<?php

namespace Pterodactyl\Models;

class Baniplist extends Model
{
    public const RESOURCE_NAME = 'ban_ip';

    protected $table = 'BanIp';

    protected $fillable = [
        'server_id',
        'ip',
        'country',
        'region',
        'city',
        'countryname',
        'port',
    ];

    protected $casts = [
        'ip' => 'string',
    ];

    public static array $validationRules = [
        'ip' => 'required|string|max:15',
    ];
}
