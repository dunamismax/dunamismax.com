<?php

declare(strict_types=1);

namespace Dunamismax\Publishing;

use DateTimeImmutable;
use DateTimeZone;
use RuntimeException;

final class PostValidator
{
    public const BODY_BYTES = 16777215; // MySQL MEDIUMTEXT capacity in bytes.

    public static function slug(string $slug): void
    {
        if (strlen($slug) > 180 || preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D', $slug) !== 1) {
            throw new RuntimeException('Slug must be 1–180 lowercase ASCII letters/digits separated by single hyphens.');
        }
    }

    public static function post(array $post): void
    {
        self::slug($post['slug']);
        foreach (['title' => 240, 'excerpt' => 600, 'body' => null] as $field => $limit) {
            $value = $post[$field];
            if (preg_match('//u', $value) !== 1) {
                throw new RuntimeException(ucfirst($field) . ' must be valid UTF-8.');
            }
            if ($field !== 'excerpt' && preg_match('/[^\s\p{Z}]/u', $value) !== 1) {
                throw new RuntimeException(ucfirst($field) . ' is required and cannot be blank.');
            }
            // Reject invisible controls at authoring time; the feed also safely
            // replaces XML-illegal characters in older/imported records.
            if (preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\x{FFFE}\x{FFFF}]/u', $value)) {
                throw new RuntimeException(ucfirst($field) . ' contains unsupported control characters.');
            }
            if ($limit !== null && preg_match_all('/./us', $value) > $limit) {
                throw new RuntimeException(ucfirst($field) . ' exceeds ' . $limit . ' Unicode characters.');
            }
        }
        if (strlen($post['body']) > self::BODY_BYTES) {
            throw new RuntimeException('Body exceeds the MEDIUMTEXT limit of 16777215 UTF-8 bytes.');
        }
        if (!in_array($post['status'], ['draft', 'published'], true)) {
            throw new RuntimeException('Status must be draft or published.');
        }
        if ($post['published_at'] !== null) {
            self::storedTime($post['published_at']);
        } elseif ($post['status'] === 'published') {
            throw new RuntimeException('A published post requires a publication timestamp.');
        }
    }

    public static function timestamp(string $input): string
    {
        if (!preg_match('/^[1-9][0-9]{3}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(Z|[+-](?:0[0-9]|1[0-3]):[0-5][0-9]|[+-]14:00)$/D', $input)
            || str_ends_with($input, '-00:00')) {
            throw new RuntimeException('Use YYYY-MM-DDTHH:MM:SSZ or YYYY-MM-DDTHH:MM:SS±HH:MM with a known UTC offset (up to ±14:00).');
        }
        $normalized = str_ends_with($input, 'Z') ? substr($input, 0, -1) . '+00:00' : $input;
        $date = DateTimeImmutable::createFromFormat('!Y-m-d\TH:i:sP', $normalized);
        if ($date === false || $date->format('Y-m-d\TH:i:sP') !== $normalized) {
            throw new RuntimeException('Invalid publication date or time; check the calendar date and clock time.');
        }
        $utc = $date->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');
        self::storedTime($utc);
        return $utc;
    }

    private static function storedTime(string $value): void
    {
        $date = DateTimeImmutable::createFromFormat('!Y-m-d H:i:s', $value, new DateTimeZone('UTC'));
        if (!preg_match('/^[1-9][0-9]{3}-/', $value) || $date === false || $date->format('Y-m-d H:i:s') !== $value) {
            throw new RuntimeException('Publication time must be a valid UTC MySQL DATETIME between years 1000 and 9999.');
        }
    }
}
