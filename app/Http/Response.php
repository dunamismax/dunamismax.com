<?php

declare(strict_types=1);

namespace Dunamismax\Http;

final readonly class Response
{
    public function __construct(
        public string $body,
        public int $status = 200,
        public array $headers = [],
    ) {
    }

    public function send(bool $head = false): void
    {
        http_response_code($this->status);
        $headers = $this->headers + [
            'Content-Type' => 'text/html; charset=utf-8',
            'Cache-Control' => 'no-store',
            'X-Content-Type-Options' => 'nosniff',
            'Referrer-Policy' => 'strict-origin-when-cross-origin',
            'Content-Security-Policy' => "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'",
            'Permissions-Policy' => 'camera=(), microphone=(), geolocation=()',
        ];
        foreach ($headers as $name => $value) {
            header($name . ': ' . $value);
        }
        if (!$head) {
            echo $this->body;
        }
    }
}
