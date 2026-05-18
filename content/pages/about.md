<p>
  <strong>I am moving deliberately into a Rust-first stack:</strong>
  Rust for the systems that need speed, correctness, and explicit
  ownership; PostgreSQL for durable state; Python for automation,
  prototyping, data work, bots, and glue. Shell and PowerShell still
  matter because real IT work needs practical tools that run where the
  machines are.
</p>

<p>
  The domains pulling me hardest are high-frequency trading
  infrastructure, crypto markets, cryptography, encryption, secure
  networking, and local-first software. I want systems that are fast,
  inspectable, self-hostable, and boring to operate once they are in
  production.
</p>

<p>
  The work I like best has a clear owner, a clear data model, and an
  operating story that can be understood without a vendor diagram. A
  small program on infrastructure you control is still one of the
  fastest ways to turn an idea into something durable.
</p>

## What I care about

<p>
  <strong>Performance with receipts.</strong> Fast code should come
  with benchmarks, traces, and a clear reason for every optimization.
</p>

<p>
  <strong>Security as architecture.</strong> Cryptography, encryption,
  key handling, identity, retention, logging, and trust boundaries shape
  the design from the start.
</p>

<p>
  <strong>Ownership.</strong> I like software that can run on hardware
  you control, with data you can inspect, back up, restore, and move
  when you need to.
</p>

<p>
  <strong>Explicit data.</strong> Schemas, migrations, records,
  validation, and SQL should make the system easier to reason about, not
  harder. If you cannot trace a value through the system, the system is
  too clever.
</p>

<p>
  <strong>Operational discipline.</strong> I value iteration, but not
  chaos. The goal is useful software with complexity that has earned its
  place.
</p>

## The stack

<p>
  <strong>Rust</strong> is the center: CLIs, network services, protocol
  work, secure transport, local tools, trading experiments, and
  performance-sensitive paths. The defaults are small crates, explicit
  APIs, real error types, structured logs, benchmarks before claims, and
  the normal Cargo quality gate. For web apps and self-hosted dashboards,
  the default lane is Leptos, Axum, Tokio, SQLx, and PostgreSQL.
</p>

<p>
  <strong>PostgreSQL</strong> is the primary data layer. Relational
  state, JSONB documents when they fit, search, audit trails, job
  tables, reporting, and operational history live in one inspectable
  system before another moving part earns its place.
</p>

<p>
  <strong>Interfaces</strong> should match the job. Leptos is the default
  for Rust web surfaces, Ratatui for terminal applications, clap for serious
  CLIs, and Tauri, egui, iced, or Dioxus only when the product genuinely
  needs desktop-native or cross-platform app UI.
</p>

<p>
  <strong>Python</strong> is for leverage: automation, prototypes, data
  scripts, bots, operational glue, and one-off tooling. New Python work
  uses <code>uv</code>, project-local virtual environments, Ruff,
  pytest, and a checked-in <code>pyproject.toml</code>.
</p>

<p>
  <strong>Operations</strong> stay practical: macOS for local work,
  Ubuntu LTS for servers, Caddy for TLS, systemd for long-running
  processes, SSH deploys, PostgreSQL backups, restore drills, Bash/zsh
  on Unix, and PowerShell where Windows administration is the right
  surface.
</p>
