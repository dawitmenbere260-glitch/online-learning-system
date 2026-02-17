<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckBlocked
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->isBlocked()) {
            return response()->json([
                'message' => 'Your account has been blocked. Please contact support.'
            ], 403);
        }

        return $next($request);
    }
}
