<?php

declare(strict_types=1);

use Dunamismax\Application;
use Dunamismax\Config;
use Dunamismax\Database;
use Dunamismax\Environment;
use Dunamismax\Repositories\PostRepository;
use Dunamismax\View;

require dirname(__DIR__) . '/bootstrap.php';

// Opt-in integration checks, on a dedicated database, with rollback of fixtures.
// Never read .env here; the target must be explicit in the command environment.
if (getenv('APP_ENV') !== 'test' || !str_ends_with(getenv('DB_NAME') ?: '', '_test')) {
    fwrite(STDERR, "Set APP_ENV=test and an explicit DB_NAME ending in _test. This must be a dedicated test database.\n");
    exit(1);
}

$pdo = null;
$failed = false;
try {
    $config = new Config(new Environment());
    $database = new Database($config);
    $pdo = $database->connection();
    $pdo->exec(file_get_contents(dirname(__DIR__) . '/database/schema.sql'));
    $pdo->exec(file_get_contents(dirname(__DIR__) . '/database/schema.sql'));
    if ((int) $pdo->query('SELECT COUNT(*) FROM posts')->fetchColumn() !== 0) {
        throw new RuntimeException('Use an empty dedicated test database. Existing content will not be deleted.');
    }
    $pdo->beginTransaction();
    $insert = $pdo->prepare('INSERT INTO posts (slug, title, excerpt, body, status, published_at) VALUES (?, ?, ?, ?, ?, ?)');
    $past = gmdate('Y-m-d H:i:s', time() - 3600);
    $future = gmdate('Y-m-d H:i:s', time() + 86400);
    foreach ([['public-note', 'published', $past], ['private-draft', 'draft', $past], ['future-note', 'published', $future]] as [$slug, $status, $date]) {
        $insert->execute([$slug, 'Title <test>', 'A thoughtful excerpt.', "First paragraph.\n\n<script>example</script>", $status, $date]);
    }
    $posts = new PostRepository($database);
    if ($posts->countPublished() !== 1 || count($posts->latest()) !== 1
        || $posts->latest()[0]['slug'] !== 'public-note'
        || $posts->findPublished('private-draft') !== null
        || $posts->findPublished('future-note') !== null
        || $posts->findPublished("' OR 1=1 --") !== null
        || $posts->latest(10, 1) !== []
    ) {
        throw new RuntimeException('Publication filtering, binding, or pagination failed.');
    }
    $app = new Application(new View($config, dirname(__DIR__)), $posts);
    $response = $app->handle('GET', '/blog/public-note');
    $home = $app->handle('GET', '/');
    if ($response->status !== 200 || str_contains($response->body, '<script>')
        || !str_contains($response->body, 'Title &lt;test&gt;')
        || $app->handle('GET', '/blog/private-draft')->status !== 404
        || $app->handle('GET', '/blog/future-note')->status !== 404
        || !str_contains($home->body, 'href="/blog/public-note" class="latest-card"')
        || !str_contains($home->body, '<strong>1 published note</strong>')
    ) {
        throw new RuntimeException('Post rendering, the home latest-post card, or private post routing failed.');
    }
    for ($index = 0; $index < 11; $index++) {
        $insert->execute(['page-note-' . $index, 'A page note', '', 'Text', 'published', $past]);
    }
    $page = $app->handle('GET', '/blog', ['page' => '2']);
    if ($posts->countPublished() !== 12 || count($posts->latest(10, 10)) !== 2
        || $page->status !== 200 || !str_contains($page->body, '/blog?page=2">')
        || !str_contains($page->body, 'Page 2 of 2')
        || $app->handle('GET', '/blog', ['page' => '3'])->status !== 404
    ) {
        throw new RuntimeException('Blog pagination failed.');
    }
    fwrite(STDOUT, "MySQL integration passed: schema reapplication, publication visibility, SQL binding, post escaping, and pagination.\n");
    $pdo->rollBack();
    require __DIR__ . '/publishing.php';
    publishingChecks($config, $database);
} catch (Throwable $error) {
    fwrite(STDERR, 'FAIL: ' . $error->getMessage() . "\n");
    $failed = true;
} finally {
    if ($pdo?->inTransaction()) {
        $pdo->rollBack();
    }
}
exit($failed ? 1 : 0);
