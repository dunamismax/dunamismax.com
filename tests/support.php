<?php

declare(strict_types=1);

/** Each CLI invocation has its own connection; its writes are committed. */
function postsCommand(array $arguments, array $environment = [], string $input = ''): array
{
    $pipes = [];
    $process = proc_open([PHP_BINARY, dirname(__DIR__) . '/bin/posts.php', ...$arguments],
        [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes, dirname(__DIR__), $environment);
    if (!is_resource($process)) {
        throw new RuntimeException('Cannot start publishing CLI subprocess.');
    }
    fwrite($pipes[0], $input);
    fclose($pipes[0]);
    $stdout = stream_get_contents($pipes[1]);
    $stderr = stream_get_contents($pipes[2]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    return [proc_close($process), $stdout, $stderr];
}

function parseFeed(string $body): DOMDocument
{
    $document = new DOMDocument();
    if (!$document->loadXML($body, LIBXML_NONET)) {
        throw new RuntimeException('RSS did not parse as XML.');
    }
    return $document;
}

/** Run the actual public front controller with explicitly supplied test settings. */
function withHttpServer(array $environment, callable $check): void
{
    $socket = stream_socket_server('tcp://127.0.0.1:0', $errno, $message);
    if ($socket === false) {
        throw new RuntimeException('Cannot allocate local HTTP test port.');
    }
    $address = stream_socket_get_name($socket, false);
    fclose($socket);
    $log = tmpfile();
    $pipes = [];
    $process = proc_open([PHP_BINARY, '-S', $address, '-t', 'public', 'dev/router.php'],
        [['pipe', 'r'], $log, $log], $pipes, dirname(__DIR__), $environment);
    if (!is_resource($process)) {
        throw new RuntimeException('Cannot start local HTTP test server.');
    }
    fclose($pipes[0]);
    try {
        $ready = false;
        for ($attempt = 0; $attempt < 50; $attempt++) {
            $connection = @stream_socket_client('tcp://' . $address, $errno, $message, 0.1);
            if ($connection !== false) {
                fclose($connection);
                $ready = true;
                break;
            }
            usleep(100000);
        }
        if (!$ready) {
            throw new RuntimeException('Local HTTP server did not start.');
        }
        $check('http://' . $address);
    } finally {
        proc_terminate($process);
        proc_close($process);
        fclose($log);
    }
}

function httpRead(string $url, string $method = 'GET'): array
{
    $context = stream_context_create(['http' => ['method' => $method, 'ignore_errors' => true,
        'timeout' => 5, 'header' => "Host: untrusted.example\r\nConnection: close\r\n"]]);
    $stream = fopen($url, 'r', false, $context);
    if ($stream === false) {
        throw new RuntimeException('HTTP test request failed.');
    }
    $headers = stream_get_meta_data($stream)['wrapper_data'];
    $body = stream_get_contents($stream);
    fclose($stream);
    return [$body, implode("\n", $headers)];
}
