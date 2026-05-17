use std::sync::Arc;

use axum::{
    Json, Router,
    body::Body,
    extract::{Path, State},
    http::{HeaderValue, Method, Request, StatusCode, header},
    middleware::{self, Next},
    response::{Html, IntoResponse},
    routing::get,
};
use chrono::{Datelike, NaiveDate, Utc};
use serde::Serialize;
use tower_http::trace::TraceLayer;
use tracing::warn;

use crate::{
    assets,
    content::{Post, SiteContent},
    db::{NewPageView, PageViewRepository},
    pages,
};

const SHORT_CACHE: &str = "public, max-age=300, must-revalidate";
const ICON_CACHE: &str = "public, max-age=86400";

#[derive(Debug, Clone)]
pub struct AppState {
    content: Arc<SiteContent>,
    page_views: Option<PageViewRepository>,
}

pub fn router() -> Router {
    router_with_content_and_page_views(
        SiteContent::load_embedded().expect("embedded content should load"),
        None,
    )
}

pub fn router_with_page_views(page_views: PageViewRepository) -> Router {
    router_with_content_and_page_views(
        SiteContent::load_embedded().expect("embedded content should load"),
        Some(page_views),
    )
}

pub fn router_with_content(content: SiteContent) -> Router {
    router_with_content_and_page_views(content, None)
}

pub fn router_with_content_and_page_views(
    content: SiteContent,
    page_views: Option<PageViewRepository>,
) -> Router {
    let state = AppState {
        content: Arc::new(content),
        page_views,
    };

    Router::new()
        .route("/", get(home))
        .route("/about", get(about))
        .route("/contact", get(contact))
        .route("/projects", get(projects))
        .route("/blog", get(blog_index))
        .route("/blog/{slug}", get(blog_post))
        .route("/feed.xml", get(feed))
        .route("/robots.txt", get(robots))
        .route("/manifest.webmanifest", get(manifest))
        .route("/icon.svg", get(icon))
        .route("/css/site.css", get(css))
        .route("/js/theme.js", get(theme_js))
        .route("/healthz", get(health))
        .route("/actuator/health", get(actuator_health))
        .fallback(not_found)
        .with_state(state.clone())
        .layer(middleware::from_fn_with_state(state, record_page_view))
        .layer(TraceLayer::new_for_http())
}

async fn home(State(state): State<AppState>) -> Html<String> {
    Html(pages::home_page(&state.content))
}

async fn about(State(state): State<AppState>) -> Html<String> {
    Html(pages::about_page(&state.content))
}

async fn contact() -> Html<String> {
    Html(pages::contact_page())
}

async fn projects(State(state): State<AppState>) -> Html<String> {
    Html(pages::projects_page(&state.content))
}

async fn blog_index(State(state): State<AppState>) -> Html<String> {
    Html(pages::blog_index_page(&state.content))
}

async fn blog_post(State(state): State<AppState>, Path(slug): Path<String>) -> impl IntoResponse {
    state
        .content
        .post_by_slug(&slug)
        .map(|post| Html(pages::blog_post_page(post)).into_response())
        .unwrap_or_else(not_found_response)
}

async fn feed(State(state): State<AppState>) -> impl IntoResponse {
    (
        [(header::CONTENT_TYPE, "application/xml; charset=utf-8")],
        feed_xml(&state.content),
    )
}

async fn robots() -> impl IntoResponse {
    (
        [
            (header::CONTENT_TYPE, "text/plain; charset=utf-8"),
            (header::CACHE_CONTROL, SHORT_CACHE),
        ],
        assets::ROBOTS_TXT,
    )
}

async fn manifest() -> impl IntoResponse {
    (
        [
            (header::CONTENT_TYPE, "application/manifest+json"),
            (header::CACHE_CONTROL, SHORT_CACHE),
        ],
        assets::MANIFEST_JSON,
    )
}

async fn icon() -> impl IntoResponse {
    (
        [
            (header::CONTENT_TYPE, "image/svg+xml; charset=utf-8"),
            (header::CACHE_CONTROL, ICON_CACHE),
        ],
        assets::ICON_SVG,
    )
}

