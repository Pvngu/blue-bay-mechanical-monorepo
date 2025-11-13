<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkOrder extends Model
{
    use HasFactory;

    protected $table = 'work_orders';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'work_order_number',
        'job_id',
        'client_id',
        'technician_id',
        'title',
        'description',
        'status',
        'priority',
        'scheduled_date',
        'completed_date',
        'technician_notes',
        'client_signature',
        'signature_date',
        'labor_hours',
        'labor_cost',
        'parts_cost',
        'total_cost',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'completed_date' => 'datetime',
        'signature_date' => 'datetime',
        'labor_hours' => 'decimal:2',
        'labor_cost' => 'decimal:2',
        'parts_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(Scheduling::class, 'job_id');
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
     * Get photos for the work order.
     */
    public function photos()
    {
        return $this->hasMany(WorkOrderPhoto::class, 'work_order_id');
    }

    /**
     * Get service history records for this work order.
     */
    public function serviceHistories()
    {
        return $this->hasMany(\App\Models\ServiceHistory::class, 'work_order_id');
    }
}
