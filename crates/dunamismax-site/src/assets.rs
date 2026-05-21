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
  "theme_color": "#0d1117",
  "background_color": "#0d1117"
}"##;

pub const SITE_CSS: &str = r#"
:root,
[data-theme="dark"] {
  color-scheme: dark;
  --bg: #0d1117;
  --bg-subtle: #010409;
  --bg-elevated: #151b23;
  --surface: #151b23;
  --surface-strong: #1c232c;
  --surface-overlay: #21262d;
  --text: #e6edf3;
  --text-soft: #b9c2cb;
  --text-muted: #7d8590;
  --border: #30363d;
  --border-muted: #21262d;
  --accent: #2f81f7;
  --accent-strong: #58a6ff;
  --accent-soft: rgba(56, 139, 253, 0.15);
  --accent-on: #ffffff;
  --success: #3fb950;
  --success-soft: rgba(63, 185, 80, 0.16);
  --attention: #d29922;
  --attention-soft: rgba(210, 153, 34, 0.18);
  --danger: #f85149;
  --danger-soft: rgba(248, 81, 73, 0.18);
  --shadow-soft: 0 8px 24px rgba(1, 4, 9, 0.40);
  --shadow-md: 0 12px 32px rgba(1, 4, 9, 0.55);
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --measure: 44rem;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

[data-theme="light"] {
  color-scheme: light;
  --bg: #ffffff;
  --bg-subtle: #f6f8fa;
  --bg-elevated: #f6f8fa;
  --surface: #ffffff;
  --surface-strong: #ffffff;
  --surface-overlay: #f6f8fa;
  --text: #1f2328;
  --text-soft: #424a53;
  --text-muted: #59636e;
  --border: #d0d7de;
  --border-muted: #d8dee4;
  --accent: #0969da;
  --accent-strong: #0550ae;
  --accent-soft: #ddf4ff;
  --accent-on: #ffffff;
  --success: #1a7f37;
  --success-soft: #dafbe1;
  --attention: #9a6700;
  --attention-soft: #fff8c5;
  --danger: #cf222e;
  --danger-soft: #ffebe9;
  --shadow-soft: 0 1px 0 rgba(31, 35, 40, 0.04), 0 4px 12px rgba(31, 35, 40, 0.06);
  --shadow-md: 0 8px 24px rgba(31, 35, 40, 0.12);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
body {
  min-width: 320px;
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.5;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a { color: var(--accent); text-decoration: none; text-underline-offset: 0.2em; overflow-wrap: anywhere; }
a:hover { text-decoration: underline; }
button { font: inherit; color: inherit; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 3px; }
code, kbd, pre, samp { font-family: var(--font-mono); }

.skip-link {
  position: fixed;
  left: 1rem;
  top: 1rem;
  z-index: 100;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: var(--accent-on);
  font-weight: 600;
  padding: 0.55rem 0.9rem;
  transform: translateY(-200%);
  transition: transform 120ms ease;
}
.skip-link:focus { transform: translateY(0); text-decoration: none; }

/* ---------- Header ---------- */
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--border-muted);
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
}
.primary-nav,
.mobile-nav,
.section-inner,
.footer-inner,
.footer-meta__inner {
  width: min(100% - 2rem, 76rem);
  margin-inline: auto;
}
.primary-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.7rem;
}
.brand-link, .footer-brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  font-weight: 600;
  font-size: 0.98rem;
  color: var(--text);
  text-decoration: none;
}
.brand-link:hover, .footer-brand-link:hover { text-decoration: none; color: var(--text); }
.brand-mark {
  display: grid;
  width: 1.85rem;
  height: 1.85rem;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-strong);
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.brand-mark--footer { width: 1.7rem; height: 1.7rem; font-size: 0.66rem; }

