#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod window_manager;
mod websocket_router;

use std::sync::Arc;
use warp::Filter;
use tokio::sync::Mutex;

use window_manager::WebSocketWindowManager;
use websocket_router::WebSocketRouter;

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![greet, get_file_path])
        .setup(|app| {
            let app_handle = app.handle().clone();
            
            // Crear el gestor de ventanas
            let window_manager = Arc::new(Mutex::new(WebSocketWindowManager::new(app_handle)));
            
            // Crear el router de WebSocket
            let ws_router = Arc::new(WebSocketRouter::new(Arc::clone(&window_manager)));
            

            // Configurar y iniciar el servidor WebSocket
            let ws_router_clone = Arc::clone(&ws_router);
            tokio::spawn(async move {
                let websocket_route = warp::path("ws")
                    .and(warp::ws())
                    .map(move |ws: warp::ws::Ws| {
                        let router = Arc::clone(&ws_router_clone);
                        ws.on_upgrade(move |socket| {
                            let router = Arc::clone(&router);
                            async move {
                                router.handle_connection(socket).await;
                            }
                        })
                    });

                // Ruta para obtener información del servidor
                let info_route = warp::path("info")
                    .and(warp::get())
                    .map(|| {
                        warp::reply::json(&serde_json::json!({
                            "server": "Tauri WebSocket Server",
                            "version": "1.0.0",
                            "endpoints": {
                                "websocket": "ws://localhost:8080/ws",
                                "info": "http://localhost:8080/info",
                                "health": "http://localhost:8080/health"
                            }
                        }))
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

                // Combinar todas las rutas
                let routes = websocket_route
                    .or(info_route)
                    .or(health_route)
                    .with(warp::cors().allow_any_origin());

                println!("🚀 WebSocket server running on ws://localhost:8080/ws");
                println!("📊 Server info available at http://localhost:8080/info");
                println!("❤️  Health check at http://localhost:8080/health");
                
                warp::serve(routes)
                    .run(([127, 0, 0, 1], 8080))
                    .await;
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_file_path(file_path: String) -> String {
    file_path
}