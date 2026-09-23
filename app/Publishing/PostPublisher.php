<?php

declare(strict_types=1);

namespace Dunamismax\Publishing;

use PDO;
use RuntimeException;
use Throwable;

final readonly class PostPublisher
{
    public function __construct(private PDO $pdo)
    {
    }

    public function create(string $slug, array $fields): array
    {
        self::fields($fields);
        $post = $fields + ['slug' => $slug, 'title' => '', 'excerpt' => '', 'body' => '', 'status' => 'draft', 'published_at' => null];
        PostValidator::post($post);
        $query = $this->pdo->prepare('INSERT INTO posts (slug, title, excerpt, body, status, published_at) VALUES (:slug, :title, :excerpt, :body, :status, :published_at)');
        $query->execute($post);
        return $post;
    }

    public function find(string $slug, bool $lock = false): array
    {
        PostValidator::slug($slug);
        $query = $this->pdo->prepare('SELECT *, UTC_TIMESTAMP() AS checked_at FROM posts WHERE slug = ?' . ($lock ? ' FOR UPDATE' : ''));
        $query->execute([$slug]);
        $post = $query->fetch();
        if ($post === false) {
            throw new RuntimeException('Post not found. Use list to inspect available slugs.');
        }
        $post['state'] = $post['status'] === 'published' && $post['published_at'] > $post['checked_at'] ? 'scheduled' : $post['status'];
        return $post;
    }

    public function listing(int $limit, int $offset): array
    {
        $query = $this->pdo->prepare("SELECT slug, title, status, published_at, CASE WHEN status = 'published' AND published_at > UTC_TIMESTAMP() THEN 'scheduled' ELSE status END AS state FROM posts ORDER BY id DESC LIMIT ? OFFSET ?");
        $query->bindValue(1, $limit, PDO::PARAM_INT);
        $query->bindValue(2, $offset, PDO::PARAM_INT);
        $query->execute();
        return $query->fetchAll();
    }

    public function validate(string $slug, array $fields): void
    {
        self::fields($fields);
        PostValidator::post(array_replace($this->find($slug), $fields));
    }

    public function change(string $command, string $slug, array $fields = [], ?string $at = null): array
    {
        self::fields($fields);
        $this->pdo->beginTransaction();
        try {
            $post = array_replace($this->find($slug, true), $fields);
            if ($command === 'publish' || $command === 'schedule') {
                $now = $this->pdo->query('SELECT UTC_TIMESTAMP()')->fetchColumn();
                $post['status'] = 'published';
                $post['published_at'] = $command === 'publish' ? $now : PostValidator::timestamp($at ?? '');
                if ($command === 'schedule' && $post['published_at'] <= $now) {
                    throw new RuntimeException('Scheduled publication must be in the future relative to the database UTC clock. Use publish for immediate publication.');
                }
            } elseif ($command === 'unpublish') {
                $post['status'] = 'draft'; // Retain date as editorial history.
            } elseif ($command !== 'edit') {
                throw new RuntimeException('Unsupported publishing operation.');
            }
            // Validate every resulting field, including unchanged stored content.
            PostValidator::post($post);
            $values = array_intersect_key($post, array_flip(['slug', 'title', 'excerpt', 'body', 'status', 'published_at']));
            $query = $this->pdo->prepare('UPDATE posts SET title = :title, excerpt = :excerpt, body = :body, status = :status, published_at = :published_at WHERE slug = :slug');
            $query->execute($values);
            $this->pdo->commit();
            return $post;
        } catch (Throwable $error) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $error;
        }
    }

    private static function fields(array $fields): void
    {
        foreach ($fields as $name => $value) {
            if (!in_array($name, ['title', 'excerpt', 'body'], true) || !is_string($value)) {
                throw new RuntimeException('Only title, excerpt and body may be edited; use explicit publication commands for status and dates.');
            }
        }
    }
}
