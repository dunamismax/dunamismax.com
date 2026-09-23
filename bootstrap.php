<?php

declare(strict_types=1);

// No vendor tree: this application owns its small Dunamismax namespace.
spl_autoload_register(static function (string $class): void {
    $prefix = 'Dunamismax\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }

    $file = __DIR__ . '/app/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
    if (is_file($file)) {
        require $file;
    }
});

require_once __DIR__ . '/app/helpers.php';
date_default_timezone_set('UTC');
