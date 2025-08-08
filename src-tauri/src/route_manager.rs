use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Deserialize, Serialize};
use warp::Filter;
use warp::Reply;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RouteConfig {
    pub path: String,
    pub method: String,
    pub handler: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RouteResponse {
    pub success: bool,
    pub message: String,
    pub data: Option<serde_json::Value>,
}

pub struct RouteManager {
    routes: Arc<RwLock<HashMap<String, RouteConfig>>>,
}

impl RouteManager {
    pub fn new() -> Self {
        Self {
            routes: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn add_route(&self, route: RouteConfig) -> Result<(), String> {
        let mut routes = self.routes.write().await;
        
        if routes.contains_key(&route.path) {
            return Err(format!("Route '{}' already exists", route.path));
        }

        routes.insert(route.path.clone(), route);
        Ok(())
    }

    pub async fn remove_route(&self, path: &str) -> Result<(), String> {
        let mut routes = self.routes.write().await;
        
        if routes.remove(path).is_none() {
            return Err(format!("Route '{}' not found", path));
        }

        Ok(())
    }

    pub async fn list_routes(&self) -> Vec<RouteConfig> {
        let routes = self.routes.read().await;
        routes.values().cloned().collect()
    }

    pub async fn get_route(&self, path: &str) -> Option<RouteConfig> {
        let routes = self.routes.read().await;
        routes.get(path).cloned()
    }

    pub async fn clear_routes(&self) {
        let mut routes = self.routes.write().await;
        routes.clear();
    }

    pub async fn build_warp_routes(&self) -> impl Filter<Extract = impl Reply> + Clone + Send {
        let _routes = self.routes.read().await;
        
        // Create a simple route that returns a JSON response
        let route = warp::path("api")
            .and(warp::path::param::<String>())
            .and(warp::method())
            .map(|path: String, _method: warp::http::Method| {
                warp::reply::json(&serde_json::json!({
                    "path": path,
                    "method": _method.to_string(),
                    "status": "not_implemented"
                }))
            });

        route
    }

    pub async fn handle_proxy_route(&self, path: String, _method: String) -> RouteResponse {
        let routes = self.routes.read().await;
        
        match routes.get(&path) {
            Some(route) => RouteResponse {
                success: true,
                message: format!("Route found: {} {}", route.method, route.path),
                data: Some(serde_json::to_value(route).unwrap()),
            },
            None => RouteResponse {
                success: false,
                message: format!("Route '{}' not found", path),
                data: None,
            },
        }
    }
}