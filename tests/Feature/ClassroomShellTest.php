<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ClassroomShellTest extends TestCase
{
    use RefreshDatabase;
    #[Test]
    public function halaman_welcome_terrender_via_inertia(): void
    {
        $res = $this->get('/');

        $res->assertOk();
        $res->assertInertia(fn (Assert $page) => $page
            ->component('Welcome')
            ->has('appName'));
    }

    #[Test]
    public function dashboard_tamu_dialihkan_ke_login(): void
    {
        $res = $this->get('/dashboard');

        $res->assertRedirect('/login');
    }

    #[Test]
    public function dashboard_user_login_terrender_via_inertia(): void
    {
        $user = User::factory()->create(['role' => 'mhs']);

        $res = $this->actingAs($user)->get('/dashboard');

        $res->assertOk();
        $res->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->has('stats'));
    }
}
