use crate::ws::router::WebSocketResponse;
use crate::proxy::{HttpProxy, ProxyRequest};
use crate::window_manager::WebSocketWindowManager;
use std::sync::Arc;
use tokio::sync::Mutex;

pub async fn handle_proxy_request(
    _window_manager: Arc<Mutex<WebSocketWindowManager>>,
    message: crate::ws::router::WebSocketMessage,
) -> WebSocketResponse {
    if let Some(data) = message.data {
        let proxy_request: Result<ProxyRequest, _> = serde_json::from_value(data);
        
        match proxy_request {
            Ok(request) => {
                let proxy = HttpProxy::new(None);
                
                match proxy.handle_proxy_request(request).await {
                    Ok(response) => WebSocketResponse::success(
                        "proxy_request",
                        "Proxy request completed successfully",
                        Some(serde_json::to_value(response).unwrap())
                    ),
                    Err(e) => WebSocketResponse::error("proxy_request", &format!("Proxy error: {}", e)),
                }
            }
            Err(e) => WebSocketResponse::error("proxy_request", &format!("Invalid proxy request format: {}", e)),
        }
    } else {
        WebSocketResponse::error("proxy_request", "Missing proxy request data")
    }
}

pub async fn handle_simple_proxy(
    _window_manager: Arc<Mutex<WebSocketWindowManager>>,
    message: crate::ws::router::WebSocketMessage,
) -> WebSocketResponse {
    if let Some(params) = message.params {
        let target_url = params.get("url").cloned().unwrap_or_default();
        let method = params.get("method").cloned().unwrap_or_else(|| "GET".to_string());
        let body = params.get("body").cloned();
        
        if target_url.is_empty() {
            return WebSocketResponse::error("simple_proxy", "Missing URL parameter");
        }

        let proxy = HttpProxy::new(None);
        
        match proxy.handle_http_proxy(&target_url, &method, None, body).await {
            Ok(response) => WebSocketResponse::success(
                "simple_proxy",
                "Simple proxy request completed successfully",
                Some(serde_json::to_value(response).unwrap())
            ),
            Err(e) => WebSocketResponse::error("simple_proxy", &format!("Proxy error: {}", e)),
        }
    } else {
        WebSocketResponse::error("simple_proxy", "Missing parameters")
    }
}