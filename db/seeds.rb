# This file should ensure the existence of records required to run the application in every environment
# (production, development, test). The code here should be idempotent so that it can be executed at any
# point in every environment. The data can then be loaded with the bin/rails db:seed command (or created
# alongside the database with db:setup).

projects = [
  {
    slug: "dunamismax-site", name: "dunamismax.com", category: "reference", status: "shipped",
    position: 10, featured: true, visibility: "public",
    tagline: "This site. A Ruby on Rails 8 app on Puma, Caddy, and SQLite, deployed on a single Ubuntu box.",
    repo: "https://github.com/dunamismax/dunamismax.com",
    url:  "https://dunamismax.com",
    stack: "Ruby, Rails 8, Hotwire, Tailwind CSS, SQLite, Puma, Caddy, systemd"
  },
  {
    slug: "sentrypact", name: "SentryPact", category: "apps", status: "active",
    position: 15, featured: true, visibility: "public",
    tagline: "Lockdown-first filtering with timer-locked Solo Pacts. Rails control plane, native enforcement clients.",
    repo: "https://github.com/dunamismax/sentrypact",
    url:  "https://sentrypact.com",
    stack: "Ruby, Rails 8, Hotwire, Tailwind, SQLite, Swift, Kotlin"
  },
  {
    slug: "scrybase", name: "Scrybase", category: "apps", status: "active",
    position: 20, featured: true, visibility: "public",
    tagline: "A Commander workbench for decks, collections, pod history, matchup notes, and long-term tuning around a real playgroup.",
    repo: "https://github.com/dunamismax/scrybase",
    stack: "Ruby, Rails, PostgreSQL, Hotwire, Tailwind"
  },
  {
    slug: "debugpath", name: "DebugPath", category: "apps", status: "active",
    position: 30, featured: true, visibility: "public",
    tagline: "An investigation workspace for timelines, artifacts, notes, and debugging context collected during real production incidents.",
    repo: "https://github.com/dunamismax/debugpath",
    stack: "Ruby, Rails, PostgreSQL, Hotwire, MinIO"
  },
  {
    slug: "myliferpg", name: "MyLifeRPG", category: "apps", status: "active",
    position: 40, featured: false, visibility: "public",
    tagline: "A planning-first personal system for habits, tasks, routines, goals, and progress tracking without turning everything into a game.",
    repo: "https://github.com/dunamismax/myliferpg",
    stack: "Ruby, Rails, PostgreSQL, Hotwire"
  },
  {
    slug: "elchess", name: "ElChess", category: "apps", status: "phase-0",
    position: 50, featured: false, visibility: "public",
    tagline: "A multiplayer chess platform centered on durable game history, ratings, authentication, and post-game review.",
    repo: "https://github.com/dunamismax/elchess",
    stack: "Ruby, Rails, PostgreSQL, Action Cable, Hotwire"
  },
  {
    slug: "mtg-card-bot", name: "MTG Card Bot", category: "apps", status: "shipped",
    position: 60, featured: false, visibility: "public",
    tagline: "Discord bot for fast Magic: The Gathering card lookup with pricing, legality, rulings, and embed-first responses powered by Scryfall.",
    repo: "https://github.com/dunamismax/mtg-card-bot",
    stack: "Python, uv, discord.py, httpx"
  },
  {
    slug: "wirescope", name: "wirescope", category: "infrastructure", status: "shipped",
    position: 10, featured: false, visibility: "public",
    tagline: "Network observability for operators who need live capture, DNS context, historical search, alerts, and PCAP export on infrastructure they control.",
    repo: "https://github.com/dunamismax/wirescope",
    stack: "Go, SQLite, PCAP"
  },
  {
    slug: "bore", name: "bore", category: "infrastructure", status: "shipped",
    position: 20, featured: false, visibility: "public",
    tagline: "Peer-to-peer encrypted file transfer with direct hole punching, relay fallback, and both browser and terminal interfaces.",
    repo: "https://github.com/dunamismax/bore",
    stack: "Go, QUIC, Noise"
  },
  {
    slug: "rustdesk-selfhosted", name: "rustdesk-selfhosted", category: "infrastructure", status: "shipped",
    position: 30, featured: false, visibility: "public",
    tagline: "A self-hosted RustDesk relay and signaling deployment for low-friction remote desktop on infrastructure you own.",
    repo: "https://github.com/dunamismax/rustdesk-selfhosted",
    stack: "Docker, Caddy, systemd"
  },
  {
    slug: "gitpulse", name: "GitPulse", category: "developer-tools", status: "active",
    position: 10, featured: false, visibility: "public",
    tagline: "Local-first git analytics that separate active work, commit history, and push activity into a clearer picture of engineering output.",
    repo: "https://github.com/dunamismax/gitpulse",
    stack: "Go, SQLite"
  },
  {
    slug: "toolworks", name: "toolworks", category: "developer-tools", status: "active",
    position: 20, featured: false, visibility: "public",
    tagline: "A collection of automation scripts, CLI helpers, and small utilities that are useful enough to stand on their own.",
    repo: "https://github.com/dunamismax/toolworks",
    stack: "Python, uv, CLI"
  },
  {
    slug: "dunamismax-profile", name: "dunamismax", category: "reference", status: "active",
    position: 20, featured: false, visibility: "public",
    tagline: "The public profile repo that ties together my current focus areas, active projects, and primary links.",
    repo: "https://github.com/dunamismax/dunamismax",
    stack: "Markdown, Docs"
  },
  {
    slug: "go-web-server", name: "go-web-server", category: "reference", status: "shipped",
    position: 40, featured: false, visibility: "public",
    tagline: "A Go-first web starter kept around as a reference, alongside the Rails default for newer work.",
    repo: "https://github.com/dunamismax/go-web-server",
    stack: "Go, Echo, PostgreSQL, SQLC"
  },
  {
    slug: "c-from-the-ground-up", name: "C From The Ground Up", category: "reference", status: "shipped",
    position: 50, featured: false, visibility: "public",
    tagline: "A progressive C workbook that moves from first principles to systems programming through readable lessons and capstone exercises.",
    repo: "https://github.com/dunamismax/c-from-the-ground-up",
    url:  "https://dunamismax.github.io/c-from-the-ground-up/",
    stack: "C, Make, Reference"
  },
  {
    slug: "hello-world-from-hell", name: "hello-world-from-hell", category: "reference", status: "shipped",
    position: 60, featured: false, visibility: "public",
    tagline: "A deliberately absurd C project that turns Hello World into an elaborate exercise in macros, threads, and bad judgment.",
    repo: "https://github.com/dunamismax/hello-world-from-hell",
    stack: "C, Make, Testing"
  }
]

