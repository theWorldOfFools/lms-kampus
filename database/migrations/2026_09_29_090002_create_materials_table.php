<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // penulis (dosen)
            $table->string('title');
            $table->text('body')->nullable();
            $table->string('type', 20)->default('doc'); // file|link|video|doc
            $table->string('file_path')->nullable();
            $table->string('link_url')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['course_id', 'published_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};
