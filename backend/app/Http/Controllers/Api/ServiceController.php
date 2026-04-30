<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::where('is_active', true)->orderBy('order')->get();
        return response()->json($services->map(fn($s) => $this->formatService($s)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|unique:services',
            'category' => 'nullable|string',
            'description' => 'nullable|string',
            'duration_minutes' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'image_url' => 'nullable|string',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $service = Service::create($validated);
        return response()->json($service, 201);
    }

    public function show(Service $service)
    {
        return response()->json($this->formatService($service));
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name' => 'sometimes|unique:services,name,' . $service->id,
            'category' => 'nullable|string',
            'description' => 'nullable|string',
            'duration_minutes' => 'sometimes|integer|min:1',
            'price' => 'sometimes|numeric|min:0',
            'image_url' => 'nullable|string',
            'order' => 'nullable|integer',
            'is_active' => 'sometimes|boolean',
        ]);

        $service->update($validated);
        return response()->json($service);
    }

    public function destroy(Service $service)
    {
        $service->delete();
        return response()->json(null, 204);
    }

    private function formatService(Service $service): array
    {
        $data = $service->toArray();
        $data['name'] = $service->name;
        $data['description'] = $service->description;
        return $data;
    }
}
