use std::collections::HashMap;
use futures_util::{SinkExt, StreamExt};
use warp::ws::{WebSocket, Message};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::sync::mpsc::UnboundedSender;
use crate::window_manager::WebSocketWindowManager;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct WebSocketMessage {
    pub action: String,
    pub label: Option<String>,
    pub url: Option<String>,
    pub data: Option<serde_json::Value>,
    pub params: Option<HashMap<String, String>>,
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
            _ => WebSocketResponse::error(&message.action, "Unknown action"),
        }
    }

    async fn handle_create_window(&self, message: WebSocketMessage) -> WebSocketResponse {
        if let (Some(label), Some(url)) = (&message.label, &message.url) {
            let manager = self.window_manager.lock().await;
            match manager.create_or_open_window(label, url).await {
                Ok(_) => {
                    let data = serde_json::json!({
                        "label": label,
                        "url": url
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
        let windows = manager.list_windows().await;
        let data = serde_json::json!({
            "windows": windows,
            "count": windows.len()
        });
        WebSocketResponse::success("list_windows", "Windows listed successfully", Some(data))
    }

    async fn handle_get_window_info(&self, message: WebSocketMessage) -> WebSocketResponse {
        if let Some(label) = &message.label {
            let manager = self.window_manager.lock().await;
            if let Some(url) = manager.get_window_url(label).await {
                let data = serde_json::json!({
                    "label": label,
                    "url": url.to_string(),
                    "exists": true
                });
                WebSocketResponse::success("get_window_info", "Window info retrieved", Some(data))
            } else {
                let _data = serde_json::json!({
                    "label": label,
                    "exists": false
                });
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
}