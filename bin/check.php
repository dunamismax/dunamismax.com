<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$files = [$root . '/bootstrap.php'];
foreach (['app', 'bin', 'dev', 'public', 'tests', 'views'] as $directory) {
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root . '/' . $directory));
    foreach ($iterator as $file) {
        if ($file->isFile() && $file->getExtension() === 'php') {
            $files[] = $file->getPathname();
        }
    }
}

foreach ($files as $file) {
    $output = [];
    exec(escapeshellarg(PHP_BINARY) . ' -l ' . escapeshellarg($file) . ' 2>&1', $output, $status);
    if ($status !== 0) {
        fwrite(STDERR, implode("\n", $output) . "\n");
        exit(1);
    }
}
printf("Syntax OK: %d PHP files.\n", count($files));
