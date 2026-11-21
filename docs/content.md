# Publishing

The commands below describe the current TypeScript/PostgreSQL workflow.

Approved pages live in `src/routes/` (`+page.svelte`, with metadata in the
matching `+page.ts` or `+page.server.ts`). Every portfolio card comes from the
typed inventory in `src/lib/projects.ts` (groups, order, anchors and the home
page's featured subset), rendered by `src/lib/components/ProjectCard.svelte`.
Do not change other project claims without checking their evidence in
[docs/portfolio.md](portfolio.md), and keep `tests/http.ts` in step with it.

Posts live authoritatively in PostgreSQL `app.posts`. Use an authorized shell:

```sh
sudo /usr/local/sbin/dunamismax-posts create first-note --title 'First note' --body-file /home/sawyer/drafts/first-note.txt
sudo /usr/local/sbin/dunamismax-posts validate first-note
sudo /usr/local/sbin/dunamismax-posts edit first-note --excerpt 'A short description.'
sudo /usr/local/sbin/dunamismax-posts schedule first-note --at 2099-10-01T09:00:00-04:00
sudo /usr/local/sbin/dunamismax-posts publish first-note
sudo /usr/local/sbin/dunamismax-posts unpublish first-note
sudo /usr/local/sbin/dunamismax-posts list --limit 50 --offset 0
sudo /usr/local/sbin/dunamismax-posts show first-note
```

The sample future date illustrates the required explicit UTC offset; choose the
intended publication time. New posts are drafts. Edit preserves slug, status and
date; validate saves nothing; publish deliberately resets the publication instant
to database time; schedule requires a future instant; unpublish retains the date.
There is no public preview/admin endpoint. Blank lines become paragraphs; single
newlines become line breaks. HTML and Markdown remain literal, escaped text.
Titles/excerpts permit 240/600 Unicode characters, body 16,777,215 UTF-8 bytes.
Use `--body-file -` for UTF-8 stdin. JSON list/show intentionally contain private
content: use only trusted terminals and do not publish their output.

The root-owned wrapper takes a shared deployment lock for the command, loads
only `/etc/web-apps/dunamismax/publishing.env`, then drops to the independent
`sawyer` operator identity (separate from the website user). Deployment’s exclusive lock excludes
concurrent publishing. It never passes migration credentials or a database URL
to the web process. Direct local development uses `pnpm run posts ...` with
`POSTS_CONFIG` pointing to an absolute 0600 file owned by the invoking user
outside the checkout; that file is the sole configuration source. No inherited
website/admin credential fallback is allowed. Help needs no database/config.

The old PHP command is removed from this checkout, and its configuration was
frozen root-owned mode 0000 at the first cutover. MySQL is retired; PostgreSQL
is the only database, and releases only move forward.

## Drizzle implementation

The publisher (`src/lib/publisher.ts`) and CLI use Drizzle queries over one
dedicated node-postgres session per command, with unchanged commands, limits,
transactions, row locks and private list/show output. Only publish and schedule
write the publication instant, so edit and unpublish never round-trip stored
timestamps through JavaScript dates. Database errors are reported generically:
Drizzle query errors embed SQL parameters (post text) and are never printed.
