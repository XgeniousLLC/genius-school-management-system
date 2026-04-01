<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolSetting extends Model
{
    protected $table = 'school_settings';

    protected $fillable = ['school_id', 'key', 'value', 'group'];

    /**
     * Get a setting value for a school.
     */
    public static function get(int $schoolId, string $key, mixed $default = null): mixed
    {
        return static::where('school_id', $schoolId)->where('key', $key)->value('value') ?? $default;
    }

    /**
     * Set a setting value for a school.
     */
    public static function set(int $schoolId, string $key, mixed $value, string $group = 'general'): void
    {
        static::updateOrCreate(
            ['school_id' => $schoolId, 'key' => $key],
            ['value' => $value, 'group' => $group],
        );
    }

    /**
     * Get all settings for a school as a flat key→value array.
     */
    public static function allFor(int $schoolId): array
    {
        return static::where('school_id', $schoolId)->pluck('value', 'key')->toArray();
    }
}
