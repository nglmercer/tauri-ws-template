use std::sync::Arc;
use tokio::sync::Mutex;
use crate::window_manager::WebSocketWindowManager;
use crate::ws::router::{WebSocketMessage, WebSocketResponse};

pub async fn handle_set_always_on_top(
    window_manager: Arc<Mutex<WebSocketWindowManager>>,
    message: WebSocketMessage,
) -> WebSocketResponse {
    if let Some(label) = &message.label {
        let always_on_top = message.always_on_top.unwrap_or(false);

        let manager = window_manager.lock().await;
        match manager.set_always_on_top(label, always_on_top).await {
            Ok(_) => {
                let data = serde_json::json!({
                    "label": label,
                    "is_always_on_top": always_on_top,
                });
                WebSocketResponse::success("set_always_on_top", "Always on top set successfully", Some(data))
            }
            Err(e) => WebSocketResponse::error(
                "set_always_on_top",
                &format!("Failed to set always on top: {}", e),
            ),
        }
    } else {
        WebSocketResponse::error("set_always_on_top", "Missing window label")
    }
}