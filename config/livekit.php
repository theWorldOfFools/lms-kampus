<?php

return [
    'url' => env('LIVEKIT_URL', 'http://127.0.0.1:7880'),
    'api_key' => env('LIVEKIT_API_KEY', 'devkey'),
    'api_secret' => env('LIVEKIT_API_SECRET', ''),
    'egress_enabled' => env('LIVEKIT_EGRESS_ENABLED', false),
];
