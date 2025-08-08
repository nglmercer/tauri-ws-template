use crate::ws::router::{WebSocketMessage, WebSocketResponse};
use crate::window_manager::WebSocketWindowManager;
use std::sync::Arc;
use tokio::sync::Mutex;

pub async fn handle_navigate_window(
    window_manager: Arc<Mutex<WebSocketWindowManager>>,
    message: WebSocketMessage,
) -> WebSocketResponse {
    if let (Some(label), Some(url)) = (&message.label, &message.url) {
        let manager = window_manager.lock().await;
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