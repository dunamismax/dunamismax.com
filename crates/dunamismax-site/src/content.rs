use std::{
    cmp::Reverse,
    collections::{HashMap, HashSet},
    fs,
    path::{Path, PathBuf},
};

use chrono::NaiveDate;
use pulldown_cmark::{Options, Parser, html};
use serde::Deserialize;
use toml::Value;

const FRONTMATTER_DELIM: &str = "+++";

#[derive(Debug, Clone)]
pub struct SiteContent {
    pub projects: Vec<Project>,
    pub about: Page,
    pub posts: Vec<Post>,
}

impl SiteContent {
    pub fn load(content_root: impl AsRef<Path>) -> Result<Self, ContentError> {
        let content_root = content_root.as_ref();
        let markdown = MarkdownRenderer::default();

        Ok(Self {
            projects: load_projects(content_root.join("projects.toml"))?,
            about: load_page(
                content_root.join("pages/about.md"),
                PageMeta::new(
                    "/about",
                    "About | dunamismax",
                    "About Stephen Sawyer and the dunamismax engineering stack.",
                    "about",
                ),
                &markdown,
            )?,
            posts: load_posts(content_root.join("posts"), &markdown)?,
        })
    }

    pub fn featured_projects(&self) -> Vec<&Project> {
        self.projects
            .iter()
            .filter(|project| project.featured)
            .collect()
    }

    pub fn published_posts(&self) -> Vec<&Post> {
        self.posts.iter().filter(|post| !post.draft).collect()
    }

    pub fn latest_post(&self) -> Option<&Post> {
        self.published_posts().into_iter().next()
    }

    pub fn post_by_slug(&self, slug: &str) -> Option<&Post> {
        self.posts
            .iter()
            .find(|post| post.slug == slug && !post.draft)
    }
}

#[derive(Debug, Clone, Eq, PartialEq)]
pub struct Page {
    pub slug: String,
    pub source_path: PathBuf,
    pub markdown: String,
    pub html: String,
    pub meta: PageMeta,
}

#[derive(Debug, Clone, Eq, PartialEq)]
pub struct PageMeta {
    pub path: String,
    pub title: String,
    pub description: String,
    pub section: String,
    pub og_type: String,
}

impl PageMeta {
    pub fn new(path: &str, title: &str, description: &str, section: &str) -> Self {
        Self {
            path: path.to_owned(),
            title: title.to_owned(),
            description: description.to_owned(),
            section: section.to_owned(),
            og_type: "website".to_owned(),
        }
    }
}

#[derive(Debug, Clone, Eq, PartialEq)]
pub struct Project {
    pub slug: String,
    pub name: String,
    pub category: ProjectCategory,
    pub status: ProjectStatus,
    pub position: i32,
    pub featured: bool,
    pub visibility: String,
    pub tagline: String,
    pub stack: Vec<String>,
    pub repo: String,
    pub url: String,
}

impl Project {
    pub fn public_repo(&self) -> bool {
        self.visibility == "public" && !self.repo.is_empty()
    }
}

#[derive(Debug, Clone, Copy, Eq, PartialEq, Hash)]
pub enum ProjectCategory {
    Apps,
    Infrastructure,
    DeveloperTools,
    Reference,
}

impl ProjectCategory {
    pub fn from_slug(slug: &str) -> Result<Self, ContentError> {
        match slug {
            "apps" => Ok(Self::Apps),
            "infrastructure" => Ok(Self::Infrastructure),
            "developer-tools" => Ok(Self::DeveloperTools),
            "reference" => Ok(Self::Reference),
            _ => Err(ContentError::Invalid {
                path: PathBuf::from("content/projects.toml"),
                message: format!("unknown project category: {slug}"),
            }),
        }
    }

