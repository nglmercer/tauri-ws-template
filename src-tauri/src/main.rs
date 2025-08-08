#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod window_manager;
mod ws;
mod proxy;
mod route_manager;

use std::sync::Arc;
use warp::Filter;
use tokio::sync::{Mutex, RwLock};
use std::net::SocketAddr;

use window_manager::WebSocketWindowManager;
use ws::router::WebSocketRouter;
use route_manager::RouteManager;

// Estado global para almacenar la información del servidor
pub struct ServerInfo {
    pub websocket_port: u16,
    pub websocket_url: String,
}

impl Default for ServerInfo {
    fn default() -> Self {
        Self {
            websocket_port: 0,
            websocket_url: String::new(),
        }
    }
}

type ServerInfoState = Arc<RwLock<ServerInfo>>;

#[tokio::main]
async fn main() {
    // Estado compartido para la información del servidor
    let server_info = Arc::new(RwLock::new(ServerInfo::default()));
    let server_info_clone = Arc::clone(&server_info);

    // Estado para el gestor de rutas
    let route_manager = Arc::new(RouteManager::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(server_info.clone())
        .manage(route_manager.clone())
        .invoke_handler(tauri::generate_handler![
            greet, 
            get_file_path, 
            get_websocket_info,
            get_websocket_url,
            get_websocket_port,
            add_route,
            remove_route,
            list_routes,
            proxy_request
        ])
        .setup(move |app| {
            let app_handle = app.handle().clone();
            let _server_info_clone = server_info.clone();
            
            // Crear el gestor de ventanas
            let window_manager = Arc::new(Mutex::new(WebSocketWindowManager::new(app_handle)));
            
            // Crear el router de WebSocket
            let ws_router = Arc::new(WebSocketRouter::new(Arc::clone(&window_manager), route_manager.clone()));
            
            // Configurar y iniciar el servidor WebSocket
            let ws_router_clone = Arc::clone(&ws_router);
            let route_manager_clone = route_manager.clone();
            tokio::spawn(async move {
                if let Err(e) = start_websocket_server(ws_router_clone, _server_info_clone, route_manager_clone).await {
                    eprintln!("WebSocket server error: {}", e);
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn start_websocket_server(
    ws_router: Arc<WebSocketRouter>,
    server_info: ServerInfoState,
    route_manager: Arc<RouteManager>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let websocket_route = warp::path("ws")
        .and(warp::ws())
        .map(move |ws: warp::ws::Ws| {
            let router = Arc::clone(&ws_router);
            ws.on_upgrade(move |socket| {
                let router = Arc::clone(&router);
                async move {
                    router.handle_connection(socket).await;
                }
            })
        });

    // Ruta para obtener información del servidor
    let server_info_for_route = Arc::clone(&server_info);
    let info_route = warp::path("info")
        .and(warp::get())
        .and(warp::any().map(move || Arc::clone(&server_info_for_route)))
        .and_then(|server_info: ServerInfoState| async move {
            let info = server_info.read().await;
            Ok::<_, warp::Rejection>(warp::reply::json(&serde_json::json!({
                "server": "Tauri WebSocket Server",
                "version": "1.0.0",
                "websocket_port": info.websocket_port,
                "endpoints": {
                    "websocket": &info.websocket_url,
                    "info": format!("http://localhost:{}/info", info.websocket_port),
                    "health": format!("http://localhost:{}/health", info.websocket_port)
                }
            })))
        });

    // Ruta de health check
    let health_route = warp::path("health")
        .and(warp::get())
        .map(|| {
            warp::reply::json(&serde_json::json!({
                "status": "healthy",
                "timestamp": chrono::Utc::now().timestamp()
            }))
        });

    // Rutas para gestión de rutas
    let route_manager_for_routes = Arc::clone(&route_manager);
    let routes_info_route = warp::path("routes")
        .and(warp::get())
        .and(warp::any().map(move || Arc::clone(&route_manager_for_routes)))
        .and_then(|route_manager: Arc<RouteManager>| async move {
            let routes = route_manager.list_routes().await;
            Ok::<_, warp::Rejection>(warp::reply::json(&serde_json::json!({
                "success": true,
                "routes": routes,
                "count": routes.len()
            })))
        });

    // Rutas para proxy
    let proxy_route = warp::path("proxy")
        .and(warp::post())
        .and(warp::body::json())
        .and_then(|proxy_config: serde_json::Value| async move {
            let proxy = crate::proxy::HttpProxy::new(None);
            
            let target_url = proxy_config.get("url")
                .and_then(|v| v.as_str())
                .unwrap_or("");
            let method = proxy_config.get("method")
                .and_then(|v| v.as_str())
                .unwrap_or("GET");
            let headers = proxy_config.get("headers")
                .and_then(|v| serde_json::from_value(v.clone()).ok());
            let body = proxy_config.get("body")
                .and_then(|v| v.as_str().map(|s| s.to_string()));

            if target_url.is_empty() {
                return Ok::<_, warp::Rejection>(warp::reply::with_status(
                    warp::reply::json(&serde_json::json!({
                        "success": false,
                        "error": "Missing URL parameter"
                    })),
                    warp::http::StatusCode::BAD_REQUEST,
                ));
            }

            match proxy.handle_http_proxy(target_url, method, headers, body).await {
                Ok(response) => Ok::<_, warp::Rejection>(warp::reply::with_status(
                    warp::reply::json(&serde_json::json!({
                        "success": true,
                        "response": response
                    })),
                    warp::http::StatusCode::OK,
                )),
                Err(e) => Ok::<_, warp::Rejection>(warp::reply::with_status(
                    warp::reply::json(&serde_json::json!({
                        "success": false,
                        "error": e
                    })),
                    warp::http::StatusCode::BAD_REQUEST,
                )),
            }
        });

    // Combinar todas las rutas
    let routes = websocket_route
        .or(info_route)
        .or(health_route)
        .or(routes_info_route)
        .or(proxy_route)
        .with(warp::cors().allow_any_origin());

    // Usar puerto 0 para asignación automática
    let server = warp::serve(routes);
    
    // Obtener una dirección libre
    let addr: SocketAddr = ([127, 0, 0, 1], 0).into();
    let server = server.try_bind_ephemeral(addr)?;
    
    let bound_addr = server.0;
    let port = bound_addr.port();
    let websocket_url = format!("ws://localhost:{}/ws", port);

    // Actualizar la información del servidor
    {
        let mut info = server_info.write().await;
        info.websocket_port = port;
        info.websocket_url = websocket_url.clone();
    }

    println!("🚀 WebSocket server running on {}", websocket_url);
    println!("📊 Server info available at http://localhost:{}/info", port);
    println!("❤️  Health check at http://localhost:{}/health", port);

    // Ejecutar el servidor
    server.1.await;
    
    Ok(())
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_file_path(file_path: String) -> String {
    file_path
}

#[tauri::command]
async fn get_websocket_info(server_info: tauri::State<'_, ServerInfoState>) -> Result<serde_json::Value, String> {
    let info = server_info.read().await;
    Ok(serde_json::json!({
        "port": info.websocket_port,
        "url": info.websocket_url,
        "status": if info.websocket_port > 0 { "running" } else { "starting" }
    }))
}

#[tauri::command]
async fn get_websocket_url(server_info: tauri::State<'_, ServerInfoState>) -> Result<String, String> {
    let info = server_info.read().await;
    if info.websocket_url.is_empty() {
        Err("WebSocket server not ready yet".to_string())
    } else {
        Ok(info.websocket_url.clone())
    }
}

#[tauri::command]
async fn get_websocket_port(server_info: tauri::State<'_, ServerInfoState>) -> Result<u16, String> {
    let info = server_info.read().await;
    if info.websocket_port == 0 {
        Err("WebSocket server not ready yet".to_string())
    } else {
        Ok(info.websocket_port)
    }
}

#[tauri::command]
async fn add_route(
    route_manager: tauri::State<'_, Arc<RouteManager>>,
    route_config: serde_json::Value,
) -> Result<serde_json::Value, String> {
    let route: route_manager::RouteConfig = serde_json::from_value(route_config)
        .map_err(|e| format!("Invalid route configuration: {}", e))?;
    
    route_manager.add_route(route.clone()).await
        .map_err(|e| e.to_string())?;
    
    Ok(serde_json::json!({
        "success": true,
        "message": format!("Route '{}' added successfully", route.path),
        "route": route
    }))
}

#[tauri::command]
async fn remove_route(
    route_manager: tauri::State<'_, Arc<RouteManager>>,
    path: String,
) -> Result<serde_json::Value, String> {
    route_manager.remove_route(&path).await
        .map_err(|e| e.to_string())?;
    
    Ok(serde_json::json!({
        "success": true,
        "message": format!("Route '{}' removed successfully", path)
    }))
}

#[tauri::command]
async fn list_routes(
    route_manager: tauri::State<'_, Arc<RouteManager>>,
) -> Result<serde_json::Value, String> {
    let routes = route_manager.list_routes().await;
    Ok(serde_json::json!({
        "success": true,
        "routes": routes,
        "count": routes.len()
    }))
}

#[tauri::command]
async fn proxy_request(
    proxy_config: serde_json::Value,
) -> Result<serde_json::Value, String> {
    let proxy_request = proxy_config;
    
    let target_url = proxy_request.get("url")
        .and_then(|v| v.as_str())
        .ok_or("Missing URL parameter")?;
    
    let method = proxy_request.get("method")
        .and_then(|v| v.as_str())
        .unwrap_or("GET");
    
    let headers = proxy_request.get("headers")
        .and_then(|v| serde_json::from_value(v.clone()).ok());
    
    let body = proxy_request.get("body")
        .and_then(|v| v.as_str().map(|s| s.to_string()));

    let proxy = crate::proxy::HttpProxy::new(None);
    
    match proxy.handle_http_proxy(target_url, method, headers, body).await {
        Ok(response) => Ok(serde_json::json!({
            "success": true,
            "response": response
        })),
        Err(e) => Err(e.to_string()),
    }
}