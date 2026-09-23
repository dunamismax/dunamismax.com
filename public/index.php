<?php

declare(strict_types=1);

use Dunamismax\Application;
use Dunamismax\Config;
use Dunamismax\Database;
use Dunamismax\Environment;
use Dunamismax\Http\Response;
use Dunamismax\Repositories\PostRepository;
use Dunamismax\View;

// Keep internal details in server logs, including failures during bootstrap.
ini_set('display_errors', '0');
ini_set('log_errors', '1');
require dirname(__DIR__) . '/bootstrap.php';

try {
    $root = dirname(__DIR__);
    $config = new Config(Environment::fromFile($root . '/.env'));
    $app = new Application(new View($config, $root), new PostRepository(new Database($config)));
    $response = $app->handle($_SERVER['REQUEST_METHOD'] ?? 'GET', $_SERVER['REQUEST_URI'] ?? '/', $_GET);
} catch (Throwable $error) {
    error_log((string) $error);
    $response = new Response('dunamismax.com is temporarily unavailable. Please try again shortly.', 503, [
        'Content-Type' => 'text/plain; charset=utf-8', 'Retry-After' => '60', 'X-Robots-Tag' => 'noindex',
    ]);
}

$response->send(($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'HEAD');
