use crate::ws::router::{WebSocketMessage, WebSocketResponse};

pub async fn handle_ping(_message: WebSocketMessage) -> WebSocketResponse {
    let data = serde_json::json!({
        "timestamp": chrono::Utc::now().timestamp(),
        "server": "websocket_router"
    });
    WebSocketResponse::success("ping", "pong", Some(data))
}