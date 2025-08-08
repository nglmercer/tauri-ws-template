use crate::ws::router::{WebSocketMessage, WebSocketResponse};
use crate::window_manager::WebSocketWindowManager;
use std::sync::Arc;
use tokio::sync::Mutex;

pub async fn handle_create_window(
    window_manager: Arc<Mutex<WebSocketWindowManager>>,
    message: WebSocketMessage,
) -> WebSocketResponse {
    if let (Some(label), Some(url)) = (&message.label, &message.url) {
        let is_transparent = message.transparent.unwrap_or(false);
        let always_on_top = message.always_on_top.unwrap_or(false);

        let manager = window_manager.lock().await;
        match manager.create_or_open_window(label, url, is_transparent, always_on_top).await {
            Ok(_) => {
                let data = serde_json::json!({
                    "label": label,
                    "url": url,
                    "transparent": is_transparent,
                    "always_on_top": always_on_top
                });
                WebSocketResponse::success("create_window", "Window created successfully", Some(data))
            }
            Err(e) => WebSocketResponse::error("create_window", &format!("Failed to create window: {}", e)),
        }
    } else {
        WebSocketResponse::error("create_window", "Missing label or URL")
    }
}