async fn css() -> impl IntoResponse {
    (
        [
            (header::CONTENT_TYPE, "text/css; charset=utf-8"),
            (header::CACHE_CONTROL, SHORT_CACHE),
        ],
        assets::SITE_CSS,
    )
}

async fn theme_js() -> impl IntoResponse {
    (
        [
            (header::CONTENT_TYPE, "text/javascript; charset=utf-8"),
            (header::CACHE_CONTROL, SHORT_CACHE),
        ],
        assets::THEME_JS,
    )
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse { status: "ok" })
}

async fn actuator_health() -> Json<ActuatorHealthResponse> {
    Json(ActuatorHealthResponse { status: "UP" })
}

async fn record_page_view(
    State(state): State<AppState>,
    request: Request<Body>,
    next: Next,
) -> axum::response::Response {
    let method = request.method().clone();
    let path = request.uri().path().to_owned();
    let referrer = header_to_string(request.headers().get(header::REFERER));
    let user_agent = header_to_string(request.headers().get(header::USER_AGENT));
    let response = next.run(request).await;

    if method == Method::GET
        && response.status().is_success()
        && is_trackable_path(&path)
        && let Some(repo) = state.page_views
    {
        tokio::spawn(async move {
            let result = repo
                .record_page_view(NewPageView {
                    path: &path,
                    referrer: referrer.as_deref(),
                    user_agent: user_agent.as_deref(),
                })
                .await;

            if let Err(error) = result {
                warn!(%error, path = %path, "failed to record page view");
            }
        });
    }

    response
}

fn header_to_string(value: Option<&HeaderValue>) -> Option<String> {
    value
        .and_then(|value| value.to_str().ok())
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_owned)
}

fn is_trackable_path(path: &str) -> bool {
    matches!(path, "/" | "/about" | "/contact" | "/projects" | "/blog")
        || path.starts_with("/blog/")
}

async fn not_found() -> impl IntoResponse {
    not_found_response()
}

fn not_found_response() -> axum::response::Response {
    (StatusCode::NOT_FOUND, Html(pages::not_found_page())).into_response()
}

fn feed_xml(content: &SiteContent) -> String {
    let posts = content.published_posts();
    let updated = posts
        .first()
        .map(|post| rfc1123_date(post.published_on))
        .unwrap_or_else(|| Utc::now().format("%a, %d %b %Y %H:%M:%S GMT").to_string());
    let mut xml = String::from("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    xml.push_str(
        "<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\" xmlns:content=\"http://purl.org/rss/1.0/modules/content/\">\n",
    );
    xml.push_str("  <channel>\n");
    xml.push_str("    <title>dunamismax · Blog</title>\n");
    xml.push_str("    <link>https://dunamismax.com/</link>\n");
    xml.push_str("    <description>Engineering work by Stephen Sawyer in Rust, PostgreSQL, Python automation, and self-hosted software.</description>\n");
    xml.push_str("    <atom:link href=\"https://dunamismax.com/feed.xml\" rel=\"self\" type=\"application/rss+xml\"/>\n");
    xml.push_str("    <language>en</language>\n");
    xml.push_str(&format!("    <lastBuildDate>{updated}</lastBuildDate>\n"));

    for post in posts {
        xml.push_str(&item_xml(post));
        xml.push('\n');
    }

    xml.push_str("  </channel>\n</rss>\n");
    xml
}

fn item_xml(post: &Post) -> String {
    let url = format!("https://dunamismax.com/blog/{}", post.slug);
    format!(
        "    <item>\n      <title>{}</title>\n      <link>{}</link>\n      <guid isPermaLink=\"true\">{}</guid>\n      <pubDate>{}</pubDate>\n      <description>{}</description>\n      <content:encoded><![CDATA[{}]]></content:encoded>\n    </item>",
        escape_xml(&post.title),
        escape_xml(&url),
        escape_xml(&url),
        rfc1123_date(post.published_on),
        escape_xml(&post.description),
        post.body_html,
    )
}

