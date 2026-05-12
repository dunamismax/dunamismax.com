<p>
  <strong>I work in a deliberately narrow toolkit:</strong> Java for
  the application layer and PostgreSQL for the data layer.
  Server-rendered HTML with Thymeleaf, HTMX, and Tailwind on top. One
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
  impressive in a diagram. One Ubuntu LTS VM, one fat jar under
  systemd, one PostgreSQL on the same box, one Caddy in front, one
  redeploy path.
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
  <strong>Java 25 LTS</strong> is the default application layer: Spring
  Boot 4, Maven, JDK toolchains, Java records, and virtual threads for
  web apps, APIs, services, scheduled jobs, and CLIs. Spring MVC runs on
  embedded Tomcat with Jackson 3, Jakarta Validation, Spring Boot
  Actuator, Spring Security when the product needs it, jOOQ, Flyway,
  and HikariCP.
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
  <strong>Server-rendered HTML</strong> with Thymeleaf, HTMX, Tailwind
  CSS, and vanilla JavaScript covers most product surfaces. Alpine.js
  comes in only when a page has enough local state to justify it.
</p>

<p>
  <strong>Verification</strong> runs through JUnit 5, AssertJ, Spring
  Boot Test, Testcontainers PostgreSQL, Flyway migration tests, and
  Playwright only for critical browser flows.
</p>

<p>
  <strong>One Ubuntu LTS VM</strong> runs everything: Caddy in front for
  TLS and reverse proxy, the Spring Boot fat jar under systemd, and
  PostgreSQL on the same box. Local dev runs in Docker Compose with a
  <code>justfile</code>, Maven wrapper, <code>.env</code> config, and
  Mailpit when email needs testing. Deploys go out over SSH from GitHub
  Actions with Flyway handling migrations, <code>pg_dump</code> backups,
  and an offsite backup copy.
</p>
