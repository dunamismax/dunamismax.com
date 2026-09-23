<?php

declare(strict_types=1);

namespace Dunamismax\Repositories;

use Dunamismax\Database;
use PDO;

final readonly class PostRepository
{
    // The same visibility rule governs lists, counts, individual posts, and RSS.
    private const VISIBLE = "status = 'published' AND published_at <= UTC_TIMESTAMP()";

    public function __construct(private Database $database)
    {
    }

    public function latest(int $limit = 10, int $offset = 0): array
    {
        if (!$this->database->isConfigured()) {
            return [];
        }
        $query = $this->database->connection()->prepare(
            'SELECT slug, title, excerpt, body, published_at FROM posts WHERE ' . self::VISIBLE
            . ' ORDER BY published_at DESC, id DESC LIMIT :limit OFFSET :offset',
        );
        $query->bindValue('limit', max(1, min(50, $limit)), PDO::PARAM_INT);
        $query->bindValue('offset', max(0, $offset), PDO::PARAM_INT);
        $query->execute();
        return $query->fetchAll();
    }

    public function countPublished(): int
    {
        if (!$this->database->isConfigured()) {
            return 0;
        }
        return (int) $this->database->connection()->query(
            'SELECT COUNT(*) FROM posts WHERE ' . self::VISIBLE,
        )->fetchColumn();
    }

    public function findPublished(string $slug): ?array
    {
        if (!$this->database->isConfigured()) {
            return null;
        }
        $query = $this->database->connection()->prepare(
            'SELECT slug, title, excerpt, body, published_at FROM posts WHERE slug = :slug AND '
            . self::VISIBLE . ' LIMIT 1',
        );
        $query->execute(['slug' => $slug]);
        $post = $query->fetch();
        return $post === false ? null : $post;
    }
}
