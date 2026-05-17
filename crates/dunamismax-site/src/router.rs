use axum::{Json, Router, http::StatusCode, routing::get};
use serde::Serialize;
use tower_http::trace::TraceLayer;

pub fn router() -> Router {
    Router::new()
        .route("/healthz", get(health))
        .route("/actuator/health", get(actuator_health))
        .fallback(not_found)
        .layer(TraceLayer::new_for_http())
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse { status: "ok" })
}

async fn actuator_health() -> Json<ActuatorHealthResponse> {
    Json(ActuatorHealthResponse { status: "UP" })
}

async fn not_found() -> (StatusCode, &'static str) {
    (StatusCode::NOT_FOUND, "not found")
}

#[derive(Debug, Serialize)]
struct HealthResponse {
    status: &'static str,
}

#[derive(Debug, Serialize)]
struct ActuatorHealthResponse {
    status: &'static str,
}

#[cfg(test)]
mod tests {
    use super::router;
    use axum::{
        body::{Body, to_bytes},
        http::{Request, StatusCode, header},
    };
    use tower::ServiceExt;

    #[tokio::test]
    async fn healthz_returns_ok_json() {
        let response = router()
            .oneshot(
                Request::builder()
                    .uri("/healthz")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.headers().get(header::CONTENT_TYPE).unwrap(),
            "application/json"
        );
        assert_eq!(body(response).await, r#"{"status":"ok"}"#);
    }

    #[tokio::test]
    async fn actuator_health_returns_spring_compatible_shape() {
        let response = router()
            .oneshot(
                Request::builder()
                    .uri("/actuator/health")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(body(response).await, r#"{"status":"UP"}"#);
    }

    #[tokio::test]
    async fn unknown_route_returns_not_found() {
        let response = router()
            .oneshot(
                Request::builder()
                    .uri("/missing")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::NOT_FOUND);
        assert_eq!(body(response).await, "not found");
    }

    async fn body(response: axum::response::Response) -> String {
        let bytes = to_bytes(response.into_body(), 1024).await.unwrap();
        String::from_utf8(bytes.to_vec()).unwrap()
    }
}
