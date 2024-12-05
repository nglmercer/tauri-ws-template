#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use enigo::{
    Direction::{Click, Press, Release},
    Enigo, Key, Keyboard, Settings
};
use std::thread;
use std::time::Duration;
use std::collections::HashMap;

use warp::Filter;
use futures_util::{StreamExt, SinkExt};
use tokio::task::spawn_blocking; // Importar solo spawn_blocking directamente
use tokio::sync::mpsc;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Deserialize, Serialize, Debug)]
struct MyMessage {
    action: String,
    data: String,
}


#[tokio::main]
async fn main() {
    // Ejecutar tareas en paralelo: servidor WebSocket y bucle de intervalo
    tokio::spawn(async {
        let keys_by_platform = get_keys_by_platform();
        example_usage();
        // Convertir a JSON para facilitar la lectura
        let json_output = serde_json::to_string_pretty(&keys_by_platform).unwrap();
        println!("{}", json_output);
        // Ruta para el WebSocket
        let websocket_route = warp::path("ws")
            .and(warp::ws())
            .map(|ws: warp::ws::Ws| ws.on_upgrade(handle_connection));

        println!("WebSocket server running on ws://localhost:8080/ws");

        // Iniciar el servidor
        warp::serve(websocket_route).run(([127, 0, 0, 1], 8080)).await;
        
    });

    // Ejecutar tauriarm_lib::run en el hilo principal
    tauriarm_lib::run();


}

async fn handle_connection(ws: warp::ws::WebSocket) {
    println!("New WebSocket connection established!");

    // Dividir el WebSocket en transmisor y receptor
    let (mut tx, mut rx) = ws.split();

    // Escuchar mensajes del cliente
    while let Some(result) = rx.next().await {
        match result {
            Ok(message) => {
                if let Ok(text) = message.to_str() {
                    println!("Received: {}", text);

                    // Intentar deserializar el mensaje recibido como JSON
                    match serde_json::from_str::<MyMessage>(text) {
                        Ok(parsed_message) => {
                            // Llamar a una función para manejar el mensaje
                            handle_message(parsed_message).await;
                        }
                        Err(_) => {
                            eprintln!("Invalid JSON received");
                        }
                    }

                    // Enviar una respuesta de vuelta
                    let response = format!("Server says: {}", text);
                    let _ = tx.send(warp::ws::Message::text(response)).await;
                }
            }
            Err(e) => {
                eprintln!("WebSocket error: {}", e);
                break;
            }
        }
    }
}

// Esta función maneja el mensaje una vez deserializado
async fn handle_message(message: MyMessage) {
    match message.action.as_str() {
        "say_hello" => {
            println!("Hello received: {}", message.data);
        }
        "say_goodbye" => {
            println!("Goodbye received: {}", message.data);
        }
        _ => {
            println!("Unknown action: {}", message.action);
        }
    }
}
async fn enigo_test() {
    env_logger::try_init().ok();
    thread::sleep(Duration::from_secs(5));
    let mut enigo = Enigo::new(&Settings::default()).unwrap();

    // write text
    enigo
        .text("Hello World! here is a lot of text  ❤️")
        .unwrap();

    // select all
    enigo.key(Key::Control, Press).unwrap();
    enigo.key(Key::Unicode('a'), Click).unwrap();
    enigo.key(Key::Control, Release).unwrap();

}
fn get_keys_by_platform() -> HashMap<String, Vec<String>> {
    let mut enigo = Enigo::new(&Settings::default()).unwrap();
    
    // Ejemplo de keys comunes por plataforma
    let mut platform_keys = HashMap::new();
    
    #[cfg(target_os = "windows")]
    {
        platform_keys.insert("windows".to_string(), vec![
            "VK_RETURN".to_string(),
            "VK_SHIFT".to_string(),
            "VK_CONTROL".to_string(),
            "VK_MENU".to_string(), // Alt key
            "VK_ESCAPE".to_string()
        ]);
    }
    
    #[cfg(target_os = "macos")]
    {
        platform_keys.insert("macos".to_string(), vec![
            "kVK_Return".to_string(),
            "kVK_Shift".to_string(),
            "kVK_Command".to_string(),
            "kVK_Option".to_string(),
            "kVK_Escape".to_string()
        ]);
    }
    
    #[cfg(target_os = "linux")]
    {
        platform_keys.insert("linux".to_string(), vec![
            "Return".to_string(),
            "Shift".to_string(),
            "Control".to_string(),
            "Alt".to_string(),
            "Escape".to_string()
        ]);
    }
    
    platform_keys
}
fn execute_key_combinations(combinations: &[(Option<Key>, Key, Option<u64>)]) {
    let mut enigo = Enigo::new(&Settings::default()).unwrap();

    for (modifier, main_key, delay) in combinations {
        // Press modifier key if exists
        if let Some(mod_key) = modifier {
            enigo.key(mod_key.clone(), Press).unwrap();
        }

        // Press and release the main key
        enigo.key(main_key.clone(), Click).unwrap();

        // Release modifier key if exists
        if let Some(mod_key) = modifier {
            enigo.key(mod_key.clone(), Release).unwrap();
        }

        // Add delay if specified
        if let Some(ms) = delay {
            thread::sleep(Duration::from_millis(*ms));
        }
    }
}

// Example usage
fn example_usage() {
    enigo_test();
    let combinations = vec![
        (Some(Key::Control), Key::Unicode('a'), Some(50)),  // Select all
        (Some(Key::Control), Key::Unicode('c'), Some(50)),  // Copy
    ];
    
    execute_key_combinations(&combinations);
}
