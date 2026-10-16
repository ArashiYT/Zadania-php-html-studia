<?php
header('Content-Type: application/json; charset=utf-8');

$baseDir = realpath(__DIR__ . '/projects');
if ($baseDir === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Cannot find directory "projects"']);
    exit;
}

// Szuka index.php / index.html, a jak ich nie ma, bierze pierwszy plik
function findEntryFile(string $dir): ?string
{
    foreach (['index.php', 'index.html'] as $name) {
        if (is_file($dir . DIRECTORY_SEPARATOR . $name)) {
            return $name;
        }
    }
    foreach (scandir($dir) as $file) {
        if ($file[0] === '.') continue; // pomija ukryte i . / ..
        if (is_file($dir . DIRECTORY_SEPARATOR . $file)) {
            return $file;
        }
    }
    return null;
}

// Zamienia ścieżkę względną na bezpieczny URL
function toUrl(string $rel): string
{
    $parts = explode('/', str_replace('\\', '/', $rel));
    return 'projects/' . implode('/', array_map('rawurlencode', $parts));
}

$result = [];

$it = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($baseDir, FilesystemIterator::SKIP_DOTS),
    RecursiveIteratorIterator::SELF_FIRST
);

foreach ($it as $item) {
    if (!$item->isDir()) continue;

    $rel   = substr($item->getPathname(), strlen($baseDir) + 1);
    $entry = findEntryFile($item->getPathname());
    $relUnix = str_replace('\\', '/', $rel);

    $result[] = [
        'folder' => $relUnix,
        'file'   => $entry,
        'url'    => $entry ? toUrl($relUnix . '/' . $entry) : null,
    ];
}

echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);