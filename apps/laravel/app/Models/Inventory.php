<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Inventory extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'inventory_code',
        'part_name',
        'part_number',
        'category',
        'stock',
        'min_stock',
        'location',
        'unit_price',
        'supplier',
        'supplier_contact',
        'last_restocked',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'stock' => 'integer',
        'min_stock' => 'integer',
        'unit_price' => 'decimal:2',
        'last_restocked' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Boot: assign UUID when creating if not provided.
     */
    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    /**
     * Get transactions for the inventory item.
     */
    public function transactions()
    {
        return $this->hasMany(\App\Models\InventoryTransaction::class, 'inventory_id');
    }
}
