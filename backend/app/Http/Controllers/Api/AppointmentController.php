<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index()
    {
        return response()->json(Appointment::with(['client', 'service', 'employee'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'service_id' => 'required|exists:services,id',
            'employee_id' => 'nullable|exists:employees,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'status' => 'in:pending,confirmed,completed,cancelled',
            'notes' => 'nullable|string',
            'phone' => 'required|string',
            'email' => 'required|email',
            'name' => 'required|string',
        ]);

        // Jeśli brak client_id, tworzymy klienta
        if (!isset($validated['client_id'])) {
            $client = \App\Models\Client::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
            ]);
            $validated['client_id'] = $client->id;
        }

        unset($validated['name']);

        $appointment = Appointment::create($validated);
        return response()->json($appointment->load(['client', 'service', 'employee']), 201);
    }

    public function show(Appointment $appointment)
    {
        return response()->json($appointment->load(['client', 'service', 'employee']));
    }

    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,confirmed,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        $appointment->update($validated);
        return response()->json($appointment->load(['client', 'service', 'employee']));
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();
        return response()->json(null, 204);
    }
}
