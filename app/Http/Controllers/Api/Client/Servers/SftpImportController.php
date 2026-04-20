<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Pterodactyl\Facades\Activity;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Http\Requests\Api\Client\Servers\Importer\SftpImportRequest;
use Pterodactyl\Models\Server;
use Pterodactyl\Services\Servers\Importer\SftpImportService;

class SftpImportController extends ClientApiController
{
    public function __construct(
        private SftpImportService $importService,
    ) {
        parent::__construct();
    }

    /**
     * Imports files from a remote SFTP server into this server.
     */
    public function store(SftpImportRequest $request, Server $server): JsonResponse
    {
        set_time_limit(0);

        $result = $this->importService->handle(
            $server,
            $request->user(),
            $request->validated()
        );

        Activity::event('server:import.sftp')
            ->property('host', $request->input('host'))
            ->property('source_path', $request->input('source_path'))
            ->property('destination_path', $request->input('destination_path'))
            ->property('imported_files', $result['imported_files'])
            ->property('imported_bytes', $result['imported_bytes'])
            ->log();

        return new JsonResponse([
            'object' => 'sftp_import',
            'attributes' => $result,
        ], Response::HTTP_OK);
    }
}
