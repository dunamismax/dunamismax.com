use chrono::{Datelike, NaiveDate};
use leptos::prelude::*;

use crate::content::{PageMeta, Post, Project, ProjectCategory, SiteContent};

const SITE_BASE_URL: &str = "https://dunamismax.com";
const ASSET_VERSION: &str = "20260518-ui3";
const DEFAULT_DESCRIPTION: &str = "Engineering work by Stephen Sawyer in Rust, PostgreSQL, Python automation, and self-hosted software.";

#[derive(Debug, Clone)]
pub struct ContactCard {
    pub title: &'static str,
    pub value: &'static str,
    pub href: &'static str,
    pub external: bool,
    pub detail: &'static str,
}

pub fn home_page(content: &SiteContent) -> String {
    let featured = content
        .featured_projects()
        .into_iter()
        .map(project_card)
        .collect::<Vec<_>>()
        .join("");
    let latest_panel = content
        .latest_post()
        .map(latest_post_card)
        .unwrap_or_else(latest_post_empty_card);
    let project_count = content.projects.len();
    let post_count = content.published_posts().len();
    let project_summary = format!("{project_count} public projects");
    let writing_summary = if post_count == 1 {
        "1 published note".to_owned()
    } else {
        format!("{post_count} published notes")
    };
    let current_focus = focus_panel();
    let quick_nav = quick_nav_grid();
    let stats = home_stats(&project_summary, &writing_summary);
    let workflows = workflow_grid();
    let meta = PageMeta::new("/", "dunamismax", DEFAULT_DESCRIPTION, "home");
    let body = view! {
        <section class="hero-section">
          <div class="hero-background" aria-hidden="true"></div>
          <div class="section-inner hero-grid">
            <div class="hero-copy">
              <p class="eyebrow">"Stephen Sawyer · dunamismax"</p>
              <h1>"Rust-first systems with durable state and practical operations."</h1>
              <p class="lede lede--strong">
                "Engineering work across Rust services, PostgreSQL-backed products, Python automation, cryptography, encryption, and self-hosted infrastructure."
              </p>
              <p class="lede">
                "The public work is kept inspectable: plain-file content, minimal JavaScript, deployable on one Ubuntu VM behind Caddy."
              </p>
              <div class="hero-actions">
                <a href="/projects" class="button button-primary">"View projects"</a>
                <a href="/about" class="button button-secondary">"Read about Stephen"</a>
              </div>
              <div class="stack-row" aria-label="Primary stack">
                <span class="stack-chip stack-chip--strong">"Rust"</span>
                <span class="stack-chip stack-chip--strong">"PostgreSQL"</span>
                <span class="stack-chip stack-chip--strong">"Python"</span>
                <span class="stack-chip">"Axum"</span>
                <span class="stack-chip">"Leptos"</span>
                <span class="stack-chip">"Tokio"</span>
                <span class="stack-chip">"uv"</span>
                <span class="stack-chip">"Ruff"</span>
                <span class="stack-chip">"systemd"</span>
                <span class="stack-chip">"Caddy"</span>
              </div>
              <p class="fine-print">
                "Code lives on "
                <a href="https://github.com/dunamismax" rel="noopener noreferrer me" target="_blank">"GitHub"</a>
                " and mirrors to "
                <a href="https://codeberg.org/dunamismax" rel="noopener noreferrer me" target="_blank">"Codeberg"</a>
                "."
              </p>
            </div>
            <aside class="hero-aside" aria-label="Site snapshot">
              <div inner_html=current_focus></div>
              <div inner_html=latest_panel></div>
            </aside>
          </div>
        </section>
        <section class="signal-bar">
          <div class="section-inner" inner_html=stats></div>
        </section>
        <section class="page-section page-section--tight">
          <div class="section-inner" inner_html=workflows></div>
        </section>
        <section class="page-section">
          <div class="section-inner">
            <div class="section-heading section-heading--split">
              <div>
                <p class="eyebrow">"Featured projects"</p>
                <h2>"Current public work."</h2>
              </div>
              <p>"Rust-first tools, Python automation, PostgreSQL-backed operations, and technical references that support the next phase of work."</p>
            </div>
            <ul class="card-list card-list--projects" inner_html=featured></ul>
            <p class="section-foot"><a href="/projects" class="section-link">"See every project"</a></p>
          </div>
        </section>
        <section class="page-section page-section--quiet">
          <div class="section-inner">
            <div class="section-heading section-heading--split">
              <div>
                <p class="eyebrow">"Navigate"</p>
                <h2>"Find the useful surface."</h2>
              </div>
              <p>"A compact route map for projects, writing, background, and contact paths."</p>
            </div>
            <nav class="nav-card-grid" aria-label="Quick navigation" inner_html=quick_nav></nav>
          </div>
        </section>
    }.to_html();

    render_layout(&meta, body)
}

