<p>
  <strong>I work in a deliberately narrow toolkit:</strong> Kotlin on
  the JVM for everything I write, and PostgreSQL for everything I
  store. Server-rendered HTML with Thymeleaf, HTMX, and Tailwind on
  top. One language, one database, one VM. The tools are small on
  purpose so the systems they produce stay legible.
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
  impressive in a diagram. One Ubuntu VM, one fat jar under systemd,
  one PostgreSQL on the same box, one Caddy in front, one redeploy
  script.
</p>

<p>
  <strong>Explicit data and explicit ownership.</strong> Schemas,
  migrations, types, and SQL should make the system easier to reason
  about, not harder. If you cannot trace a value through the system,
  the system is too clever.
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
  <strong>Kotlin on the JVM</strong> is the entire application layer:
  web apps, APIs, services, scheduled jobs, CLIs. JDK 21 with virtual
  threads, Spring Boot with Spring MVC, Gradle Kotlin DSL,
  <code>kotlinx.serialization</code>, Spring Data JDBC, jOOQ for typed
  SQL, and Flyway for migrations.
</p>

<p>
  <strong>PostgreSQL</strong> is the single data platform. Relational
  data, JSONB documents, full-text search, queues, audit logs,
  permissions, reporting, geospatial, and vector search live in one
  inspectable operational core before the system earns Redis, Kafka,
  Elasticsearch, ClickHouse, or a dedicated vector database. The
  defaults: <code>pgcrypto</code>, <code>pg_trgm</code>, and
  <code>pg_stat_statements</code>; <code>pgvector</code> only when
  there is real AI/RAG work, and PostGIS only when there are real
  maps.
</p>

<p>
  <strong>Server-rendered HTML</strong> with Thymeleaf, HTMX, and
  Tailwind covers most product surfaces without an SPA, a bundler, or
  a JavaScript framework.
</p>

<p>
  <strong>One Ubuntu VM</strong> runs everything: Caddy in front for
  TLS and reverse proxy, the Spring Boot fat jar under systemd, and
  PostgreSQL on the same box. Local dev runs in Docker Compose with a
  <code>justfile</code>, and deploys go out over SSH from GitHub
  Actions with Flyway handling migrations.
</p>
