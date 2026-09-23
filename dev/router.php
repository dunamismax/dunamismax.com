<?php

declare(strict_types=1);

// Router for PHP's local development server. Production uses Caddy + PHP-FPM,
// which serves exactly these two files directly and sends everything else to PHP.
$path = rawurldecode(explode('?', $_SERVER['REQUEST_URI'] ?? '/', 2)[0]);
if ($path === '/css/site.css' || $path === '/icon.svg') {
    return false;
}

require dirname(__DIR__) . '/public/index.php';
