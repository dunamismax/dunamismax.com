<?php

declare(strict_types=1);

function e(string|int $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** Plain text becomes escaped paragraphs; HTML and Markdown stay literal. */
function paragraphs(string $text): string
{
    $parts = preg_split('/\R\s*\R/u', trim($text)) ?: [];
    return implode("\n", array_map(
        static fn (string $part): string => '<p>' . nl2br(e($part), false) . '</p>',
        $parts,
    ));
}

function reading_minutes(string $text): int
{
    $words = preg_match_all('/[\p{L}\p{N}]+/u', $text);
    return max(1, (int) ceil(($words ?: 0) / 220));
}

function short_date(string $datetime): string
{
    return (new DateTimeImmutable($datetime))->format('M j, Y');
}

function nav_link(string $href, string $label, string $current): string
{
    $active = $href === $current;
    return '<a href="' . e($href) . '"' . ($active ? ' class="is-current" aria-current="page"' : '')
        . '>' . e($label) . '</a>';
}
