<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique(); // kode MK, mis. IF101
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('sks')->default(2);
            $table->foreignId('dosen_id')->constrained('users')->cascadeOnDelete();
            $table->string('semester', 20)->default('Ganjil');
            $table->string('academic_year', 15)->default('2026/2027');
            $table->string('class_code', 10)->unique(); // kode enroll ala Classroom
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['dosen_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
