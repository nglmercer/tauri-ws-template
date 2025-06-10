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

    pub async fn create_or_open_window(&self, label: &str, url: &str) -> Result<(), String> {
        let parsed_url = Url::parse(url).map_err(|e| format!("Invalid URL: {}", e))?;

        let mut windows = self.windows.lock().await;

        // Si la ventana ya existe, enfócarla o traerla al frente
        if let Some(window) = self.app_handle.get_webview_window(label) {
            window
                .show()
                .map_err(|e| format!("Error showing window: {}", e))?;
            window
                .set_focus()
                .map_err(|e| format!("Error focusing window: {}", e))?;
            
            // Actualizar información de la ventana
            if let Some(window_info) = windows.get_mut(label) {
                window_info.is_visible = true;
                window_info.is_focused = true;
            }
            
            return Ok(());
        }

        // Crear nueva ventana si no existe
        let window = WebviewWindowBuilder::new(
            &self.app_handle,
            label,
            WebviewUrl::External(parsed_url.clone()),
        )
        .title(format!("Window: {}", label))
        .resizable(true)
        .transparent(false)
        .build()
        .map_err(|e| format!("Failed to create webview: {}", e))?;

        // Registrar la ventana en el mapa con información completa
        let window_info = WindowInfo {
            label: label.to_string(),
            url: parsed_url.to_string(),
            title: format!("Window: {}", label),
            created_at: chrono::Utc::now().timestamp(),
            is_visible: true,
            is_focused: true,
        };

        windows.insert(label.to_string(), window_info);

        // Configurar event listeners para la ventana
        let label_clone = label.to_string();
        let windows_clone = Arc::clone(&self.windows);
        
        window.on_window_event(move |event| {
            let label = label_clone.clone();
            let windows = Arc::clone(&windows_clone);
            
            // Clonamos los datos del evento que necesitamos
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

    pub async fn navigate_window(&self, label: &str, url: &str) -> Result<(), String> {
        let parsed_url = Url::parse(url).map_err(|e| format!("Invalid URL: {}", e))?;
        let mut windows = self.windows.lock().await;

        if let Some(window) = self.app_handle.get_webview_window(label) {
            // Evaluar JavaScript para navegar a la nueva URL
            let js_code = format!("window.location.href = '{}';", parsed_url);
            window
                .eval(&js_code)
                .map_err(|e| format!("Error navigating window: {}", e))?;
            
            // Actualizar URL en la información
            if let Some(window_info) = windows.get_mut(label) {
                window_info.url = parsed_url.to_string();
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