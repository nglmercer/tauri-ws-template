use std::collections::HashMap;
use std::time::Duration;
use serde::{Deserialize, Serialize};
use reqwest;
use reqwest::header::{HeaderMap, HeaderName, HeaderValue};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProxyConfig {
    pub timeout: Option<u64>,
    pub allow_origins: Option<Vec<String>>,
    pub max_redirects: Option<u8>,
}

impl Default for ProxyConfig {
    fn default() -> Self {
        Self {
            timeout: Some(30000),
            allow_origins: Some(vec!["*".to_string()]),
            max_redirects: Some(5),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProxyRequest {
    pub method: String,
    pub url: String,
    pub headers: Option<HashMap<String, String>>,
    pub body: Option<String>,
    pub timeout: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProxyResponse {
    pub status: u16,
    pub status_text: String,
    pub headers: HashMap<String, String>,
    pub body: String,
    pub is_json: bool,
}

pub struct HttpProxy {
    config: ProxyConfig,
    client: reqwest::Client,
}

impl HttpProxy {
    pub fn new(config: Option<ProxyConfig>) -> Self {
        let config = config.unwrap_or_default();
        
        let client_builder = reqwest::Client::builder()
            .timeout(Duration::from_millis(config.timeout.unwrap_or(30000)))
            .redirect(reqwest::redirect::Policy::limited(config.max_redirects.unwrap_or(5) as usize));

        let client = client_builder
            .build()
            .expect("Failed to build HTTP client");

        Self { config, client }
    }

    pub async fn handle_proxy_request(&self, request: ProxyRequest) -> Result<ProxyResponse, String> {
        // Validate URL
        let parsed_url = url::Url::parse(&request.url)
            .map_err(|_| "Invalid URL format".to_string())?;

        // Validate protocol
        if !matches!(parsed_url.scheme(), "http" | "https") {
            return Err("Invalid protocol for HTTP proxy".to_string());
        }

        // Prepare headers
        let mut headers = HeaderMap::new();
        
        if let Some(custom_headers) = request.headers {
            for (key, value) in custom_headers {
                if let Ok(header_name) = HeaderName::from_bytes(key.as_bytes()) {
                    if let Ok(header_value) = HeaderValue::from_str(&value) {
                        headers.insert(header_name, header_value);
                    }
                }
            }
        }

        // Set CORS headers
        headers.insert("Access-Control-Allow-Origin", HeaderValue::from_static("*"));
        headers.insert("Access-Control-Allow-Methods", HeaderValue::from_static("GET, POST, PUT, PATCH, DELETE, OPTIONS"));
        headers.insert("Access-Control-Allow-Headers", HeaderValue::from_static("*"));
        headers.insert("Access-Control-Expose-Headers", HeaderValue::from_static("*"));

        // Prepare request
        let method = match request.method.to_uppercase().as_str() {
            "GET" => reqwest::Method::GET,
            "POST" => reqwest::Method::POST,
            "PUT" => reqwest::Method::PUT,
            "PATCH" => reqwest::Method::PATCH,
            "DELETE" => reqwest::Method::DELETE,
            "OPTIONS" => reqwest::Method::OPTIONS,
            "HEAD" => reqwest::Method::HEAD,
            _ => return Err("Unsupported HTTP method".to_string()),
        };

        let mut req_builder = self.client.request(method, &request.url);
        req_builder = req_builder.headers(headers);

        // Add body if present
        if let Some(body) = request.body {
            if !body.is_empty() {
                req_builder = req_builder.body(body);
            }
        }

        // Execute request
        let response = req_builder.send().await
            .map_err(|e| format!("Request failed: {}", e))?;

        let status = response.status().as_u16();
        let status_text = response.status().canonical_reason().unwrap_or("Unknown").to_string();

        // Collect headers
        let mut response_headers = HashMap::new();
        for (key, value) in response.headers() {
            if let Ok(value_str) = value.to_str() {
                response_headers.insert(key.to_string(), value_str.to_string());
            }
        }

        // Get response body
        let body_bytes = response.bytes().await
            .map_err(|e| format!("Failed to read response body: {}", e))?;
        
        let body_str = String::from_utf8_lossy(&body_bytes).to_string();

        // Check if response is JSON
        let is_json = response_headers.get("content-type")
            .map(|ct| ct.contains("application/json") || ct.contains("text/json"))
            .unwrap_or(false);

        // Validate JSON if content type indicates JSON
        let final_body = if is_json {
            // Try to parse as JSON to validate
            if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&body_str) {
                serde_json::to_string(&parsed).unwrap_or(body_str)
            } else {
                // Invalid JSON, return as plain text with warning
                body_str
            }
        } else {
            body_str
        };

        Ok(ProxyResponse {
            status,
            status_text,
            headers: response_headers,
            body: final_body,
            is_json,
        })
    }

    pub async fn handle_http_proxy(&self, target_url: &str, method: &str, headers: Option<HashMap<String, String>>, body: Option<String>) -> Result<ProxyResponse, String> {
        let request = ProxyRequest {
            method: method.to_string(),
            url: target_url.to_string(),
            headers,
            body,
            timeout: None,
        };

        self.handle_proxy_request(request).await
    }
}