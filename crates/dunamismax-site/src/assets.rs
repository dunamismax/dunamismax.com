pub const ICON_SVG: &str = include_str!("../assets/icon.svg");
pub const THEME_JS: &str = include_str!("../assets/theme.js");

pub const ROBOTS_TXT: &str = "User-agent: *\nAllow: /\n";

pub const MANIFEST_JSON: &str = r##"{
  "name": "dunamismax",
  "short_name": "dunamismax",
  "icons": [
    { "src": "/icon.svg", "type": "image/svg+xml", "sizes": "512x512" },
    { "src": "/icon.svg", "type": "image/svg+xml", "sizes": "512x512", "purpose": "maskable" }
  ],
  "start_url": "/",
  "display": "standalone",
  "scope": "/",
  "description": "Engineering work by Stephen Sawyer in Rust, PostgreSQL, Python automation, and self-hosted software.",
  "theme_color": "#0a0a0b",
  "background_color": "#0a0a0b"
}"##;

pub const SITE_CSS: &str = r#"
:root {
  color-scheme: light;
  --bg: #f6f7f1;
  --bg-elevated: #ecefe7;
  --surface: #ffffff;
  --surface-strong: #ffffff;
  --text: #101418;
  --text-soft: #46515b;
  --text-muted: #68737d;
  --border: rgba(16, 20, 24, 0.14);
  --accent: #1f6feb;
  --accent-strong: #0f4fa8;
  --accent-soft: #e5eefc;
  --green: #0f766e;
  --green-soft: #e0f2ef;
  --warm: #a55412;
  --warm-soft: #f6e7d5;
  --shadow-soft: 0 10px 26px rgba(16, 20, 24, 0.10);
  --radius-lg: 8px;
  --radius-md: 6px;
  --measure: 44rem;
}

[data-theme="dark"] {
  color-scheme: dark;
  --bg: #0d1117;
  --bg-elevated: #111820;
  --surface: #151c24;
  --surface-strong: #1b2430;
  --text: #f0f4f8;
  --text-soft: #c3ccd6;
  --text-muted: #929daa;
  --border: rgba(240, 244, 248, 0.15);
  --accent: #84b6ff;
  --accent-strong: #c4ddff;
  --accent-soft: rgba(132, 182, 255, 0.15);
  --green: #73daca;
  --green-soft: rgba(115, 218, 202, 0.14);
  --warm: #f6b26b;
  --warm-soft: rgba(246, 178, 107, 0.14);
  --shadow-soft: 0 16px 36px rgba(0, 0, 0, 0.30);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  min-width: 320px;
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  text-rendering: optimizeLegibility;
}

