<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🔐 Seeding roles and permissions...');

        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Example permissions — adjust or extend as needed for your app
        $permissions = [
            'manage users',
            'view reports',
            'edit settings',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Roles used in UserSeeder
        $roles = [
            'Super Administrador' => ['manage users', 'view reports', 'edit settings'],
            'Administrador' => ['view reports'],
        ];

        foreach ($roles as $roleName => $perms) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->syncPermissions($perms);
            $this->command->info("✓ Role created: {$roleName}");
        }

        $this->command->info('✅ Roles and permissions seeded.');
    }
}
