<p>
  <strong>I work in a deliberately narrow toolkit:</strong> C and Zig for
  systems software, Python for scripts and backends, and vanilla HTML,
  CSS, and TypeScript for the web. No frameworks, no SPA tax, no clever
  meta-language sitting between me and the data. The tools are small on
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
  impressive in a diagram. One box, one service, one redeploy script is
  often the correct answer.
</p>

<p>
  <strong>Explicit data and explicit ownership.</strong> Schemas, file
  formats, allocations, and lifetimes should make the system easier to
  reason about, not harder. If you cannot trace a value through the
  system, the system is too clever.
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
  <strong>C</strong> (C23 preferred, C17 for portability) is where I
  write the systems core: parsers, file formats, on-disk data, anything
  that has to be precise about memory and time. Allocator-clean code,
  fixed-width binary formats, fuzzable parsers, and explicit error
  handling are the defaults.
</p>

<p>
  <strong>Zig</strong> drives the build system, cross-compilation,
  codegen, helper tools, and test harnesses. C compiles through
  <code>zig cc</code>; CMake stays out of the project.
</p>

<p>
  <strong>Python</strong> handles scripting, automation, APIs, and
  backends. It's the right shape for fast tools, content pipelines,
  deployment scripts, and small services that don't need to live in a
  systems language.
</p>

<p>
  <strong>Vanilla HTML, CSS, and TypeScript</strong> is the web stack.
  No frameworks, no client-side router, no build-time magic when a
  server-rendered page works. JavaScript is added only when the product
  clearly benefits from it.
</p>
