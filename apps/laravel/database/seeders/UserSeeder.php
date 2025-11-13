<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('👤 Creating users...');

        // Create a specific super admin user
        $superAdmin = User::create([
            'name' => 'Super Administrador',
            'email' => 'superadmin@bluebaymechanical.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $superAdmin->assignRole('Super Administrador');
        $this->command->info('✓ Created super admin user (superadmin@bluebaymechanical.com)');

        // Create a specific admin user
        $admin = User::create([
            'name' => 'Admin Principal',
            'email' => 'admin@bluebaymechanical.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('Administrador');
        $this->command->info('✓ Created admin user (admin@bluebaymechanical.com)');
    }
}