.desktop-nav { display: none; align-items: center; gap: 0.25rem; }
.desktop-nav a, .mobile-nav a {
  color: var(--text-soft);
  font-size: 0.92rem;
  font-weight: 500;
  text-decoration: none;
  padding: 0.4rem 0.7rem;
  border-radius: var(--radius-sm);
}
.desktop-nav a:hover { color: var(--text); background: var(--surface-overlay); text-decoration: none; }
.desktop-nav a.is-current { color: var(--text); font-weight: 600; }
.desktop-nav a.is-current::after {
  content: "";
  display: block;
  height: 2px;
  margin-top: 0.4rem;
  margin-inline: 0.2rem;
  background: var(--accent);
  border-radius: 2px;
}
.mobile-nav a.is-current { color: var(--text); border-color: var(--accent); background: var(--accent-soft); }

.nav-actions { display: inline-flex; align-items: center; gap: 0.5rem; }

.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.1rem;
  height: 2.1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-strong);
  color: var(--text-soft);
  cursor: pointer;
  padding: 0;
  transition: background-color 120ms ease, color 120ms ease, border-color 120ms ease;
}
.theme-toggle:hover { background: var(--surface-overlay); color: var(--text); border-color: var(--border); }
.theme-toggle svg { width: 1.05rem; height: 1.05rem; display: block; }
.theme-toggle__sun { display: none; }
.theme-toggle__moon { display: block; }
[data-theme="light"] .theme-toggle__sun { display: block; }
[data-theme="light"] .theme-toggle__moon { display: none; }

/* ---------- Buttons ---------- */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 2.4rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.92rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease;
}
.button:hover { text-decoration: none; }
.button-primary {
  background: var(--accent);
  color: var(--accent-on);
  border-color: color-mix(in srgb, var(--accent) 75%, #000 8%);
}
.button-primary:hover { background: var(--accent-strong); border-color: var(--accent-strong); color: var(--accent-on); }
.button-secondary {
  background: var(--surface-strong);
  color: var(--text);
}
.button-secondary:hover { background: var(--surface-overlay); border-color: var(--border); color: var(--text); }

.mobile-nav {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  padding-bottom: 0.7rem;
  scrollbar-width: none;
}
.mobile-nav::-webkit-scrollbar { display: none; }
.mobile-nav a {
  flex: 0 0 auto;
  border: 1px solid var(--border);
  background: var(--surface-strong);
  padding: 0.38rem 0.75rem;
}

/* ---------- Hero ---------- */
.hero-section,
.page-hero,
.page-section { position: relative; }
.hero-section {
  border-bottom: 1px solid var(--border-muted);
  background: var(--bg);
  overflow: hidden;
}
.hero-background {
  position: absolute;
  inset: 0;
  opacity: 0.4;
  background-image:
    radial-gradient(circle at 18% 18%, var(--accent-soft), transparent 38%),
    radial-gradient(circle at 82% 78%, var(--success-soft), transparent 42%);
  pointer-events: none;
}
.hero-grid {
  position: relative;
  display: grid;
  gap: 2.5rem;
  padding-block: 4rem 3.5rem;
}
.hero-copy { max-width: 46rem; min-width: 0; }
.hero-aside { display: grid; min-width: 0; align-content: start; gap: 1rem; }
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent);
  letter-spacing: 0.02em;
  text-transform: uppercase;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  margin: 0 0 1rem;
}
.eyebrow::before {
  content: "";
  display: inline-block;
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

h1, h2, h3, h4 {
  color: var(--text);
  line-height: 1.18;
  letter-spacing: -0.01em;
  overflow-wrap: anywhere;
}
h1 { font-weight: 700; }
.hero-copy h1, .page-hero h1 {
  max-width: 32ch;
  margin: 0;
  font-size: clamp(2rem, 4vw + 1rem, 2.85rem);
  letter-spacing: -0.02em;
}
.lede, .section-heading > p, .page-hero .lede {
  color: var(--text-soft);
  font-size: 1.05rem;
  line-height: 1.65;
  max-width: 38rem;
}
.lede--strong { color: var(--text); font-size: 1.12rem; }
.hero-copy .lede { margin: 1.1rem 0 0; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 1.6rem; }
.hero-actions--inline { margin-top: 1.2rem; }

.stack-row { margin-top: 1.5rem; }
.stack-row, .project-card__stack, .post-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.stack-chip {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--border);
  background: var(--surface-overlay);
  border-radius: 999px;
  color: var(--text-soft);
  padding: 0.2rem 0.65rem;
  font-family: var(--font-mono);
  font-size: 0.74rem;
  font-weight: 500;
}
.stack-chip--strong {
  border-color: color-mix(in srgb, var(--accent) 50%, var(--border));
  color: var(--accent-strong);
  background: var(--accent-soft);
}

