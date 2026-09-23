<?php

declare(strict_types=1);

// Defense in depth: this file is outside the only web root, public/.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

ini_set('display_errors', '0');
ini_set('log_errors', '0');
require dirname(__DIR__) . '/bootstrap.php';

try {
    Dunamismax\Publishing\PostsCommand::run(array_slice($argv, 1), dirname(__DIR__));
} catch (PDOException $error) {
    // Never print driver messages: they can contain post text or credentials.
    $message = ($error->errorInfo[1] ?? null) === 1062
        ? 'That slug already exists. Inspect it with show or choose a different slug; nothing was overwritten.'
        : 'Database operation failed. Check the protected publishing configuration, server availability, schema, and SELECT/INSERT/UPDATE grants. No partial changes were saved.';
    fwrite(STDERR, 'Error: ' . $message . "\n");
    exit(1);
} catch (RuntimeException $error) {
    fwrite(STDERR, 'Error: ' . $error->getMessage() . "\n");
    exit(1);
} catch (Throwable) {
    fwrite(STDERR, "Error: Publishing failed unexpectedly. Check the PHP runtime and input; no partial changes were saved.\n");
    exit(1);
}
