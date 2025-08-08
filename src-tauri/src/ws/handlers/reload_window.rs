use crate::ws::router::{WebSocketMessage, WebSocketResponse};
use crate::window_manager::WebSocketWindowManager;
use std::sync::Arc;
use tokio::sync::Mutex;

pub async fn handle_reload_window(
    window_manager: Arc<Mutex<WebSocketWindowManager>>,
    message: WebSocketMessage,
) -> WebSocketResponse {
    if let Some(label) = &message.label {
        let manager = window_manager.lock().await;
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