<?php

declare(strict_types=1);

use Dunamismax\Config;
use Dunamismax\Database;
use Dunamismax\Environment;

require dirname(__DIR__) . '/bootstrap.php';

try {
    $config = new Config(Environment::fromFile(dirname(__DIR__) . '/.env'));
    $database = new Database($config);
    $sql = file_get_contents(dirname(__DIR__) . '/database/schema.sql');
    if ($sql === false) {
        throw new RuntimeException('Cannot read baseline schema.');
    }
    $database->connection()->exec($sql);
    fwrite(STDOUT, "Baseline schema ready. No content was inserted.\n");
} catch (Throwable $error) {
    fwrite(STDERR, $error->getMessage() . "\n");
    exit(1);
}