.fine-print { margin: 1.5rem 0 0; color: var(--text-muted); font-size: 0.9rem; }
.fine-print a { color: var(--accent); }

/* ---------- System panel (hero aside) ---------- */
.system-panel {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}
.system-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--border-muted);
  background: var(--surface-overlay);
  padding: 0.65rem 0.9rem;
}
.system-panel__label {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text);
  font-weight: 600;
}
.status-dot {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 999px;
  background: var(--success-soft);
  color: var(--success);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem 0.2rem 0.5rem;
}
.status-dot::before {
  content: "";
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--success) 30%, transparent);
  animation: pulse 2.4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.system-panel__rows { display: grid; margin: 0; }
.system-panel__rows > div {
  display: grid;
  gap: 0.2rem;
  border-bottom: 1px solid var(--border-muted);
  padding: 0.75rem 0.9rem;
}
.system-panel__rows > div:last-child { border-bottom: 0; }
.system-panel dt {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.system-panel dd { margin: 0; color: var(--text); font-size: 0.92rem; line-height: 1.5; }

/* ---------- Signal bar ---------- */
.signal-bar {
  border-bottom: 1px solid var(--border-muted);
  background: var(--bg-subtle);
  padding-block: 1.4rem;
}
.signal-grid { display: grid; gap: 0.8rem; }
.signal-card {
  border: 1px solid var(--border-muted);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius-sm);
  background: var(--surface);
  padding: 0.85rem 1rem;
}
.signal-card:nth-child(2) { border-left-color: var(--success); }
.signal-card:nth-child(3) { border-left-color: var(--attention); }
.signal-card:nth-child(4) { border-left-color: var(--accent-strong); }
.signal-card p {
  margin: 0 0 0.15rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.signal-card strong { color: var(--text); font-size: 0.95rem; font-weight: 600; }

/* ---------- Page hero & sections ---------- */
.page-hero {
  border-bottom: 1px solid var(--border-muted);
  padding-block: 3rem 2.5rem;
  background: var(--bg);
}
.page-section { border-bottom: 1px solid var(--border-muted); padding-block: 3.5rem; }
.page-section:last-of-type { border-bottom: 0; }
.page-section--tight { padding-block: 2.4rem; }
.page-section--quiet { background: var(--bg-subtle); }

.section-heading { max-width: var(--measure); margin-bottom: 1.5rem; }
.section-heading h2 { margin: 0.4rem 0 0; font-size: 1.6rem; }
.section-heading--split { display: grid; gap: 1rem; max-width: none; align-items: end; }
.section-heading--split > p { margin: 0; max-width: 38rem; color: var(--text-soft); }
.section-foot { margin-top: 1.5rem; }
.section-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--accent);
  font-weight: 600;
  font-size: 0.92rem;
}
.section-link:hover { color: var(--accent-strong); }
.section-link::after { content: "→"; transition: transform 120ms ease; }
.section-link:hover::after { transform: translateX(2px); }

.hero-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 1.5rem;
}
.hero-summary span {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--border-muted);
  border-radius: var(--radius-sm);
  background: var(--surface-overlay);
  color: var(--text-soft);
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.35rem 0.7rem;
}

