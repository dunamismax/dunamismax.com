<?php

declare(strict_types=1);

namespace Dunamismax\Publishing;

use Dunamismax\Config;
use Dunamismax\Environment;
use RuntimeException;

final class PublishingConfig
{
    public static function load(string $root): Config
    {
        $path = getenv('POSTS_CONFIG') ?: '/etc/dunamismax/publishing.env';
        $resolved = realpath($path);
        if ($resolved === false || !is_file($resolved) || !is_readable($resolved)) {
            throw new RuntimeException('Publishing configuration is missing or unreadable. Set POSTS_CONFIG to a protected absolute file path; see docs/content.md.');
        }
        if (!str_starts_with($path, '/') || str_starts_with($resolved, realpath($root) . '/')) {
            throw new RuntimeException('Publishing configuration must be outside the checkout and web root, at an absolute path.');
        }
        $stat = stat($resolved);
        if ($stat === false || ($stat['mode'] & 0777) !== 0600
            || !function_exists('posix_geteuid') || $stat['uid'] !== posix_geteuid()) {
            throw new RuntimeException('Publishing configuration must be mode 0600 and owned by the current shell user. PHP POSIX is required.');
        }
        // The selected file is the sole source of DB settings. Never read .env,
        // nor inherit a website/admin identity from process DB_* variables.
        $env = Environment::fromFile($resolved, false);
        foreach (['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'] as $key) {
            if ($env->get($key) === '') {
                throw new RuntimeException('Publishing configuration requires ' . $key . '. No website configuration fallback is allowed.');
            }
        }
        return new Config($env);
    }
}
