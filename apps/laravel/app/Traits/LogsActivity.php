<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

trait LogsActivity
{
    public static function bootLogsActivity()
    {
        static::created(function ($model) {
            $model->logCreatedEvent($model);
        });
        
        static::updated(function ($model) {
            $model->logUpdatedEvent($model);
        });

        static::deleted(function ($model) {
            $model->logDeletedEvent($model);
        });
    }

    /**
     * Log the created event for a model.
     */
    protected function logCreatedEvent($model)
    {
        $modelAttributes = $this->getAttributes();
        $excludedLogFields = $this->getExcludedLogFields();
        
        $logData = [];
        foreach ($modelAttributes as $field => $value) {
            if (in_array($field, $excludedLogFields)) {
                continue;
            }

            if ($this->isForeignKey($field)) {
                $relatedValue = $this->getRelatedModelAttribute($model, $field, 'name', $value);
                $logData[$field] = $relatedValue ?? 'Unknown';
            } else {
                $logData[$field] = $this->maskSensitiveField($field, $value);
            }
        }

        $entityName = $this->getEntityName();
        $description = $this->getCreatedDescription($model);

        $this->createActivityLog([
            'action' => 'CREATED',
            'entity' => $entityName,
            'description' => $description,
            'json_log' => [
                'data' => ['new' => $logData],
                'action' => 'CREATED',
                'entity' => $entityName,
                'metadata' => $this->getMetadata(),
                'timestamp' => now()->toISOString(),
                'description' => $description
            ]
        ]);
    }

    /**
     * Log the updated event for a model.
     */
    protected function logUpdatedEvent($model)
    {
        $updatedData = $model->getDirty();
        $originalData = $model->getOriginal();
        $excludedLogFields = $this->getExcludedLogFields();

        $changes = [];
        foreach ($updatedData as $field => $newValue) {
            if (in_array($field, $excludedLogFields)) {
                continue;
            }

            if ($this->isForeignKey($field)) {
                $oldRelatedValue = $this->getRelatedModelAttribute($model, $field, 'name', $originalData[$field]);
                $newRelatedValue = $this->getRelatedModelAttribute($model, $field, 'name', $newValue);
                
                $changes[$field] = [
                    'old' => $oldRelatedValue ?? 'Unknown',
                    'new' => $newRelatedValue ?? 'Unknown',
                ];
            } else {
                $changes[$field] = [
                    'old' => $this->maskSensitiveField($field, $originalData[$field]),
                    'new' => $this->maskSensitiveField($field, $newValue),
                ];
            }
        }

        if (!empty($changes)) {
            $entityName = $this->getEntityName();
            $description = $this->getUpdatedDescription($model, $changes);

            $this->createActivityLog([
                'action' => 'UPDATED',
                'entity' => $entityName,
                'description' => $description,
                'json_log' => [
                    'data' => [
                        'old' => array_map(fn($change) => $change['old'], $changes),
                        'new' => array_map(fn($change) => $change['new'], $changes)
                    ],
                    'action' => 'UPDATED',
                    'entity' => $entityName,
                    'metadata' => $this->getMetadata(),
                    'timestamp' => now()->toISOString(),
                    'description' => $description
                ]
            ]);
        }
    }

    /**
     * Log the deleted event for a model.
     */
    protected function logDeletedEvent($model)
    {
        $modelAttributes = $model->getAttributes();
        $excludedLogFields = $this->getExcludedLogFields();

        $logData = [];
        foreach ($modelAttributes as $field => $value) {
            if (in_array($field, $excludedLogFields)) {
                continue;
            }

            if ($this->isForeignKey($field)) {
                $relatedValue = $this->getRelatedModelAttribute($model, $field, 'name', $value);
                $logData[$field] = $relatedValue ?? 'Unknown';
            } else {
                $logData[$field] = $this->maskSensitiveField($field, $value);
            }
        }

        $entityName = $this->getEntityName();
        $description = $this->getDeletedDescription($model);

        $this->createActivityLog([
            'action' => 'DELETED',
            'entity' => $entityName,
            'description' => $description,
            'json_log' => [
                'data' => ['old' => $logData],
                'action' => 'DELETED',
                'entity' => $entityName,
                'metadata' => $this->getMetadata(),
                'timestamp' => now()->toISOString(),
                'description' => $description
            ]
        ]);
    }

