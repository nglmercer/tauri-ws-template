#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::collections::HashMap;
use futures_util::{SinkExt, StreamExt};
use warp::Filter;
use warp::ws::{WebSocket, Message};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use tokio::sync::Mutex;
use tokio::sync::mpsc::{unbounded_channel, UnboundedSender};
use tokio::sync::mpsc;
use url::Url;
use rdev::{listen, Event, EventType, Key};


#[derive(Clone, Debug, Serialize, Deserialize)]
struct KeyEvent {
    key: String,
    event_type: String,
}

#[derive(Clone, Debug)]
pub struct WebSocketWindowManager {
    app_handle: AppHandle,
    windows: Arc<Mutex<HashMap<String, Url>>>,
    clients: Arc<Mutex<HashMap<String, UnboundedSender<Message>>>>,
}

impl WebSocketWindowManager {
    pub fn new(app_handle: AppHandle) -> Self {
        WebSocketWindowManager {
            app_handle,
            windows: Arc::new(Mutex::new(HashMap::new())),
            clients: Arc::new(Mutex::new(HashMap::new())),
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
    pub async fn register_client(&self, client_id: String, tx: UnboundedSender<Message>) {
        let mut clients = self.clients.lock().await;
        clients.insert(client_id, tx);
    }

    pub async fn broadcast_message(&self, message: &str) {
        let clients = self.clients.lock().await;
        for (_, tx) in clients.iter() {
            let _ = tx.send(Message::text(message));
        }
    }
}


async fn listen_global_key_events(window_manager: Arc<Mutex<WebSocketWindowManager>>) {
    // Crear un canal para enviar eventos de teclado desde el hilo de `rdev` al bucle de Tokio
    let (tx, mut rx) = mpsc::unbounded_channel();

    // Ejecutar `listen` en un hilo separado
    std::thread::spawn(move || {
        if let Err(error) = listen(move |event: Event| {
            if let EventType::KeyPress(key) = event.event_type {
                let key_str = match key {
                    Key::Unknown(code) => format!("Unknown({})", code),
                    _ => format!("{:?}", key),
                };

                // Enviar el evento de teclado a través del canal
                if let Err(e) = tx.send(key_str) {
                    eprintln!("Error sending key event: {:?}", e);
                }
            }
        }) {
            eprintln!("Error listening to global key events: {:?}", error);
        }
    });

    // Recibir eventos de teclado en el bucle de Tokio
    while let Some(key) = rx.recv().await {
        let message = serde_json::json!({
            "action": "key_press",
            "key": key,
        });

        let manager = window_manager.lock().await;
        manager.broadcast_message(&message.to_string()).await;
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
    ws: WebSocket,
    window_manager: Arc<Mutex<WebSocketWindowManager>>,
) {
    println!("New WebSocket connection established!");

    let (tx, mut rx) = ws.split();
    let (client_tx, mut client_rx) = unbounded_channel();

    let client_id = uuid::Uuid::new_v4().to_string();
    {
        let manager = window_manager.lock().await;
        manager.register_client(client_id.clone(), client_tx).await;
    }

    // Envolver `tx` en un `Arc<Mutex>` para compartirlo de manera segura
    let tx = Arc::new(Mutex::new(tx as futures_util::stream::SplitSink<WebSocket, Message>));

    // Clonar `tx` para usarlo en el `tokio::spawn`
    let tx_clone = Arc::clone(&tx);

    tokio::spawn(async move {
        while let Some(message) = client_rx.recv().await {
            let mut tx = tx_clone.lock().await;
            let _ = tx.send(message).await;
        }
    });

    while let Some(result) = rx.next().await {
        match result {
            Ok(message) => {
                if let Ok(text) = message.to_str() {
                    println!("Received: {}", text);

                    match serde_json::from_str::<MyMessage>(text) {
                        Ok(parsed_message) => {
                            let manager_clone = Arc::clone(&window_manager);

                            tokio::spawn(async move {
                                handle_message(parsed_message, manager_clone).await;
                            });

                            let response = format!("Server processed: {}", text);
                            let mut tx = tx.lock().await;
                            let _ = tx.send(Message::text(response)).await;
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

    {
        let manager = window_manager.lock().await;
        manager.clients.lock().await.remove(&client_id);
    }
}

async fn handle_message(message: MyMessage, window_manager: Arc<Mutex<WebSocketWindowManager>>) {
    let manager = window_manager.lock().await;

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

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![get_file_path])
        .setup(|app| {
            let app_handle = app.handle().clone();
            let window_manager = Arc::new(Mutex::new(WebSocketWindowManager::new(app_handle)));

            let ws_window_manager = Arc::clone(&window_manager);

            // Iniciar la escucha de eventos de teclado globales
            let key_listener_manager = Arc::clone(&window_manager);
            tokio::spawn(async move {
                listen_global_key_events(key_listener_manager).await;
            });

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
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_file_path(file_path: String) -> String {
    // Aquí puedes procesar el archivo según sea necesario
    file_path
}