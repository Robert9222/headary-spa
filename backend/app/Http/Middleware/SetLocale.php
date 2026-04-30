<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SetLocale
{
    public function handle(Request $request, Closure $next)
    {
        $locale = $request->query('lang')
            ?? $request->header('Accept-Language', 'en');

        // Take first two chars (e.g., "en-US" -> "en")
        $locale = substr($locale, 0, 2);

        if (in_array($locale, ['en', 'pl', 'fi'])) {
            app()->setLocale($locale);
        }

        return $next($request);
    }
}