    pub fn slug(self) -> &'static str {
        match self {
            Self::Apps => "apps",
            Self::Infrastructure => "infrastructure",
            Self::DeveloperTools => "developer-tools",
            Self::Reference => "reference",
        }
    }

    pub fn label(self) -> &'static str {
        match self {
            Self::Apps => "Applications",
            Self::Infrastructure => "Infrastructure",
            Self::DeveloperTools => "Developer tools",
            Self::Reference => "Reference",
        }
    }

    pub fn description(self) -> &'static str {
        match self {
            Self::Apps => "Products and services with clear data models and owned infrastructure.",
            Self::Infrastructure => "Self-hosted services, networking, and operations work.",
            Self::DeveloperTools => "Tooling, automation, and operator-facing utilities.",
            Self::Reference => {
                "Profile, site, and source repos that explain the stack and operating surface."
            }
        }
    }
}

#[derive(Debug, Clone, Copy, Eq, PartialEq, Hash)]
pub enum ProjectStatus {
    Active,
    Shipped,
    Phase0,
    Legacy,
}

impl ProjectStatus {
    pub fn from_slug(slug: &str) -> Result<Self, ContentError> {
        match slug {
            "active" => Ok(Self::Active),
            "shipped" => Ok(Self::Shipped),
            "phase-0" => Ok(Self::Phase0),
            "legacy" => Ok(Self::Legacy),
            _ => Err(ContentError::Invalid {
                path: PathBuf::from("content/projects.toml"),
                message: format!("unknown project status: {slug}"),
            }),
        }
    }

    pub fn slug(self) -> &'static str {
        match self {
            Self::Active => "active",
            Self::Shipped => "shipped",
            Self::Phase0 => "phase-0",
            Self::Legacy => "legacy",
        }
    }

    pub fn label(self) -> &'static str {
        match self {
            Self::Active => "Active",
            Self::Shipped => "Shipped",
            Self::Phase0 => "Phase 0",
            Self::Legacy => "Legacy",
        }
    }
}

#[derive(Debug, Clone, Eq, PartialEq)]
pub struct Post {
    pub slug: String,
    pub title: String,
    pub description: String,
    pub published_on: NaiveDate,
    pub tags: Vec<String>,
    pub body_markdown: String,
    pub body_html: String,
    pub draft: bool,
}

impl Post {
    pub fn reading_time_minutes(&self) -> usize {
        let words = self
            .body_markdown
            .split(|character: char| !character.is_alphanumeric())
            .filter(|word| !word.is_empty())
            .count();

        usize::max(1, words.div_ceil(220))
    }
}

#[derive(Debug, Clone, Eq, PartialEq)]
pub struct Frontmatter {
    pub slug: Option<String>,
    pub title: String,
    pub description: String,
    pub published_on: NaiveDate,
    pub tags: Vec<String>,
    pub draft: bool,
}

#[derive(Debug, Clone)]
pub struct MarkdownRenderer {
    options: Options,
}

impl Default for MarkdownRenderer {
    fn default() -> Self {
        let mut options = Options::empty();
        options.insert(Options::ENABLE_TABLES);
        options.insert(Options::ENABLE_GFM);

        Self { options }
    }
}

impl MarkdownRenderer {
    pub fn render(&self, markdown: &str) -> String {
        let parser = Parser::new_ext(markdown, self.options);
        let mut rendered = String::new();
        html::push_html(&mut rendered, parser);

        sanitize_html(&rendered)
    }
}

fn sanitize_html(rendered: &str) -> String {
    let tags = HashSet::from([
        "a",
        "blockquote",
        "br",
        "code",
        "em",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "hr",
        "li",
        "ol",
        "p",
        "pre",
        "strong",
        "table",
        "tbody",
        "td",
        "th",
        "thead",
        "tr",
        "ul",
    ]);
    let tag_attributes = HashMap::from([("a", HashSet::from(["href", "title"]))]);
    let url_schemes = HashSet::from(["http", "https", "mailto"]);

    ammonia::Builder::new()
        .tags(tags)
        .tag_attributes(tag_attributes)
        .generic_attributes(HashSet::new())
        .url_schemes(url_schemes)
        .clean(rendered)
        .to_string()
}

pub fn load_projects(path: impl AsRef<Path>) -> Result<Vec<Project>, ContentError> {
    let path = path.as_ref();
    let text = read_to_string(path)?;
    load_projects_from_str(path, &text)
}