fn focus_panel() -> String {
    view! {
      <section class="system-panel" aria-label="Current focus">
        <div class="system-panel__header">
          <span class="system-panel__label">"Current direction"</span>
          <span class="status-dot">"Live"</span>
        </div>
        <dl class="system-panel__rows">
          <div>
            <dt>"Runtime"</dt>
            <dd>"Rust 2024 · Axum · Leptos SSR"</dd>
          </div>
          <div>
            <dt>"State"</dt>
            <dd>"PostgreSQL · typed migrations · privacy-aware events"</dd>
          </div>
          <div>
            <dt>"Ops"</dt>
            <dd>"Ubuntu LTS · Caddy · systemd · SSH deploys"</dd>
          </div>
        </dl>
      </section>
    }
    .to_html()
}

fn home_stats(project_summary: &str, writing_summary: &str) -> String {
    let stats = [
        ("Stack", "Rust, PostgreSQL, Python"),
        ("Work", project_summary),
        ("Writing", writing_summary),
        ("Deploy", "Self-hostable behind Caddy"),
    ]
    .into_iter()
    .map(|(label, value)| {
        view! {
          <article class="signal-card">
            <p>{label}</p>
            <strong>{value}</strong>
          </article>
        }
        .to_html()
    })
    .collect::<Vec<_>>()
    .join("");

    view! { <div class="signal-grid" inner_html=stats></div> }.to_html()
}

fn workflow_grid() -> String {
    let cards = [
        (
            "Systems",
            "Rust services, protocol work, network tooling, and performance-sensitive code.",
        ),
        (
            "Data",
            "PostgreSQL as the durable core for application state, audit trails, and reporting.",
        ),
        (
            "Automation",
            "Python, uv, Ruff, Bash, zsh, and PowerShell for repeatable operator workflows.",
        ),
    ]
    .into_iter()
    .map(|(title, body)| {
        view! {
          <article class="workflow-card">
            <p class="workflow-card__title">{title}</p>
            <p>{body}</p>
          </article>
        }
        .to_html()
    })
    .collect::<Vec<_>>()
    .join("");

    view! { <div class="workflow-grid" inner_html=cards></div> }.to_html()
}

fn quick_nav_grid() -> String {
    [
        (
            "/projects",
            "Projects",
            "Rust, Python, PostgreSQL, automation, and self-hosted systems grouped by category.",
        ),
        (
            "/blog",
            "Blog",
            "Build logs, design notes, and practical decisions from real systems.",
        ),
        (
            "/about",
            "About",
            "Stephen's engineering direction, operating habits, and stack priorities.",
        ),
        (
            "/contact",
            "Contact",
            "Email, Signal, GitHub, Codeberg, Reddit, and the source for this site.",
        ),
    ]
    .into_iter()
    .map(|(href, title, detail)| {
        view! {
          <a href=href class="nav-card">
            <span class="nav-card__title">{title}</span>
            <span class="nav-card__detail">{detail}</span>
          </a>
        }
        .to_html()
    })
    .collect::<Vec<_>>()
    .join("")
}

fn latest_post_empty_card() -> String {
    view! {
      <a href="/blog" class="latest-card latest-card--empty">
        <span class="latest-card__kicker">"Blog"</span>
        <span class="latest-card__title">"Writing is ready for build notes."</span>
        <span class="latest-card__meta">"RSS and draft filtering are in place"</span>
        <span class="latest-card__description">"Published posts will appear here automatically, while drafts stay out of public routes and feeds."</span>
      </a>
    }
    .to_html()
}

pub fn about_page(content: &SiteContent) -> String {
    let body = view! {
        <section class="page-hero">
          <div class="section-inner">
            <p class="eyebrow">"About"</p>
            <h1>"Stephen Sawyer."</h1>
            <p class="lede">"Rust-first systems, PostgreSQL-backed products, Python automation, and practical operations."</p>
          </div>
        </section>
        <section class="page-section">
          <div class="section-inner">
            <article class="prose" inner_html=content.about.html.clone()></article>
          </div>
        </section>
    }.to_html();

    render_layout(&content.about.meta, body)
}