    /**
     * Create the activity log record.
     */
    protected function createActivityLog($data)
    {
        ActivityLog::create([
            'user_id' => 1,
            'loggable_type' => get_class($this),
            'loggable_id' => $this->id,
            'action' => $data['action'],
            'entity' => $data['entity'],
            'description' => $data['description'],
            'json_log' => $data['json_log'],
            'datetime' => now(),
        ]);
    }

    /**
     * Get fields to exclude from activity logging.
     * Override in individual models as needed.
     */
    protected function getExcludedLogFields()
    {
        $defaultExcluded = ['id', 'created_at', 'updated_at'];
        
        if (method_exists($this, 'getCustomExcludedLogFields')) {
            return array_merge($defaultExcluded, $this->getCustomExcludedLogFields());
        }
        
        return $defaultExcluded;
    }

    /**
     * Check if a field is a foreign key.
     */
    protected function isForeignKey($field)
    {
        return Str::endsWith($field, '_id');
    }

    /**
     * Get related model attribute value.
     */
    protected function getRelatedModelAttribute($model, $field, $attribute = 'name', $value = null)
    {
        if (!$value) {
            return null;
        }

        // Remove _id suffix to get relation name
        $relationName = Str::beforeLast($field, '_id');
        
        try {
            // Get the model class for this relation
            $modelClass = $this->getModelClassFromRelation($relationName);
            
            if ($modelClass && class_exists($modelClass)) {
                $relatedModel = $modelClass::find($value);
                
                if ($relatedModel && isset($relatedModel->$attribute)) {
                    return $relatedModel->$attribute;
                }
            }
        } catch (\Exception $e) {
            // Log the error or handle it as needed
            return null;
        }

        return null;
    }

    /**
     * Get model class from relation name.
     */
    protected function getModelClassFromRelation($relationName)
    {
        // Convert relation name to StudlyCase for the model class
        $modelClassName = Str::studly(Str::singular($relationName));

        // Define the default namespace for models
        $defaultNamespace = 'App\\Models\\';

        // Complete model class with namespace
        $fullModelClass = $defaultNamespace . $modelClassName;

        // Check if the class exists
        if (class_exists($fullModelClass)) {
            return $fullModelClass;
        }

        return null;
    }

    /**
     * Mask sensitive fields.
     */
    protected function maskSensitiveField($field, $value)
    {
        $sensitiveFields = ['password', 'card_number', 'cvv', 'ssn'];
        
        if (in_array(strtolower($field), $sensitiveFields)) {
            if ($field === 'card_number') {
                return str_repeat('*', strlen($value) - 4) . substr($value, -4);
            }
            if ($field === 'cvv') {
                return '***';
            }
            return '***MASKED***';
        }

        return $value;
    }

    /**
     * Get entity name for logging.
     */
    protected function getEntityName()
    {
        return Str::plural(Str::snake(class_basename($this)));
    }

    /**
     * Get metadata for logging.
     */
    protected function getMetadata()
    {
        return [
            'server' => gethostname(),
            'database' => config('database.connections.mysql.database', 'unknown'),
        ];
    }

    /**
     * Get created description.
     */
    protected function getCreatedDescription($model)
    {
        $entityName = Str::title(str_replace('_', ' ', Str::singular($this->getEntityName())));
        return "{$entityName} created: ID {$model->id}";
    }

    /**
     * Get updated description.
     */
    protected function getUpdatedDescription($model, $changes)
    {
        $entityName = Str::title(str_replace('_', ' ', Str::singular($this->getEntityName())));
        return "{$entityName} updated: ID {$model->id}";
    }

    /**
     * Get deleted description.
     */
    protected function getDeletedDescription($model)
    {
        $entityName = Str::title(str_replace('_', ' ', Str::singular($this->getEntityName())));
        return "{$entityName} deleted: ID {$model->id}";
    }
}
