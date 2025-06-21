// src/websocket_router.rs

use std::collections::HashMap;
use futures_util::{SinkExt, StreamExt};
use warp::ws::{WebSocket, Message};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::sync::mpsc::UnboundedSender;
use crate::window_manager::WebSocketWindowManager;
use crate::window_manager::WindowInfo; 

// ... (Las estructuras WebSocketMessage y WebSocketResponse permanecen iguales)
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct WebSocketMessage {
    pub action: String,
    pub label: Option<String>,
    pub url: Option<String>,
    pub data: Option<serde_json::Value>,
    pub params: Option<HashMap<String, String>>,
    pub transparent: Option<bool>,
    pub always_on_top: Option<bool>,
}

#[derive(Clone, Debug, Serialize)]
pub struct WebSocketResponse {
    pub success: bool,
    pub message: String,
    pub data: Option<serde_json::Value>,
    pub action: String,
}

impl WebSocketResponse {
    pub fn success(action: &str, message: &str, data: Option<serde_json::Value>) -> Self {
        Self {
            success: true,
            message: message.to_string(),
            data,
            action: action.to_string(),
        }
    }

    pub fn error(action: &str, message: &str) -> Self {
        Self {
            success: false,
            message: message.to_string(),
            data: None,
            action: action.to_string(),
        }
    }

    pub fn to_json(&self) -> String {
        serde_json::to_string(self).unwrap_or_else(|_| "{}".to_string())
    }
}


pub struct WebSocketRouter {
    window_manager: Arc<Mutex<WebSocketWindowManager>>,
    clients: Arc<Mutex<HashMap<String, UnboundedSender<Message>>>>,
}

impl WebSocketRouter {
    pub fn new(window_manager: Arc<Mutex<WebSocketWindowManager>>) -> Self {
        Self {
            window_manager,
            clients: Arc::new(Mutex::new(HashMap::new())),
        }
    }
    
    // ... (handle_connection sigue igual)
    pub async fn handle_connection(&self, ws: WebSocket) {
        println!("New WebSocket connection established!");

        let (tx, mut rx) = ws.split();
        let (client_tx, mut client_rx) = tokio::sync::mpsc::unbounded_channel();

        let client_id = uuid::Uuid::new_v4().to_string();
        
        // Registrar cliente
        {
            let mut clients = self.clients.lock().await;
            clients.insert(client_id.clone(), client_tx);
        }

        let tx = Arc::new(Mutex::new(tx));
        let tx_clone = Arc::clone(&tx);

        // Task para enviar mensajes al cliente
        tokio::spawn(async move {
            while let Some(message) = client_rx.recv().await {
                let mut tx = tx_clone.lock().await;
                let _ = tx.send(message).await;
            }
        });

        // Procesar mensajes entrantes
        while let Some(result) = rx.next().await {
            match result {
                Ok(message) => {
                    if let Ok(text) = message.to_str() {
                        println!("Received: {}", text);

                        let response = match serde_json::from_str::<WebSocketMessage>(text) {
                            Ok(parsed_message) => {
                                self.route_message(parsed_message).await
                            }
                            Err(_) => {
                                WebSocketResponse::error("parse_error", "Invalid JSON format")
                            }
                        };

                        let mut tx = tx.lock().await;
                        let _ = tx.send(Message::text(response.to_json())).await;
                    }
                }
                Err(e) => {
                    eprintln!("WebSocket error: {}", e);
                    break;
                }
            }
        }

        // Limpiar cliente desconectado
        {
            let mut clients = self.clients.lock().await;
            clients.remove(&client_id);
        }
    }


    async fn route_message(&self, message: WebSocketMessage) -> WebSocketResponse {
        match message.action.as_str() {
            "create_window" => self.handle_create_window(message).await,
            "close_window" => self.handle_close_window(message).await,
            "list_windows" => self.handle_list_windows(message).await,
            "get_window_info" => self.handle_get_window_info(message).await,
            "focus_window" => self.handle_focus_window(message).await,
            "ping" => self.handle_ping(message).await,
            "toggle_transparency" => self.handle_toggle_transparency(message).await,
            "reload_window" => self.handle_reload_window(message).await,
            "navigate_window" => self.handle_navigate_window(message).await,
            
            // NUEVAS RUTAS PARA ALWAYS ON TOP
            "toggle_always_on_top" => self.handle_toggle_always_on_top(message).await,
            "set_always_on_top" => self.handle_set_always_on_top(message).await,
    
            _ => WebSocketResponse::error(&message.action, "Unknown action"),
        }
    }
    
