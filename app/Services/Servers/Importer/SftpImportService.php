<?php

namespace Pterodactyl\Services\Servers\Importer;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Http;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\User;
use Pterodactyl\Repositories\Wings\DaemonServerRepository;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Services\Nodes\NodeJWTService;
use phpseclib3\Net\SFTP;
use RuntimeException;
use Throwable;

class SftpImportService
{
    public function __construct(
        private DaemonFileRepository $fileRepository,
        private DaemonServerRepository $serverRepository,
        private NodeJWTService $jwtService,
    ) {
    }

    /**
     * @return array<string, int|string>
     */
    public function handle(Server $server, User $user, array $payload): array
    {
        $sourcePath = $this->normalizePath($payload['source_path']);
        $destinationPath = $this->normalizePath($payload['destination_path']);

        $sftp = new SFTP($payload['host'], (int) $payload['port'], 20);
        if (!$sftp->login($payload['username'], $payload['password'])) {
            throw new RuntimeException('Unable to authenticate with the remote SFTP server.');
        }

        $sourceSize = $this->calculateRemoteSize($sftp, $sourcePath);
        $availableBytes = $this->getAvailableBytes($server);

        if ($sourceSize > $availableBytes) {
            throw new RuntimeException(sprintf(
                'This import requires %s of free space, but only %s is available on the destination server.',
                $this->formatBytes($sourceSize),
                $this->formatBytes($availableBytes)
            ));
        }

        $uploadUrl = $this->getUploadUrl($server, $user);

        $this->ensurePathExists($server, $destinationPath);

        $stats = [
            'imported_files' => 0,
            'imported_bytes' => 0,
            'created_directories' => 0,
        ];

        $startedAt = microtime(true);

        if ($sftp->is_dir($sourcePath)) {
            $this->importDirectory($sftp, $server, $uploadUrl, $sourcePath, $destinationPath, $stats);
        } elseif ($sftp->is_file($sourcePath)) {
            $this->uploadSftpFile($sftp, $uploadUrl, $sourcePath, $destinationPath, basename($sourcePath), $stats);
        } else {
            throw new RuntimeException('The source path does not exist on the remote SFTP server.');
        }

        return [
            ...$stats,
            'elapsed_ms' => (int) round((microtime(true) - $startedAt) * 1000),
        ];
    }

    /**
     * @param array<string, int> $stats
     */
    private function importDirectory(
        SFTP $sftp,
        Server $server,
        string $uploadUrl,
        string $sourceDirectory,
        string $destinationDirectory,
        array &$stats,
    ): void {
        $entries = $sftp->rawlist($sourceDirectory);
        if ($entries === false) {
            throw new RuntimeException(sprintf('Failed to list remote directory: %s', $sourceDirectory));
        }

        foreach ($entries as $name => $entry) {
            if ($name === '.' || $name === '..' || !is_array($entry)) {
                continue;
            }

            $sourceChild = $this->joinPath($sourceDirectory, $name);
            $destinationChild = $this->joinPath($destinationDirectory, $name);

            $type = $entry['type'] ?? null;
            if ($type === SFTP::TYPE_DIRECTORY) {
                if (!$this->pathExists($server, $destinationChild)) {
                    $this->createPathSegment($server, $destinationChild);
                    ++$stats['created_directories'];
                }

                $this->importDirectory($sftp, $server, $uploadUrl, $sourceChild, $destinationChild, $stats);
                continue;
            }

            if ($type !== SFTP::TYPE_REGULAR) {
                continue;
            }

            $this->uploadSftpFile($sftp, $uploadUrl, $sourceChild, $destinationDirectory, $name, $stats);
        }
    }

    /**
     * @param array<string, int> $stats
     */
    private function uploadSftpFile(
        SFTP $sftp,
        string $uploadUrl,
        string $sourceFile,
        string $destinationDirectory,
        string $filename,
        array &$stats,
    ): void {
        $tempPath = tempnam(sys_get_temp_dir(), 'sftpimp_');
        if ($tempPath === false) {
            throw new RuntimeException('Failed to create a temporary file for transfer.');
        }

        try {
            if (!$sftp->get($sourceFile, $tempPath)) {
                throw new RuntimeException(sprintf('Failed to download remote file: %s', $sourceFile));
            }

            $size = filesize($tempPath);
            if ($size === false) {
                throw new RuntimeException(sprintf('Unable to determine size for downloaded file: %s', $sourceFile));
            }

            $stream = fopen($tempPath, 'rb');
            if ($stream === false) {
                throw new RuntimeException(sprintf('Failed to read temporary file for upload: %s', $sourceFile));
            }

            try {
                $response = Http::timeout(120)
                    ->attach('files', $stream, $filename)
                    ->post($this->appendDirectoryQuery($uploadUrl, $destinationDirectory));
            } finally {
                fclose($stream);
            }

            if (!$response->successful()) {
                throw new RuntimeException(sprintf(
                    'Failed to upload file to destination server (%s): %s',
                    $filename,
                    $response->body()
                ));
            }

            ++$stats['imported_files'];
            $stats['imported_bytes'] += $size;
        } finally {
            if (file_exists($tempPath)) {
                @unlink($tempPath);
            }
        }
    }

