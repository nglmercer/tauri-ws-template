use crate::ws::router::{WebSocketMessage, WebSocketResponse};
use crate::window_manager::{WebSocketWindowManager, WindowInfo};
use std::sync::Arc;
use tokio::sync::Mutex;

pub async fn handle_list_windows(
    window_manager: Arc<Mutex<WebSocketWindowManager>>,
    _message: WebSocketMessage,
) -> WebSocketResponse {
    let manager = window_manager.lock().await;
    let windows_map = manager.get_all_windows_info().await;
    let windows: Vec<WindowInfo> = windows_map.values().cloned().collect();

    let data = serde_json::json!({
        "windows": windows,
        "count": windows.len()
    });
    WebSocketResponse::success("list_windows", "Windows listed successfully", Some(data))
}