    // Modificar handle_create_window para incluir always_on_top:
    async fn handle_create_window(&self, message: WebSocketMessage) -> WebSocketResponse {
        if let (Some(label), Some(url)) = (&message.label, &message.url) {
            let is_transparent = message.transparent.unwrap_or(false);
            let always_on_top = message.always_on_top.unwrap_or(false); // <--- NUEVO

            let manager = self.window_manager.lock().await;
            match manager.create_or_open_window(label, url, is_transparent, always_on_top).await {
                Ok(_) => {
                    let data = serde_json::json!({
                        "label": label,
                        "url": url,
                        "transparent": is_transparent,
                        "always_on_top": always_on_top // <--- INCLUIR EN RESPUESTA
                    });
                    WebSocketResponse::success("create_window", "Window created successfully", Some(data))
                }
                Err(e) => WebSocketResponse::error("create_window", &format!("Failed to create window: {}", e)),
            }
        } else {
            WebSocketResponse::error("create_window", "Missing label or URL")
        }
    }

    async fn handle_close_window(&self, message: WebSocketMessage) -> WebSocketResponse {
        if let Some(label) = &message.label {
            let manager = self.window_manager.lock().await;
            match manager.close_window(label).await {
                Ok(_) => {
                    let data = serde_json::json!({
                        "label": label
                    });
                    WebSocketResponse::success("close_window", "Window closed successfully", Some(data))
                }
                Err(e) => WebSocketResponse::error("close_window", &format!("Failed to close window: {}", e)),
            }
        } else {
            WebSocketResponse::error("close_window", "Missing window label")
        }
    }

    async fn handle_list_windows(&self, _message: WebSocketMessage) -> WebSocketResponse {
        let manager = self.window_manager.lock().await;
        // Llama a la función que devuelve toda la información
        let windows_map = manager.get_all_windows_info().await;
        
        // Convierte el HashMap a un Vec de WindowInfo
        let windows: Vec<WindowInfo> = windows_map.values().cloned().collect();
    
        let data = serde_json::json!({
            "windows": windows, // Ahora envías la lista de objetos completos
            "count": windows.len()
        });
        WebSocketResponse::success("list_windows", "Windows listed successfully", Some(data))
    }
    async fn handle_get_window_info(&self, message: WebSocketMessage) -> WebSocketResponse {
        if let Some(label) = &message.label {
            let manager = self.window_manager.lock().await;
            if let Some(info) = manager.get_window_info(label).await {
                // Envía el objeto WindowInfo completo
                let data = serde_json::to_value(info).unwrap_or(serde_json::Value::Null);
                WebSocketResponse::success("get_window_info", "Window info retrieved", Some(data))
            } else {
                WebSocketResponse::error("get_window_info", "Window not found")
            }
        } else {
            WebSocketResponse::error("get_window_info", "Missing window label")
        }
    }

    async fn handle_focus_window(&self, message: WebSocketMessage) -> WebSocketResponse {
        if let Some(label) = &message.label {
            let manager = self.window_manager.lock().await;
            match manager.focus_window(label).await {
                Ok(_) => {
                    let data = serde_json::json!({
                        "label": label
                    });
                    WebSocketResponse::success("focus_window", "Window focused successfully", Some(data))
                }
                Err(e) => WebSocketResponse::error("focus_window", &format!("Failed to focus window: {}", e)),
            }
        } else {
            WebSocketResponse::error("focus_window", "Missing window label")
        }
    }

    async fn handle_ping(&self, _message: WebSocketMessage) -> WebSocketResponse {
        let data = serde_json::json!({
            "timestamp": chrono::Utc::now().timestamp(),
            "server": "websocket_router"
        });
        WebSocketResponse::success("ping", "pong", Some(data))
    }


    // --- NUEVOS HANDLERS ---

