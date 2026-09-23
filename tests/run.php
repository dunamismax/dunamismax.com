<?php

declare(strict_types=1);

use Dunamismax\Application;
use Dunamismax\Config;
use Dunamismax\Database;
use Dunamismax\Environment;
use Dunamismax\Repositories\PostRepository;
use Dunamismax\View;

require dirname(__DIR__) . '/bootstrap.php';
require_once __DIR__ . '/support.php';

// These tests do not read .env or touch a database. Isolate process overrides.
foreach (['APP_ENV', 'APP_URL', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'] as $key) {
    putenv($key);
}

$checks = 0;
function expect(bool $condition, string $message): void
{
    global $checks;
    if (!$condition) {
        throw new RuntimeException($message);
    }
    $checks++;
}

function rejects(callable $action, string $message): void
{
    try {
        $action();
    } catch (RuntimeException) {
        expect(true, $message);
        return;
    }
    expect(false, $message);
}

/** @return list<string> */
function hrefs(string $html): array
{
    preg_match_all('#href="([^"]+)"#', $html, $matches);
    return $matches[1];
}

function appFor(array $values): Application
{
    $config = new Config(new Environment($values, false));
    return new Application(new View($config, dirname(__DIR__)), new PostRepository(new Database($config)));
}

try {
    $root = dirname(__DIR__);
    $temp = tempnam(sys_get_temp_dir(), 'dunamismax-env-');
    try {
        file_put_contents($temp, "# Comment\nAPP_ENV=local\nDB_PASSWORD='literal # dollar \$HOME'\nDB_NAME=\n");
        $env = Environment::fromFile($temp);
        expect($env->get('DB_PASSWORD') === 'literal # dollar $HOME', 'Environment values must stay literal.');
        expect($env->get('DB_NAME', 'fallback') === '', 'Empty values must survive.');
        putenv('APP_ENV=test');
        expect($env->get('APP_ENV') === 'test', 'Process environment must take precedence.');
        putenv('APP_ENV');
        file_put_contents($temp, "DB_PASSWORD='unterminated\n");
        rejects(fn () => Environment::fromFile($temp), 'Malformed environment files must fail.');
    } finally {
        unlink($temp);
    }

    rejects(fn () => new Config(new Environment()), 'Production must require a database.');
    rejects(fn () => new Config(new Environment(['APP_ENV' => 'production', 'APP_URL' => 'http://example.com', 'DB_NAME' => 'test'])), 'Production must require HTTPS.');
    rejects(fn () => new Config(new Environment(['APP_ENV' => 'local', 'DB_NAME' => 'db;host=evil'])), 'DSN injection must be rejected.');
    rejects(fn () => new Config(new Environment(['APP_ENV' => 'local', 'APP_URL' => 'https://example.com/subdir'])), 'Base URL paths are unsupported.');
    rejects(fn () => new Config(new Environment(['APP_ENV' => 'staging'])), 'Unknown environments must be rejected.');
    expect((new Config(new Environment(['APP_ENV' => 'local'])))->url === 'https://dunamismax.com', 'The canonical origin defaults to the apex domain.');
    expect(e('<script>"&') === '&lt;script&gt;&quot;&amp;', 'Output must be escaped.');
    expect(!str_contains(paragraphs("Hello\n\n<script>alert(1)</script>"), '<script>'), 'Post text must not become executable HTML.');
    expect(substr_count(paragraphs("First\r\n\r\nSecond"), '<p>') === 2, 'Paragraphs must handle Windows line endings.');
    expect(paragraphs("# Heading\n*emphasis*") === "<p># Heading<br>\n*emphasis*</p>", 'Markdown must stay literal text; there is no Markdown renderer.');
    expect(reading_minutes('one') === 1 && reading_minutes(str_repeat('word ', 221)) === 2, 'Reading time rounds up at 220 words with a one-minute floor.');

    $app = appFor(['APP_ENV' => 'test', 'APP_URL' => 'http://localhost:8000']);
    $pages = [
        '/' => ['PHP-first web work and hands-on systems administration.', 'dunamismax'],
        '/about' => ['PHP-first web development, Python scripting, and practical systems administration.', 'About · dunamismax'],
        '/projects' => ['Live projects.', 'Projects · dunamismax'],
        '/blog' => ['No posts yet.', 'Blog · dunamismax'],
        '/contact' => ['dunamismax@tutamail.com', 'Contact · dunamismax'],
    ];
    $bodies = [];
    foreach ($pages as $path => [$text, $title]) {
        $response = $app->handle('GET', $path);
        $bodies[$path] = $response->body;
        expect($response->status === 200, $path . ' must render without a local database.');
        expect(str_starts_with($response->body, "<!DOCTYPE html>\n<html lang=\"en\">"), $path . ' must be a complete HTML document.');
        expect(str_contains($response->body, $text), $path . ' must contain its meaningful content: ' . $text);
        expect(str_contains($response->body, '<title>' . e($title) . '</title>'), $path . ' must keep its title format.');
        expect(substr_count($response->body, '<h1') === 1, $path . ' must have exactly one h1.');
        expect(str_contains($response->body, '<main id="main-content"') && str_contains($response->body, 'href="#main-content"'), $path . ' must have a main landmark and skip link.');
        expect(!preg_match('/<script|\son[a-z]+=|javascript:|style=/i', $response->body), $path . ' must send zero JavaScript and no inline styles.');
        expect(!str_contains($response->body, 'theme.js') && !str_contains($response->body, 'theme-toggle') && !str_contains($response->body, 'data-theme'), $path . ' must not reference the removed theme toggle.');
        expect(str_contains($response->body, '<link rel="canonical" href="http://localhost:8000' . $path . '">'), $path . ' canonical must use the configured origin.');
        expect(str_contains($response->body, '<meta property="og:title"') && str_contains($response->body, 'href="/manifest.webmanifest"') && str_contains($response->body, '<link rel="icon" href="/icon.svg"'), $path . ' must keep sharing metadata, manifest, and icon links.');
        expect(str_contains($response->body, 'rel="alternate" type="application/rss+xml"') && str_contains($response->body, '<a href="/feed.xml">RSS feed</a>'), $path . ' must advertise the feed.');
        expect(preg_match('#<link rel="stylesheet" href="/css/site\.css\?v=\d+">#', $response->body) === 1, $path . ' must link the versioned stylesheet.');
        expect(($response->headers['X-Robots-Tag'] ?? '') === 'noindex' && str_contains($response->body, '<meta name="robots" content="noindex">'), $path . ' must discourage indexing outside production.');
        expect($app->handle('HEAD', $path)->status === 200, $path . ' must support HEAD.');
        if ($path !== '/') {
            expect(substr_count($response->body, 'href="' . $path . '" class="is-current" aria-current="page"') === 2, $path . ' must mark the current section in both navigations without relying on color.');
        }
    }

    // The repositioned copy: no Rust wording, and retired projects are gone.
    $css = file_get_contents($root . '/public/css/site.css');
    $public = implode("\n", [...array_values($bodies), $css,
        $app->handle('GET', '/manifest.webmanifest')->body, $app->handle('GET', '/feed.xml')->body,
        $app->handle('GET', '/missing')->body]);
    foreach (['rust', 'axum', 'leptos', 'tokio', 'cargo', 'sqlx', 'loveward', 'callrift', 'pod tracker', 'pod-tracker', 'fileferry', 'next.js', 'typescript', 'tailwind', 'drizzle', 'postgres'] as $word) {
        expect(!preg_match('/\b' . preg_quote($word, '/') . '\b/i', $public), 'Public output must not mention ' . $word . '.');
    }
    foreach (['/' => 'PHP', '/about' => 'Python', '/projects' => 'PHP'] as $path => $word) {
        expect(str_contains($bodies[$path], $word), $path . ' must present the ' . $word . ' direction.');
    }
    expect(str_contains($bodies['/about'], 'sysadmin'), 'The about page must present the sysadmin role.');

    // Projects are semantic HTML; the summaries must match the cards they describe.
    $names = static function (string $html): array {
        preg_match_all('#<h3 class="project-card__name">([^<]+)</h3>#', $html, $matches);
        return $matches[1];
    };
    $expectedProjects = ['mtg-card-bot', 'status.dunamismax', 'dunamismax.com', 'Toolworks', 'LangIndex'];
    expect($names($bodies['/projects']) === $expectedProjects, 'The projects page must list exactly the five active projects in category order.');
    expect($names($bodies['/']) === $expectedProjects, 'The home page must feature the same five projects.');
    expect(str_contains($bodies['/projects'], '<li>5 public projects</li>') && str_contains($bodies['/'], '<strong>5 public projects</strong>'), 'Project counts must match the cards.');
    preg_match_all('#<section class="project-group"#', $bodies['/projects'], $groups);
    expect(count($groups[0]) === 4 && str_contains($bodies['/projects'], '<li>4 active categories</li>'), 'Category count must match the groups.');
    foreach (['Applications', 'Infrastructure', 'Developer tools', 'Reference'] as $group) {
        expect(str_contains($bodies['/projects'], '>' . $group . '</h2>'), 'Projects must group under ' . $group . '.');
    }
    expect(substr_count($bodies['/projects'], 'class="project-status project-status--active">Active</span>') === 5, 'Every listed project must show a text status, not only a color.');

    preg_match('#<main id="main-content".*?</main>#s', $bodies['/contact'], $contactMain);
    expect(hrefs($contactMain[0]) === [
        'mailto:dunamismax@tutamail.com',
        'https://signal.me/#eu/ohSycFRzUEPZzCEifM1UVelp9pdBfmOPoSHItfUsK1PqosRCQSBBEIsqRq2krmph',
        'https://github.com/dunamismax',
        'https://codeberg.org/dunamismax',
        'https://www.reddit.com/user/DunamisMax/',
        'https://github.com/dunamismax/dunamismax.com',
    ], 'Contact must preserve all six destinations exactly.');
    expect(str_contains($bodies['/'], 'Writing is ready for build notes.') && str_contains($bodies['/'], '<strong>0 published notes</strong>'), 'An empty blog must say so on the home page.');

    // Non-HTML routes keep their URLs, types, and bodies.
    $robots = $app->handle('GET', '/robots.txt');
    expect($robots->status === 200 && $robots->body === "User-agent: *\nAllow: /\n" && $robots->headers['Content-Type'] === 'text/plain; charset=utf-8' && $robots->headers['Cache-Control'] === 'public, max-age=300, must-revalidate', 'robots.txt must be preserved.');
    $manifest = $app->handle('GET', '/manifest.webmanifest');
    $manifestData = json_decode($manifest->body, true, 8, JSON_THROW_ON_ERROR);
    expect($manifest->headers['Content-Type'] === 'application/manifest+json' && $manifestData['name'] === 'dunamismax' && $manifestData['icons'][0]['src'] === '/icon.svg' && $manifestData['start_url'] === '/', 'The web manifest must be preserved.');
    $health = $app->handle('GET', '/healthz');
    expect($health->status === 200 && $health->body === '{"status":"ok"}' && $health->headers['Content-Type'] === 'application/json', '/healthz must return the same JSON probe.');
    expect($app->handle('HEAD', '/healthz')->status === 200, '/healthz must support HEAD.');
    $feed = $app->handle('GET', '/feed.xml');
    $feedXml = parseFeed($feed->body);
    expect($feed->status === 200 && $feed->headers['Content-Type'] === 'application/xml; charset=utf-8' && $feed->headers['Cache-Control'] === 'no-store', 'The feed must keep its content type and avoid stale caches.');
    expect($feedXml->documentElement->getAttribute('version') === '2.0' && $feedXml->getElementsByTagName('item')->length === 0, 'An empty blog must produce a valid, empty RSS 2.0 feed.');
    expect($feedXml->getElementsByTagName('title')->item(0)->textContent === 'dunamismax · Blog', 'The feed title must be preserved.');
    expect(str_contains($css, '.site-header') && str_contains($css, '@media (prefers-color-scheme: light)') && !str_contains($css, 'data-theme') && !str_contains($css, 'theme-toggle'), 'The stylesheet must theme through prefers-color-scheme only.');
    expect(str_starts_with(file_get_contents($root . '/public/icon.svg'), '<svg'), 'The icon must be served as SVG.');
    expect(!is_dir($root . '/public/js') && $app->handle('GET', '/js/theme.js')->status === 404, 'The removed theme script must be gone.');

    foreach (['/.env', '/README.md', '/index.php', '/app/Config.php', '/missing', '/about/', '/blog/', '/blog/nope', '/blog/Upper', '/blog/a--b', '//evil.example', '/blog/../../.env', '/bin/posts.php', '/favicon.ico', '/404'] as $path) {
        $response = $app->handle('GET', $path);
        expect($response->status === 404 && str_contains($response->body, 'That page is not here.'), 'Private or unknown path must return 404: ' . $path);
        expect(!str_contains($response->body, 'rel="canonical"') && ($response->headers['X-Robots-Tag'] ?? '') === 'noindex', 'Error pages must not be canonical or indexed: ' . $path);
    }
    expect(str_contains($app->handle('GET', '/missing')->body, '<title>Not found · dunamismax</title>'), 'The 404 title must be preserved.');
    foreach (['0', '-1', 'abc', ['1'], '100001', '2'] as $page) {
        expect($app->handle('GET', '/blog', ['page' => $page])->status === 404, 'Invalid or nonexistent blog pages must return 404.');
    }
    foreach (['POST', 'PUT', 'DELETE', 'OPTIONS'] as $method) {
        $response = $app->handle($method, '/');
        expect($response->status === 405 && $response->headers['Allow'] === 'GET, HEAD', 'Unsupported methods must be rejected: ' . $method);
    }

    $post = ['slug' => 'escaping', 'title' => '<script>bad</script>', 'excerpt' => 'A "quote"', 'published_at' => '2026-01-01 12:00:00', 'body' => "<img src=x onerror=alert(1)>\n\nSecond paragraph."];
    $config = new Config(new Environment(['APP_ENV' => 'test'], false));
    $rendered = (new View($config, $root))->page('post', ['title' => $post['title'], 'post' => $post, 'path' => '/blog/escaping', 'ogType' => 'article']);
    expect(!str_contains($rendered->body, '<script>') && str_contains($rendered->body, '&lt;script&gt;bad&lt;/script&gt;'), 'Post titles must be escaped.');
    expect(str_contains($rendered->body, '<p>&lt;img src=x onerror=alert(1)&gt;</p>') && str_contains($rendered->body, '<p>Second paragraph.</p>'), 'Post bodies must be escaped paragraphs.');
    expect(str_contains($rendered->body, '<meta property="og:type" content="article">') && str_contains($rendered->body, 'datetime="2026-01-01"') && str_contains($rendered->body, 'Jan 1, 2026'), 'Posts must carry article metadata and a machine-readable date.');

    // Production indexing, and behavior when MySQL is unreachable (port 1 refuses).
    // Failures belong in the server log; capture it to prove they are recorded.
    $errorLog = tempnam(sys_get_temp_dir(), 'dunamismax-log-');
    $previousLog = ini_set('error_log', $errorLog);
    $production = appFor(['APP_ENV' => 'production', 'APP_URL' => 'https://dunamismax.com', 'DB_NAME' => 'dunamismax', 'DB_PORT' => '1']);
    foreach (['/about', '/projects', '/contact', '/?utm_source=test'] as $path) {
        $response = $production->handle('GET', $path);
        $canonical = explode('?', $path, 2)[0];
        expect($response->status === 200 && !isset($response->headers['X-Robots-Tag']) && !str_contains($response->body, 'name="robots"'), 'Production must allow indexing of ' . $path);
        expect(str_contains($response->body, '<link rel="canonical" href="https://dunamismax.com' . $canonical . '">'), 'Production canonical URLs must drop query strings: ' . $path);
    }
    $degraded = $production->handle('GET', '/');
    expect($degraded->status === 200 && !str_contains($degraded->body, 'Writing is ready') && str_contains($degraded->body, 'Notes on the blog'), 'The home page must stay up during a database outage without claiming the blog is empty.');
    foreach (['/blog', '/blog/any-post', '/feed.xml'] as $path) {
        $response = $production->handle('GET', $path);
        expect($response->status === 503 && ($response->headers['Retry-After'] ?? '') === '60' && !str_contains($response->body, '<rss'), 'A database outage must be an honest 503 on ' . $path);
    }
    expect($production->handle('GET', '/healthz')->status === 200, 'The health probe must not depend on MySQL.');
    ini_set('error_log', $previousLog === false ? '' : $previousLog);
    $logged = file_get_contents($errorLog);
    unlink($errorLog);
    expect(substr_count($logged, 'PDOException') === 5, 'Every database failure must be logged for the operator.');

    // The real front controller and development router, over HTTP. A release
    // has a production .env beside it; simulate one when the checkout has none,
    // so these checks prove the test server never falls back to it.
    $envFile = $root . '/.env';
    $simulatedEnv = !file_exists($envFile) && !is_link($envFile);
    if ($simulatedEnv) {
        file_put_contents($envFile, "# Temporary file written by tests/run.php; safe to delete.\nAPP_ENV=production\nAPP_URL=https://must-not-be-used.example\nDB_HOST=127.0.0.1\nDB_PORT=1\nDB_NAME=must_not_be_used\nDB_USER=must_not_be_used\nDB_PASSWORD=must-not-be-used\n");
    }
    try {
        withHttpServer(['APP_ENV' => 'test', 'APP_URL' => 'https://canonical.example', 'TEST_EMPTY_ENV' => 'DB_NAME,DB_USER,DB_PASSWORD'], static function (string $base) use ($css): void {
            [$body, $headers] = httpRead($base . '/');
            expect(str_contains($headers, '200 OK') && str_contains(strtolower($headers), 'content-type: text/html; charset=utf-8'), 'HTTP home must be HTML.');
            expect(str_contains(strtolower($headers), "content-security-policy: default-src 'self'") && str_contains(strtolower($headers), 'x-content-type-options: nosniff'), 'HTTP responses must carry security headers.');
            expect(str_contains($body, 'https://canonical.example/') && !str_contains($body, 'untrusted.example'), 'The Host header must never influence canonical URLs.');
            [$headBody, $headHeaders] = httpRead($base . '/', 'HEAD');
            expect($headBody === '' && str_contains($headHeaders, '200 OK'), 'HEAD must return headers only.');
            [$cssBody, $cssHeaders] = httpRead($base . '/css/site.css?v=1');
            expect($cssBody === $css && str_contains(strtolower($cssHeaders), 'content-type: text/css'), 'The stylesheet URL must be served as CSS.');
            [$iconBody, $iconHeaders] = httpRead($base . '/icon.svg');
            expect(str_starts_with($iconBody, '<svg') && str_contains(strtolower($iconHeaders), 'content-type: image/svg+xml'), 'The icon URL must be served as SVG.');
            [$feedBody, $feedHeaders] = httpRead($base . '/feed.xml');
            expect(str_contains(strtolower($feedHeaders), 'content-type: application/xml; charset=utf-8'), 'HTTP feed must keep application/xml.');
            expect(parseFeed($feedBody)->getElementsByTagName('item')->length === 0 && !str_contains($feedBody, 'must-not-be-used'), 'The test server must never read the release .env or its database.');
            foreach (['/js/theme.js', '/index.php', '/.env', '/bootstrap.php'] as $path) {
                [, $privateHeaders] = httpRead($base . $path);
                expect(str_contains($privateHeaders, '404'), 'HTTP must not expose ' . $path);
            }
            [, $postHeaders] = httpRead($base . '/', 'POST');
            expect(str_contains($postHeaders, '405') && str_contains($postHeaders, 'Allow: GET, HEAD'), 'HTTP POST must be rejected.');
        });
    } finally {
        if ($simulatedEnv) {
            unlink($envFile);
        }
    }

    require __DIR__ . '/features.php';
    printf("Passed %d application checks.\n", $checks);
} catch (Throwable $error) {
    fwrite(STDERR, 'FAIL: ' . $error->getMessage() . "\n");
    exit(1);
}
