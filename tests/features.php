<?php

declare(strict_types=1);

use Dunamismax\Config;
use Dunamismax\Environment;
use Dunamismax\Publishing\PostValidator;
use Dunamismax\Publishing\PublishingConfig;
use Dunamismax\RssFeed;

require_once __DIR__ . '/support.php';

$post = ['slug' => 'synthetic-test', 'title' => 'Synthetic title', 'excerpt' => '', 'body' => 'Synthetic body.', 'status' => 'draft', 'published_at' => null];
PostValidator::post($post);
expect(PostValidator::timestamp('2099-10-01T09:00:00-04:00') === '2099-10-01 13:00:00', 'Offset timestamps must normalize to UTC.');
expect(PostValidator::timestamp('2099-10-01T09:00:00+14:00') === '2099-09-30 19:00:00', 'UTC conversion must handle date boundaries.');
foreach (['tomorrow', '2099-01-01 10:00:00', '2099-01-01T10:00:00', '2099-02-29T00:00:00Z', '2099-04-31T00:00:00Z', '2099-01-01T24:00:00Z', '2099-01-01T00:00:60Z', '2099-01-01T00:00:00-00:00', '2099-01-01T00:00:00+14:01', '1000-01-01T00:00:00+01:00', '9999-12-31T23:59:59-01:00'] as $value) {
    rejects(fn () => PostValidator::timestamp($value), 'Ambiguous/invalid/out-of-range date must fail: ' . $value);
}
foreach ([['title', ''], ['body', " \n\t\u{00A0}"], ['slug', 'Upper'], ['slug', 'a--b'], ['slug', str_repeat('a', 181)], ['title', str_repeat('é', 241)], ['excerpt', str_repeat('🌲', 601)], ['body', str_repeat('x', PostValidator::BODY_BYTES + 1)], ['title', "\xFF"], ['body', "x\0"], ['body', "x\u{FFFF}"], ['status', 'scheduled'], ['status', 'published'], ['published_at', '2026-02-30 12:00:00']] as [$key, $value]) {
    rejects(fn () => PostValidator::post(array_replace($post, [$key => $value])), 'Invalid ' . $key . ' must fail.');
}
PostValidator::post(array_replace($post, ['title' => str_repeat('é', 240), 'excerpt' => str_repeat('🌲', 600)]));
expect(true, 'Schema character limits must count Unicode characters rather than bytes.');

[$code, $out, $err] = postsCommand(['--help'], ['POSTS_CONFIG' => '/missing-publishing-config']);
expect($code === 0 && str_contains($out, 'schedule') && str_contains($out, '/etc/dunamismax/publishing.env') && $err === '', 'Help must work without configuration or MySQL.');
foreach ([['no-such-command'], ['edit', 'synthetic'], ['schedule', 'synthetic', '--at', 'tomorrow'], ['create', 'synthetic', '--title', 'X'], ['create', 'synthetic', '--title', 'X', '--body-file', '-', '--kind', 'essay'], ['edit', 'synthetic', '--status', 'published'], ['edit', 'synthetic', '--slug', 'renamed'], ['list', '--limit', '0'], ['list', '--limit', '1', '--limit', '2']] as $arguments) {
    [$code, $out, $err] = postsCommand($arguments);
    expect($code !== 0 && str_starts_with($err, 'Error:'), 'Invalid CLI invocation must fail clearly: ' . implode(' ', $arguments));
}
[$code, $out, $err] = postsCommand(['list'], ['POSTS_CONFIG' => '/missing-config', 'DB_NAME' => 'unused', 'DB_USER' => 'wrong-user', 'DB_PASSWORD' => 'secret-sentinel']);
expect($code !== 0 && str_contains($err, 'configuration') && !str_contains($err, 'secret-sentinel'), 'Missing config must not fall back or expose credentials.');
$configFile = tempnam(sys_get_temp_dir(), 'dunamismax-publishing-unit-');
try {
    file_put_contents($configFile, "DB_HOST=127.0.0.1\nDB_PORT=3306\nDB_NAME=isolated_test\nDB_USER=writer\nDB_PASSWORD=synthetic-sentinel\n");
    chmod($configFile, 0600);
    putenv('POSTS_CONFIG=' . $configFile);
    putenv('DB_USER=unexpected-admin');
    $publishingConfig = PublishingConfig::load(dirname(__DIR__));
    expect($publishingConfig->dbUser === 'writer', 'Publishing settings must ignore inherited web/admin DB settings.');
    chmod($configFile, 0640);
    clearstatcache();
    rejects(fn () => PublishingConfig::load(dirname(__DIR__)), 'Group-readable publishing credentials must fail closed.');
    chmod($configFile, 0600);
    file_put_contents($configFile, "DB_HOST=127.0.0.1\n");
    clearstatcache();
    rejects(fn () => PublishingConfig::load(dirname(__DIR__)), 'Incomplete publishing configuration must fail.');
} finally {
    unlink($configFile);
    putenv('POSTS_CONFIG');
    putenv('DB_USER');
}

$rssConfig = new Config(new Environment(['APP_ENV' => 'test', 'APP_URL' => 'http://localhost:8000'], false));
$synthetic = ['slug' => 'synthetic-rss', 'title' => "A & <B> — café 🌲\x01\u{FFFF}\xFF", 'excerpt' => '<img src=x onerror=alert(1)> & café', 'body' => "First <b>para</b>.\n\nSecond.", 'published_at' => '2026-01-02 03:04:05'];
$xml = parseFeed((new RssFeed($rssConfig))->response([$synthetic])->body);
expect($xml->getElementsByTagName('title')->item(1)->textContent === "A & <B> — café 🌲���", 'Invalid XML characters and UTF-8 must be deliberately substituted.');
expect($xml->getElementsByTagName('description')->item(1)->textContent === '&lt;img src=x onerror=alert(1)&gt; &amp; café', 'RSS description must preserve literal markup even in HTML-capable readers.');
expect($xml->getElementsByTagNameNS('http://purl.org/rss/1.0/modules/content/', 'encoded')->item(0)->textContent === "<p>First &lt;b&gt;para&lt;/b&gt;.</p>\n<p>Second.</p>", 'Full content must be the same escaped paragraphs as the post page.');
expect($xml->getElementsByTagName('guid')->item(0)->textContent === 'http://localhost:8000/blog/synthetic-rss', 'GUID must be the configured canonical permalink.');
expect($xml->getElementsByTagName('pubDate')->item(0)->textContent === 'Fri, 02 Jan 2026 03:04:05 +0000', 'RSS date must include weekday and UTC offset.');
expect($xml->getElementsByTagName('lastBuildDate')->item(0)->textContent === 'Fri, 02 Jan 2026 03:04:05 +0000', 'lastBuildDate follows the newest post.');
