<?php

namespace Pterodactyl\Models;

class Mcplugins extends Model
{
    public const RESOURCE_NAME = 'mcplugins';

    protected $table = 'mcplugins';

    protected $fillable = [
        'server_id',
        'plugin',
    ];

    protected $casts = [
        'server_id' => 'integer',
        'plugin' => 'string',
    ];

    public static array $validationRules = [
        'server_id' => 'required|integer',
        'plugin' => 'required|string',
    ];

    public function server()
    {
        return $this->belongsTo(Server::class);
    }
}
