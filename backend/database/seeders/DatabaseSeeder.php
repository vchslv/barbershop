<?php

namespace Database\Seeders;

use App\Models\Barber;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedAdmin();

        if (Service::query()->exists() || Barber::query()->exists()) {
            return;
        }

        Service::insert([
            [
                'name' => 'Classic haircut',
                'description' => 'Clipper and scissors cut with styling',
                'duration_minutes' => 45,
                'price' => 35,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Haircut + beard',
                'description' => 'Full service: haircut and beard shaping',
                'duration_minutes' => 60,
                'price' => 50,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Beard trim',
                'description' => 'Beard shaping and trim',
                'duration_minutes' => 30,
                'price' => 20,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Kids haircut',
                'description' => 'Haircut for kids under 12',
                'duration_minutes' => 30,
                'price' => 25,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        Barber::insert([
            [
                'name' => 'Alex',
                'specialty' => 'Classic cuts and fades',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Daniel',
                'specialty' => 'Beards and mustaches',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Sam',
                'specialty' => 'Modern styles',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    private function seedAdmin(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@barbershop.test');
        $password = env('ADMIN_PASSWORD', 'admin123');

        User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Admin',
                'phone' => null,
                'password' => Hash::make($password),
                'role' => User::ROLE_ADMIN,
            ]
        );
    }
}
