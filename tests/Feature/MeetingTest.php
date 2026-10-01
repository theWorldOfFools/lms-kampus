<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Meeting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class MeetingTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function tamu_dialihkan_ke_login(): void
    {
        $this->get('/meetings')->assertRedirect('/login');
        $this->get('/meetings/create')->assertRedirect('/login');
    }

    #[Test]
    public function admin_bisa_lihat_daftar_dan_form(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get('/meetings')
            ->assertOk()
            ->assertInertia(fn (Assert $p) => $p->component('Meetings/Index')->has('meetings'));

        $this->actingAs($admin)->get('/meetings/create')
            ->assertOk()
            ->assertInertia(fn (Assert $p) => $p->component('Meetings/Form'));
    }

    #[Test]
    public function semua_role_bisa_buat_standalone(): void
    {
        foreach (['admin', 'dosen', 'mhs'] as $role) {
            $user = User::factory()->create(['role' => $role]);
            $res = $this->actingAs($user)->post('/meetings', [
                'title' => "Rapat {$role}",
                'course_id' => null,
            ]);
            $res->assertRedirect();
            $this->assertDatabaseHas('meetings', ['title' => "Rapat {$role}", 'course_id' => null]);
        }
    }

    #[Test]
    public function mhs_tidak_bisa_buat_meeting_per_course(): void
    {
        $dosen = User::factory()->create(['role' => 'dosen']);
        $mhs = User::factory()->create(['role' => 'mhs']);
        $course = Course::create([
            'code' => 'IF999', 'name' => 'Kelas Tes', 'dosen_id' => $dosen->id, 'class_code' => 'TEST999',
        ]);

        $this->actingAs($mhs)->post('/meetings', [
            'title' => 'Nakal', 'course_id' => $course->id,
        ])->assertForbidden();
    }

    #[Test]
    public function dosen_bisa_buat_meeting_kelasnya_dan_masuk_room_dapat_token(): void
    {
        config(['livekit.api_key' => 'devkey', 'livekit.api_secret' => str_repeat('s', 32)]);
        $dosen = User::factory()->create(['role' => 'dosen']);
        $course = Course::create([
            'code' => 'IF998', 'name' => 'Kelas Dosen', 'dosen_id' => $dosen->id, 'class_code' => 'TEST998',
        ]);

        $res = $this->actingAs($dosen)->post('/meetings', [
            'title' => 'Kuliah 1', 'course_id' => $course->id,
        ]);
        $res->assertRedirect();
        $meeting = Meeting::where('title', 'Kuliah 1')->firstOrFail();

        $this->actingAs($dosen)->get("/meetings/{$meeting->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $p) => $p
                ->component('Meetings/Room')
                ->has('meeting')
                ->has('livekit'));
    }

    #[Test]
    public function halaman_room_menyertakan_kredensial_turn_terbatas(): void
    {
        config(['turn.rest_secret' => str_repeat('k', 32)]);
        $admin = User::factory()->create(['role' => 'admin']);
        $meeting = Meeting::create([
            'title' => 'Dengan TURN', 'course_id' => null, 'created_by' => $admin->id,
        ]);

        // Host request dipakai untuk URL TURN agar cocok dengan browser
        $this->actingAs($admin)->get("/meetings/{$meeting->id}", ['Host' => 'localhost:8000'])
            ->assertOk()
            ->assertInertia(fn (Assert $p) => $p
                ->component('Meetings/Room')
                ->has('livekit.turn')
                ->where('livekit.turn.urls.0', fn ($v) => str_starts_with($v, 'turn:localhost:'))
                ->where('livekit.turn.username', fn ($v) => str_contains($v, 'user-'.$admin->id)));
    }

    #[Test]
    public function mhs_luar_kelas_tidak_bisa_buka_meeting_kelas(): void
    {
        $dosen = User::factory()->create(['role' => 'dosen']);
        $mhs = User::factory()->create(['role' => 'mhs']);
        $course = Course::create([
            'code' => 'IF997', 'name' => 'Kelas Privat', 'dosen_id' => $dosen->id, 'class_code' => 'TEST997',
        ]);
        $meeting = Meeting::create([
            'title' => 'Privat', 'course_id' => $course->id, 'created_by' => $dosen->id,
        ]);

        $this->actingAs($mhs)->get("/meetings/{$meeting->id}")->assertForbidden();
    }

    #[Test]
    public function join_via_kode_room_berhasil(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $meeting = Meeting::create([
            'title' => 'Bebas', 'course_id' => null, 'created_by' => $admin->id,
        ]);

        $this->actingAs($admin)->post('/meetings/join', ['code' => $meeting->room_name])
            ->assertRedirect("/meetings/{$meeting->id}");

        $this->actingAs($admin)->post('/meetings/join', ['code' => 'tidak-ada'])
            ->assertRedirect();
    }
}
