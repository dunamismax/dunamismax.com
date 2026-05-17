pub const ICON_SVG: &str = include_str!("../../../src/main/resources/static/icon.svg");
pub const THEME_JS: &str = include_str!("../../../src/main/resources/static/js/theme.js");

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
  --bg: #f5f1e8;
  --surface: #fffaf2;
  --surface-strong: #ffffff;
  --text: #16161a;
  --text-soft: #58564f;
  --text-muted: #7c7869;
  --border: rgba(22, 22, 26, 0.14);
  --accent: #2a5fbd;
  --accent-strong: #1a3f80;
  --accent-soft: #dde8f7;
  --shadow-soft: 0 12px 34px rgba(20, 20, 30, 0.10);
  --radius-lg: 18px;
  --radius-md: 12px;
}

[data-theme="dark"] {
  color-scheme: dark;
  --bg: #0a0a0b;
  --surface: #15161e;
  --surface-strong: #1a1c26;
  --text: #f1eee5;
  --text-soft: #c5bfb1;
  --text-muted: #928b7d;
  --border: rgba(241, 238, 229, 0.14);
  --accent: #8eb4ff;
  --accent-strong: #b8ceff;
  --accent-soft: rgba(142, 180, 255, 0.13);
  --shadow-soft: 0 16px 44px rgba(0, 0, 0, 0.28);
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

a { color: inherit; text-underline-offset: 0.2em; }
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
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(18px);
}
.primary-nav, .mobile-nav, .section-inner, .footer-inner, .footer-meta__inner {
  width: min(100% - 2rem, 76rem);
  margin-inline: auto;
}
.primary-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 1rem;
}
.brand-link, .footer-brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 800;
  text-decoration: none;
}
.brand-mark {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 0.9rem;
  background: var(--surface-strong);
  color: var(--accent);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.82rem;
  box-shadow: var(--shadow-soft);
}
.brand-mark--footer { width: 2.1rem; height: 2.1rem; border-radius: 0.7rem; }
.desktop-nav { display: none; align-items: center; gap: 1.4rem; color: var(--text-soft); font-weight: 650; }
.desktop-nav a, .mobile-nav a, .footer-column a { text-decoration: none; }
.desktop-nav a.is-current, .mobile-nav a.is-current { color: var(--accent); }
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
.theme-toggle__track { position: relative; display: block; width: 2rem; height: 1.1rem; border-radius: 999px; background: var(--border); }
.theme-toggle__thumb { position: absolute; left: 0.15rem; top: 0.15rem; width: 0.8rem; height: 0.8rem; border-radius: 999px; background: var(--accent); }
[data-theme="dark"] .theme-toggle__thumb { transform: translateX(0.9rem); }
.button-primary { background: var(--accent); color: var(--bg); border-color: var(--accent); padding: 0.82rem 1.1rem; }
.button-secondary { background: var(--surface-strong); color: var(--text); padding: 0.82rem 1.1rem; }
.mobile-nav { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.85rem; color: var(--text-soft); }
.mobile-nav a { flex: 0 0 auto; border: 1px solid var(--border); border-radius: 999px; background: var(--surface-strong); padding: 0.42rem 0.78rem; }

