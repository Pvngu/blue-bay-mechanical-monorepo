<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Job extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'service_jobs';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'job_code',
        'client_id',
        'technician_id',
        'address',
        'scheduled_date',
        'scheduled_time',
        'estimated_duration_minutes',
        'status',
        'priority',
        'description',
        'completion_notes',
        'completed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'scheduled_date' => 'date',
        'estimated_duration_minutes' => 'integer',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the client that owns the job.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the technician that owns the job.
     */
    public function technician(): BelongsTo
    {
        return $this->belongsTo(Technician::class);
    }

    /**
     * Scope a query to filter by scheduled_date from.
     */
    public function scopeScheduledDateFrom($query, $date)
    {
        return $query->where('scheduled_date', '>=', $date);
    }

    /**
     * Scope a query to filter by scheduled_date to.
     */
    public function scopeScheduledDateTo($query, $date)
    {
        return $query->where('scheduled_date', '<=', $date);
    }
}
