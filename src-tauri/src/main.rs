#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::collections::HashMap;

use futures_util::{SinkExt, StreamExt};
use warp::Filter;
/* use tokio::task::spawn_blocking; // Importar solo spawn_blocking directamente
use tokio::sync::mpsc;
use serde_json::Value; */
use serde::{Deserialize, Serialize};
// Arc para crear un mutex
use std::sync::Arc;
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use tokio::sync::Mutex;
use url::Url; // Asegúrate de tener esta importación

#[derive(Clone, Debug)]
pub struct WebSocketWindowManager {
    app_handle: AppHandle,
    windows: Arc<Mutex<HashMap<String, Url>>>,
}

impl WebSocketWindowManager {
    pub fn new(app_handle: AppHandle) -> Self {
        WebSocketWindowManager {
            app_handle,
            windows: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn create_or_open_window(&self, label: &str, url: &str) -> Result<(), String> {
        let parsed_url = Url::parse(url).map_err(|e| format!("Invalid URL: {}", e))?;

        let mut windows = self.windows.lock().await;

        // Si la ventana ya existe, enfócarla o traerla al frente
        if self.app_handle.get_webview_window(label).is_some() {
            if let Some(window) = self.app_handle.get_webview_window(label) {
                window
                    .show()
                    .map_err(|e| format!("Error showing window: {}", e))?;
                window
                    .set_focus()
                    .map_err(|e| format!("Error focusing window: {}", e))?;
                return Ok(());
            }
        }

        // Crear nueva ventana si no existe
        WebviewWindowBuilder::new(
            &self.app_handle,
            label,
            WebviewUrl::External(parsed_url.clone()),
        )
        .title(format!("Ventana: {}", label))
        .resizable(true)
        .transparent(false)
        .build()
        .map_err(|e| format!("Failed to create webview: {}", e))?;

        // Registrar la ventana en el mapa
        windows.insert(label.to_string(), parsed_url);

        Ok(())
    }

    pub async fn close_window(&self, label: &str) -> Result<(), String> {
        let mut windows = self.windows.lock().await;

        if let Some(window) = self.app_handle.get_webview_window(label) {
            window
                .close()
                .map_err(|e| format!("Error closing window: {}", e))?;
            windows.remove(label);
            Ok(())
        } else {
            Err(format!("Window with label '{}' not found", label))
        }
    }

    pub async fn list_windows(&self) -> Vec<String> {
        let windows = self.windows.lock().await;
        windows.keys().cloned().collect()
    }

    pub async fn get_window_url(&self, label: &str) -> Option<Url> {
        let windows = self.windows.lock().await;
        windows.get(label).cloned()
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
struct MyMessage {
    action: String,
    label: Option<String>,
    url: Option<String>,
    data: Option<String>,
}

async fn handle_connection(
    ws: warp::ws::WebSocket,
    window_manager: Arc<Mutex<WebSocketWindowManager>>,
) {
    println!("New WebSocket connection established!");

    // Split the WebSocket into sender and receiver
    let (mut tx, mut rx) = ws.split();

    // Listen for client messages
    while let Some(result) = rx.next().await {
        match result {
            Ok(message) => {
                if let Ok(text) = message.to_str() {
                    println!("Received: {}", text);

                    // Try to deserialize the received message as JSON
                    match serde_json::from_str::<MyMessage>(text) {
                        Ok(parsed_message) => {
                            // Clone the window manager for async use
                            let manager_clone = Arc::clone(&window_manager);

                            // Handle the message
                            tokio::spawn(async move {
                                handle_message(parsed_message, manager_clone).await;
                            });

                            // Send a response back
                            let response = format!("Server processed: {}", text);
                            let _ = tx.send(warp::ws::Message::text(response)).await;
                        }
                        Err(_) => {
                            eprintln!("Invalid JSON received");
                        }
                    }
                }
            }
            Err(e) => {
                eprintln!("WebSocket error: {}", e);
                break;
            }
        }
    }
}

async fn handle_message(message: MyMessage, window_manager: Arc<Mutex<WebSocketWindowManager>>) {
    let mut manager = window_manager.lock().await;

    match message.action.as_str() {
        "create_window" => {
            if let (Some(label), Some(url)) = (&message.label, &message.url) {
                match manager.create_or_open_window(label, url).await {
                    Ok(_) => println!("Window created: {}", label),
                    Err(e) => eprintln!("Failed to create window: {}", e),
                }
            } else {
                eprintln!("Missing label or URL for window creation");
            }
        }
        "close_window" => {
            if let Some(label) = &message.label {
                match manager.close_window(label).await {
                    Ok(_) => println!("Window closed: {}", label),
                    Err(e) => eprintln!("Failed to close window: {}", e),
                }
            } else {
                eprintln!("Missing label for window closure");
            }
        }
        _ => {
            println!("Unknown action: {}", message.action);
        }
    }
}

// In your main function, set up the WebSocket server with the window manager
#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let app_handle = app.handle().clone();
            let window_manager = Arc::new(Mutex::new(WebSocketWindowManager::new(app_handle)));

            let ws_window_manager = Arc::clone(&window_manager);

            tokio::spawn(async move {
                let websocket_route =
                    warp::path("ws")
                        .and(warp::ws())
                        .map(move |ws: warp::ws::Ws| {
                            let wm = Arc::clone(&ws_window_manager);
                            ws.on_upgrade(move |socket| handle_connection(socket, wm))
                        });

                println!("WebSocket server running on ws://localhost:8080/ws");
                warp::serve(websocket_route)
                    .run(([127, 0, 0, 1], 8080))
                    .await;
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
