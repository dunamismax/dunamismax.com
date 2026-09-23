# Content

## Pages

Home, about, contact, and projects are hand-written semantic HTML in
`views/`. Edit them directly and run `make check`; the tests assert key copy,
the project counts, the contact links, and that no retired stack or project
names appear.

To add or remove a project, edit the card in
`views/partials/projects/<category>.php`, then update `4 public projects` on
`views/home.php` and `views/projects.php` (and the category count if a group
appears or disappears) and the expected list in `tests/run.php`.

## Blog posts

Posts live in MySQL and are managed only through the CLI, over SSH or a local
shell, as the `sawyer` account:

```sh
cd /srv/www/dunamismax.com/current
php bin/posts.php --help
php bin/posts.php create my-post --title 'Title' --body-file ~/drafts/my-post.txt --excerpt 'One-line summary.'
php bin/posts.php validate my-post
php bin/posts.php publish my-post                       # now
php bin/posts.php schedule my-post --at 2026-10-01T09:00:00-04:00
php bin/posts.php unpublish my-post                     # back to draft, date kept
php bin/posts.php list
php bin/posts.php show my-post
```

- New posts are drafts. Only `publish` and `schedule` make them public.
- Edits preserve unspecified fields, status, and date. Slugs cannot change.
- Slugs are lowercase ASCII words separated by single hyphens.
- The body is UTF-8 plain text. Blank lines separate paragraphs. HTML and
  Markdown stay literal and are escaped on output; there is no Markdown
  renderer.
- Title: up to 240 characters. Excerpt: up to 600 characters, optional; it
  becomes the meta description and RSS description.
- Private drafts can live in `/srv/www/dunamismax.com/shared/storage/drafts`
  (sawyer only, mode 0700).

The CLI reads only `/etc/dunamismax/publishing.env` (or `POSTS_CONFIG`). The
file must be mode 0600 and owned by the invoking user. It never uses the
website's credentials, and the website can never read it.

## Feed

`/feed.xml` is RSS 2.0 with the 20 newest visible posts, each with an escaped
description and the escaped paragraph body as `content:encoded`. GUIDs are
`https://dunamismax.com/blog/<slug>`. There are no cache validators, so
scheduled and unpublished posts take effect on the next request.
