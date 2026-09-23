<?php

declare(strict_types=1);

namespace Dunamismax;

use PDO;
use RuntimeException;

final class Database
{
    private ?PDO $connection = null;

    public function __construct(private readonly Config $config)
    {
    }

    public function isConfigured(): bool
    {
        return $this->config->hasDatabase();
    }

    public function connection(): PDO
    {
        if (!$this->isConfigured()) {
            throw new RuntimeException('Configure DB_NAME before using the database.');
        }
        if ($this->connection === null) {
            $this->connection = new PDO(
                sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
                    $this->config->dbHost, $this->config->dbPort, $this->config->dbName),
                $this->config->dbUser,
                $this->config->dbPassword,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::ATTR_TIMEOUT => 5,
                ],
            );
            $this->connection->exec("SET time_zone = '+00:00'");
        }

        return $this->connection;
    }
}
