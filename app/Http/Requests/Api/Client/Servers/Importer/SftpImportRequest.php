<?php

namespace Pterodactyl\Http\Requests\Api\Client\Servers\Importer;

use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;
use Pterodactyl\Models\Permission;
use Pterodactyl\Models\Server;

class SftpImportRequest extends ClientApiRequest
{
    /**
     * Require both SFTP access and file create permissions for imports.
     */
    public function authorize(): bool
    {
        $server = $this->route()->parameter('server');

        if (!$server instanceof Server) {
            return false;
        }

        return $this->user()->can(Permission::ACTION_FILE_SFTP, $server)
            && $this->user()->can(Permission::ACTION_FILE_CREATE, $server);
    }

    public function rules(): array
    {
        return [
            'protocol' => 'sometimes|string|in:sftp',
            'host' => 'required|string|max:255',
            'port' => 'required|integer|min:1|max:65535',
            'username' => 'required|string|max:255',
            'password' => 'required|string|max:1024',
            'source_path' => 'required|string|max:2048',
            'destination_path' => 'required|string|max:2048',
        ];
    }
}
