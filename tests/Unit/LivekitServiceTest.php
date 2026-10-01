<?php

namespace Tests\Unit;

use App\Services\LivekitService;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class LivekitServiceTest extends TestCase
{
    #[Test]
    public function join_token_menghasilkan_jwt_tiga_bagian(): void
    {
        config(['livekit.api_key' => 'devkey', 'livekit.api_secret' => str_repeat('s', 32)]);

        $svc = new LivekitService();
        $jwt = $svc->joinToken('lms-meeting-1', 'user-1', 'Dosen A');

        $this->assertIsString($jwt);
        $this->assertCount(3, explode('.', $jwt));

        // Payload harus memuat room + identity (base64url decode)
        [, $payloadB64] = explode('.', $jwt) + [null, null, null];
        $payload = json_decode(base64_decode(strtr($payloadB64, '-_', '+/')), true);

        $this->assertNotEmpty($payload);
        $this->assertSame('lms-meeting-1', $payload['video']['room'] ?? null);
    }

    #[Test]
    public function room_name_konsisten_per_meeting(): void
    {
        $svc = new LivekitService();

        $this->assertSame('lms-meeting-42', $svc->roomNameForMeeting(42));
    }
}
