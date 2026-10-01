<?php

namespace App\Services;

use Agence104\LiveKit\AccessToken;
use Agence104\LiveKit\AccessTokenOptions;
use Agence104\LiveKit\VideoGrant;

/**
 * LivekitService — penerbit token LiveKit untuk Meeting WebRTC.
 *
 * Fase 0: hanya token join (tanpa RoomService API call agar test offline lolos).
 * Fase 4: tambah createRoom, listRooms, egress recording via RoomServiceClient.
 */
class LivekitService
{
    public function __construct(
        private readonly ?string $apiKey = null,
        private readonly ?string $apiSecret = null,
    ) {}

    private function key(): string
    {
        return $this->apiKey ?? (string) config('livekit.api_key');
    }

    private function secret(): string
    {
        return $this->apiSecret ?? (string) config('livekit.api_secret');
    }

    /**
     * Buat JWT untuk user join room.
     */
    public function joinToken(
        string $room,
        string $identity,
        string $name,
        bool $canPublish = true,
        bool $canSubscribe = true,
        int $ttlSeconds = 3600,
    ): string {
        $options = new AccessTokenOptions();
        $options->setIdentity($identity);
        $options->setName($name);
        $options->setTtl($ttlSeconds);

        $grant = new VideoGrant();
        $grant->setRoomJoin(true);
        $grant->setRoomName($room);
        $grant->setCanPublish($canPublish);
        $grant->setCanSubscribe($canSubscribe);

        $token = new AccessToken($this->key(), $this->secret(), $options);
        $token->setGrant($grant);

        return $token->toJwt();
    }

    public function roomNameForMeeting(int $meetingId): string
    {
        return "lms-meeting-{$meetingId}";
    }
}
