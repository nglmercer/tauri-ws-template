use crate::ws::router::{WebSocketMessage, WebSocketResponse};
use crate::window_manager::WebSocketWindowManager;
use std::sync::Arc;
use tokio::sync::Mutex;

pub async fn handle_toggle_transparency(
    window_manager: Arc<Mutex<WebSocketWindowManager>>,
    message: WebSocketMessage,
) -> WebSocketResponse {
    if let Some(label) = &message.label {
        let manager = window_manager.lock().await;
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