a { color: inherit; text-underline-offset: 0.2em; overflow-wrap: anywhere; }
button { font: inherit; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.skip-link {
  position: fixed;
  left: 1rem;
  top: 1rem;
  z-index: 100;
  border-radius: 999px;
  background: var(--accent);
  color: var(--bg);
  font-weight: 700;
  padding: 0.55rem 0.9rem;
  transform: translateY(-180%);
}
.skip-link:focus { transform: translateY(0); }

.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  backdrop-filter: blur(18px);
}
.primary-nav, .mobile-nav, .section-inner, .footer-inner, .footer-meta__inner {
  width: min(100% - 2rem, 78rem);
  margin-inline: auto;
}
.primary-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.85rem;
}
.brand-link, .footer-brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 800;
  text-decoration: none;
}
.brand-word { overflow-wrap: normal; }
.brand-mark {
  display: grid;
  width: 2.35rem;
  height: 2.35rem;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface-strong);
  color: var(--accent);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.82rem;
  box-shadow: var(--shadow-soft);
}
.brand-mark--footer { width: 2.1rem; height: 2.1rem; }
.desktop-nav { display: none; align-items: center; gap: 1.4rem; color: var(--text-soft); font-weight: 650; }
.desktop-nav a, .mobile-nav a, .footer-column a { text-decoration: none; }
.desktop-nav a {
  border-bottom: 2px solid transparent;
  padding-block: 0.25rem;
}
.desktop-nav a:hover, .footer-column a:hover, .section-link:hover { color: var(--accent); }
.desktop-nav a.is-current {
  border-bottom-color: var(--accent);
  color: var(--text);
}
.mobile-nav a.is-current { border-color: var(--accent); color: var(--accent); }
.nav-actions { display: inline-flex; }
.theme-toggle, .button {
  display: inline-flex;
  min-height: 2.65rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid var(--border);
  font-size: 0.9rem;
  font-weight: 750;
  text-decoration: none;
}
.theme-toggle {
  gap: 0.5rem;
  background: var(--surface-strong);
  color: var(--text-soft);
  cursor: pointer;
  padding: 0.5rem 0.7rem 0.5rem 0.55rem;
}
.theme-toggle:hover, .button-secondary:hover, .mobile-nav a:hover { border-color: var(--accent); color: var(--accent); }
.theme-toggle__track { position: relative; display: block; width: 2rem; height: 1.1rem; border-radius: 999px; background: var(--border); }
.theme-toggle__thumb { position: absolute; left: 0.15rem; top: 0.15rem; width: 0.8rem; height: 0.8rem; border-radius: 999px; background: var(--accent); transition: transform 160ms ease; }
[data-theme="dark"] .theme-toggle__thumb { transform: translateX(0.9rem); }
.button-primary { background: var(--accent); color: #ffffff; border-color: var(--accent); padding: 0.82rem 1.1rem; }
.button-primary:hover { background: var(--accent-strong); border-color: var(--accent-strong); }
.button-secondary { background: var(--surface-strong); color: var(--text); padding: 0.82rem 1.1rem; }
.mobile-nav { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.85rem; color: var(--text-soft); }
.mobile-nav a { flex: 0 0 auto; border: 1px solid var(--border); border-radius: 999px; background: var(--surface-strong); padding: 0.42rem 0.78rem; }

.hero-section, .page-hero, .page-section { position: relative; overflow: hidden; }
.hero-section {
  border-bottom: 1px solid var(--border);
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--bg) 84%, var(--accent-soft) 16%), var(--bg) 46%, color-mix(in srgb, var(--bg) 88%, var(--green-soft) 12%));
}
.hero-background {
  position: absolute;
  inset: 0;
  opacity: 0.52;
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: linear-gradient(180deg, #000 0%, transparent 92%);
}
.hero-grid { position: relative; display: grid; gap: 2rem; padding-block: 2rem; }
.hero-copy { max-width: 46rem; min-width: 0; }
.hero-aside { display: grid; min-width: 0; align-content: start; gap: 1rem; }
.eyebrow {
  color: var(--accent);
  letter-spacing: 0;
  text-transform: uppercase;
  font-size: 0.78rem;
  font-weight: 850;
  margin: 0 0 0.85rem;
}
h1, h2, h3, p { letter-spacing: 0; }
h1, h2, h3 { color: var(--text); line-height: 1.08; overflow-wrap: anywhere; }
.hero-copy h1, .page-hero h1 { max-width: 48rem; margin: 0; font-size: 2.55rem; }
.lede, .section-heading > p, .page-hero .lede { color: var(--text-soft); font-size: 1.04rem; line-height: 1.68; }
.lede--strong { color: var(--text); font-size: 1.12rem; }
.hero-copy .lede { margin: 1rem 0 0; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.45rem; }
.stack-row { margin-top: 1rem; }
.stack-row, .project-card__stack, .post-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.stack-chip {
  border: 1px solid var(--border);
  background: var(--surface-strong);
  border-radius: 999px;
  color: var(--text-soft);
  padding: 0.3rem 0.7rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.78rem;
}
.stack-chip--strong { border-color: color-mix(in srgb, var(--accent) 48%, var(--border)); color: var(--accent); background: var(--accent-soft); }
.system-panel {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--surface-strong) 94%, var(--accent-soft) 6%);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}
.system-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  padding: 0.85rem 1rem;
}
.system-panel__label, .status-dot, .post-card__meta, .latest-card__meta, .post-detail__meta {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
.system-panel__label { color: var(--text); font-weight: 850; }
.status-dot {
  border: 1px solid color-mix(in srgb, var(--green) 42%, var(--border));
  border-radius: 999px;
  background: var(--green-soft);
  color: var(--green);
  font-size: 0.72rem;
  font-weight: 850;
  padding: 0.25rem 0.55rem;
}
.system-panel__rows {
  display: grid;
  margin: 0;
}
.system-panel__rows div {
  display: grid;
  gap: 0.25rem;
  border-bottom: 1px solid var(--border);
  padding: 0.9rem 1rem;
}
.system-panel__rows div:last-child { border-bottom: 0; }
.system-panel dt {
  color: var(--accent);
  font-size: 0.76rem;
  font-weight: 850;
  text-transform: uppercase;
}
.system-panel dd { margin: 0; color: var(--text-soft); line-height: 1.5; }
.signal-bar { border-bottom: 1px solid var(--border); background: var(--surface-strong); color: var(--text-soft); padding-block: 0.85rem; }
.signal-grid { display: grid; gap: 0.75rem; }
.signal-card {
  border-left: 3px solid var(--accent);
  background: var(--bg);
  padding: 0.8rem 0.95rem;
}
.signal-card:nth-child(2) { border-left-color: var(--green); }
.signal-card:nth-child(3) { border-left-color: var(--warm); }
.signal-card p { margin: 0 0 0.2rem; color: var(--text-muted); font-size: 0.78rem; font-weight: 800; text-transform: uppercase; }
.signal-card strong { color: var(--text); font-size: 0.96rem; }
.page-hero {
  border-bottom: 1px solid var(--border);
  padding-block: 3.25rem;
  background: linear-gradient(180deg, color-mix(in srgb, var(--bg) 86%, var(--accent-soft) 14%), var(--bg));
}
.page-section { border-bottom: 1px solid var(--border); padding-block: 4rem; }
.page-section--tight { padding-block: 2.6rem; }
.page-section--quiet { background: var(--bg-elevated); }
.section-heading { max-width: var(--measure); }
.section-heading h2 { margin: 0; font-size: 1.85rem; }
.section-heading--split { display: grid; gap: 1rem; max-width: none; align-items: end; }
.section-heading--split > p { margin: 0; max-width: 38rem; }
.hero-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1.4rem;
}
.hero-summary span {
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface-strong);
  color: var(--text-soft);
  font-size: 0.86rem;
  font-weight: 750;
  padding: 0.42rem 0.75rem;
}
.workflow-grid, .nav-card-grid, .contact-grid, .card-list {
  display: grid;
  gap: 1rem;
}
.workflow-card {
  border-top: 3px solid var(--accent);
  background: var(--surface-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: 1.1rem;
}
.workflow-card:nth-child(2) { border-top-color: var(--green); }
.workflow-card:nth-child(3) { border-top-color: var(--warm); }
.workflow-card p { margin: 0; color: var(--text-soft); line-height: 1.6; }
.workflow-card__title { color: var(--text) !important; font-weight: 850; margin-bottom: 0.35rem !important; }
.card-list { margin: 1.5rem 0 0; padding: 0; list-style: none; }
.project-card, .post-card, .contact-card, .latest-card, .nav-card {
  display: grid;
  gap: 0.65rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface-strong);
  box-shadow: var(--shadow-soft);
  padding: 1.1rem;
}
.project-card:hover, .post-card:hover, .contact-card:hover, .latest-card:hover, .nav-card:hover {
  border-color: color-mix(in srgb, var(--accent) 42%, var(--border));
}
.post-card, .latest-card, .nav-card { text-decoration: none; }
.latest-card { border-left: 4px solid var(--green); }
.latest-card--empty { border-left-color: var(--warm); }
.latest-card__kicker, .nav-card__title {
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 850;
  text-transform: uppercase;
}
.nav-card__title { color: var(--text); }
.nav-card__detail { color: var(--text-soft); line-height: 1.55; }
.project-card__head, .project-card__foot { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.75rem; }
.project-card__name { margin: 0; font-size: 1.05rem; }
.project-status { border-radius: 999px; background: var(--accent-soft); color: var(--accent); padding: 0.2rem 0.6rem; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.72rem; font-weight: 800; }
.project-status--active { background: var(--green-soft); color: var(--green); }
.project-status--shipped { background: var(--accent-soft); color: var(--accent); }
.project-status--phase-0 { background: var(--warm-soft); color: var(--warm); }
.project-card__tagline, .post-card__description, .contact-card__detail, .fine-print, .latest-card__description { color: var(--text-soft); line-height: 1.6; }
.fine-print { margin: 1rem 0 0; }
.project-card__links { display: inline-flex; flex-wrap: wrap; gap: 1rem; }
.project-card__links a, .section-link { color: var(--accent); font-weight: 750; text-decoration: none; }
.project-group + .project-group { margin-top: 3rem; }
.project-group__heading { border-bottom: 1px solid var(--border); margin-bottom: 1rem; padding-bottom: 0.8rem; }
.project-group__heading h2 { margin: 0 0 0.35rem; font-size: 1.45rem; }
.project-group__heading p { margin: 0; color: var(--text-soft); line-height: 1.6; }
.post-card__meta, .latest-card__meta, .post-detail__meta { color: var(--text-muted); font-size: 0.8rem; }
.post-card__title, .latest-card__title, .contact-card__value { color: var(--text); font-size: 1.1rem; font-weight: 800; }
.post-detail { max-width: var(--measure); margin-inline: auto; }
.post-detail__meta { display: flex; flex-wrap: wrap; gap: 0.8rem; }
.post-tags { margin-top: 1rem; }
.post-body, .prose { color: var(--text-soft); font-size: 1.02rem; line-height: 1.75; }
.post-body h2, .post-body h3, .prose h2, .prose h3 { margin-top: 2rem; }
.post-body strong, .prose strong { color: var(--text); }
.post-body a, .prose a { color: var(--accent); }
.empty-state {
  max-width: var(--measure);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface-strong);
  box-shadow: var(--shadow-soft);
  padding: 1.35rem;
}
.empty-state h2 { margin: 0 0 0.65rem; }
.empty-state p { color: var(--text-soft); line-height: 1.65; }
.contact-grid { margin-top: 0; }
.contact-card__title { color: var(--accent); text-transform: uppercase; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.78rem; font-weight: 850; }
.site-footer { border-top: 1px solid var(--border); background: #0a0a0b; color: #f2eee3; padding-top: 3rem; }
.footer-inner { display: grid; gap: 2rem; padding-bottom: 2rem; }
.footer-copy { color: rgba(242, 238, 227, 0.74); max-width: 36rem; line-height: 1.65; }
.footer-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; }
.footer-column { display: grid; align-content: start; gap: 0.55rem; }
.footer-column__title { color: rgba(242, 238, 227, 0.55); text-transform: uppercase; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.74rem; font-weight: 850; }
.footer-meta { border-top: 1px solid rgba(242, 238, 227, 0.12); padding-block: 1.2rem; color: rgba(242, 238, 227, 0.55); font-size: 0.8rem; }
.footer-meta__inner { display: flex; flex-wrap: wrap; gap: 0.75rem 1.5rem; justify-content: space-between; }
.footer-meta p { margin: 0; }

@media (min-width: 560px) {
  .signal-grid, .nav-card-grid, .workflow-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 768px) {
  .desktop-nav { display: flex; }
  .mobile-nav { display: none; }
  .contact-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .footer-inner { grid-template-columns: 1.4fr 1fr; }
  .card-list--projects { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .section-heading--split { grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.8fr); }
  .hero-copy h1, .page-hero h1 { font-size: 3rem; }
}
@media (min-width: 1024px) {
  .hero-grid { grid-template-columns: minmax(0, 1.1fr) minmax(22rem, 0.75fr); align-items: start; padding-block: 2rem; }
  .signal-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .workflow-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .footer-columns { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 420px) {
  .brand-word { display: none; }
  .theme-toggle [data-theme-target="label"] { display: none; }
  .hero-copy h1, .page-hero h1 { font-size: 1.95rem; }
  .project-card__head, .project-card__foot { display: grid; justify-content: stretch; }
}
@media (max-width: 767px) {
  .hero-aside { display: none; }
  .hero-grid { padding-block: 1.55rem; }
  .stack-row {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 0.2rem;
  }
  .stack-chip { flex: 0 0 auto; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
"#;
