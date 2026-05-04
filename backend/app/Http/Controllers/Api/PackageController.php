<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PackageController extends Controller
{
    public function index(Request $request)
    {
        $query = Package::query()->orderBy('id');

        // Admins (authenticated via sanctum) see ALL packages, including inactive ones.
        // Public requests get only active packages.
        if (! Auth::guard('sanctum')->check()) {
            $query->where('is_active', true);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:packages',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_minutes' => 'required|integer|min:1',
            'service_ids' => 'nullable|array',
            'service_ids.*' => 'integer|exists:services,id',
            'is_active' => 'sometimes|boolean',
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
            'name' => 'sometimes|string|unique:packages,name,' . $package->id,
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'duration_minutes' => 'sometimes|integer|min:1',
            'service_ids' => 'nullable|array',
            'service_ids.*' => 'integer|exists:services,id',
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