    private function calculateRemoteSize(SFTP $sftp, string $path): int
    {
        if ($sftp->is_file($path)) {
            $size = $sftp->size($path);

            return $size === false ? 0 : (int) $size;
        }

        if (!$sftp->is_dir($path)) {
            return 0;
        }

        $total = 0;
        $entries = $sftp->rawlist($path);
        if ($entries === false) {
            throw new RuntimeException(sprintf('Failed to list remote directory: %s', $path));
        }

        foreach ($entries as $name => $entry) {
            if ($name === '.' || $name === '..' || !is_array($entry)) {
                continue;
            }

            $child = $this->joinPath($path, $name);
            $type = $entry['type'] ?? null;

            if ($type === SFTP::TYPE_DIRECTORY) {
                $total += $this->calculateRemoteSize($sftp, $child);
                continue;
            }

            if ($type === SFTP::TYPE_REGULAR) {
                $total += (int) ($entry['size'] ?? 0);
            }
        }

        return $total;
    }

    private function getAvailableBytes(Server $server): int
    {
        $details = $this->serverRepository->setServer($server)->getDetails();
        $usedBytes = (int) data_get($details, 'utilization.disk_bytes', 0);
        $limitBytes = $server->disk * 1024 * 1024;

        return max($limitBytes - $usedBytes, 0);
    }

    private function ensurePathExists(Server $server, string $path): void
    {
        if ($path === '/' || $this->pathExists($server, $path)) {
            return;
        }

        $segments = array_values(array_filter(explode('/', trim($path, '/')), fn ($segment) => $segment !== ''));
        $current = '/';

        foreach ($segments as $segment) {
            $next = $this->joinPath($current, $segment);
            if (!$this->pathExists($server, $next)) {
                $this->createPathSegment($server, $next);
            }
            $current = $next;
        }
    }

    private function createPathSegment(Server $server, string $path): void
    {
        $parent = dirname($path);
        $parent = $parent === '.' ? '/' : $this->normalizePath($parent);

        try {
            $this->fileRepository
                ->setServer($server)
                ->createDirectory(basename($path), $parent);
        } catch (Throwable $exception) {
            // If the path now exists, another operation may have created it already.
            if (!$this->pathExists($server, $path)) {
                throw $exception;
            }
        }
    }

    private function pathExists(Server $server, string $path): bool
    {
        try {
            $this->fileRepository->setServer($server)->getDirectory($path);

            return true;
        } catch (Throwable) {
            return false;
        }
    }

    private function getUploadUrl(Server $server, User $user): string
    {
        $token = $this->jwtService
            ->setExpiresAt(CarbonImmutable::now()->addMinutes(30))
            ->setUser($user)
            ->setClaims(['server_uuid' => $server->uuid])
            ->handle($server->node, $user->id . $server->uuid);

        return sprintf('%s/upload/file?token=%s', $server->node->getConnectionAddress(), $token->toString());
    }

    private function appendDirectoryQuery(string $uploadUrl, string $directory): string
    {
        return sprintf('%s&directory=%s', $uploadUrl, urlencode($directory));
    }

    private function normalizePath(string $path): string
    {
        $path = trim($path);
        if ($path === '' || $path === '/') {
            return '/';
        }

        $normalized = '/' . trim(str_replace('\\', '/', $path), '/');

        return preg_replace('#/+#', '/', $normalized) ?? '/';
    }

    private function joinPath(string $base, string $segment): string
    {
        return $this->normalizePath(rtrim($base, '/') . '/' . ltrim($segment, '/'));
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        $value = (float) $bytes;
        $unit = 'B';

        foreach ($units as $candidate) {
            $unit = $candidate;
            if ($value < 1024 || $candidate === 'PB') {
                break;
            }

            $value /= 1024;
        }

        return $unit === 'B' ? sprintf('%d %s', $bytes, $unit) : sprintf('%.2f %s', $value, $unit);
    }
}
