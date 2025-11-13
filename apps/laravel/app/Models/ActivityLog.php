<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    protected $table = 'activity_logs';

    protected $fillable = [
        'user_id',
        'loggable_type',
        'loggable_id',
        'action',
        'entity',
        'description',
        'json_log',
        'datetime',
    ];

    protected $casts = [
        'json_log' => 'array',
        'datetime' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function loggable(): MorphTo
    {
        return $this->morphTo();
    }

    public function scopeForModel($query, $model)
    {
        return $query->where('loggable_type', get_class($model))
                    ->where('loggable_id', $model->id);
    }

    public function scopeForAction($query, $action)
    {
        return $query->where('action', $action);
    }

    public function scopeForEntity($query, $entity)
    {
        return $query->where('entity', $entity);
    }

    public function scopeWhereDatetimeFrom($query, $datetime)
    {
        return $query->where('datetime', '>=', $datetime);
    }

    public function scopeWhereDatetimeTo($query, $datetime)
    {
        return $query->where('datetime', '<=', $datetime);
    }
}