fn load_projects_from_str(path: &Path, text: &str) -> Result<Vec<Project>, ContentError> {
    let document: RawProjectsDocument =
        toml::from_str(text).map_err(|source| ContentError::Toml {
            path: path.to_path_buf(),
            source,
        })?;

    let mut seen = HashSet::new();
    let mut projects = Vec::with_capacity(document.projects.len());

    for raw in document.projects {
        if !seen.insert(raw.slug.clone()) {
            return Err(ContentError::Invalid {
                path: path.to_path_buf(),
                message: format!("duplicate project slug: {}", raw.slug),
            });
        }

        projects.push(Project {
            slug: raw.slug,
            name: raw.name,
            category: ProjectCategory::from_slug(&raw.category)?,
            status: ProjectStatus::from_slug(&raw.status)?,
            position: raw.position.unwrap_or(999),
            featured: raw.featured.unwrap_or(false),
            visibility: raw.visibility.unwrap_or_else(|| "public".to_owned()),
            tagline: raw.tagline,
            stack: raw.stack,
            repo: raw.repo.unwrap_or_default(),
            url: raw.url.unwrap_or_default(),
        });
    }

    projects.sort_by(|left, right| {
        left.position
            .cmp(&right.position)
            .then_with(|| left.name.cmp(&right.name))
    });

    Ok(projects)
}

pub fn load_page(
    path: impl AsRef<Path>,
    meta: PageMeta,
    markdown: &MarkdownRenderer,
) -> Result<Page, ContentError> {
    let path = path.as_ref();
    let markdown_body = read_to_string(path)?;
    let slug = path
        .file_stem()
        .and_then(|name| name.to_str())
        .unwrap_or("page")
        .to_owned();

    Ok(Page {
        slug,
        source_path: path.to_path_buf(),
        html: markdown.render(&markdown_body),
        markdown: markdown_body,
        meta,
    })
}

pub fn load_posts(
    posts_dir: impl AsRef<Path>,
    markdown: &MarkdownRenderer,
) -> Result<Vec<Post>, ContentError> {
    let posts_dir = posts_dir.as_ref();
    if !posts_dir.exists() {
        return Ok(Vec::new());
    }

    let mut posts = Vec::new();
    for entry in fs::read_dir(posts_dir).map_err(|source| ContentError::Io {
        path: posts_dir.to_path_buf(),
        source,
    })? {
        let path = entry
            .map_err(|source| ContentError::Io {
                path: posts_dir.to_path_buf(),
                source,
            })?
            .path();
        if path.extension().and_then(|extension| extension.to_str()) == Some("md") {
            posts.push(parse_post(&path, markdown)?);
        }
    }

    let mut seen = HashSet::new();
    for post in &posts {
        if !seen.insert(post.slug.clone()) {
            return Err(ContentError::Invalid {
                path: posts_dir.to_path_buf(),
                message: format!("duplicate post slug: {}", post.slug),
            });
        }
    }

    posts.sort_by_key(|post| Reverse(post.published_on));
    Ok(posts)
}

fn parse_post(path: &Path, markdown: &MarkdownRenderer) -> Result<Post, ContentError> {
    let text = read_to_string(path)?;
    let (meta, body_markdown) = split_frontmatter(path, &text)?;
    let frontmatter = parse_frontmatter(path, meta)?;
    let slug = frontmatter
        .slug
        .unwrap_or_else(|| fallback_slug(path).unwrap_or_else(|| "post".to_owned()));
    let body_html = markdown.render(body_markdown);

    Ok(Post {
        slug,
        title: frontmatter.title,
        description: frontmatter.description,
        published_on: frontmatter.published_on,
        tags: frontmatter.tags,
        body_markdown: body_markdown.to_owned(),
        body_html,
        draft: frontmatter.draft,
    })
}

