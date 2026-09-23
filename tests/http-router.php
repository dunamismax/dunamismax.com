<?php

declare(strict_types=1);

// Test-only router for PHP's built-in server. proc_open() silently drops
// environment variables whose value is empty, so a test cannot pass
// DB_NAME='' to the server; the front controller would then fall back to the
// checkout's real .env (in a release, production). Restore each name listed
// in TEST_EMPTY_ENV as an explicitly empty value, which takes precedence.
foreach (array_filter(explode(',', getenv('TEST_EMPTY_ENV') ?: '')) as $key) {
    putenv($key . '=');
}

return require dirname(__DIR__) . '/dev/router.php';
