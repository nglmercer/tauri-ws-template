use crate::ws::router::{WebSocketMessage, WebSocketResponse};
use crate::window_manager::WebSocketWindowManager;
use std::sync::Arc;
use tokio::sync::Mutex;

pub async fn handle_get_window_info(
    window_manager: Arc<Mutex<WebSocketWindowManager>>,
    message: WebSocketMessage,
) -> WebSocketResponse {
    if let Some(label) = &message.label {
        let manager = window_manager.lock().await;
        if let Some(info) = manager.get_window_info(label).await {
            let data = serde_json::to_value(info).unwrap_or(serde_json::Value::Null);
            WebSocketResponse::success("get_window_info", "Window info retrieved", Some(data))
        } else {
            WebSocketResponse::error("get_window_info", "Window not found")
        }
    } else {
        WebSocketResponse::error("get_window_info", "Missing window label")
    }
}