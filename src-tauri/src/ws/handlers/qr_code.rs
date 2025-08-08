use std::sync::Arc;
use tokio::sync::Mutex;
use crate::window_manager::WebSocketWindowManager;
use crate::ws::router::{WebSocketMessage, WebSocketResponse};
use base64::{Engine as _, engine::general_purpose};
use qrcode_generator::QrCodeEcc;

pub async fn handle_qr_decode(
    _window_manager: Arc<Mutex<WebSocketWindowManager>>,
    message: WebSocketMessage,
) -> WebSocketResponse {
    if let Some(data) = &message.data {
        if let Some(base64_image) = data.get("image").and_then(|v| v.as_str()) {
            // Decode base64 image
            match general_purpose::STANDARD.decode(base64_image) {
                Ok(image_data) => {
                    // Use rqrr to decode QR from image bytes
                    match decode_qr_from_image(&image_data) {
                        Ok(decoded_text) => {
                            let response_data = serde_json::json!({
                                "text": decoded_text,
                                "success": true
                            });
                            WebSocketResponse::success("qr_decode", "QR code decoded successfully", Some(response_data))
                        }
                        Err(e) => WebSocketResponse::error("qr_decode", &format!("Failed to decode QR code: {}", e))
                    }
                }
                Err(e) => WebSocketResponse::error("qr_decode", &format!("Invalid base64 image data: {}", e))
            }
        } else {
            WebSocketResponse::error("qr_decode", "Missing image data in base64 format")
        }
    } else {
        WebSocketResponse::error("qr_decode", "Missing data field")
    }
}

pub async fn handle_qr_encode(
    _window_manager: Arc<Mutex<WebSocketWindowManager>>,
    message: WebSocketMessage,
) -> WebSocketResponse {
    if let Some(data) = &message.data {
        if let Some(text) = data.get("text").and_then(|v| v.as_str()) {
            let size = data.get("size").and_then(|v| v.as_u64()).unwrap_or(256) as u32;
            
            match generate_qr_base64(text, size) {
                Ok(base64_image) => {
                    let response_data = serde_json::json!({
                        "image": base64_image,
                        "text": text,
                        "size": size,
                        "format": "png"
                    });
                    WebSocketResponse::success("qr_encode", "QR code generated successfully", Some(response_data))
                }
                Err(e) => WebSocketResponse::error("qr_encode", &format!("Failed to generate QR code: {}", e))
            }
        } else {
            WebSocketResponse::error("qr_encode", "Missing text field for QR generation")
        }
    } else {
        WebSocketResponse::error("qr_encode", "Missing data field")
    }
}

fn generate_qr_base64(text: &str, size: u32) -> Result<String, Box<dyn std::error::Error>> {
    let png_data = qrcode_generator::to_png_to_vec(text, QrCodeEcc::Medium, size as usize)?;
    Ok(general_purpose::STANDARD.encode(png_data))
}

fn decode_qr_from_image(image_data: &[u8]) -> Result<String, Box<dyn std::error::Error>> {
    use image::io::Reader as ImageReader;
    use rqrr::{PreparedImage};
    
    let img = ImageReader::new(std::io::Cursor::new(image_data))
        .with_guessed_format()?
        .decode()?;
    
    let luma_img = img.to_luma8();
    let mut prepared = PreparedImage::prepare(luma_img);
    
    let grids = prepared.detect_grids();
    if grids.is_empty() {
        return Err("No QR code found in image".into());
    }
    
    for grid in grids {
        if let Ok((_, content)) = grid.decode() {
            return Ok(content);
        }
    }
    
    Err("Failed to decode QR code".into())
}