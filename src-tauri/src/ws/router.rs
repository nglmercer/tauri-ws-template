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
    route_manager: Arc<crate::route_manager::RouteManager>,
    clients: Arc<Mutex<HashMap<String, UnboundedSender<Message>>>>,
}

impl WebSocketRouter {
    pub fn new(window_manager: Arc<Mutex<WebSocketWindowManager>>, route_manager: Arc<crate::route_manager::RouteManager>) -> Self {
        Self {
            window_manager,
            route_manager,
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
            // Window management
            "create_window" => crate::ws::handlers::create_window::handle_create_window(self.window_manager.clone(), message).await,
            "close_window" => crate::ws::handlers::close_window::handle_close_window(self.window_manager.clone(), message).await,
            "list_windows" => crate::ws::handlers::list_windows::handle_list_windows(self.window_manager.clone(), message).await,
            "get_window_info" => crate::ws::handlers::get_window_info::handle_get_window_info(self.window_manager.clone(), message).await,
            "focus_window" => crate::ws::handlers::focus_window::handle_focus_window(self.window_manager.clone(), message).await,
            "ping" => crate::ws::handlers::ping::handle_ping(message).await,
            "toggle_transparency" => crate::ws::handlers::toggle_transparency::handle_toggle_transparency(self.window_manager.clone(), message).await,
            "reload_window" => crate::ws::handlers::reload_window::handle_reload_window(self.window_manager.clone(), message).await,
            "navigate_window" => crate::ws::handlers::navigate_window::handle_navigate_window(self.window_manager.clone(), message).await,
            
            // Window control
            "toggle_always_on_top" => crate::ws::handlers::toggle_always_on_top::handle_toggle_always_on_top(self.window_manager.clone(), message).await,
            "set_always_on_top" => crate::ws::handlers::set_always_on_top::handle_set_always_on_top(self.window_manager.clone(), message).await,
            
            // QR Code
            "qr_decode" => crate::ws::handlers::qr_code::handle_qr_decode(self.window_manager.clone(), message).await,
            "qr_encode" => crate::ws::handlers::qr_code::handle_qr_encode(self.window_manager.clone(), message).await,
            
            // Route management
            "add_route" => self.handle_add_route(message).await,
            "remove_route" => self.handle_remove_route(message).await,
            "list_routes" => self.handle_list_routes().await,
            "add_proxy_route" => self.handle_add_proxy_route(message).await,
            
            // Proxy functionality
            "proxy_request" => crate::ws::handlers::proxy_handler::handle_proxy_request(self.window_manager.clone(), message).await,
            "simple_proxy" => crate::ws::handlers::proxy_handler::handle_simple_proxy(self.window_manager.clone(), message).await,
    
            _ => WebSocketResponse::error(&message.action, "Unknown action"),
        }
    }
    
    async fn handle_add_route(&self, message: WebSocketMessage) -> WebSocketResponse {
        let route_config = match serde_json::from_value::<crate::route_manager::RouteConfig>(
            message.data.unwrap_or(serde_json::Value::Null)
        ) {
            Ok(config) => config,
            Err(e) => return WebSocketResponse::error("add_route", &format!("Invalid route config: {}", e)),
        };

        match self.route_manager.add_route(route_config).await {
            Ok(_) => WebSocketResponse::success("add_route", "Route added successfully", None),
            Err(e) => WebSocketResponse::error("add_route", &e),
        }
    }

    async fn handle_remove_route(&self, message: WebSocketMessage) -> WebSocketResponse {
        let path = match message.params.as_ref().and_then(|p| p.get("path")) {
            Some(path) => path.clone(),
            None => return WebSocketResponse::error("remove_route", "Missing path parameter"),
        };

        match self.route_manager.remove_route(&path).await {
            Ok(_) => WebSocketResponse::success("remove_route", "Route removed successfully", None),
            Err(e) => WebSocketResponse::error("remove_route", &e),
        }
    }

    async fn handle_list_routes(&self) -> WebSocketResponse {
        let routes = self.route_manager.list_routes().await;
        WebSocketResponse::success("list_routes", "Routes retrieved successfully", Some(serde_json::to_value(routes).unwrap()))
    }

    async fn handle_add_proxy_route(&self, message: WebSocketMessage) -> WebSocketResponse {
        let route_config = match serde_json::from_value::<crate::route_manager::RouteConfig>(
            message.data.unwrap_or(serde_json::Value::Null)
        ) {
            Ok(config) => config,
            Err(e) => return WebSocketResponse::error("add_proxy_route", &format!("Invalid route config: {}", e)),
        };

        match self.route_manager.add_route(route_config).await {
            Ok(_) => WebSocketResponse::success("add_proxy_route", "Proxy route added successfully", None),
            Err(e) => WebSocketResponse::error("add_proxy_route", &e),
        }
    }

}