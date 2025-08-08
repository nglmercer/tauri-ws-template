use crate::ws::router::{WebSocketMessage, WebSocketResponse};
use crate::window_manager::WebSocketWindowManager;
use std::sync::Arc;
use tokio::sync::Mutex;

pub async fn handle_focus_window(
    window_manager: Arc<Mutex<WebSocketWindowManager>>,
    message: WebSocketMessage,
) -> WebSocketResponse {
    if let Some(label) = &message.label {
        let manager = window_manager.lock().await;
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