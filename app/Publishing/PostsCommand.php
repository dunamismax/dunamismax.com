<?php

declare(strict_types=1);

namespace Dunamismax\Publishing;

use Dunamismax\Database;
use RuntimeException;

final class PostsCommand
{
    public const HELP = <<<'HELP'
dunamismax.com — blog publishing through an authorized local shell or SSH

Usage: php bin/posts.php <command> [SLUG] [options]

  create SLUG --title TEXT --body-file FILE [--excerpt TEXT]
  edit SLUG [--title TEXT] [--body-file FILE] [--excerpt TEXT]
  list [--limit 50] [--offset 0]      Newest created first; JSON output
  show SLUG                         Inspect all fields as JSON (dates UTC)
  validate SLUG [edit options]       Validate the complete result, without writes
  publish SLUG                      Publish now; explicitly set a new UTC date
  schedule SLUG --at TIMESTAMP       Publish when this future instant arrives
  unpublish SLUG                     Return to draft; retain the publication date
  --help                            Show this help without configuration or MySQL

FILE is a UTF-8 plain-text file; use --body-file - to read stdin.
Blank lines separate paragraphs. HTML and Markdown remain literal text.
TIMESTAMP: YYYY-MM-DDTHH:MM:SSZ or YYYY-MM-DDTHH:MM:SS±HH:MM.
Example future format: 2099-10-01T09:00:00-04:00 (choose your intended date).
Edits preserve unspecified fields, status and date; slugs cannot be edited.
New posts are drafts. Only publish and schedule can change them to published.

Configuration: POSTS_CONFIG selects an absolute 0600 file owned by the shell
user outside the checkout; default /etc/dunamismax/publishing.env.
DB_* values come only from that file, never .env or the process environment.
See docs/content.md and docs/production.md for credentials and the full workflow.
HELP;

    public static function run(array $args, string $root): void
    {
        if ($args === [] || $args === ['help'] || in_array('--help', $args, true)) {
            fwrite(STDOUT, self::HELP . "\n");
            return;
        }
        $command = array_shift($args);
        $allowed = match ($command) {
            'create', 'edit', 'validate' => ['title', 'excerpt', 'body-file'],
            'list' => ['limit', 'offset'],
            'schedule' => ['at'],
            'show', 'publish', 'unpublish' => [],
            default => throw new RuntimeException('Unknown command. Run php bin/posts.php --help.'),
        };
        $slug = $command === 'list' ? null : array_shift($args);
        if ($command !== 'list') {
            if ($slug === null) {
                throw new RuntimeException('This command requires a post slug. See --help.');
            }
            PostValidator::slug($slug);
        }
        $options = [];
        while ($args !== []) {
            $option = array_shift($args);
            $name = substr($option, 2);
            if (!str_starts_with($option, '--') || !in_array($name, $allowed, true) || array_key_exists($name, $options)) {
                throw new RuntimeException('Unknown or repeated option. Use the options shown by --help (separate option and value with a space).');
            }
            $value = array_shift($args);
            if ($value === null || str_starts_with($value, '--')) {
                throw new RuntimeException('Missing value for --' . $name . '.');
            }
            $options[$name] = $value;
        }
        if ($command === 'create' && (!isset($options['title']) || !isset($options['body-file']))) {
            throw new RuntimeException('Creating a draft requires --title and --body-file.');
        }
        if ($command === 'edit' && $options === []) {
            throw new RuntimeException('Specify at least one field to edit. See --help.');
        }
        if ($command === 'schedule') {
            PostValidator::timestamp($options['at'] ?? '');
        }
        $limit = self::integer($options['limit'] ?? '50', 1, 500, 'limit');
        $offset = self::integer($options['offset'] ?? '0', 0, 2147483647, 'offset');
        $fields = array_intersect_key($options, array_flip(['title', 'excerpt']));
        if (isset($options['body-file'])) {
            $source = $options['body-file'];
            if ($source !== '-' && (!is_file($source) || !is_readable($source))) {
                throw new RuntimeException('Body file must be a readable local file, or - for stdin.');
            }
            $body = @file_get_contents($source === '-' ? 'php://stdin' : $source, false, null, 0, PostValidator::BODY_BYTES + 1);
            if ($body === false) {
                throw new RuntimeException('Could not read the body file or stdin.');
            }
            $fields['body'] = $body;
        }
        $publisher = new PostPublisher((new Database(PublishingConfig::load($root)))->connection());
        if ($command === 'list' || $command === 'show') {
            $data = $command === 'list' ? $publisher->listing($limit, $offset) : $publisher->find($slug);
            // JSON also prevents stored terminal escape sequences from executing.
            fwrite(STDOUT, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR) . "\n");
            return;
        }
        if ($command === 'validate') {
            $publisher->validate($slug, $fields);
            fwrite(STDOUT, "Valid: {$slug}. No changes saved.\n");
            return;
        }
        $post = $command === 'create' ? $publisher->create($slug, $fields)
            : $publisher->change($command, $slug, $fields, $options['at'] ?? null);
        $message = match ($command) {
            'create' => 'Draft created',
            'edit' => 'Post edited; publication status and date preserved',
            'publish' => 'Published immediately at ' . $post['published_at'] . ' UTC',
            'schedule' => 'Scheduled for ' . $post['published_at'] . ' UTC; private until then',
            'unpublish' => 'Unpublished to draft; retained publication date: ' . ($post['published_at'] ?? 'none') . ($post['published_at'] === null ? '' : ' UTC'),
        };
        fwrite(STDOUT, $message . ': ' . $slug . ".\n");
    }

    private static function integer(string $value, int $min, int $max, string $name): int
    {
        $number = filter_var($value, FILTER_VALIDATE_INT, ['options' => ['min_range' => $min, 'max_range' => $max]]);
        if ($number === false) {
            throw new RuntimeException('--' . $name . ' must be an integer from ' . $min . ' to ' . $max . '.');
        }
        return $number;
    }
}