fn split_frontmatter<'a>(path: &Path, text: &'a str) -> Result<(&'a str, &'a str), ContentError> {
    if !text.starts_with(FRONTMATTER_DELIM) {
        return Err(ContentError::Invalid {
            path: path.to_path_buf(),
            message: "missing TOML frontmatter delimited by +++".to_owned(),
        });
    }

    let end = text[FRONTMATTER_DELIM.len()..]
        .find(&format!("\n{FRONTMATTER_DELIM}"))
        .map(|index| index + FRONTMATTER_DELIM.len())
        .ok_or_else(|| ContentError::Invalid {
            path: path.to_path_buf(),
            message: "frontmatter opened with +++ but never closed".to_owned(),
        })?;

    let body_start = end + 1 + FRONTMATTER_DELIM.len();
    let body = text[body_start..]
        .strip_prefix('\n')
        .unwrap_or(&text[body_start..]);

    Ok((text[FRONTMATTER_DELIM.len()..end].trim(), body))
}

fn parse_frontmatter(path: &Path, meta: &str) -> Result<Frontmatter, ContentError> {
    let value = toml::from_str::<Value>(meta).map_err(|source| ContentError::Toml {
        path: path.to_path_buf(),
        source,
    })?;
    let table = value.as_table().ok_or_else(|| ContentError::Invalid {
        path: path.to_path_buf(),
        message: "frontmatter must be a TOML table".to_owned(),
    })?;

    Ok(Frontmatter {
        slug: optional_string(table, "slug"),
        title: required_string(path, table, "title")?,
        description: required_string(path, table, "description")?,
        published_on: required_date(path, table, "published_on")?,
        tags: string_list(table, "tags")?,
        draft: table.get("draft").and_then(Value::as_bool).unwrap_or(false),
    })
}

fn required_string(
    path: &Path,
    table: &toml::Table,
    key: &'static str,
) -> Result<String, ContentError> {
    table
        .get(key)
        .and_then(Value::as_str)
        .map(str::to_owned)
        .ok_or_else(|| ContentError::Invalid {
            path: path.to_path_buf(),
            message: format!("missing required string key {key}"),
        })
}

fn optional_string(table: &toml::Table, key: &'static str) -> Option<String> {
    table.get(key).and_then(Value::as_str).map(str::to_owned)
}

fn required_date(
    path: &Path,
    table: &toml::Table,
    key: &'static str,
) -> Result<NaiveDate, ContentError> {
    let value = table.get(key).ok_or_else(|| ContentError::Invalid {
        path: path.to_path_buf(),
        message: format!("missing required date key {key}"),
    })?;

    match value {
        Value::Datetime(date_time) => parse_date(path, key, &date_time.to_string()),
        Value::String(text) => parse_date(path, key, text),
        _ => Err(ContentError::Invalid {
            path: path.to_path_buf(),
            message: format!("unsupported date value for {key}"),
        }),
    }
}

fn parse_date(path: &Path, key: &'static str, text: &str) -> Result<NaiveDate, ContentError> {
    let date = text.get(..10).ok_or_else(|| ContentError::Invalid {
        path: path.to_path_buf(),
        message: format!("invalid date for {key}: {text}"),
    })?;

    NaiveDate::parse_from_str(date, "%Y-%m-%d").map_err(|source| ContentError::Date {
        path: path.to_path_buf(),
        key,
        source,
    })
}

fn string_list(table: &toml::Table, key: &'static str) -> Result<Vec<String>, ContentError> {
    match table.get(key) {
        Some(Value::String(text)) => Ok(split_comma_list(text)),
        Some(Value::Array(values)) => values
            .iter()
            .map(|value| {
                value
                    .as_str()
                    .map(str::to_owned)
                    .ok_or_else(|| ContentError::Invalid {
                        path: PathBuf::from("frontmatter"),
                        message: format!("{key} must contain only strings"),
                    })
            })
            .collect(),
        Some(_) => Err(ContentError::Invalid {
            path: PathBuf::from("frontmatter"),
            message: format!("{key} must be a string or string array"),
        }),
        None => Ok(Vec::new()),
    }
}

fn split_comma_list(text: &str) -> Vec<String> {
    text.split(',')
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_owned)
        .collect()
}

fn fallback_slug(path: &Path) -> Option<String> {
    path.file_stem()
        .and_then(|name| name.to_str())
        .map(str::to_owned)
}

