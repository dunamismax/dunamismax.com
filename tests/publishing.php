<?php

declare(strict_types=1);

use Dunamismax\Application;
use Dunamismax\Config;
use Dunamismax\Database;
use Dunamismax\Environment;
use Dunamismax\Repositories\PostRepository;
use Dunamismax\View;

require_once __DIR__ . '/support.php';

function publishingChecks(Config $config, Database $database): void
{
    $pdo = $database->connection();
    $root = dirname(__DIR__);
    $checks = 0;
    $expect = static function (bool $condition, string $message) use (&$checks): void {
        if (!$condition) {
            throw new RuntimeException($message);
        }
        $checks++;
    };
    foreach (['TEST_PUBLISH_DB_USER', 'TEST_PUBLISH_DB_PASSWORD', 'TEST_WEB_DB_USER', 'TEST_WEB_DB_PASSWORD'] as $key) {
        if (!getenv($key)) {
            throw new RuntimeException('Set ' . $key . ' for dedicated test-only publisher and SELECT-only website identities.');
        }
    }
    $environment = ['APP_ENV' => 'test', 'APP_URL' => 'https://canonical.example', 'DB_HOST' => $config->dbHost,
        'DB_PORT' => (string) $config->dbPort, 'DB_NAME' => $config->dbName,
        'DB_USER' => getenv('TEST_WEB_DB_USER'), 'DB_PASSWORD' => getenv('TEST_WEB_DB_PASSWORD')];
    $publicDatabase = new Database(new Config(new Environment($environment, false)));
    $publicConfig = new Config(new Environment($environment, false));
    $app = new Application(new View($publicConfig, $root), new PostRepository($publicDatabase));
    $prefix = 'cli-test-' . bin2hex(random_bytes(6));
    $slug = $prefix . '-post';
    $other = $prefix . '-second';
    $file = tempnam(sys_get_temp_dir(), 'dunamismax-cli-config-');
    $bodyFile = tempnam(sys_get_temp_dir(), 'dunamismax-cli-body-');
    $cliEnvironment = ['POSTS_CONFIG' => $file, 'DB_USER' => 'must-not-be-used', 'DB_PASSWORD' => 'must-not-be-used'];
    $cli = static function (array $args, string $input = '', bool $succeeds = true) use ($cliEnvironment, $expect): string {
        [$code, $out, $err] = postsCommand($args, $cliEnvironment, $input);
        $expect($succeeds ? $code === 0 && $err === '' : $code !== 0 && str_starts_with($err, 'Error:'), 'CLI result unexpected for ' . $args[0] . ': ' . $err);
        return $succeeds ? $out : $err;
    };
    $show = static function (string $target) use ($cli): array {
        $post = json_decode($cli(['show', $target]), true, flags: JSON_THROW_ON_ERROR);
        unset($post['checked_at']); // A derived database clock, not a stored field.
        return $post;
    };
    $visibility = static function (bool $visible) use ($app, $slug, $expect): void {
        foreach (['/', '/blog', '/feed.xml'] as $path) {
            $response = $app->handle('GET', $path);
            $expect($response->status === 200 && str_contains($response->body, '/blog/' . $slug) === $visible, 'Visibility differs at ' . $path);
        }
        $expect($app->handle('GET', '/blog/' . $slug)->status === ($visible ? 200 : 404), 'Individual post visibility differs.');
    };
    try {
        $values = ['DB_HOST' => $config->dbHost, 'DB_PORT' => (string) $config->dbPort, 'DB_NAME' => $config->dbName,
            'DB_USER' => getenv('TEST_PUBLISH_DB_USER'), 'DB_PASSWORD' => getenv('TEST_PUBLISH_DB_PASSWORD')];
        $lines = [];
        foreach ($values as $key => $value) {
            if (strpbrk($value, "\r\n'") !== false) {
                throw new RuntimeException('Test credentials must fit single-quoted literal environment entries.');
            }
            $lines[] = $key . "='" . $value . "'";
        }
        file_put_contents($file, implode("\n", $lines) . "\n");
        chmod($file, 0600);
        file_put_contents($bodyFile, "Synthetic first paragraph.\n\n<script>literal</script> — café 🌲");

        // Prove the supplied public identity cannot write, even a no-op UPDATE.
        try {
            $publicDatabase->connection()->exec("UPDATE posts SET title = title WHERE 1 = 0");
            throw new RuntimeException('The test website account is not SELECT-only.');
        } catch (PDOException $error) {
            $expect(($error->errorInfo[1] ?? null) === 1142 || ($error->errorInfo[1] ?? null) === 1143, 'Website writes must fail because of grants.');
        }
        $writer = new Database(new Config(new Environment($values, false)));
        foreach (['DELETE FROM posts WHERE 1 = 0', 'CREATE TABLE forbidden_publisher_schema (id INT)'] as $sql) {
            try {
                $writer->connection()->exec($sql);
                throw new RuntimeException('Publisher has excess DELETE/schema privileges.');
            } catch (PDOException $error) {
                $expect(($error->errorInfo[1] ?? null) === 1142, 'Publisher must have no DELETE or schema privileges.');
            }
        }
        $expect(parseFeed($app->handle('GET', '/feed.xml')->body)->getElementsByTagName('item')->length === 0, 'A genuinely empty database must produce an empty feed.');
        $cli(['create', $slug, '--title', 'Synthetic & <title> — café 🌲', '--body-file', $bodyFile, '--excerpt', '<img src=x onerror=alert(1)> & plain text']);
        $post = $show($slug);
        $expect($post['status'] === 'draft' && $post['published_at'] === null, 'New content must default to draft without a publication date.');
        $visibility(false);
        $duplicate = $cli(['create', $slug, '--title', 'Overwrite attempt', '--body-file', '-'], 'Synthetic duplicate.', false);
        $expect(str_contains($duplicate, 'already exists') && $show($slug)['title'] === $post['title'], 'Duplicate slug must fail without overwriting.');
        $cli(['edit', $slug, '--body-file', '-'], "Changed synthetic body.\n\n<script>literal</script>");
        $edited = $show($slug);
        $expect($edited['title'] === $post['title'] && $edited['excerpt'] === $post['excerpt'] && $edited['status'] === 'draft', 'Editing must preserve unspecified fields.');
        $cli(['edit', $slug, '--title', ''], '', false);
        $cli(['edit', $slug, '--body-file', '-'], "\xFF", false);
        $cli(['edit', $slug, '--excerpt', str_repeat('é', 601)], '', false);
        $cli(['show', $prefix . '-missing'], '', false);
        $cli(['publish', $prefix . '-missing'], '', false);
        $expect($show($slug) === $edited, 'Failed edits must leave every stored field unchanged.');
        $cli(['validate', $slug, '--title', 'Unsaved synthetic revision']);
        $expect($show($slug) === $edited, 'Validate must be a read-only dry run.');

        // Publication must validate stored content too, and roll back its status/date.
        $pdo->prepare('UPDATE posts SET title = ? WHERE slug = ?')->execute(['', $slug]);
        $cli(['publish', $slug], '', false);
        $expect($show($slug)['status'] === 'draft' && $show($slug)['published_at'] === null, 'Failed publication must not partially update status or date.');
        $cli(['edit', $slug, '--title', $post['title']]);
        $now = $pdo->query('SELECT UTC_TIMESTAMP()')->fetchColumn();
        $expect(str_contains($cli(['publish', $slug]), 'Published immediately'), 'Immediate publication must be explicit.');
        $published = $show($slug);
        $expect($published['status'] === 'published' && $published['published_at'] >= $now && $published['state'] === 'published', 'Publish must use the database UTC clock.');
        $visibility(true);
        $rendered = $app->handle('GET', '/blog/' . $slug)->body;
        $expect(str_contains($rendered, '&lt;script&gt;literal&lt;/script&gt;') && !str_contains($rendered, '<script>'), 'Published post body must remain escaped.');
        $feed = parseFeed($app->handle('GET', '/feed.xml')->body);
        $guid = $feed->getElementsByTagName('guid')->item(0)->textContent;
        $expect($guid === 'https://canonical.example/blog/' . $slug, 'Feed GUID must use configured origin and stable slug.');
        $cli(['edit', $slug, '--title', 'An ordinary synthetic edit']);
        $expect($show($slug)['published_at'] === $published['published_at'], 'Ordinary public edits must not reset the date.');
        $expect(parseFeed($app->handle('GET', '/feed.xml')->body)->getElementsByTagName('guid')->item(0)->textContent === $guid, 'Ordinary edits must preserve GUID.');

        $cli(['unpublish', $slug]);
        $expect($show($slug)['published_at'] === $published['published_at'], 'Unpublish must retain the date.');
        $visibility(false);
        $cli(['schedule', $slug, '--at', '2099-10-01T09:00:00-04:00']);
        $scheduled = $show($slug);
        $expect($scheduled['published_at'] === '2099-10-01 13:00:00' && $scheduled['status'] === 'published' && $scheduled['state'] === 'scheduled', 'Scheduling must normalize UTC and derive its state.');
        $visibility(false);
        $cli(['edit', $slug, '--excerpt', '']);
        $expect($show($slug)['published_at'] === $scheduled['published_at'] && $show($slug)['state'] === 'scheduled', 'Scheduled edits must retain schedule and support clearing excerpt.');
        foreach (['2000-01-01T00:00:00Z', '2099-02-30T12:00:00Z', '2099-10-01 12:00:00'] as $badDate) {
            $cli(['schedule', $slug, '--at', $badDate], '', false);
        }
        $expect($show($slug)['published_at'] === $scheduled['published_at'], 'Invalid schedules must not change the existing schedule.');
        $cli(['unpublish', $slug]);
        $expect($show($slug)['published_at'] === $scheduled['published_at'], 'Unpublishing a schedule must retain its timestamp.');
        $cli(['publish', $slug]);
        $expect($show($slug)['published_at'] !== $scheduled['published_at'] && $show($slug)['state'] === 'published', 'Republish must explicitly replace the retained date with now.');

        // Confirm automatic eligibility at a near-future boundary, no worker.
        $near = $pdo->query('SELECT DATE_FORMAT(UTC_TIMESTAMP() + INTERVAL 3 SECOND, "%Y-%m-%dT%H:%i:%sZ")')->fetchColumn();
        $cli(['schedule', $slug, '--at', $near]);
        $visibility(false);
        $deadline = microtime(true) + 6;
        while ($pdo->query('SELECT UTC_TIMESTAMP()')->fetchColumn() < str_replace(['T', 'Z'], [' ', ''], $near) && microtime(true) < $deadline) {
            usleep(100000);
        }
        $visibility(true);
        $cli(['create', $other, '--title', 'Synthetic private companion', '--body-file', '-'], 'Synthetic body.');
        $expect(count(json_decode($cli(['list', '--limit', '1']), true)) === 1, 'CLI listing must be bounded.');
        $expect(count(json_decode($cli(['list', '--limit', '1', '--offset', '1']), true)) === 1, 'CLI listing must support pagination.');

        // Imported control characters must not corrupt the RSS document.
        $pdo->prepare('UPDATE posts SET title = ?, excerpt = ? WHERE slug = ?')->execute(["Imported & <title> 🌲\x01\u{FFFF}", '<b>literal</b> & café', $slug]);
        $feed = parseFeed($app->handle('GET', '/feed.xml')->body);
        $expect($feed->getElementsByTagName('title')->item(1)->textContent === "Imported & <title> 🌲��", 'Stored XML-illegal characters must be replaced.');
        $expect($feed->getElementsByTagName('description')->item(1)->textContent === '&lt;b&gt;literal&lt;/b&gt; &amp; café', 'Stored excerpts must be safely encoded.');
        $cli(['edit', $slug, '--title', 'Synthetic valid title']);

        $insert = $pdo->prepare("INSERT INTO posts (slug, title, body, status, published_at) VALUES (?, 'Synthetic feed bound', 'Synthetic body.', 'published', '2001-01-01 00:00:00')");
        for ($i = 0; $i < 25; $i++) {
            $insert->execute([$prefix . '-bound-' . $i]);
        }
        $feed = parseFeed($app->handle('GET', '/feed.xml')->body);
        $expect($feed->getElementsByTagName('item')->length === 20, 'RSS must stop at 20 entries.');
        $expect(str_ends_with($feed->getElementsByTagName('guid')->item(1)->textContent, '-bound-24'), 'Equal publication dates must use descending id as a stable tie-breaker.');
        $expect($feed->getElementsByTagName('item')->item(1)->getElementsByTagName('description')->length === 0, 'Absent excerpt must not produce an invented summary.');

        withHttpServer($environment, static function (string $base) use ($expect, $slug, $other): void {
            [$body, $headers] = httpRead($base . '/feed.xml');
            $expect(str_contains($headers, '200 OK') && str_contains(strtolower($headers), 'content-type: application/xml; charset=utf-8'), 'HTTP RSS must have the correct status and content type.');
            $expect(str_contains(strtolower($headers), 'cache-control: no-store') && !str_contains(strtolower($headers), 'etag:'), 'RSS must avoid stale caches/conditional responses.');
            $expect(!str_contains($body, 'untrusted.example') && str_contains($body, 'https://canonical.example/blog/' . $slug), 'Request Host must never influence canonical feed URLs.');
            parseFeed($body);
            [$headBody, $headHeaders] = httpRead($base . '/feed.xml', 'HEAD');
            $expect($headBody === '' && str_contains($headHeaders, '200 OK') && str_contains(strtolower($headHeaders), 'content-type: application/xml; charset=utf-8'), 'Actual HEAD must return feed headers with zero body.');
            [, $methodHeaders] = httpRead($base . '/feed.xml', 'POST');
            $expect(str_contains($methodHeaders, '405') && str_contains($methodHeaders, 'Allow: GET, HEAD'), 'HTTP feed must reject POST.');
            foreach (['/blog/' . $other, '/bin/posts.php', '/admin'] as $path) {
                [, $privateHeaders] = httpRead($base . $path);
                $expect(str_contains($privateHeaders, '404'), 'Private routes must not be exposed over HTTP.');
            }
        });
        $brokenEnvironment = array_replace($environment, ['APP_ENV' => 'production', 'DB_PORT' => '1']);
        withHttpServer($brokenEnvironment, static function (string $base) use ($expect): void {
            foreach (['GET', 'HEAD'] as $method) {
                [$body, $headers] = httpRead($base . '/feed.xml', $method);
                $expect(str_contains($headers, '503') && !str_contains($body, '<rss'), 'Production database failure must not masquerade as an empty feed.');
            }
        });
        printf("Passed %d MySQL publishing/RSS/HTTP checks with separate publisher and SELECT-only website accounts.\n", $checks);
    } finally {
        // Subprocess commits are outside any parent transaction. Delete only this
        // run's random-prefixed fixtures, even after failure. Never truncate.
        $pdo->prepare('DELETE FROM posts WHERE slug LIKE ?')->execute([$prefix . '-%']);
        unlink($file);
        unlink($bodyFile);
    }
}
