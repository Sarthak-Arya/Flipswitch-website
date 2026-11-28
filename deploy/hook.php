<?php

/**
 * One-time install: copy this file to ~/public_html/deploy-hook.php
 * and put the same random token in ~/deploy.token and the DEPLOY_TOKEN
 * GitHub secret. The file accepts only that token, then fast-forwards
 * the app and replaces the compiled build folder.
 */

declare(strict_types=1);

const MAX_UPLOAD_BYTES = 20_000_000;

header('Content-Type: text/plain; charset=UTF-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(404);
    echo "Not found\n";
    exit;
}

$home = dirname(__DIR__);
$app = $home.'/Flipswitch-website';
$tokenFile = $home.'/deploy.token';
$log = '';

try {
    $expected = is_file($tokenFile) ? trim((string) file_get_contents($tokenFile)) : '';
    if ($expected === '' || !tokenMatches(bearerToken(), $expected)) {
        http_response_code(403);
        echo "Forbidden\n";
        exit;
    }

    if (!is_dir($app.'/.git')) {
        throw new RuntimeException('App checkout was not found.');
    }

    set_time_limit(300);
    $incoming = uploadedBuild();
    $log .= pullApp($app, $home);
    $log .= installBuild($incoming, [
        $app.'/public/build',
        $home.'/public_html/build',
    ]);
    $log .= run('php artisan optimize:clear && php artisan route:clear', $app);
    removeTree(dirname($incoming));
    refreshHook($app);
    http_response_code(200);
    echo $log;
} catch (Throwable $error) {
    http_response_code(500);
    echo $log.$error->getMessage()."\n";
}

function bearerToken(): string
{
    $header = $_SERVER['HTTP_X_DEPLOY_TOKEN']
        ?? $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? '';

    if ($header === '' && function_exists('getallheaders')) {
        $headers = getallheaders() ?: [];
        foreach ($headers as $name => $value) {
            if (strcasecmp((string) $name, 'Authorization') === 0 || strcasecmp((string) $name, 'X-Deploy-Token') === 0) {
                $header = (string) $value;
                break;
            }
        }
    }

    if (preg_match('/^Bearer\s+(\S+)$/', $header, $matches) === 1) {
        return $matches[1];
    }

    return $header;
}

function tokenMatches(string $given, string $expected): bool
{
    if ($given === '' || strlen($given) !== strlen($expected)) {
        return false;
    }

    return hash_equals($expected, $given);
}