fn rfc1123_date(date: NaiveDate) -> String {
    format!(
        "{}, {:02} {} {} 00:00:00 GMT",
        weekday_name(date.weekday().num_days_from_sunday()),
        date.day(),
        month_name(date.month()),
        date.year()
    )
}

fn weekday_name(day: u32) -> &'static str {
    match day {
        0 => "Sun",
        1 => "Mon",
        2 => "Tue",
        3 => "Wed",
        4 => "Thu",
        5 => "Fri",
        6 => "Sat",
        _ => "Sun",
    }
}

fn month_name(month: u32) -> &'static str {
    match month {
        1 => "Jan",
        2 => "Feb",
        3 => "Mar",
        4 => "Apr",
        5 => "May",
        6 => "Jun",
        7 => "Jul",
        8 => "Aug",
        9 => "Sep",
        10 => "Oct",
        11 => "Nov",
        12 => "Dec",
        _ => "Jan",
    }
}

fn escape_xml(text: &str) -> String {
    text.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
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
    use super::{feed_xml, router, router_with_content};
    use crate::content::{
        Page, PageMeta, Post, Project, ProjectCategory, ProjectStatus, SiteContent,
    };
    use axum::{
        body::{Body, to_bytes},
        http::{Request, StatusCode, header},
    };
    use chrono::NaiveDate;
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
        let html = body(response).await;
        assert!(html.contains("That page is not here."));
        assert!(html.contains(r#"<title>Not found · dunamismax</title>"#));
    }

    #[tokio::test]
    async fn public_html_routes_render_meaningful_content() {
        for (path, expected) in [
            ("/", "Fast systems you can inspect and own."),
            ("/about", "Rust-first systems"),
            ("/projects", "Live projects."),
            ("/blog", "No posts yet."),
            ("/contact", "dunamismax@tutamail.com"),
        ] {
            let response = router()
                .oneshot(Request::builder().uri(path).body(Body::empty()).unwrap())
                .await
                .unwrap();

            assert_eq!(response.status(), StatusCode::OK, "{path}");
            assert!(
                response
                    .headers()
                    .get(header::CONTENT_TYPE)
                    .unwrap()
                    .to_str()
                    .unwrap()
                    .starts_with("text/html"),
                "{path}"
            );
            let html = body(response).await;
            assert!(html.contains(expected), "{path} did not contain {expected}");
            assert!(html.contains(r#"<link rel="canonical""#));
            assert!(html.contains(r#"<meta property="og:title""#));
            assert!(html.contains(r#"href="/manifest.webmanifest""#));
        }
    }

    #[tokio::test]
    async fn project_route_groups_content() {
        let response = router()
            .oneshot(
                Request::builder()
                    .uri("/projects")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        let html = body(response).await;
        assert!(html.contains("Applications"));
        assert!(html.contains("Developer tools"));
        assert!(html.contains("FileFerry"));
        assert!(html.contains("dunamismax.com"));
    }

    #[tokio::test]
    async fn assets_and_feed_have_expected_content_types() {
        for (path, content_type, expected) in [
            ("/feed.xml", "application/xml", "<rss version=\"2.0\""),
            ("/robots.txt", "text/plain", "User-agent: *"),
            (
                "/manifest.webmanifest",
                "application/manifest+json",
                "\"name\": \"dunamismax\"",
            ),
            ("/icon.svg", "image/svg+xml", "<svg"),
            ("/css/site.css", "text/css", ".site-header"),
            ("/js/theme.js", "text/javascript", "dunamismax-theme"),
        ] {
            let response = router()
                .oneshot(Request::builder().uri(path).body(Body::empty()).unwrap())
                .await
                .unwrap();

            assert_eq!(response.status(), StatusCode::OK, "{path}");
            assert!(
                response
                    .headers()
                    .get(header::CONTENT_TYPE)
                    .unwrap()
                    .to_str()
                    .unwrap()
                    .starts_with(content_type),
                "{path}"
            );
            assert!(body(response).await.contains(expected), "{path}");
        }
    }

    #[tokio::test]
    async fn static_assets_include_cache_headers() {
        for (path, expected_cache) in [
            ("/robots.txt", "public, max-age=300, must-revalidate"),
            (
                "/manifest.webmanifest",
                "public, max-age=300, must-revalidate",
            ),
            ("/css/site.css", "public, max-age=300, must-revalidate"),
            ("/js/theme.js", "public, max-age=300, must-revalidate"),
            ("/icon.svg", "public, max-age=86400"),
        ] {
            let response = router()
                .oneshot(Request::builder().uri(path).body(Body::empty()).unwrap())
                .await
                .unwrap();

            assert_eq!(response.status(), StatusCode::OK, "{path}");
            assert_eq!(
                response.headers().get(header::CACHE_CONTROL).unwrap(),
                expected_cache,
                "{path}"
            );
        }
    }

    #[tokio::test]
    async fn blog_post_route_renders_published_posts_and_excludes_drafts() {
        let app = router_with_content(test_content());

        let response = app
            .clone()
            .oneshot(
                Request::builder()
                    .uri("/blog/published")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);
        let html = body(response).await;
        assert!(html.contains("Published Post"));
        assert!(html.contains("Rendered body"));

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/blog/draft")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }

    #[test]
    fn feed_contains_published_posts_only() {
        let xml = feed_xml(&test_content());

        assert!(xml.contains("<title>Published Post</title>"));
        assert!(xml.contains("https://dunamismax.com/blog/published"));
        assert!(!xml.contains("Draft Post"));
    }

    #[test]
    fn page_view_tracking_only_covers_public_html_routes() {
        for path in [
            "/",
            "/about",
            "/contact",
            "/projects",
            "/blog",
            "/blog/post",
        ] {
            assert!(super::is_trackable_path(path), "{path}");
        }

        for path in ["/healthz", "/actuator/health", "/feed.xml", "/css/site.css"] {
            assert!(!super::is_trackable_path(path), "{path}");
        }
    }

    async fn body(response: axum::response::Response) -> String {
        let bytes = to_bytes(response.into_body(), 1024 * 1024).await.unwrap();
        String::from_utf8(bytes.to_vec()).unwrap()
    }

    fn test_content() -> SiteContent {
        SiteContent {
            projects: vec![Project {
                slug: "test-project".to_owned(),
                name: "Test Project".to_owned(),
                category: ProjectCategory::Apps,
                status: ProjectStatus::Active,
                position: 1,
                featured: true,
                visibility: "public".to_owned(),
                tagline: "A project for route tests.".to_owned(),
                stack: vec!["Rust".to_owned()],
                repo: "https://github.com/dunamismax/test-project".to_owned(),
                url: String::new(),
            }],
            about: Page {
                slug: "about".to_owned(),
                source_path: "about.md".into(),
                markdown: "About test.".to_owned(),
                html: "<p>About test.</p>".to_owned(),
                meta: PageMeta::new("/about", "About | dunamismax", "About test.", "about"),
            },
            posts: vec![
                Post {
                    slug: "draft".to_owned(),
                    title: "Draft Post".to_owned(),
                    description: "Draft description.".to_owned(),
                    published_on: NaiveDate::from_ymd_opt(2026, 5, 17).unwrap(),
                    tags: vec!["draft".to_owned()],
                    body_markdown: "Draft body".to_owned(),
                    body_html: "<p>Draft body</p>".to_owned(),
                    draft: true,
                },
                Post {
                    slug: "published".to_owned(),
                    title: "Published Post".to_owned(),
                    description: "Published description.".to_owned(),
                    published_on: NaiveDate::from_ymd_opt(2025, 5, 17).unwrap(),
                    tags: vec!["rust".to_owned()],
                    body_markdown: "Rendered body".to_owned(),
                    body_html: "<p>Rendered body</p>".to_owned(),
                    draft: false,
                },
            ],
        }
    }
}
