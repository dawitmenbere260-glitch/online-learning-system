<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InstructorMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || (!$request->user()->isInstructor() && !$request->user()->isAdmin())) {
            return response()->json(['message' => 'Unauthorized. Instructor access required.'], 403);
        }

        return $next($request);
    }
}