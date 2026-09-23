<?php

declare(strict_types=1);

namespace Dunamismax;

use RuntimeException;

final readonly class Config
{
    public string $environment;
    public string $url;
    public string $dbHost;
    public int $dbPort;
    public string $dbName;
    public string $dbUser;
    public string $dbPassword;

    public function __construct(Environment $env)
    {
        $this->environment = $env->get('APP_ENV', 'production');
        if (!in_array($this->environment, ['local', 'test', 'production'], true)) {
            throw new RuntimeException('APP_ENV must be local, test, or production.');
        }

        $this->url = rtrim($env->get('APP_URL', 'https://dunamismax.com'), '/');
        $parts = parse_url($this->url);
        if ($parts === false || !isset($parts['host'])
            || !in_array($parts['scheme'] ?? '', ['http', 'https'], true)
            || isset($parts['user']) || isset($parts['pass'])
            || isset($parts['query']) || isset($parts['fragment'])
            || ($parts['path'] ?? '') !== ''
            || filter_var($this->url, FILTER_VALIDATE_URL) === false
        ) {
            throw new RuntimeException('APP_URL must be an absolute origin URL without a path.');
        }

        $this->dbHost = $env->get('DB_HOST', '127.0.0.1');
        $port = filter_var($env->get('DB_PORT', '3306'), FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1, 'max_range' => 65535],
        ]);
        if ($port === false || !preg_match('/^[a-zA-Z0-9.:-]+$/', $this->dbHost)) {
            throw new RuntimeException('Invalid database host or port.');
        }
        $this->dbPort = $port;
        $this->dbName = $env->get('DB_NAME');
        $this->dbUser = $env->get('DB_USER', 'dunamismax_web');
        $this->dbPassword = $env->get('DB_PASSWORD');

        if ($this->dbName !== '' && !preg_match('/^[a-zA-Z0-9_]+$/', $this->dbName)) {
            throw new RuntimeException('DB_NAME may contain only letters, numbers, and underscores.');
        }
        if ($this->isProduction() && ($parts['scheme'] !== 'https' || !$this->hasDatabase())) {
            throw new RuntimeException('Production requires HTTPS APP_URL and a configured database.');
        }
    }

    public function isProduction(): bool
    {
        return $this->environment === 'production';
    }

    public function hasDatabase(): bool
    {
        return $this->dbName !== '';
    }
}