pub fn projects_page(content: &SiteContent) -> String {
    let project_count = content.projects.len();
    let group_count = [
        ProjectCategory::Apps,
        ProjectCategory::Infrastructure,
        ProjectCategory::DeveloperTools,
        ProjectCategory::Reference,
    ]
    .into_iter()
    .filter(|category| {
        content
            .projects
            .iter()
            .any(|project| project.category == *category)
    })
    .count();
    let groups = [
        ProjectCategory::Apps,
        ProjectCategory::Infrastructure,
        ProjectCategory::DeveloperTools,
        ProjectCategory::Reference,
    ]
    .into_iter()
    .filter_map(|category| {
        let cards = content
            .projects
            .iter()
            .filter(|project| project.category == category)
            .map(project_card)
            .collect::<Vec<_>>()
            .join("");

        (!cards.is_empty()).then(|| project_group(category, cards))
    })
    .collect::<Vec<_>>()
    .join("");

    let meta = PageMeta::new(
        "/projects",
        "Projects · dunamismax",
        "Rust-first tools, Python automation, PostgreSQL-backed operations, and self-hosted project work by Stephen Sawyer.",
        "projects",
    );
    let body = view! {
        <section class="page-hero">
          <div class="section-inner">
            <p class="eyebrow">"Projects"</p>
            <h1>"Live projects."</h1>
            <p class="lede">"Rust-first tools, Python automation, PostgreSQL-backed operations, and references that support the next phase of work."</p>
            <div class="hero-summary" aria-label="Project summary">
              <span>{format!("{project_count} public projects")}</span>
              <span>{format!("{group_count} active categories")}</span>
              <span>"Plain TOML source of truth"</span>
            </div>
          </div>
        </section>
        <section class="page-section">
          <div class="section-inner" inner_html=groups></div>
        </section>
    }.to_html();

    render_layout(&meta, body)
}

pub fn blog_index_page(content: &SiteContent) -> String {
    let posts = content.published_posts();
    let post_list = if posts.is_empty() {
        view! {
          <section class="empty-state">
            <p class="eyebrow">"No posts yet."</p>
            <h2>"The blog route is ready."</h2>
            <p>"Published posts will render here and in the RSS feed. Drafts stay private until the content flag changes."</p>
            <a href="/projects" class="section-link">"Browse current projects"</a>
          </section>
        }
        .to_html()
    } else {
        let cards = posts
            .into_iter()
            .map(post_card)
            .collect::<Vec<_>>()
            .join("");
        view! { <ul class="card-list" inner_html=cards></ul> }.to_html()
    };
    let meta = PageMeta::new(
        "/blog",
        "Blog · dunamismax",
        "Build logs, design notes, and stack reasoning from Stephen Sawyer.",
        "blog",
    );
    let body = view! {
        <section class="page-hero">
          <div class="section-inner">
            <p class="eyebrow">"Blog"</p>
            <h1>"Notes from shipping software."</h1>
            <p class="lede">"Build logs, design notes, and stack reasoning from Rust-first systems, PostgreSQL-backed products, Python automation, cryptography, encryption, and self-hosted operations."</p>
          </div>
        </section>
        <section class="page-section">
          <div class="section-inner" inner_html=post_list></div>
        </section>
    }.to_html();

    render_layout(&meta, body)
}

pub fn blog_post_page(post: &Post) -> String {
    let tags = post
        .tags
        .iter()
        .map(|tag| view! { <span class="stack-chip">{format!("#{tag}")}</span> }.to_html())
        .collect::<Vec<_>>()
        .join("");
    let meta = PageMeta {
        path: format!("/blog/{}", post.slug),
        title: format!("{} · dunamismax", post.title),
        description: post.description.clone(),
        section: "blog".to_owned(),
        og_type: "article".to_owned(),
    };
    let body = view! {
        <section class="page-hero">
          <div class="section-inner">
            <article class="post-detail">
              <p class="eyebrow">"Blog"</p>
              <h1>{post.title.clone()}</h1>
              <p class="lede">{post.description.clone()}</p>
              <p class="post-detail__meta">
                <span>{long_date(post.published_on)}</span>
                <span>{format!("{} min read", post.reading_time_minutes())}</span>
              </p>
              <div class="post-tags" inner_html=tags></div>
            </article>
          </div>
        </section>
        <section class="page-section">
          <div class="section-inner">
            <article class="post-detail">
              <div class="post-body" inner_html=post.body_html.clone()></div>
              <p class="section-foot"><a href="/blog" class="section-link">"Back to all posts"</a></p>
            </article>
          </div>
        </section>
    }.to_html();

    render_layout(&meta, body)
}