/* ---------- Cards: workflow, nav, projects, posts, contact ---------- */
.workflow-grid, .nav-card-grid, .contact-grid, .card-list {
  display: grid;
  gap: 0.9rem;
}
.workflow-card,
.project-card,
.post-card,
.contact-card,
.latest-card,
.nav-card {
  display: grid;
  gap: 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  padding: 1.1rem;
  transition: border-color 120ms ease, background-color 120ms ease, transform 120ms ease;
}
.workflow-card { gap: 0.4rem; }
.workflow-card__title {
  color: var(--text);
  font-weight: 600;
  font-size: 0.98rem;
  margin: 0 0 0.1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.workflow-card__title::before {
  content: "";
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 2px;
  background: var(--accent);
}
.workflow-card:nth-child(2) .workflow-card__title::before { background: var(--success); }
.workflow-card:nth-child(3) .workflow-card__title::before { background: var(--attention); }
.workflow-card p { margin: 0; color: var(--text-soft); line-height: 1.6; font-size: 0.94rem; }

.project-card:hover,
.post-card:hover,
.contact-card:hover,
.latest-card:hover,
.nav-card:hover {
  border-color: var(--accent);
  background: var(--surface-strong);
}

.post-card, .latest-card, .nav-card { text-decoration: none; }
.post-card:hover, .latest-card:hover, .nav-card:hover { text-decoration: none; }

.latest-card {
  border-left: 3px solid var(--success);
  padding-left: 1rem;
}
.latest-card--empty { border-left-color: var(--attention); }
.latest-card__kicker, .nav-card__title {
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.nav-card__title { color: var(--text); font-family: var(--font-sans); text-transform: none; letter-spacing: 0; font-size: 1rem; }
.nav-card__detail { color: var(--text-soft); line-height: 1.55; font-size: 0.92rem; }

.project-card__head, .project-card__foot {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.7rem;
  align-items: center;
}
.project-card__name { margin: 0; font-size: 1.05rem; font-weight: 600; }
.project-status {
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-strong);
  padding: 0.15rem 0.55rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: lowercase;
}
.project-status--active { background: var(--success-soft); color: var(--success); }
.project-status--shipped { background: var(--accent-soft); color: var(--accent-strong); }
.project-status--phase-0 { background: var(--attention-soft); color: var(--attention); }

.project-card__tagline,
.post-card__description,
.contact-card__detail,
.latest-card__description {
  color: var(--text-soft);
  line-height: 1.55;
  font-size: 0.94rem;
  margin: 0;
}
.project-card__links { display: inline-flex; flex-wrap: wrap; gap: 0.9rem; }
.project-card__links a {
  color: var(--accent);
  font-weight: 600;
  font-size: 0.88rem;
  font-family: var(--font-mono);
}

.project-group + .project-group { margin-top: 2.5rem; }
.project-group__heading {
  border-bottom: 1px solid var(--border-muted);
  margin-bottom: 1rem;
  padding-bottom: 0.7rem;
}
.project-group__heading h2 { margin: 0 0 0.25rem; font-size: 1.25rem; }
.project-group__heading p { margin: 0; color: var(--text-soft); line-height: 1.55; font-size: 0.94rem; }

.post-card__meta, .latest-card__meta, .post-detail__meta {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.78rem;
}
.post-card__title, .latest-card__title, .contact-card__value {
  color: var(--text);
  font-size: 1.05rem;
  font-weight: 600;
}
.contact-card__value { color: var(--accent); font-family: var(--font-mono); font-size: 0.94rem; }
.contact-card__value:hover { color: var(--accent-strong); }

.post-detail { max-width: var(--measure); margin-inline: auto; }
.post-detail__meta { display: flex; flex-wrap: wrap; gap: 0.8rem; margin-top: 0.5rem; }
.post-tags { margin-top: 0.85rem; }

/* ---------- Prose ---------- */
.post-body, .prose {
  color: var(--text-soft);
  font-size: 1rem;
  line-height: 1.72;
}
.post-body h2, .post-body h3, .prose h2, .prose h3 {
  margin-top: 2.2rem;
  margin-bottom: 0.6rem;
  color: var(--text);
}
.post-body h2, .prose h2 { font-size: 1.4rem; padding-bottom: 0.3rem; border-bottom: 1px solid var(--border-muted); }
.post-body h3, .prose h3 { font-size: 1.15rem; }
.post-body p, .prose p { margin: 0 0 1rem; }
.post-body strong, .prose strong { color: var(--text); }
.post-body a, .prose a { color: var(--accent); }
.post-body a:hover, .prose a:hover { color: var(--accent-strong); }
.post-body code, .prose code {
  background: var(--surface-overlay);
  border: 1px solid var(--border-muted);
  border-radius: 4px;
  padding: 0.08rem 0.32rem;
  font-size: 0.88em;
}
.post-body pre, .prose pre {
  background: var(--bg-subtle);
  border: 1px solid var(--border-muted);
  border-radius: var(--radius-md);
  padding: 0.9rem 1rem;
  overflow-x: auto;
  line-height: 1.55;
}
.post-body pre code, .prose pre code {
  background: none;
  border: 0;
  padding: 0;
  font-size: 0.88rem;
}
.post-body blockquote, .prose blockquote {
  margin: 1rem 0;
  padding: 0.3rem 1rem;
  border-left: 3px solid var(--border);
  color: var(--text-muted);
}
.post-body ul, .post-body ol, .prose ul, .prose ol { padding-left: 1.4rem; margin: 0 0 1rem; }
.post-body li, .prose li { margin-bottom: 0.3rem; }
.post-body table, .prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.94rem;
}
.post-body th, .post-body td, .prose th, .prose td {
  border: 1px solid var(--border-muted);
  padding: 0.55rem 0.8rem;
  text-align: left;
}
.post-body th, .prose th { background: var(--surface-overlay); font-weight: 600; color: var(--text); }

