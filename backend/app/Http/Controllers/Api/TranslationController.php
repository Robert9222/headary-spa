<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TranslationController extends Controller
{
    /**
     * Admin: translate a single piece of text using MyMemory free API.
     * Body: { text: string, source: 'pl'|'en'|'fi', target: 'pl'|'en'|'fi' }
     * Returns: { translated: string }
     */
    public function translate(Request $request)
    {
        $data = $request->validate([
            'text'   => 'required|string|max:5000',
            'source' => 'required|string|size:2',
            'target' => 'required|string|size:2',
        ]);

        if ($data['source'] === $data['target'] || trim($data['text']) === '') {
            return response()->json(['translated' => $data['text']]);
        }

        try {
            $response = Http::timeout(20)->get('https://api.mymemory.translated.net/get', [
                'q'        => $data['text'],
                'langpair' => $data['source'] . '|' . $data['target'],
                'de'       => config('mail.from.address', 'admin@headary-spa.local'),
            ]);

            if (!$response->ok()) {
                return response()->json([
                    'error'      => 'Translation service unavailable.',
                    'translated' => $data['text'],
                ], 502);
            }

            $body = $response->json();
            $translated = $body['responseData']['translatedText'] ?? $data['text'];

            return response()->json([
                'translated' => $translated,
                'match'      => $body['responseData']['match'] ?? null,
            ]);
        } catch (\Throwable $e) {
            Log::warning('Translation failed: ' . $e->getMessage());
            return response()->json([
                'error'      => 'Translation failed: ' . $e->getMessage(),
                'translated' => $data['text'],
            ], 502);
        }
    }
}

