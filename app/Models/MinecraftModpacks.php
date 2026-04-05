<?php

namespace Pterodactyl\Models;

class MinecraftModpacks extends Model
{
    public const RESOURCE_NAME = 'MinecraftModpacks';

    protected $table = 'modpacklist';

    protected $fillable = [
        'name',
        'version',
        'mcversion',
        'url',
        'icon',
    ];

    protected $casts = [
        'name' => 'string',
        'version' => 'string',
        'mcversion' => 'string',
        'url' => 'string',
        'icon' => 'string',
    ];

    public static array $validationRules = [
        'name' => 'required|string',
        'version' => 'required|string',
    ];
}
