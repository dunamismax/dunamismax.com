<?php

declare(strict_types=1);

namespace Dunamismax;

use DateTimeImmutable;
use DateTimeZone;
use Dunamismax\Http\Response;

final readonly class RssFeed
{
    public function __construct(private Config $config)
    {
    }

    public function response(array $posts): Response
    {
        $origin = $this->config->url;
        $built = $posts === [] ? new DateTimeImmutable('now', new DateTimeZone('UTC')) : self::date($posts[0]['published_at']);
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n"
            . '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">' . "\n"
            . "  <channel>\n"
            . "    <title>dunamismax · Blog</title>\n"
            . '    <link>' . self::xml($origin . '/') . "</link>\n"
            . '    <description>' . self::xml(Application::DESCRIPTION) . "</description>\n"
            . '    <atom:link href="' . self::xml($origin . '/feed.xml') . '" rel="self" type="application/rss+xml"/>' . "\n"
            . "    <language>en</language>\n"
            . '    <lastBuildDate>' . $built->format('D, d M Y H:i:s O') . "</lastBuildDate>\n";
        foreach ($posts as $post) {
            $url = self::xml($origin . '/blog/' . $post['slug']);
            $xml .= "    <item>\n"
                . '      <title>' . self::xml($post['title']) . "</title>\n"
                . '      <link>' . $url . "</link>\n"
                . '      <guid isPermaLink="true">' . $url . "</guid>\n"
                . '      <pubDate>' . self::date($post['published_at'])->format('D, d M Y H:i:s O') . "</pubDate>\n";
            if ($post['excerpt'] !== '') {
                // RSS descriptions can be interpreted as HTML. Escape that
                // layer as well as XML so stored plain text stays plain text.
                $plain = htmlspecialchars($post['excerpt'], ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML5, 'UTF-8');
                $xml .= '      <description>' . self::xml($plain) . "</description>\n";
            }
            if (isset($post['body'])) {
                // The same escaped paragraphs the post page renders.
                $xml .= '      <content:encoded>' . self::xml(paragraphs($post['body'])) . "</content:encoded>\n";
            }
            $xml .= "    </item>\n";
        }
        $xml .= "  </channel>\n</rss>\n";
        $headers = ['Content-Type' => 'application/xml; charset=utf-8', 'Cache-Control' => 'no-store'];
        if (!$this->config->isProduction()) {
            $headers['X-Robots-Tag'] = 'noindex';
        }
        return new Response($xml, 200, $headers);
    }

    private static function date(string $value): DateTimeImmutable
    {
        return new DateTimeImmutable($value, new DateTimeZone('UTC'));
    }

    private static function xml(string $text): string
    {
        // Replace invalid UTF-8 and XML 1.0 forbidden code points with U+FFFD;
        // a legacy/imported control character must never break the entire feed.
        return htmlspecialchars($text, ENT_QUOTES | ENT_XML1 | ENT_SUBSTITUTE | ENT_DISALLOWED, 'UTF-8');
    }
}
