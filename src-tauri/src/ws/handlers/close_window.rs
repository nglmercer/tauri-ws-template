use crate::ws::router::{WebSocketMessage, WebSocketResponse};
use crate::window_manager::WebSocketWindowManager;
use std::sync::Arc;
use tokio::sync::Mutex;

pub async fn handle_close_window(
    window_manager: Arc<Mutex<WebSocketWindowManager>>,
    message: WebSocketMessage,
) -> WebSocketResponse {
    if let Some(label) = &message.label {
        let manager = window_manager.lock().await;
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