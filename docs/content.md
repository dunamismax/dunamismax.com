# Publishing

## Current workflow

Approved pages live in `src/pages/` and reusable cards in
`src/components/projects/`. Keep the eight-card ordering and summaries aligned.
Do not change other project claims without checking their evidence.

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
only `/etc/astro-apps/dunamismax/publishing.env`, then drops to the independent
`sawyer` operator identity (separate from the website user). Deployment’s exclusive lock excludes
concurrent publishing. It never passes migration credentials or a database URL
to the web process. Direct local development uses `npm run posts -- ...` with
`POSTS_CONFIG` pointing to an absolute 0600 file owned by the invoking user
outside the checkout; that file is the sole configuration source. No inherited
website/admin credential fallback is allowed. Help needs no database/config.

The old PHP command is removed from this checkout. At first cutover its
configuration is frozen root-owned mode 0000; a protected rollback copy retains
the original ownership/mode. Do not restore it while PostgreSQL writers are
active. The guarded rollback refuses a MySQL switch when content has diverged.

## Rewrite requirements (pending BUILD Phase 0)

Move approved page content to `src/app/**/page.tsx` and shared cards to React
components without changing their order, anchors or unrelated profile copy.
Update this site's stack descriptions consistently in the home/about/blog copy,
shared layout/footer, config description/manifest metadata and own project card
only when implementation and release evidence support them. Recheck sibling
project evidence before changing their descriptions; no cross-repo migration is
implied by the owner's common stack prompt.

Keep PostgreSQL content in place. Adopt Drizzle for schema, view reads and
publisher transactions while retaining every command, limit, status/date/slug
rule and credential boundary above. There is still no public editor, preview,
account or login requirement. The planned Compose publisher is a one-off
operator tool behind the same `dunamismax-posts` interface and shared lock;
the web container never receives publishing credentials. `list`/`show` output
stays private. Do not change the installed wrapper until the implementation,
permissions and rollback path pass rehearsal.
