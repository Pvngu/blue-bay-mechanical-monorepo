<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Scheduling extends Model
{
    use HasFactory;

    protected $table = 'scheduling';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'job_number',
        'client_id',
        'technician_id',
        'title',
        'description',
        'service_type',
        'status',
        'priority',
        'scheduled_date',
        'scheduled_time',
        'estimated_duration',
        'actual_start_time',
        'actual_end_time',
        'location_address',
        'location_lat',
        'location_lng',
        'notes',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'scheduled_time' => 'string',
        'estimated_duration' => 'integer',
        'actual_start_time' => 'datetime',
        'actual_end_time' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(Technician::class);
    }

    /**
     * Get service history records for this job.
     */
    public function serviceHistories()
    {
        return $this->hasMany(\App\Models\ServiceHistory::class, 'job_id');
    }
}