fn read_to_string(path: &Path) -> Result<String, ContentError> {
    fs::read_to_string(path).map_err(|source| ContentError::Io {
        path: path.to_path_buf(),
        source,
    })
}

#[derive(Debug, Deserialize)]
struct RawProjectsDocument {
    projects: Vec<RawProject>,
}

#[derive(Debug, Deserialize)]
struct RawProject {
    slug: String,
    name: String,
    category: String,
    status: String,
    position: Option<i32>,
    featured: Option<bool>,
    visibility: Option<String>,
    tagline: String,
    #[serde(default, deserialize_with = "deserialize_string_list")]
    stack: Vec<String>,
    repo: Option<String>,
    url: Option<String>,
}

fn deserialize_string_list<'de, D>(deserializer: D) -> Result<Vec<String>, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let value = Option::<Value>::deserialize(deserializer)?;
    match value {
        Some(Value::String(text)) => Ok(split_comma_list(&text)),
        Some(Value::Array(values)) => values
            .iter()
            .map(|value| {
                value
                    .as_str()
                    .map(str::to_owned)
                    .ok_or_else(|| serde::de::Error::custom("list value must be a string"))
            })
            .collect(),
        Some(_) => Err(serde::de::Error::custom(
            "value must be a string or string array",
        )),
        None => Ok(Vec::new()),
    }
}

#[derive(Debug, thiserror::Error)]
pub enum ContentError {
    #[error("{path}: {source}")]
    Io {
        path: PathBuf,
        #[source]
        source: std::io::Error,
    },
    #[error("{path}: invalid TOML: {source}")]
    Toml {
        path: PathBuf,
        #[source]
        source: toml::de::Error,
    },
    #[error("{path}: invalid date in {key}: {source}")]
    Date {
        path: PathBuf,
        key: &'static str,
        #[source]
        source: chrono::ParseError,
    },
    #[error("{path}: {message}")]
    Invalid { path: PathBuf, message: String },
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    #[test]
    fn loads_repository_content_tree() {
        let root = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../content");

        let content = SiteContent::load(root).expect("repository content should load");

        assert_eq!(content.projects.len(), 7);
        assert_eq!(content.featured_projects().len(), 7);
        assert!(content.about.html.contains("<strong>Rust</strong>"));
        assert!(content.about.html.contains("<strong>Python</strong>"));
    }

    #[test]
    fn parses_valid_project_content() {
        let projects = load_projects_from_str(
            Path::new("projects.toml"),
            r#"
                [[projects]]
                slug = "beta"
                name = "Beta"
                category = "apps"
                status = "active"
                tagline = "Second alphabetically"
                position = 10
                stack = ["Rust", "PostgreSQL"]

                [[projects]]
                slug = "alpha"
                name = "Alpha"
                category = "developer-tools"
                status = "shipped"
                tagline = "First alphabetically"
                position = 10
                featured = true
                visibility = "private"
                stack = "Rust, Tokio"
            "#,
        )
        .expect("valid projects should parse");

        assert_eq!(projects[0].slug, "alpha");
        assert_eq!(projects[0].stack, ["Rust", "Tokio"]);
        assert_eq!(projects[1].stack, ["Rust", "PostgreSQL"]);
    }

    #[test]
    fn rejects_missing_project_keys() {
        let error = load_projects_from_str(
            Path::new("projects.toml"),
            r#"
                [[projects]]
                slug = "missing"
                name = "Missing"
                category = "apps"
                status = "active"
            "#,
        )
        .expect_err("missing required project fields should fail");

        assert!(error.to_string().contains("missing field `tagline`"));
    }

    #[test]
    fn rejects_duplicate_project_slugs() {
        let error = load_projects_from_str(
            Path::new("projects.toml"),
            r#"
                [[projects]]
                slug = "same"
                name = "One"
                category = "apps"
                status = "active"
                tagline = "One"

                [[projects]]
                slug = "same"
                name = "Two"
                category = "apps"
                status = "active"
                tagline = "Two"
            "#,
        )
        .expect_err("duplicate project slugs should fail");

        assert!(error.to_string().contains("duplicate project slug: same"));
    }