pub fn contact_page() -> String {
    let cards = contact_cards()
        .into_iter()
        .map(contact_card)
        .collect::<Vec<_>>()
        .join("");
    let meta = PageMeta::new(
        "/contact",
        "Contact · dunamismax",
        "How to reach Stephen Sawyer by email, Signal, GitHub, Codeberg, or public source.",
        "contact",
    );
    let body = view! {
        <section class="page-hero">
          <div class="section-inner">
            <p class="eyebrow">"Contact"</p>
            <h1>"Get in touch."</h1>
            <p class="lede">"Email is the best place to start. Signal works well for direct outreach, and GitHub or Codeberg are the right places for public discussion around code."</p>
            <div class="hero-summary" aria-label="Contact preferences">
              <span>"Email first"</span>
              <span>"Signal for private outreach"</span>
              <span>"GitHub or Codeberg for public code"</span>
            </div>
          </div>
        </section>
        <section class="page-section">
          <div class="section-inner">
            <div class="contact-grid" inner_html=cards></div>
          </div>
        </section>
    }.to_html();

    render_layout(&meta, body)
}

pub fn not_found_page() -> String {
    let meta = PageMeta::new(
        "/404",
        "Not found · dunamismax",
        "The requested page was not found on dunamismax.com.",
        "error",
    );
    let body = view! {
        <section class="page-hero">
          <div class="section-inner">
            <p class="eyebrow">"404"</p>
            <h1>"That page is not here."</h1>
            <p class="lede">"The address may have moved, or never existed. Try the home page, the project list, or the blog."</p>
            <div class="hero-actions hero-actions--inline">
              <a href="/" class="button button-primary">"Home"</a>
              <a href="/projects" class="button button-secondary">"Projects"</a>
              <a href="/blog" class="button button-secondary">"Blog"</a>
            </div>
          </div>
        </section>
    }.to_html();

    render_layout(&meta, body)
}

pub fn render_layout(meta: &PageMeta, body: String) -> String {
    let canonical = format!("{SITE_BASE_URL}{}", meta.path);
    let title = meta.title.clone();
    let description = meta.description.clone();
    let section = meta.section.clone();
    let og_type = meta.og_type.clone();
    let stylesheet_href = format!("/css/site.css?v={ASSET_VERSION}");
    let rendered = view! {
        <html lang="en">
          <head>
            <meta charset="utf-8"/>
            <title>{title.clone()}</title>
            <meta name="viewport" content="width=device-width,initial-scale=1"/>
            <meta name="description" content=description.clone()/>
            <meta name="theme-color" content="#0a0a0b" media="(prefers-color-scheme: dark)"/>
            <meta name="theme-color" content="#f6f7f1" media="(prefers-color-scheme: light)"/>
            <meta name="apple-mobile-web-app-capable" content="yes"/>
            <meta name="application-name" content="dunamismax"/>
            <link rel="canonical" href=canonical.clone()/>
            <meta name="og:site_name" content="dunamismax"/>
            <meta name="og:type" content=og_type/>
            <meta name="og:title" content=title.clone()/>
            <meta name="og:description" content=description.clone()/>
            <meta name="og:url" content=canonical/>
            <meta name="twitter:card" content="summary"/>
            <meta name="twitter:title" content=title/>
            <meta name="twitter:description" content=description/>
            <link rel="icon" href="/icon.svg" type="image/svg+xml"/>
            <link rel="manifest" href="/manifest.webmanifest"/>
            <link rel="alternate" type="application/rss+xml" title="dunamismax · Blog" href="/feed.xml"/>
            <link rel="stylesheet" href=stylesheet_href/>
            <script>
              {r#"(() => {
                try {
                  var stored = localStorage.getItem("dunamismax-theme");
                  var theme = stored === "light" || stored === "dark" ? stored : "dark";
                  document.documentElement.dataset.theme = theme;
                  document.documentElement.style.colorScheme = theme;
                } catch (_) {
                  document.documentElement.dataset.theme = "dark";
                  document.documentElement.style.colorScheme = "dark";
                }
              })();"#}
            </script>
            <script src="/js/theme.js" defer></script>
          </head>
          <body>
            <a href="#main-content" class="skip-link">"Skip to content"</a>
            <Header section=section.clone()/>
            <main id="main-content" inner_html=body></main>
            <Footer/>
          </body>
        </html>
    }.to_html();

    let rendered = rendered.replace("<meta name=\"og:", "<meta property=\"og:");

    format!("<!DOCTYPE html>{rendered}")
}

