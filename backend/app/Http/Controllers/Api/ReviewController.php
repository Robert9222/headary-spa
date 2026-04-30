<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::query();
        if ($request->has('approved') || $request->has('is_approved')) {
            $query->where('is_approved', $request->boolean('approved') || $request->boolean('is_approved'));
        }
        if ($request->has('featured') || $request->has('is_featured')) {
            $query->where('is_featured', $request->boolean('featured') || $request->boolean('is_featured'));
        }
        return $query->with('service')->latest()->get()->map(function ($review) {
            $data = $review->toArray();
            $data['content'] = $review->getTranslations('content');
            if (isset($data['service'])) {
                $data['service']['name'] = $review->service->name ?? null;
            }
            return $data;
        });
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'client_name' => 'required|string|max:255',
            'client_email' => 'required|email|max:255',
            'service_id' => 'required|exists:services,id',
            'rating' => 'required|integer|min:1|max:5',
            'content' => 'required|array',
            'language' => 'nullable|string|in:pl,en,fi',
            'is_approved' => 'boolean',
            'is_featured' => 'boolean',
        ]);
        $review = Review::create($data);
        return response()->json($review->fresh(['service']), 201);
    }

    public function show(Review $review)
    {
        return $review->load('service');
    }

    public function update(Request $request, Review $review)
    {
        $data = $request->validate([
            'client_name' => 'sometimes|string|max:255',
            'client_email' => 'sometimes|email|max:255',
            'service_id' => 'sometimes|exists:services,id',
            'rating' => 'sometimes|integer|min:1|max:5',
            'content' => 'sometimes|array',
            'language' => 'nullable|string|in:pl,en,fi',
            'is_approved' => 'boolean',
            'is_featured' => 'boolean',
        ]);
        $review->update($data);
        return response()->json($review->fresh(['service']));
    }

    public function destroy(Review $review)
    {
        $review->delete();
        return response()->noContent();
    }
}

