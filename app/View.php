<?php

declare(strict_types=1);

namespace Dunamismax;

use Dunamismax\Http\Response;
use Throwable;

final readonly class View
{
    public function __construct(private Config $config, private string $root)
    {
    }

    public function feed(array $posts): Response
    {
        return (new RssFeed($this->config))->response($posts);
    }

    public function page(string $template, array $data = [], int $status = 200, array $headers = []): Response
    {
        // Template names come only from application code, never a request.
        $config = $this->config;
        $data += [
            'title' => 'dunamismax',
            'description' => Application::DESCRIPTION,
            'path' => '/',
            'ogType' => 'website',
            'noindex' => !$config->isProduction() || $status !== 200,
        ];
        extract($data, EXTR_SKIP);
        $section = '/' . explode('/', ltrim(explode('?', $path, 2)[0], '/'), 2)[0];
        $cssVersion = (string) filemtime($this->root . '/public/css/site.css');

        $level = ob_get_level();
        ob_start();
        try {
            require $this->root . '/views/' . $template . '.php';
            $content = ob_get_clean();
            ob_start();
            require $this->root . '/views/layout.php';
            $html = ob_get_clean();
        } catch (Throwable $error) {
            while (ob_get_level() > $level) {
                ob_end_clean();
            }
            throw $error;
        }

        if ($noindex) {
            $headers['X-Robots-Tag'] = 'noindex';
        }
        return new Response($html, $status, $headers);
    }
}