#[component]
fn Header(section: String) -> impl IntoView {
    view! {
      <header class="site-header">
        <nav class="primary-nav" aria-label="Primary navigation">
          <a href="/" class="brand-link" aria-label="dunamismax home">
            <span class="brand-mark" aria-hidden="true">"DM"</span>
            <span class="brand-word">"dunamismax"</span>
          </a>
          <div class="desktop-nav">
            <a href="/projects" class=active_class(&section, "projects")>"Projects"</a>
            <a href="/blog" class=active_class(&section, "blog")>"Blog"</a>
            <a href="/about" class=active_class(&section, "about")>"About"</a>
            <a href="/contact" class=active_class(&section, "contact")>"Contact"</a>
          </div>
          <div class="nav-actions">
            <button type="button" class="theme-toggle" aria-pressed="true" aria-label="Switch to light mode">
              <span class="theme-toggle__track" aria-hidden="true"><span class="theme-toggle__thumb"></span></span>
              <span data-theme-target="label">"Dark"</span>
            </button>
          </div>
        </nav>
        <nav class="mobile-nav" aria-label="Section navigation">
          <a href="/projects" class=active_class(&section, "projects")>"Projects"</a>
          <a href="/blog" class=active_class(&section, "blog")>"Blog"</a>
          <a href="/about" class=active_class(&section, "about")>"About"</a>
          <a href="/contact" class=active_class(&section, "contact")>"Contact"</a>
        </nav>
      </header>
    }
}

#[component]
fn Footer() -> impl IntoView {
    view! {
      <footer class="site-footer">
        <div class="footer-inner">
          <div class="footer-brand-block">
            <a href="/" class="footer-brand-link">
              <span class="brand-mark brand-mark--footer" aria-hidden="true">"DM"</span>
              <span>"dunamismax"</span>
            </a>
            <p class="footer-copy">
              "Stephen Sawyer. Rust-first engineer and IT operator focused on performance, cryptography, PostgreSQL, Python automation, privacy, and security."
            </p>
          </div>
          <nav class="footer-columns" aria-label="Footer">
            <div class="footer-column">
              <p class="footer-column__title">"Site"</p>
              <a href="/">"Home"</a>
              <a href="/projects">"Projects"</a>
              <a href="/blog">"Blog"</a>
              <a href="/about">"About"</a>
              <a href="/contact">"Contact"</a>
            </div>
            <div class="footer-column">
              <p class="footer-column__title">"Code"</p>
              <a href="https://github.com/dunamismax" rel="noopener noreferrer me" target="_blank">"GitHub"</a>
              <a href="https://codeberg.org/dunamismax" rel="noopener noreferrer me" target="_blank">"Codeberg"</a>
              <a href="https://github.com/dunamismax/dunamismax.com" rel="noopener noreferrer me" target="_blank">"Site source"</a>
              <a href="/feed.xml">"RSS feed"</a>
            </div>
            <div class="footer-column">
              <p class="footer-column__title">"Elsewhere"</p>
              <a href="mailto:dunamismax@tutamail.com" rel="me">"Email"</a>
              <a href="https://www.reddit.com/user/DunamisMax/" rel="noopener noreferrer me" target="_blank">"Reddit"</a>
            </div>
          </nav>
        </div>
        <div class="footer-meta">
          <div class="footer-meta__inner">
            <p>"© 2026 Stephen Sawyer."</p>
            <p class="footer-meta__claim">"Rust · PostgreSQL · Python · Served behind Caddy"</p>
          </div>
        </div>
      </footer>
    }
}

fn latest_post_card(post: &Post) -> String {
    view! {
      <a href=format!("/blog/{}", post.slug) class="latest-card">
        <span class="latest-card__kicker">"Latest post"</span>
        <span class="latest-card__title">{post.title.clone()}</span>
        <span class="latest-card__meta">{format!("{} · {} min read", short_date(post.published_on), post.reading_time_minutes())}</span>
        <span class="latest-card__description">{post.description.clone()}</span>
      </a>
    }.to_html()
}

