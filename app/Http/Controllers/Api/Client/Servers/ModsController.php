<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Illuminate\Http\Request;
use Pterodactyl\Models\Server;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Illuminate\Support\Facades\Http;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Facades\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class ModsController extends ClientApiController
{
    private DaemonFileRepository $fileRepository;

    private const MODRINTH_API = 'https://api.modrinth.com/v2';
    private const CURSEFORGE_API = 'https://api.curseforge.com/v1';
    private const MINECRAFT_GAME_ID = 432;
    private const MODS_CLASS_ID = 6;

    public function __construct(DaemonFileRepository $fileRepository)
    {
        parent::__construct();
        $this->fileRepository = $fileRepository;
    }

    public function curse(Request $request): JsonResponse
    {
        $type = $request->input('type') ?? 'curseforge';
        $search = $request->input('search') ?? '';
        $page = (int) ($request->input('page') ?? 1);
        $version = $request->input('version') ?? '';
        $loader = $request->input('loader') ?? '';

        if ($type === 'modrinth') {
            return $this->searchModrinth($search, $page, $version, $loader);
        }

        return $this->searchCurseForge($search, $page, $version, $loader);
    }

    private function searchModrinth(string $search, int $page, string $version, string $loader): JsonResponse
    {
        $limit = 20;
        $offset = ($page - 1) * $limit;

        $facets = [['project_type:mod']];
        if ($version) {
            $facets[] = ["versions:$version"];
        }
        if ($loader) {
            $facets[] = ["categories:$loader"];
        }

        $response = Http::timeout(30)
            ->withHeaders(['User-Agent' => 'Pterodactyl-Panel/1.0'])
            ->get(self::MODRINTH_API . '/search', [
                'query' => $search,
                'limit' => $limit,
                'offset' => $offset,
                'facets' => json_encode($facets),
            ]);

        if ($response->failed()) {
            return new JsonResponse(['error' => 'Failed to search Modrinth'], 502);
        }

        $data = $response->json();

        return new JsonResponse($data['hits'] ?? []);
    }

    private function searchCurseForge(string $search, int $page, string $version, string $loader): JsonResponse
    {
        $apiKey = '$2a$10$g.tLQ4L6.ZjzkSH6kHtoX.e2fzfk.8PRChI/1Dn1vZ1JHkUnLgui6';

        $params = [
            'gameId' => self::MINECRAFT_GAME_ID,
            'classId' => self::MODS_CLASS_ID,
            'searchFilter' => $search,
            'pageSize' => 20,
            'index' => ($page - 1) * 20,
            'sortField' => 2, // Popularity
            'sortOrder' => 'desc',
        ];

        if ($version) {
            $params['gameVersion'] = $version;
        }
        if ($loader) {
            $loaderMap = ['forge' => 1, 'fabric' => 4, 'quilt' => 5, 'neoforge' => 6];
            if (isset($loaderMap[$loader])) {
                $params['modLoaderType'] = $loaderMap[$loader];
            }
        }

        $response = Http::timeout(30)
            ->withHeaders(['x-api-key' => $apiKey])
            ->get(self::CURSEFORGE_API . '/mods/search', $params);

        if ($response->failed()) {
            return new JsonResponse(['error' => 'Failed to search CurseForge'], 502);
        }

        $data = $response->json();

        return new JsonResponse($data['data'] ?? []);
    }

    public function versions(Request $request): JsonResponse
    {
        $type = $request->input('type') ?? 'curseforge';
        $modId = $request->input('modId') ?? '';

        if ($type === 'modrinth') {
            $response = Http::timeout(30)
                ->withHeaders(['User-Agent' => 'Pterodactyl-Panel/1.0'])
                ->get(self::MODRINTH_API . "/project/$modId/version");

            if ($response->failed()) {
                return new JsonResponse(['error' => 'Failed to get versions from Modrinth'], 502);
            }

            return new JsonResponse($response->json());
        }

        $apiKey = '$2a$10$g.tLQ4L6.ZjzkSH6kHtoX.e2fzfk.8PRChI/1Dn1vZ1JHkUnLgui6';

        $response = Http::timeout(30)
            ->withHeaders(['x-api-key' => $apiKey])
            ->get(self::CURSEFORGE_API . "/mods/$modId/files", [
                'pageSize' => 50,
            ]);

        if ($response->failed()) {
            return new JsonResponse(['error' => 'Failed to get versions from CurseForge'], 502);
        }

        $data = $response->json();

        return new JsonResponse($data['data'] ?? []);
    }

    public function description(Request $request): JsonResponse
    {
        $type = $request->input('type') ?? 'curseforge';
        $modId = $request->input('modId') ?? '';

        if ($type === 'modrinth') {
            $response = Http::timeout(30)
                ->withHeaders(['User-Agent' => 'Pterodactyl-Panel/1.0'])
                ->get(self::MODRINTH_API . "/project/$modId");

            if ($response->failed()) {
                return new JsonResponse(['error' => 'Failed to get description from Modrinth'], 502);
            }

            $data = $response->json();

            return new JsonResponse(['description' => $data['body'] ?? '']);
        }

        $apiKey = '$2a$10$g.tLQ4L6.ZjzkSH6kHtoX.e2fzfk.8PRChI/1Dn1vZ1JHkUnLgui6';

        $response = Http::timeout(30)
            ->withHeaders(['x-api-key' => $apiKey])
            ->get(self::CURSEFORGE_API . "/mods/$modId/description");

        if ($response->failed()) {
            return new JsonResponse(['error' => 'Failed to get description from CurseForge'], 502);
        }

        $data = $response->json();

        return new JsonResponse(['description' => $data['data'] ?? '']);
    }

    public function mcversions(): JsonResponse
    {
        $response = Http::timeout(30)
            ->withHeaders(['User-Agent' => 'Pterodactyl-Panel/1.0'])
            ->get(self::MODRINTH_API . '/tag/game_version');

        if ($response->failed()) {
            return new JsonResponse(['error' => 'Failed to get Minecraft versions'], 502);
        }

        $versions = collect($response->json())
            ->filter(fn ($v) => $v['version_type'] === 'release')
            ->map(fn ($v) => ['id' => $v['version']])
            ->values()
            ->all();

        return new JsonResponse($versions);
    }

    public function install(Request $request, Server $server): JsonResponse
    {
        $url = $request->input('url') ?? '';

        // Validate the URL is from an allowed domain
        $parsed = parse_url($url);
        $host = $parsed['host'] ?? '';
        $allowedHosts = [
            'cdn.modrinth.com',
            'cdn-raw.modrinth.com',
            'edge.forgecdn.net',
            'mediafilez.forgecdn.net',
            'www.curseforge.com',
        ];

        if (!in_array($host, $allowedHosts, true)) {
            return new JsonResponse(['error' => 'Download URL is not from an allowed domain'], 403);
        }

        // For CurseForge, fix the download URL
        if (str_contains($url, 'edge.forgecdn.net')) {
            $url = str_replace('edge.forgecdn.net', 'mediafilez.forgecdn.net', $url);
        }

        $file = basename(parse_url($url, PHP_URL_PATH));

        try {
            $this->fileRepository->setServer($server)->pull($url, 'mods', ['filename' => $file, 'foreground' => true]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Failed to download mod file'], 502);
        }

        Activity::event('server:file.pull')
            ->property('directory', 'mods')
            ->property('url', $url)
            ->log();

        return new JsonResponse([], Response::HTTP_NO_CONTENT);
    }
}

