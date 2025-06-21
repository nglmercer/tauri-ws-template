// src/window_manager.rs

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
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
    pub is_always_on_top: bool,
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

    pub async fn create_or_open_window(&self, label: &str, url: &str, is_transparent: bool, always_on_top: bool) -> Result<(), String> {
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

        let window_builder = WebviewWindowBuilder::new(&self.app_handle, label, WebviewUrl::External(parsed_url.clone()))
            .title(format!("Window: {}", label))
            .resizable(true)
            .transparent(is_transparent)
            .always_on_top(always_on_top);

        let window = window_builder.build().map_err(|e| format!("Failed to create webview: {}", e))?;

        let window_info = WindowInfo {
            label: label.to_string(),
            url: parsed_url.to_string(),
            title: format!("Window: {}", label),
            created_at: chrono::Utc::now().timestamp(),
            is_visible: true,
            is_focused: true,
            is_transparent,
            is_always_on_top: always_on_top,
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

        if let Some(window_info) = windows.get(label).cloned() {
            if let Some(existing_window) = self.app_handle.get_webview_window(label) {
                let new_transparent_state = !window_info.is_transparent;

                // 1. Obtener el estado actual de la ventana
                let url = Url::parse(&window_info.url).map_err(|e| format!("Invalid stored URL: {}", e))?;
                let size = existing_window.outer_size().map_err(|e| format!("Failed to get size: {}", e))?;
                let position = existing_window.outer_position().map_err(|e| format!("Failed to get position: {}", e))?;

                // 2. Generar un label temporal único
                let temp_label = format!("{}_temp_{}", label, chrono::Utc::now().timestamp_millis());

                // 3. Crear la nueva ventana con el label temporal
                let mut new_window_builder = WebviewWindowBuilder::new(
                    &self.app_handle,
                    &temp_label,
                    WebviewUrl::External(url),
                )
                .position(position.x as f64, position.y as f64)
                .inner_size(size.width as f64, size.height as f64)
                .resizable(true)
                .transparent(new_transparent_state)
                .always_on_top(window_info.is_always_on_top);

                // En Windows, las ventanas transparentes no deben tener decoraciones
                #[cfg(target_os = "windows")]
                {
                    new_window_builder = new_window_builder.decorations(!new_transparent_state);
                }

                let new_window = new_window_builder.build().map_err(|e| format!("Failed to create new window: {}", e))?;

                // 4. Cerrar la ventana original
                existing_window.close().map_err(|e| format!("Failed to close old window: {}", e))?;

                // 5. Esperar un poco para asegurar que la ventana original se haya cerrado
                tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

                // 6. Cambiar el label de la nueva ventana al label original
                // Nota: En Tauri, no se puede cambiar el label de una ventana existente,
                // así que necesitamos crear otra ventana con el label correcto
                let final_window_builder = WebviewWindowBuilder::new(
                    &self.app_handle,
                    label,
                    WebviewUrl::External(Url::parse(&window_info.url).unwrap()),
                )
                .position(position.x as f64, position.y as f64)
                .inner_size(size.width as f64, size.height as f64)
                .resizable(true)
                .transparent(new_transparent_state)
                .always_on_top(window_info.is_always_on_top);

                #[cfg(target_os = "windows")]
                let final_window_builder = final_window_builder.decorations(!new_transparent_state);

                let final_window = final_window_builder.build().map_err(|e| format!("Failed to create final window: {}", e))?;

                // 7. Cerrar la ventana temporal
                new_window.close().map_err(|e| format!("Failed to close temp window: {}", e))?;

                // 8. Registrar eventos para la nueva ventana
                let label_clone = label.to_string();
                let windows_clone = Arc::clone(&self.windows);
                
                final_window.on_window_event(move |event| {
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

                // 9. Actualizar la información de la ventana
                if let Some(info_to_update) = windows.get_mut(label) {
                    info_to_update.is_transparent = new_transparent_state;
                    info_to_update.is_visible = true;
                    info_to_update.is_focused = true;
                }

                Ok(new_transparent_state)
            } else {
                Err(format!("Window with label '{}' not found", label))
            }
        } else {
            Err(format!("Window info for '{}' not found in manager", label))
        }
    }

    // Método alternativo más simple que solo actualiza el estado interno
    // (no cambia realmente la transparencia de la ventana, solo el estado)
    pub async fn set_transparency_state(&self, label: &str, is_transparent: bool) -> Result<bool, String> {
        let mut windows = self.windows.lock().await;
        
        if let Some(window_info) = windows.get_mut(label) {
            window_info.is_transparent = is_transparent;
            Ok(is_transparent)
        } else {
            Err(format!("Window info for '{}' not found in manager", label))
        }
    }

    // El resto de los métodos permanecen sin cambios...
    
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

    pub async fn toggle_always_on_top(&self, label: &str) -> Result<bool, String> {
        let mut windows = self.windows.lock().await;

        if let Some(window) = self.app_handle.get_webview_window(label) {
            if let Some(window_info) = windows.get_mut(label) {
                let new_always_on_top = !window_info.is_always_on_top;
                
                window.set_always_on_top(new_always_on_top)
                    .map_err(|e| format!("Failed to set always on top: {}", e))?;
                
                window_info.is_always_on_top = new_always_on_top;
                
                Ok(new_always_on_top)
            } else {
                Err(format!("Window info for '{}' not found", label))
            }
        } else {
            Err(format!("Window with label '{}' not found", label))
        }
    }

    pub async fn set_always_on_top(&self, label: &str, always_on_top: bool) -> Result<(), String> {
        let mut windows = self.windows.lock().await;

        if let Some(window) = self.app_handle.get_webview_window(label) {
            if let Some(window_info) = windows.get_mut(label) {
                window.set_always_on_top(always_on_top)
                    .map_err(|e| format!("Failed to set always on top: {}", e))?;
                
                window_info.is_always_on_top = always_on_top;
                
                Ok(())
            } else {
                Err(format!("Window info for '{}' not found", label))
            }
        } else {
            Err(format!("Window with label '{}' not found", label))
        }
    }
}