/* ---------- Empty state ---------- */
.empty-state {
  max-width: var(--measure);
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  padding: 1.5rem;
}
.empty-state h2 { margin: 0 0 0.6rem; font-size: 1.25rem; }
.empty-state p { color: var(--text-soft); line-height: 1.6; margin: 0 0 0.8rem; }
.empty-state .section-link { margin-top: 0.4rem; }

.contact-grid { margin-top: 0; }
.contact-card__title {
  color: var(--text-muted);
  text-transform: uppercase;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  margin: 0;
}

/* ---------- Footer ---------- */
.site-footer {
  border-top: 1px solid var(--border-muted);
  background: var(--bg-subtle);
  color: var(--text-soft);
  padding-top: 2.5rem;
}
.footer-inner { display: grid; gap: 2rem; padding-bottom: 2rem; }
.footer-copy { color: var(--text-soft); max-width: 38rem; line-height: 1.6; font-size: 0.92rem; }
.footer-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; }
.footer-column { display: grid; align-content: start; gap: 0.45rem; }
.footer-column a { color: var(--text-soft); font-size: 0.9rem; text-decoration: none; }
.footer-column a:hover { color: var(--accent); text-decoration: none; }
.footer-column__title {
  color: var(--text);
  text-transform: uppercase;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  margin: 0 0 0.15rem;
}
.footer-meta {
  border-top: 1px solid var(--border-muted);
  padding-block: 1.1rem;
  color: var(--text-muted);
  font-size: 0.82rem;
}
.footer-meta__inner { display: flex; flex-wrap: wrap; gap: 0.75rem 1.5rem; justify-content: space-between; }
.footer-meta p { margin: 0; }
.footer-meta__claim { font-family: var(--font-mono); }

/* ---------- Responsive ---------- */
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
}
@media (min-width: 1024px) {
  .hero-grid { grid-template-columns: minmax(0, 1.15fr) minmax(20rem, 0.75fr); align-items: start; }
  .signal-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .workflow-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .footer-columns { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 420px) {
  .brand-word { display: none; }
  .hero-grid { padding-block: 2.5rem 2rem; }
}
@media (max-width: 767px) {
  .hero-aside { display: none; }
  .hero-grid { padding-block: 2.5rem 2rem; gap: 1.5rem; }
  .stack-row { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 0.2rem; scrollbar-width: none; }
  .stack-row::-webkit-scrollbar { display: none; }
  .stack-chip { flex: 0 0 auto; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
"#;
