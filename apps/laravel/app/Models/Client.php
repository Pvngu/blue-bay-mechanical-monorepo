<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'client_code',
        'name',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'preferred_contact',
        'preferred_language',
        'service_history_count',
        'last_service_date',
        'notes',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'service_history_count' => 'integer',
        'last_service_date' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Get the jobs for the client.
     */
    public function jobs(): HasMany
    {
        return $this->hasMany(Job::class);
    }

    /**
     * Get service history records for the client.
     */
    public function serviceHistories()
    {
        return $this->hasMany(\App\Models\ServiceHistory::class, 'client_id');
    }
}