fn project_group(category: ProjectCategory, cards: String) -> String {
    view! {
      <section class="project-group">
        <header class="project-group__heading">
          <h2>{category.label()}</h2>
          <p>{category.description()}</p>
        </header>
        <ul class="card-list card-list--projects" inner_html=cards></ul>
      </section>
    }
    .to_html()
}

fn project_card(project: &Project) -> String {
    let stack = project
        .stack
        .iter()
        .map(|tech| view! { <span class="stack-chip">{tech.clone()}</span> }.to_html())
        .collect::<Vec<_>>()
        .join("");
    let live_link = if project.url.is_empty() {
        String::new()
    } else {
        view! { <a href=project.url.clone() rel="noopener noreferrer" target="_blank">"live ↗"</a> }
            .to_html()
    };
    let repo_link = if project.public_repo() {
        view! { <a href=project.repo.clone() rel="noopener noreferrer" target="_blank">"repo ↗"</a> }
            .to_html()
    } else {
        String::new()
    };

    view! {
      <li>
        <article class="project-card">
          <div class="project-card__head">
            <h3 class="project-card__name">{project.name.clone()}</h3>
            <span class=format!("project-status project-status--{}", project.status.slug())>{project.status.label()}</span>
          </div>
          <p class="project-card__tagline">{project.tagline.clone()}</p>
          <div class="project-card__foot">
            <div class="project-card__stack" inner_html=stack></div>
            <div class="project-card__links" inner_html=format!("{live_link}{repo_link}")></div>
          </div>
        </article>
      </li>
    }.to_html()
}

fn post_card(post: &Post) -> String {
    view! {
      <li>
        <a href=format!("/blog/{}", post.slug) class="post-card">
          <span class="post-card__meta">{format!("{} · {} min read", short_date(post.published_on), post.reading_time_minutes())}</span>
          <span class="post-card__title">{post.title.clone()}</span>
          <span class="post-card__description">{post.description.clone()}</span>
        </a>
      </li>
    }.to_html()
}

fn contact_card(card: ContactCard) -> String {
    let rel = if card.external {
        "noopener noreferrer me"
    } else {
        "me"
    };
    let target = if card.external { "_blank" } else { "_self" };

    view! {
      <article class="contact-card">
        <p class="contact-card__title">{card.title}</p>
        <a class="contact-card__value" href=card.href rel=rel target=target>{card.value}</a>
        <p class="contact-card__detail">{card.detail}</p>
      </article>
    }
    .to_html()
}

fn contact_cards() -> Vec<ContactCard> {
    vec![
        ContactCard {
            title: "Email",
            value: "dunamismax@tutamail.com",
            href: "mailto:dunamismax@tutamail.com",
            external: false,
            detail: "Best first stop. Project questions, work, or anything that does not need to be public.",
        },
        ContactCard {
            title: "Signal",
            value: "Signal",
            href: "https://signal.me/#eu/ohSycFRzUEPZzCEifM1UVelp9pdBfmOPoSHItfUsK1PqosRCQSBBEIsqRq2krmph",
            external: true,
            detail: "For direct, end-to-end-encrypted outreach when email is not the right shape.",
        },
        ContactCard {
            title: "GitHub",
            value: "github.com/dunamismax",
            href: "https://github.com/dunamismax",
            external: true,
            detail: "Public discussion around code, issues, and pull requests across the projects on this site.",
        },
        ContactCard {
            title: "Codeberg",
            value: "codeberg.org/dunamismax",
            href: "https://codeberg.org/dunamismax",
            external: true,
            detail: "Mirrored public source and a better home for open, inspectable code.",
        },
        ContactCard {
            title: "Reddit",
            value: "u/DunamisMax",
            href: "https://www.reddit.com/user/DunamisMax/",
            external: true,
            detail: "Where I talk about MTG and self-hosting more than anything else.",
        },
        ContactCard {
            title: "Site source",
            value: "github.com/dunamismax/dunamismax.com",
            href: "https://github.com/dunamismax/dunamismax.com",
            external: true,
            detail: "Source for this site is open. Issues and PRs welcome.",
        },
    ]
}

fn active_class(current: &str, target: &str) -> &'static str {
    if current == target { "is-current" } else { "" }
}

fn short_date(date: NaiveDate) -> String {
    format!(
        "{} {}, {}",
        month_name(date.month()),
        date.day(),
        date.year()
    )
}

fn long_date(date: NaiveDate) -> String {
    short_date(date)
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
        _ => "",
    }
}
