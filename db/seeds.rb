# This file should ensure the existence of records required to run the application in every environment
# (production, development, test). The code here should be idempotent so that it can be executed at any
# point in every environment. The data can then be loaded with the bin/rails db:seed command (or created
# alongside the database with db:setup).

projects = [
  {
    slug: "zarc", name: "zarc", category: "apps", status: "active",
    position: 5, featured: true, visibility: "public",
    tagline: "Local-first, content-addressed backup system. A repository is a normal directory of explicit files, binary formats, and content-addressed objects — designed to remain understandable with ordinary tools.",
    repo: "https://github.com/dunamismax/zarc",
    stack: "C, Zig, zig cc, content addressing, fuzzable parsers"
  },
  {
    slug: "dunamismax-site", name: "dunamismax.com", category: "reference", status: "active",
    position: 10, featured: true, visibility: "public",
    tagline: "This site. Being rewritten as vanilla HTML, CSS, and TypeScript with a small Python backend, served behind Caddy on a single Ubuntu box.",
    repo: "https://github.com/dunamismax/dunamismax.com",
    url:  "https://dunamismax.com",
    stack: "HTML, CSS, TypeScript, Python, Caddy"
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

posts = []

post_slugs = posts.map { |post| post[:slug] }
Post.where.not(slug: post_slugs).delete_all

posts.each do |attrs|
  Post.find_or_initialize_by(slug: attrs[:slug]).update!(attrs)
end
