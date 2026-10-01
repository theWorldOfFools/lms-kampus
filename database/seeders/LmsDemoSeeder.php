<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class LmsDemoSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@kampus.ac.id'],
            [
                'name' => 'Admin Kampus',
                'nim_nidn' => 'ADM001',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );
        $admin->assignRole('admin');

        $budi = User::firstOrCreate(
            ['email' => 'budi@kampus.ac.id'],
            [
                'name' => 'Dr. Budi Santoso',
                'nim_nidn' => 'D001',
                'password' => Hash::make('password'),
                'role' => 'dosen',
            ]
        );
        $budi->assignRole('dosen');

        $siti = User::firstOrCreate(
            ['email' => 'siti@kampus.ac.id'],
            [
                'name' => 'Dr. Siti Aminah',
                'nim_nidn' => 'D002',
                'password' => Hash::make('password'),
                'role' => 'dosen',
            ]
        );
        $siti->assignRole('dosen');

        $students = collect();
        for ($i = 1; $i <= 30; $i++) {
            $nim = 'MHS'.str_pad((string) $i, 3, '0', STR_PAD_LEFT);
            $user = User::firstOrCreate(
                ['email' => "mhs{$i}@student.kampus.ac.id"],
                [
                    'name' => 'Mahasiswa '.str_pad((string) $i, 2, '0', STR_PAD_LEFT),
                    'nim_nidn' => $nim,
                    'password' => Hash::make('password'),
                    'role' => 'mhs',
                ]
            );
            $user->assignRole('mhs');
            $students->push($user);
        }

        $coursesData = [
            [
                'code' => 'IF101',
                'name' => 'Pengantar Informatika',
                'description' => 'Konsep dasar informatika, algoritma, dan sistem komputer.',
                'sks' => 3,
                'dosen_id' => $budi->id,
                'members' => $students->slice(0, 15),
            ],
            [
                'code' => 'IF102',
                'name' => 'Struktur Data',
                'description' => 'Array, linked list, stack, queue, tree, dan graph.',
                'sks' => 3,
                'dosen_id' => $budi->id,
                'members' => $students->slice(15, 15),
            ],
            [
                'code' => 'MK201',
                'name' => 'Basis Data',
                'description' => 'Model relasional, SQL, normalisasi, dan PostgreSQL.',
                'sks' => 3,
                'dosen_id' => $siti->id,
                'members' => $students,
            ],
        ];

        foreach ($coursesData as $c) {
            /** @var Course $course */
            $course = Course::firstOrCreate(
                ['code' => $c['code']],
                [
                    'name' => $c['name'],
                    'description' => $c['description'],
                    'sks' => $c['sks'],
                    'dosen_id' => $c['dosen_id'],
                    'semester' => 'Ganjil',
                    'academic_year' => '2026/2027',
                ]
            );

            foreach ($c['members'] as $student) {
                $course->enrollments()->firstOrCreate(
                    ['student_id' => $student->id],
                    ['status' => 'active', 'enrolled_at' => now()]
                );
            }

            $course->materials()->firstOrCreate(
                ['title' => 'Silabus & Kontrak Kuliah'],
                [
                    'user_id' => $course->dosen_id,
                    'body' => 'Silabus, aturan penilaian, dan jadwal pertemuan.',
                    'type' => 'doc',
                    'published_at' => now(),
                ]
            );
            $course->materials()->firstOrCreate(
                ['title' => 'Slide Pertemuan 1'],
                [
                    'user_id' => $course->dosen_id,
                    'body' => 'Pengantar dan motivasi mata kuliah.',
                    'type' => 'doc',
                    'published_at' => now(),
                ]
            );

            $d1 = $course->discussions()->firstOrCreate(
                ['body' => 'Selamat datang di kelas '.$course->name.'! Perkenalkan diri kalian di thread ini.'],
                ['user_id' => $course->dosen_id]
            );
            $firstStudent = $c['members']->first();
            if ($firstStudent) {
                $d1->replies()->firstOrCreate(
                    ['body' => 'Hadir, saya '.$firstStudent->name.'. Siap mengikuti perkuliahan!'],
                    ['course_id' => $course->id, 'user_id' => $firstStudent->id]
                );
            }
        }
    }
}