projects.each do |attrs|
  Project.find_or_initialize_by(slug: attrs[:slug]).update!(attrs)
end

posts = [
  {
    slug: "deploying-sentrypact-com",
    title: "Deploying sentrypact.com on a single Ubuntu box with Rails, Caddy, and systemd",
    description: "How sentrypact.com went from a fresh Rails 8 app to a production deployment behind Caddy and systemd, with Puma on a loopback port and SQLite on disk.",
    published_on: Date.new(2026, 4, 30),
    published: true,
    tags: "rails, ruby, deployment, self-hosting, caddy, systemd, sqlite",
    body_html: File.read(Rails.root.join("db/seeds/posts/deploying-sentrypact-com.html"))
  },
  {
    slug: "rewriting-dunamismax-in-rails",
    title: "Rewriting dunamismax.com in Ruby on Rails",
    description: "Why I tore down the Astro version of dunamismax.com and rebuilt the site as a Rails 8 app with Hotwire, Tailwind, SQLite, and Active Record-backed content.",
    published_on: Date.new(2026, 4, 30),
    published: true,
    tags: "rails, ruby, hotwire, tailwind, rewrite, astro",
    body_html: File.read(Rails.root.join("db/seeds/posts/rewriting-dunamismax-in-rails.html"))
  }
]

posts.each do |attrs|
  Post.find_or_initialize_by(slug: attrs[:slug]).update!(attrs)
end
