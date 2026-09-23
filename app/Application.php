<?php

declare(strict_types=1);

namespace Dunamismax;

use Dunamismax\Http\Response;
use Dunamismax\Repositories\PostRepository;
use PDOException;
use Throwable;

final readonly class Application
{
    public const DESCRIPTION = 'Web work by Stephen Sawyer in PHP and MySQL, Python scripting, and hands-on systems administration.';
    private const PER_PAGE = 10;
    private const SHORT_CACHE = 'public, max-age=300, must-revalidate';

    public function __construct(private View $view, private PostRepository $posts)
    {
    }

    public function handle(string $method, string $uri, array $query = []): Response
    {
        try {
            if (!in_array($method, ['GET', 'HEAD'], true)) {
                return $this->view->page('error', [
                    'title' => 'Method not allowed', 'code' => 405,
                    'heading' => 'This page is for reading.',
                    'message' => 'The site accepts GET and HEAD requests only.',
                ], 405, ['Allow' => 'GET, HEAD']);
            }

            // Read only the path. Do not derive canonical URLs from Host or proxy headers.
            $path = explode('?', $uri, 2)[0];
            return match ($path) {
                '/' => $this->home(),
                '/about' => $this->view->page('about', [
                    'title' => 'About', 'path' => $path,
                    'description' => 'Stephen Sawyer: PHP-first web developer, Python scripter, and sysadmin. Working style, stack priorities, and operating habits.',
                ]),
                '/contact' => $this->view->page('contact', [
                    'title' => 'Contact', 'path' => $path,
                    'description' => 'How to reach Stephen Sawyer by email, Signal, GitHub, Codeberg, or public source.',
                ]),
                '/projects' => $this->view->page('projects', [
                    'title' => 'Projects', 'path' => $path,
                    'description' => 'Python automation, self-hosted operations tooling, and this PHP site by Stephen Sawyer.',
                ]),
                '/blog' => $this->blog($query),
                '/feed.xml' => $this->view->feed($this->posts->latest(20)),
                '/robots.txt' => new Response("User-agent: *\nAllow: /\n", 200, [
                    'Content-Type' => 'text/plain; charset=utf-8', 'Cache-Control' => self::SHORT_CACHE,
                ]),
                '/manifest.webmanifest' => new Response($this->manifest(), 200, [
                    'Content-Type' => 'application/manifest+json', 'Cache-Control' => self::SHORT_CACHE,
                ]),
                '/healthz' => new Response('{"status":"ok"}', 200, [
                    'Content-Type' => 'application/json', 'X-Robots-Tag' => 'noindex',
                ]),
                default => $this->post($path),
            };
        } catch (PDOException $error) {
            error_log((string) $error);
            return $this->view->page('error', [
                'title' => 'Temporarily unavailable', 'code' => 503,
                'heading' => 'A moment, please.',
                'message' => 'Writing is briefly unavailable. Please try again in a little while.',
            ], 503, ['Retry-After' => '60']);
        } catch (Throwable $error) {
            error_log((string) $error);
            return $this->view->page('error', [
                'title' => 'Server error', 'code' => 500,
                'heading' => 'Something went wrong.',
                'message' => 'Please try again shortly.',
            ], 500);
        }
    }

    private function home(): Response
    {
        // The home page must stay up when MySQL is briefly unavailable, without
        // pretending the blog is empty: the view shows a neutral blog link instead.
        try {
            $latest = $this->posts->latest(1)[0] ?? null;
            $postCount = $this->posts->countPublished();
        } catch (PDOException $error) {
            error_log((string) $error);
            $latest = null;
            $postCount = null;
        }
        return $this->view->page('home', ['latest' => $latest, 'postCount' => $postCount]);
    }

    private function blog(array $query): Response
    {
        $page = filter_var($query['page'] ?? '1', FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1, 'max_range' => 100000],
        ]);
        if ($page === false) {
            return $this->notFound();
        }
        $pages = max(1, (int) ceil($this->posts->countPublished() / self::PER_PAGE));
        if ($page > $pages) {
            return $this->notFound();
        }
        return $this->view->page('blog', [
            'title' => 'Blog', 'path' => '/blog' . ($page > 1 ? '?page=' . $page : ''),
            'description' => 'Build logs, design notes, and server notes from Stephen Sawyer.',
            'posts' => $this->posts->latest(self::PER_PAGE, ($page - 1) * self::PER_PAGE),
            'page' => $page, 'pages' => $pages,
        ]);
    }

    private function post(string $path): Response
    {
        if (preg_match('#^/blog/([a-z0-9]+(?:-[a-z0-9]+)*)$#D', $path, $matches)) {
            $post = $this->posts->findPublished($matches[1]);
            if ($post !== null) {
                return $this->view->page('post', [
                    'title' => $post['title'], 'description' => $post['excerpt'] ?: self::DESCRIPTION,
                    'path' => $path, 'post' => $post, 'ogType' => 'article',
                ]);
            }
        }
        return $this->notFound();
    }

    private function notFound(): Response
    {
        return $this->view->page('error', [
            'title' => 'Not found', 'code' => 404,
            'heading' => 'That page is not here.',
            'message' => 'The address may have moved, or never existed. Try the home page, the project list, or the blog.',
        ], 404);
    }

    private function manifest(): string
    {
        return json_encode([
            'name' => 'dunamismax',
            'short_name' => 'dunamismax',
            'icons' => [
                ['src' => '/icon.svg', 'type' => 'image/svg+xml', 'sizes' => '512x512'],
                ['src' => '/icon.svg', 'type' => 'image/svg+xml', 'sizes' => '512x512', 'purpose' => 'maskable'],
            ],
            'start_url' => '/',
            'display' => 'standalone',
            'scope' => '/',
            'description' => self::DESCRIPTION,
            'theme_color' => '#0d1117',
            'background_color' => '#0d1117',
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . "\n";
    }
}
