<p>
  <strong>I work in a deliberately narrow toolkit:</strong> Go for the
  application layer, C for systems, and PostgreSQL for the data layer.
  Server-rendered HTML with HTMX and restrained CSS on top. One
  language, one database, one VM. The tools are small on purpose so the
  systems they produce stay legible.
</p>

<p>
  My primary build focus is <strong>Callrift</strong>, an open-source,
  username-first communications platform for encrypted messages, WebRTC
  voice, group spaces, and technical communities without phone numbers
  as identity.
</p>

<p>
  The work I like best has a clear owner, a clear data model, and an
  operating story that can be understood without a vendor diagram. A
  small program on infrastructure you control is still one of the
  fastest ways to turn an idea into something durable.
</p>

## What I care about

<p>
  <strong>Ownership.</strong> I like software that can run on hardware
  you control, with data you can inspect and move when you need to.
</p>

<p>
  <strong>Privacy and security.</strong> They are not polish items. They
  shape authentication, data retention, logging, dependency choices, and
  the way a product talks about what it stores.
</p>

<p>
  <strong>Boring infrastructure.</strong> I prefer the deployment that
  is easy to explain and easy to recover, not the one that looks
  impressive in a diagram. One Ubuntu LTS VM, Go services under systemd,
  one PostgreSQL on the same box, one Caddy in front, one redeploy path.
</p>

<p>
  <strong>Explicit data and explicit ownership.</strong> Schemas,
  migrations, records, validation, and SQL should make the system
  easier to reason about, not harder. If you cannot trace a value
  through the system, the system is too clever.
</p>

<p>
  <strong>Open source.</strong> Source code should be available when it
  helps people inspect, adapt, self-host, or recover the tools they rely
  on.
</p>

<p>
  <strong>Shipping with discipline.</strong> I value iteration, but not
  chaos. The goal is useful software with complexity that has earned its
  place.
</p>

## The stack

<p>
  <strong>Go</strong> is the default application layer: web apps, APIs,
  workers, scheduled jobs, and CLIs. I prefer small monoliths with clear
  package boundaries, standard-library defaults, explicit error paths,
  and separate web and worker binaries when the product needs them.
</p>

<p>
  <strong>C</strong> is for systems programming, performance-critical
  components, and building from first principles. I value the control
  and understanding that comes from working closer to the hardware.
</p>

<p>
  <strong>PostgreSQL 18</strong> is the single data platform. Relational
  state, JSONB documents, full-text search, queues, audit logs,
  permissions, and reporting live in one inspectable operational core
  before the system earns Redis, Kafka, Elasticsearch, ClickHouse, or a
  dedicated vector database. The defaults: uuidv7 primary keys,
  <code>pgcrypto</code>, <code>pg_trgm</code>, and
  <code>pg_stat_statements</code>; <code>pgvector</code> only for real
  AI/RAG work, and PostGIS only for maps or GIS.
</p>

<p>
  <strong>Server-rendered HTML</strong> with Go templates, HTMX,
  restrained CSS, and small feature-scoped JavaScript covers most
  product surfaces. A client-side framework comes in only when a page
  has enough local state to justify it.
</p>

<p>
  <strong>Verification</strong> runs through Go tests, SQL generation
  checks, migration tests against real PostgreSQL, template rendering
  tests, server startup smoke, and Playwright only for critical browser
  flows.
</p>

<p>
  <strong>One Ubuntu LTS VM</strong> runs everything: Caddy in front for
  TLS and reverse proxy, Go services under systemd, and PostgreSQL on
  the same box. Local dev uses an installed PostgreSQL service, a
  <code>justfile</code>, <code>.env</code> config, and Mailpit when
  email needs testing. Deploys go out over SSH from GitHub Actions with
  SQL migrations, <code>pg_dump</code> backups, restore drills, and an
  offsite backup copy.
</p>
