<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PageSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PageSectionController extends Controller
{
    /**
     * Public: list active sections for a page, ordered.
     */
    public function indexByPage(string $pageKey)
    {
        $sections = PageSection::forPage($pageKey)
            ->where('is_active', true)
            ->get()
            ->map(fn ($s) => $this->serialize($s));

        return response()->json($sections);
    }

    /**
     * Admin: list ALL sections (incl. inactive) for a page.
     */
    public function adminIndexByPage(string $pageKey)
    {
        $sections = PageSection::forPage($pageKey)
            ->get()
            ->map(fn ($s) => $this->serialize($s));

        return response()->json($sections);
    }

    public function show(PageSection $pageSection)
    {
        return response()->json($this->serialize($pageSection));
    }

    public function store(Request $request)
    {
        $validated = $this->validated($request);
        $section = PageSection::create($validated);
        return response()->json($this->serialize($section), 201);
    }

    public function update(Request $request, PageSection $pageSection)
    {
        $validated = $this->validated($request, $pageSection->id);
        $pageSection->update($validated);
        return response()->json($this->serialize($pageSection->fresh()));
    }

    public function destroy(PageSection $pageSection)
    {
        $pageSection->delete();
        return response()->json(null, 204);
    }

    /**
     * Admin: bulk reorder.
     * Expects: { items: [{id, order}, ...] }
     */
    public function reorder(Request $request)
    {
        $data = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:page_sections,id',
            'items.*.order' => 'required|integer',
        ]);

        foreach ($data['items'] as $item) {
            PageSection::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return response()->json(['message' => 'Reordered.']);
    }

    /**
     * Admin: upload section image, returns public URL.
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:5120', // 5 MB
        ]);

        $path = $request->file('image')->store('page-sections', 'public');
        $url = Storage::disk('public')->url($path);

        return response()->json([
            'path' => $path,
            'image_url' => $url,
        ]);
    }

    /* ----------------------------- helpers ----------------------------- */

    private function validated(Request $request, ?int $id = null): array
    {
        $uniqueRule = 'unique:page_sections,section_key,NULL,id,page_key,' . $request->input('page_key', '');
        if ($id) {
            $uniqueRule = 'unique:page_sections,section_key,' . $id . ',id,page_key,' . $request->input('page_key', '');
        }

        return $request->validate([
            'page_key' => 'required|string|max:100',
            'section_key' => ['required', 'string', 'max:100', $uniqueRule],
            'type' => 'required|string|in:hero,rich-text,two-column-lists,list,warning-list,cta',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'image_url' => 'nullable|string',
            'title' => 'nullable|array',
            'subtitle' => 'nullable|array',
            'body' => 'nullable|array',
            'content' => 'nullable|array',
            'meta' => 'nullable|array',
        ]);
    }

    /**
     * Return all translations (frontend picks language).
     */
    private function serialize(PageSection $s): array
    {
        return [
            'id' => $s->id,
            'page_key' => $s->page_key,
            'section_key' => $s->section_key,
            'type' => $s->type,
            'order' => $s->order,
            'is_active' => $s->is_active,
            'image_url' => $s->image_url,
            'title' => $s->getTranslations('title'),
            'subtitle' => $s->getTranslations('subtitle'),
            'body' => $s->getTranslations('body'),
            'content' => $s->getTranslations('content'),
            'meta' => $s->meta,
            'created_at' => $s->created_at,
            'updated_at' => $s->updated_at,
        ];
    }
}