    #[test]
    fn parses_posts_with_draft_filtering_and_newest_sorting() {
        let root = temp_content_root();
        write_file(
            &root.join("posts/older.md"),
            r#"+++
title = "Older"
description = "Older published post"
published_on = "2024-01-01"
+++
Older body.
"#,
        );
        write_file(
            &root.join("posts/newer.md"),
            r#"+++
slug = "newer-post"
title = "Newer"
description = "Newer published post"
published_on = "2025-01-01"
+++
Newer body.
"#,
        );
        write_file(
            &root.join("posts/draft.md"),
            r#"+++
title = "Draft"
description = "Draft post"
published_on = "2026-01-01"
draft = true
+++
Draft body.
"#,
        );

        let posts = load_posts(root.join("posts"), &MarkdownRenderer::default())
            .expect("posts should load");
        let content = SiteContent {
            projects: Vec::new(),
            about: test_page(),
            posts,
        };

        assert_eq!(content.posts[0].slug, "draft");
        assert_eq!(content.published_posts()[0].slug, "newer-post");
        assert_eq!(content.post_by_slug("draft"), None);
    }

    #[test]
    fn supports_slug_fallback_and_toml_dates() {
        let root = temp_content_root();
        write_file(
            &root.join("posts/fallback.md"),
            r#"+++
title = "Fallback"
description = "Uses filename slug"
published_on = 2025-05-17
tags = "rust, content"
+++
Body text.
"#,
        );

        let posts =
            load_posts(root.join("posts"), &MarkdownRenderer::default()).expect("post should load");

        assert_eq!(posts[0].slug, "fallback");
        assert_eq!(posts[0].published_on.to_string(), "2025-05-17");
        assert_eq!(posts[0].tags, ["rust", "content"]);
    }

    #[test]
    fn calculates_reading_time_with_one_minute_floor() {
        let one_word = Post {
            slug: "short".to_owned(),
            title: "Short".to_owned(),
            description: "Short".to_owned(),
            published_on: NaiveDate::from_ymd_opt(2025, 1, 1).unwrap(),
            tags: Vec::new(),
            body_markdown: "one".to_owned(),
            body_html: String::new(),
            draft: false,
        };
        let long = Post {
            body_markdown: vec!["word"; 221].join(" "),
            ..one_word.clone()
        };

        assert_eq!(one_word.reading_time_minutes(), 1);
        assert_eq!(long.reading_time_minutes(), 2);
    }

    #[test]
    fn markdown_preserves_limited_html_and_strips_scripts() {
        let html = MarkdownRenderer::default()
            .render("<p><strong>Allowed</strong><script>alert(1)</script></p>");

        assert!(html.contains("<p><strong>Allowed</strong></p>"));
        assert!(!html.contains("script"));
        assert!(!html.contains("alert"));
    }

    #[test]
    fn rejects_post_missing_frontmatter_keys() {
        let root = temp_content_root();
        write_file(
            &root.join("posts/bad.md"),
            r#"+++
title = "Bad"
published_on = "2025-01-01"
+++
Missing description.
"#,
        );

        let error = load_posts(root.join("posts"), &MarkdownRenderer::default())
            .expect_err("missing description should fail");

        assert!(
            error
                .to_string()
                .contains("missing required string key description")
        );
    }

    fn test_page() -> Page {
        Page {
            slug: "about".to_owned(),
            source_path: PathBuf::from("about.md"),
            markdown: String::new(),
            html: String::new(),
            meta: PageMeta::new("/about", "About", "About", "about"),
        }
    }

    fn temp_content_root() -> PathBuf {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let root = std::env::temp_dir().join(format!(
            "dunamismax-site-content-test-{}-{suffix}",
            std::process::id()
        ));
        fs::create_dir_all(root.join("posts")).unwrap();
        root
    }

    fn write_file(path: &Path, contents: &str) {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).unwrap();
        }
        fs::write(path, contents).unwrap();
    }
}
