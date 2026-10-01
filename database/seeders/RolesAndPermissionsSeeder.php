<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'course.create',
            'course.manage',
            'course.join',
            'material.manage',
            'discussion.manage',
            'meeting.create',
            'meeting.join',
            'meeting.manage',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $dosen = Role::firstOrCreate(['name' => 'dosen', 'guard_name' => 'web']);
        $mhs = Role::firstOrCreate(['name' => 'mhs', 'guard_name' => 'web']);

        $admin->syncPermissions($permissions);
        $dosen->syncPermissions(['course.create', 'course.manage', 'material.manage', 'discussion.manage', 'course.join', 'meeting.create', 'meeting.join', 'meeting.manage']);
        $mhs->syncPermissions(['course.join', 'meeting.create', 'meeting.join']);
    }
}
