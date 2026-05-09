# This file should ensure the existence of records required to run the application in every environment
# (production, development, test). The code here should be idempotent so that it can be executed at any
# point in every environment. The data can then be loaded with the bin/rails db:seed command (or created
# alongside the database with db:setup).

projects = [
  {
    slug: "ideal-magic", name: "Ideal Magic", category: "apps", status: "active",
    position: 5, featured: true, visibility: "public",
    tagline: "A serious Commander companion for deck imports, bracket evaluation, pod comparison, game nights, and playgroup tuning.",
    repo: "https://github.com/dunamismax/ideal-magic",
    url:  "https://ideal-magic.com",
    stack: "Ruby, Rails 8, PostgreSQL, Hotwire, ViewComponent, Tailwind CSS, Solid Queue, Puma, Caddy"
  },
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
    stack: "Discord, Scryfall, card search, pricing, legality, rulings"
  },
  {
    slug: "dunamismax-profile", name: "dunamismax", category: "reference", status: "active",
    position: 20, featured: false, visibility: "public",
    tagline: "The public profile repo that ties together my current focus areas, active projects, and primary links.",
    repo: "https://github.com/dunamismax/dunamismax",
    stack: "Markdown, Docs"
  }
]

project_slugs = projects.map { |project| project[:slug] }
Project.where.not(slug: project_slugs).delete_all

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
