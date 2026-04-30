<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    public function index()
    {
        return response()->json(Package::where('is_active', true)->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|unique:packages',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_minutes' => 'required|integer|min:1',
            'service_ids' => 'nullable|array',
        ]);

        $package = Package::create($validated);
        return response()->json($package, 201);
    }

    public function show(Package $package)
    {
        return response()->json($package);
    }

    public function update(Request $request, Package $package)
    {
        $validated = $request->validate([
            'name' => 'sometimes|unique:packages,name,' . $package->id,
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'duration_minutes' => 'sometimes|integer|min:1',
            'service_ids' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
        ]);

        $package->update($validated);
        return response()->json($package);
    }

    public function destroy(Package $package)
    {
        $package->delete();
        return response()->json(null, 204);
    }
}