    // NUEVO: Manejador para alternar la transparencia
    async fn handle_toggle_transparency(&self, message: WebSocketMessage) -> WebSocketResponse {
        if let Some(label) = &message.label {
            let manager = self.window_manager.lock().await;
            match manager.toggle_window_transparency(label).await {
                Ok(new_state) => {
                    let data = serde_json::json!({
                        "label": label,
                        "is_transparent": new_state,
                    });
                    WebSocketResponse::success("toggle_transparency", "Transparency toggled", Some(data))
                }
                Err(e) => WebSocketResponse::error("toggle_transparency", &format!("Failed to toggle transparency: {}", e)),
            }
        } else {
            WebSocketResponse::error("toggle_transparency", "Missing window label")
        }
    }

    // NUEVO: Manejador para recargar una ventana
    async fn handle_reload_window(&self, message: WebSocketMessage) -> WebSocketResponse {
        if let Some(label) = &message.label {
            let manager = self.window_manager.lock().await;
            match manager.reload_window(label).await {
                Ok(_) => {
                     let data = serde_json::json!({ "label": label });
                    WebSocketResponse::success("reload_window", "Window reloaded successfully", Some(data))
                }
                Err(e) => WebSocketResponse::error("reload_window", &format!("Failed to reload window: {}", e)),
            }
        } else {
            WebSocketResponse::error("reload_window", "Missing window label")
        }
    }

    // NUEVO: Manejador para navegar a una nueva URL
    async fn handle_navigate_window(&self, message: WebSocketMessage) -> WebSocketResponse {
        if let (Some(label), Some(url)) = (&message.label, &message.url) {
            let manager = self.window_manager.lock().await;
            match manager.navigate_window(label, url).await {
                Ok(_) => {
                    let data = serde_json::json!({
                        "label": label,
                        "url": url,
                    });
                    WebSocketResponse::success("navigate_window", "Window navigation successful", Some(data))
                }
                Err(e) => WebSocketResponse::error("navigate_window", &format!("Failed to navigate window: {}", e)),
            }
        } else {
            WebSocketResponse::error("navigate_window", "Missing label or URL")
        }
    }
    
    // ... (el resto de las funciones de WebSocketRouter sigue aquí)
    pub async fn broadcast_message(&self, message: &str) {
        let clients = self.clients.lock().await;
        for (_, tx) in clients.iter() {
            let _ = tx.send(Message::text(message));
        }
    }

    pub async fn send_to_client(&self, client_id: &str, message: &str) -> bool {
        let clients = self.clients.lock().await;
        if let Some(tx) = clients.get(client_id) {
            tx.send(Message::text(message)).is_ok()
        } else {
            false
        }
    }

    pub async fn get_connected_clients(&self) -> Vec<String> {
        let clients = self.clients.lock().await;
        clients.keys().cloned().collect()
    }
        // NUEVO HANDLER: Toggle always on top
    async fn handle_toggle_always_on_top(&self, message: WebSocketMessage) -> WebSocketResponse {
        if let Some(label) = &message.label {
            let manager = self.window_manager.lock().await;
            match manager.toggle_always_on_top(label).await {
                Ok(new_state) => {
                    let data = serde_json::json!({
                        "label": label,
                        "is_always_on_top": new_state,
                    });
                    WebSocketResponse::success("toggle_always_on_top", "Always on top toggled", Some(data))
                }
                Err(e) => WebSocketResponse::error("toggle_always_on_top", &format!("Failed to toggle always on top: {}", e)),
            }
        } else {
            WebSocketResponse::error("toggle_always_on_top", "Missing window label")
        }
    }

    // NUEVO HANDLER: Set always on top
    async fn handle_set_always_on_top(&self, message: WebSocketMessage) -> WebSocketResponse {
        if let Some(label) = &message.label {
            let always_on_top = message.always_on_top.unwrap_or(false);
            
            let manager = self.window_manager.lock().await;
            match manager.set_always_on_top(label, always_on_top).await {
                Ok(_) => {
                    let data = serde_json::json!({
                        "label": label,
                        "is_always_on_top": always_on_top,
                    });
                    WebSocketResponse::success("set_always_on_top", "Always on top set successfully", Some(data))
                }
                Err(e) => WebSocketResponse::error("set_always_on_top", &format!("Failed to set always on top: {}", e)),
            }
        } else {
            WebSocketResponse::error("set_always_on_top", "Missing window label")
        }
    }
}