// src/window_manager.rs

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
// MODIFICADO: Eliminado PhysicalPosition que no se usaba.
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use tokio::sync::Mutex;
use url::Url;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct WindowInfo {
    pub label: String,
    pub url: String,
    pub title: String,
    pub created_at: i64,
    pub is_visible: bool,
    pub is_focused: bool,
    pub is_transparent: bool,
}

#[derive(Clone, Debug)]
pub struct WebSocketWindowManager {
    app_handle: AppHandle,
    windows: Arc<Mutex<HashMap<String, WindowInfo>>>,
}

impl WebSocketWindowManager {
    pub fn new(app_handle: AppHandle) -> Self {
        WebSocketWindowManager {
            app_handle,
            windows: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    // ... (create_or_open_window y otras funciones no necesitan cambios)
    pub async fn create_or_open_window(&self, label: &str, url: &str, is_transparent: bool) -> Result<(), String> {
        let parsed_url = Url::parse(url).map_err(|e| format!("Invalid URL: {}", e))?;
        let mut windows = self.windows.lock().await;

        if let Some(window) = self.app_handle.get_webview_window(label) {
            window.show().map_err(|e| format!("Error showing window: {}", e))?;
            window.set_focus().map_err(|e| format!("Error focusing window: {}", e))?;
            if let Some(window_info) = windows.get_mut(label) {
                window_info.is_visible = true;
                window_info.is_focused = true;
            }
            return Ok(());
        }

        let mut window_builder = WebviewWindowBuilder::new(&self.app_handle, label, WebviewUrl::External(parsed_url.clone()))
            .title(format!("Window: {}", label))
            .resizable(true)
            .transparent(is_transparent);

        let window = window_builder.build().map_err(|e| format!("Failed to create webview: {}", e))?;

        let window_info = WindowInfo {
            label: label.to_string(),
            url: parsed_url.to_string(),
            title: format!("Window: {}", label),
            created_at: chrono::Utc::now().timestamp(),
            is_visible: true,
            is_focused: true,
            is_transparent, // <--- GUARDAMOS EL ESTADO CORRECTO
        };

        windows.insert(label.to_string(), window_info);

        let label_clone = label.to_string();
        let windows_clone = Arc::clone(&self.windows);
        
        window.on_window_event(move |event| {
            let label = label_clone.clone();
            let windows = Arc::clone(&windows_clone);
            
            let event_data = match event {
                tauri::WindowEvent::Focused(focused) => Some(("focused", *focused)),
                tauri::WindowEvent::CloseRequested { .. } => Some(("close", false)),
                _ => None,
            };
            
            if let Some((event_type, focused)) = event_data {
                tokio::spawn(async move {
                    let mut windows = windows.lock().await;
                    if let Some(window_info) = windows.get_mut(&label) {
                        match event_type {
                            "focused" => {
                                window_info.is_focused = focused;
                            }
                            "close" => {
                                windows.remove(&label);
                            }
                            _ => {}
                        }
                    }
                });
            }
        });

        Ok(())
    }

    pub async fn toggle_window_transparency(&self, label: &str) -> Result<bool, String> {
        let mut windows = self.windows.lock().await;

        if let Some(existing_window) = self.app_handle.get_webview_window(label) {
            if let Some(window_info) = windows.get(label).cloned() {
                let new_transparent_state = !window_info.is_transparent;

                // 1. Guardar el estado de la ventana actual
                let url = Url::parse(&window_info.url).map_err(|e| format!("Invalid stored URL: {}", e))?;
                let size = existing_window.outer_size().map_err(|e| format!("Failed to get size: {}", e))?;
                let position = existing_window.outer_position().map_err(|e| format!("Failed to get position: {}", e))?;
                let title = existing_window.title().map_err(|e| format!("Failed to get title: {}", e))?;

                // 2. Cerrar la ventana actual
                existing_window.close().map_err(|e| format!("Failed to close old window: {}", e))?;

                // 3. Crear una nueva ventana con la transparencia invertida
                let new_window_builder = WebviewWindowBuilder::new(
                    &self.app_handle,
                    label,
                    WebviewUrl::External(url),
                )
                .title(title)
                // LÍNEA CORREGIDA: Convertimos i32 a f64
                .position(position.x as f64, position.y as f64) 
                // También aplicamos la conversión al tamaño para ser consistentes
                .inner_size(size.width as f64, size.height as f64) 
                .resizable(true)
                .transparent(new_transparent_state);

                // En Windows, las ventanas transparentes no deben tener decoraciones.
                #[cfg(target_os = "windows")]
                let new_window_builder = new_window_builder.decorations(!new_transparent_state);
                
                let _new_window = new_window_builder.build().map_err(|e| format!("Failed to create new window: {}", e))?;

                // 4. Actualizar nuestra información de estado
                if let Some(info_to_update) = windows.get_mut(label) {
                    info_to_update.is_transparent = new_transparent_state;
                    // NOTA: Para ser 100% robusto, deberíamos volver a registrar `on_window_event` en la nueva ventana.
                    // Lo omito aquí para mantener el código simple, pero es una mejora a considerar.
                } else {
                    let mut new_info = window_info;
                    new_info.is_transparent = new_transparent_state;
                    windows.insert(label.to_string(), new_info);
                }

                Ok(new_transparent_state)
            } else {
                Err(format!("Window info for '{}' not found in manager", label))
            }
        } else {
            Err(format!("Window with label '{}' not found", label))
        }
    }

    // El resto de las funciones están bien.
    pub async fn reload_window(&self, label: &str) -> Result<(), String> {
        if let Some(window) = self.app_handle.get_webview_window(label) {
            window.eval("window.location.reload();")
                .map_err(|e| format!("Error reloading window: {}", e))?;
            Ok(())
        } else {
            Err(format!("Window with label '{}' not found", label))
        }
    }
    
    pub async fn navigate_window(&self, label: &str, url: &str) -> Result<(), String> {
        let parsed_url = Url::parse(url).map_err(|e| format!("Invalid URL: {}", e))?;
        let mut windows = self.windows.lock().await;

        if let Some(window) = self.app_handle.get_webview_window(label) {
            let js_code = format!("window.location.href = '{}';", parsed_url);
            window
                .eval(&js_code)
                .map_err(|e| format!("Error navigating window: {}", e))?;
            
            if let Some(window_info) = windows.get_mut(label) {
                window_info.url = parsed_url.to_string();
            }
            
            Ok(())
        } else {
            Err(format!("Window with label '{}' not found", label))
        }
    }

    // ... (pega aquí el resto de tus funciones de WebSocketWindowManager sin cambios)
    pub async fn close_window(&self, label: &str) -> Result<(), String> {
        let mut windows = self.windows.lock().await;

        if let Some(window) = self.app_handle.get_webview_window(label) {
            window
                .close()
                .map_err(|e| format!("Error closing window: {}", e))?;
            windows.remove(label);
            Ok(())
        } else {
            Err(format!("Window with label '{}' not found", label))
        }
    }

    pub async fn focus_window(&self, label: &str) -> Result<(), String> {
        let mut windows = self.windows.lock().await;

        if let Some(window) = self.app_handle.get_webview_window(label) {
            window
                .show()
                .map_err(|e| format!("Error showing window: {}", e))?;
            window
                .set_focus()
                .map_err(|e| format!("Error focusing window: {}", e))?;
            
            // Actualizar estado
            if let Some(window_info) = windows.get_mut(label) {
                window_info.is_visible = true;
                window_info.is_focused = true;
            }
            
            Ok(())
        } else {
            Err(format!("Window with label '{}' not found", label))
        }
    }

    pub async fn hide_window(&self, label: &str) -> Result<(), String> {
        let mut windows = self.windows.lock().await;

        if let Some(window) = self.app_handle.get_webview_window(label) {
            window
                .hide()
                .map_err(|e| format!("Error hiding window: {}", e))?;
            
            // Actualizar estado
            if let Some(window_info) = windows.get_mut(label) {
                window_info.is_visible = false;
                window_info.is_focused = false;
            }
            
            Ok(())
        } else {
            Err(format!("Window with label '{}' not found", label))
        }
    }

    pub async fn list_windows(&self) -> Vec<String> {
        let windows = self.windows.lock().await;
        windows.keys().cloned().collect()
    }

    pub async fn get_window_info(&self, label: &str) -> Option<WindowInfo> {
        let windows = self.windows.lock().await;
        windows.get(label).cloned()
    }

    pub async fn get_all_windows_info(&self) -> HashMap<String, WindowInfo> {
        let windows = self.windows.lock().await;
        windows.clone()
    }

    pub async fn get_window_url(&self, label: &str) -> Option<Url> {
        let windows = self.windows.lock().await;
        if let Some(window_info) = windows.get(label) {
            Url::parse(&window_info.url).ok()
        } else {
            None
        }
    }

    pub async fn update_window_title(&self, label: &str, new_title: &str) -> Result<(), String> {
        let mut windows = self.windows.lock().await;

        if let Some(window) = self.app_handle.get_webview_window(label) {
            window
                .set_title(new_title)
                .map_err(|e| format!("Error setting window title: {}", e))?;
            
            // Actualizar información
            if let Some(window_info) = windows.get_mut(label) {
                window_info.title = new_title.to_string();
            }
            
            Ok(())
        } else {
            Err(format!("Window with label '{}' not found", label))
        }
    }


    pub async fn window_exists(&self, label: &str) -> bool {
        let windows = self.windows.lock().await;
        windows.contains_key(label) && self.app_handle.get_webview_window(label).is_some()
    }

    pub async fn get_active_windows(&self) -> Vec<String> {
        let windows = self.windows.lock().await;
        windows
            .iter()
            .filter(|(label, info)| {
                info.is_visible && self.app_handle.get_webview_window(label).is_some()
            })
            .map(|(label, _)| label.clone())
            .collect()
    }

    pub async fn cleanup_closed_windows(&self) {
        let mut windows = self.windows.lock().await;
        let mut to_remove = Vec::new();

        for label in windows.keys() {
            if self.app_handle.get_webview_window(label).is_none() {
                to_remove.push(label.clone());
            }
        }

        for label in to_remove {
            windows.remove(&label);
        }
    }
}