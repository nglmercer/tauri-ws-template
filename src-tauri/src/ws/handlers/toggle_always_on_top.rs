use std::sync::Arc;
use tokio::sync::Mutex;
use crate::window_manager::WebSocketWindowManager;
use crate::ws::router::{WebSocketMessage, WebSocketResponse};

pub async fn handle_toggle_always_on_top(
    window_manager: Arc<Mutex<WebSocketWindowManager>>,
    message: WebSocketMessage,
) -> WebSocketResponse {
    if let Some(label) = &message.label {
        let manager = window_manager.lock().await;
        match manager.toggle_always_on_top(label).await {
            Ok(new_state) => {
                let data = serde_json::json!({
                    "label": label,
                    "is_always_on_top": new_state,
                });
                WebSocketResponse::success("toggle_always_on_top", "Always on top toggled", Some(data))
            }
            Err(e) => WebSocketResponse::error(
                "toggle_always_on_top",
                &format!("Failed to toggle always on top: {}", e),
            ),
        }
    } else {
        WebSocketResponse::error("toggle_always_on_top", "Missing window label")
    }
}