.hero-section, .page-hero, .page-section { position: relative; overflow: hidden; }
.hero-section { border-bottom: 1px solid var(--border); background: linear-gradient(115deg, var(--bg), color-mix(in srgb, var(--bg) 88%, var(--accent) 12%)); }
.hero-background { position: absolute; inset: 0; opacity: 0.45; background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px); background-size: 48px 48px; }
.hero-grid { position: relative; display: grid; gap: 2.5rem; padding-block: 3.5rem; }
.hero-copy { max-width: 42rem; }
.eyebrow { color: var(--accent); letter-spacing: 0.04em; text-transform: uppercase; font-size: 0.78rem; font-weight: 850; }
h1, h2, h3, p { letter-spacing: 0; }
h1, h2, h3 { color: var(--text); line-height: 1.08; }
.hero-copy h1, .page-hero h1 { max-width: 46rem; margin: 1.1rem 0 0; font-size: clamp(2.4rem, 8vw, 3.5rem); }
.lede, .section-heading > p, .page-hero .lede { color: var(--text-soft); font-size: 1.08rem; line-height: 1.7; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 2rem; }
.stack-row, .project-card__stack, .post-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.stack-chip { border: 1px solid var(--border); background: var(--surface-strong); border-radius: 999px; color: var(--text-soft); padding: 0.3rem 0.7rem; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.78rem; }
.signal-bar { border-bottom: 1px solid var(--border); background: var(--surface-strong); color: var(--text-soft); padding-block: 1.1rem; }
.signal-grid { display: grid; gap: 0.8rem; font-weight: 700; }
.signal-grid p { margin: 0; }
.page-hero { border-bottom: 1px solid var(--border); padding-block: 4rem; background: radial-gradient(900px 360px at 80% -10%, var(--accent-soft), transparent 70%), var(--bg); }
.page-section { border-bottom: 1px solid var(--border); padding-block: 4.5rem; }
.section-heading { max-width: 44rem; }
.section-heading h2 { margin-top: 0.8rem; font-size: 2rem; }
.post-list { display: grid; gap: 1rem; margin: 1.5rem 0 0; padding: 0; list-style: none; }
.project-card, .post-card, .contact-card, .latest-card, .nav-card {
  display: grid;
  gap: 0.55rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface-strong);
  box-shadow: var(--shadow-soft);
  padding: 1.35rem;
}
.post-card, .latest-card, .nav-card { text-decoration: none; }
.project-card__head, .project-card__foot { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.75rem; }
.project-card__name { margin: 0; font-size: 1.05rem; }
.project-status { border-radius: 999px; background: var(--accent-soft); color: var(--accent); padding: 0.2rem 0.6rem; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.72rem; font-weight: 800; }
.project-card__tagline, .post-card__description, .contact-card__detail, .fine-print { color: var(--text-soft); line-height: 1.6; }
.project-card__links { display: inline-flex; flex-wrap: wrap; gap: 1rem; }
.project-card__links a, .section-link { color: var(--accent); font-weight: 750; text-decoration: none; }
.project-group + .project-group { margin-top: 3rem; }
.project-group__heading { border-bottom: 1px solid var(--border); margin-bottom: 1rem; padding-bottom: 0.6rem; }
.post-card__meta, .latest-card__meta, .post-detail__meta { color: var(--text-muted); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.8rem; }
.post-card__title, .latest-card__title, .contact-card__value { color: var(--text); font-size: 1.1rem; font-weight: 800; }
.post-detail { max-width: 44rem; margin-inline: auto; }
.post-body, .prose { color: var(--text-soft); font-size: 1.02rem; line-height: 1.75; }
.post-body strong, .prose strong { color: var(--text); }
.post-body a, .prose a { color: var(--accent); }
.contact-grid { display: grid; gap: 1rem; margin-top: 2.5rem; }
.contact-card__title { color: var(--accent); text-transform: uppercase; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.78rem; font-weight: 850; }
.site-footer { border-top: 1px solid var(--border); background: #0a0a0b; color: #f2eee3; padding-top: 3rem; }
.footer-inner { display: grid; gap: 2rem; padding-bottom: 2rem; }
.footer-copy { color: rgba(242, 238, 227, 0.74); max-width: 36rem; line-height: 1.65; }
.footer-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; }
.footer-column { display: grid; align-content: start; gap: 0.55rem; }
.footer-column__title { color: rgba(242, 238, 227, 0.55); text-transform: uppercase; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.74rem; font-weight: 850; }
.footer-meta { border-top: 1px solid rgba(242, 238, 227, 0.12); padding-block: 1.2rem; color: rgba(242, 238, 227, 0.55); font-size: 0.8rem; }

@media (min-width: 560px) {
  .signal-grid, .nav-card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 768px) {
  .desktop-nav { display: flex; }
  .mobile-nav { display: none; }
  .contact-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .footer-inner { grid-template-columns: 1.4fr 1fr; }
}
@media (min-width: 1024px) {
  .hero-grid { grid-template-columns: 1fr 1fr; align-items: start; padding-block: 4.25rem; }
  .signal-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .footer-columns { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
"#;
