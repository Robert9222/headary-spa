<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    // Public endpoint - get all settings
    public function getPublic()
    {
        $settings = Setting::all()->keyBy('key');
        return response()->json($settings);
    }

    // Public endpoint - get single setting
    public function get($key)
    {
        $setting = Setting::where('key', $key)->first();

        if (!$setting) {
            return response()->json(['error' => 'Setting not found'], 404);
        }

        return response()->json($setting);
    }

    // Admin endpoint - update setting
    public function update(Request $request, $key)
    {
        $validated = $request->validate([
            'value' => 'required',
            'description' => 'nullable|string',
        ]);

        $setting = Setting::updateOrCreate(
            ['key' => $key],
            $validated
        );

        return response()->json($setting);
    }

    // Admin endpoint - create setting
    public function store(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|unique:settings',
            'value' => 'required',
            'description' => 'nullable|string',
        ]);

        $setting = Setting::create($validated);
        return response()->json($setting, 201);
    }

    // Admin endpoint - delete setting
    public function destroy($key)
    {
        $setting = Setting::where('key', $key)->first();

        if (!$setting) {
            return response()->json(['error' => 'Setting not found'], 404);
        }

        $setting->delete();
        return response()->json(null, 204);
    }
}

