<?php

// Konfigurasi TURN (coturn) untuk relay media WebRTC.
//
// Topologi dev WSL: browser dan LiveKit tidak punya path UDP langsung
// (host candidate ter-filter, hairpin NAT gagal), sehingga client WAJIB
// lewat relay TURN/TCP. Backend menerbitkan kredensial berumur pendek
// ala TURN REST API (username = expiry:user, password = HMAC-SHA1).
$turnUrl = env('TURN_URL', 'turn:127.0.0.1:3478');

return [
    'url' => $turnUrl,
    'port' => (int) (parse_url($turnUrl, PHP_URL_PORT) ?: 3478),
    'realm' => env('TURN_REALM', 'lms-kampus'),
    'rest_secret' => env('TURN_REST_SECRET', ''),
    'ttl_seconds' => 7200,
];