function uploadedBuild(): string
{
    $file = $_FILES['build'] ?? null;
    if (!is_array($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Build upload was missing.');
    }

    if (($file['size'] ?? 0) > MAX_UPLOAD_BYTES) {
        throw new RuntimeException('Build upload is too large.');
    }

    $tmp = sys_get_temp_dir().'/flipswitch-deploy-'.bin2hex(random_bytes(8));
    if (!mkdir($tmp, 0700, true) && !is_dir($tmp)) {
        throw new RuntimeException('Could not create a temp directory.');
    }

    $zipPath = $tmp.'/build.zip';
    if (!move_uploaded_file($file['tmp_name'], $zipPath)) {
        throw new RuntimeException('Could not store the build upload.');
    }

    $zip = new ZipArchive();
    if ($zip->open($zipPath) !== true) {
        throw new RuntimeException('Build upload is not a zip file.');
    }

    for ($index = 0; $index < $zip->numFiles; $index++) {
        $name = str_replace('\\', '/', (string) $zip->getNameIndex($index));
        if ($name === '' || str_contains($name, '../') || str_starts_with($name, '/') || !str_starts_with($name, 'build/')) {
            $zip->close();
            throw new RuntimeException('Build upload contains an unexpected path.');
        }
    }

    if (!$zip->extractTo($tmp)) {
        $zip->close();
        throw new RuntimeException('Could not extract the build upload.');
    }
    $zip->close();
    unlink($zipPath);

    $build = $tmp.'/build';
    if (!is_file($build.'/manifest.json')) {
        throw new RuntimeException('Build upload has no manifest.json.');
    }

    return $build;
}

function pullApp(string $app, string $home): string
{
    $backup = $home.'/database.php.server.bak';
    if (!copy($app.'/config/database.php', $backup)) {
        throw new RuntimeException('Could not back up config/database.php.');
    }

    try {
        putenv('GIT_TERMINAL_PROMPT=0');
        putenv('GIT_CONFIG_COUNT=1');
        putenv('GIT_CONFIG_KEY_0=safe.directory');
        putenv('GIT_CONFIG_VALUE_0='.$app);

        $before = trim(run('git rev-parse HEAD', $app));
        $output = run('git checkout -- public composer.lock', $app);
        $output .= run(
            'git -c http.lowSpeedLimit=1000 -c http.lowSpeedTime=20 pull --ff-only origin master',
            $app
        );
        $after = trim(run('git rev-parse HEAD', $app));
        $changed = trim(run('git diff --name-only '.escapeshellarg($before).' '.escapeshellarg($after), $app));

        if ($changed !== '' && preg_match('/^composer\.lock$/m', $changed) === 1) {
            $output .= run(
                'rm -f bootstrap/cache/packages.php bootstrap/cache/services.php bootstrap/cache/config.php bootstrap/cache/routes-v7.php'
                .' && composer install --no-interaction --prefer-dist --optimize-autoloader',
                $app
            );
        }

        return $output;
    } finally {
        copy($backup, $app.'/config/database.php');
    }
}

function installBuild(string $source, array $targets): string
{
    $log = '';
    $installed = [];

    foreach ($targets as $target) {
        $parent = dirname($target);
        if (!is_dir($parent) && !mkdir($parent, 0755, true) && !is_dir($parent)) {
            throw new RuntimeException('Could not create '.$parent);
        }

        $realParent = realpath($parent);
        $key = ($realParent !== false ? $realParent : $parent).'/build';
        if (isset($installed[$key])) {
            continue;
        }

        removeTree($target);
        copyTree($source, $target);
        $installed[$key] = true;
        $log .= "Installed build at {$target}\n";
    }

    return $log;
}

function run(string $command, string $cwd): string
{
    return runLogged('timeout 180 bash -lc '.escapeshellarg($command), $cwd);
}

function runLogged(string $command, string $cwd): string
{
    if (!function_exists('proc_open')) {
        throw new RuntimeException('PHP proc_open is disabled on this host, so the deploy hook cannot run git.');
    }

    $pipes = [];
    $process = proc_open($command, [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, $cwd);
    if (!is_resource($process)) {
        throw new RuntimeException('Could not start: '.$command);
    }

    $stdout = stream_get_contents($pipes[1]);
    $stderr = stream_get_contents($pipes[2]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    $exit = proc_close($process);
    $output = "$ {$command}\n{$stdout}{$stderr}";

    if ($exit !== 0) {
        throw new RuntimeException(rtrim($output)."\nCommand failed ({$exit}).");
    }

    return $output;
}

function copyTree(string $source, string $target): void
{
    if (!mkdir($target, 0755, true) && !is_dir($target)) {
        throw new RuntimeException('Could not create '.$target);
    }

    $items = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($source, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($items as $item) {
        $dest = $target.substr($item->getPathname(), strlen($source));
        if ($item->isDir()) {
            if (!is_dir($dest) && !mkdir($dest, 0755, true) && !is_dir($dest)) {
                throw new RuntimeException('Could not create '.$dest);
            }
            continue;
        }

        if (!copy($item->getPathname(), $dest)) {
            throw new RuntimeException('Could not copy '.$dest);
        }
        chmod($dest, 0644);
    }
}

function refreshHook(string $app): void
{
    $updated = $app.'/deploy/hook.php';
    if (!is_file($updated) || realpath($updated) === realpath(__FILE__)) {
        return;
    }

    copy($updated, __FILE__);
}

function removeTree(string $dir): void
{
    if (!is_dir($dir)) {
        return;
    }

    $items = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );

    foreach ($items as $item) {
        $path = $item->getPathname();
        if ($item->isDir()) {
            rmdir($path);
        } else {
            unlink($path);
        }
    }

    rmdir($dir);
}
