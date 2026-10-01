<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CourseFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['admin', 'dosen', 'mhs'] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }
    }

    private function makeUser(string $role): User
    {
        $user = User::factory()->create(['role' => $role]);
        $user->assignRole($role);

        return $user;
    }

    #[Test]
    public function dosen_bisa_buat_kelas_mhs_tidak_bisa(): void
    {
        $dosen = $this->makeUser('dosen');
        $mhs = $this->makeUser('mhs');

        $res = $this->actingAs($dosen)->post('/courses', [
            'code' => 'IF999',
            'name' => 'Kelas Uji',
            'sks' => 2,
        ]);

        $res->assertRedirect();
        $this->assertDatabaseHas('courses', ['code' => 'IF999', 'dosen_id' => $dosen->id]);

        $course = Course::where('code', 'IF999')->first();
        $this->assertNotEmpty($course->class_code);

        $res2 = $this->actingAs($mhs)->post('/courses', [
            'code' => 'IF998',
            'name' => 'Kelas Nakal',
        ]);
        $res2->assertForbidden();
    }

    #[Test]
    public function mhs_bisa_gabung_via_kode_dan_lihat_kelas(): void
    {
        $dosen = $this->makeUser('dosen');
        $mhs = $this->makeUser('mhs');

        $course = Course::create([
            'code' => 'IF100',
            'name' => 'Kelas Gabung',
            'dosen_id' => $dosen->id,
        ]);

        // Belum enroll: tidak bisa lihat
        $this->actingAs($mhs)->get("/courses/{$course->id}")->assertForbidden();

        // Kode salah
        $this->actingAs($mhs)->post('/courses/join', ['class_code' => 'SALAH123'])
            ->assertSessionHas('error');

        // Kode benar
        $res = $this->actingAs($mhs)->post('/courses/join', ['class_code' => $course->class_code]);
        $res->assertRedirect("/courses/{$course->id}");
        $this->assertDatabaseHas('enrollments', ['course_id' => $course->id, 'student_id' => $mhs->id]);

        // Sudah enroll: bisa lihat
        $this->actingAs($mhs)->get("/courses/{$course->id}")->assertOk();
    }

    #[Test]
    public function materi_hanya_dosen_pengampu_diskusi_boleh_anggota(): void
    {
        $dosen = $this->makeUser('dosen');
        $mhs = $this->makeUser('mhs');

        $course = Course::create(['code' => 'IF200', 'name' => 'Kelas Materi', 'dosen_id' => $dosen->id]);
        $course->enrollments()->create(['student_id' => $mhs->id, 'status' => 'active', 'enrolled_at' => now()]);

        // Mhs tidak boleh posting materi
        $this->actingAs($mhs)->post("/courses/{$course->id}/materials", [
            'title' => 'Nakal',
            'type' => 'doc',
        ])->assertForbidden();

        // Dosen boleh
        $this->actingAs($dosen)->post("/courses/{$course->id}/materials", [
            'title' => 'Slide 1',
            'type' => 'doc',
            'body' => 'Isi',
        ])->assertSessionHasNoErrors();
        $this->assertDatabaseHas('materials', ['course_id' => $course->id, 'title' => 'Slide 1']);

        // Mhs anggota boleh diskusi
        $this->actingAs($mhs)->post("/courses/{$course->id}/discussions", [
            'body' => 'Halo kelas!',
        ])->assertSessionHasNoErrors();
        $this->assertDatabaseHas('discussions', ['course_id' => $course->id, 'body' => 'Halo kelas!']);
    }

    #[Test]
    public function tamu_tidak_bisa_akses_kelas(): void
    {
        $this->get('/courses')->assertRedirect('/login');
    }
}
