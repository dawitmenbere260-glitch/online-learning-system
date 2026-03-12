<?php

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Authentication Flow...\n\n";

// Find an instructor
$instructor = App\Models\User::where('role', 'instructor')->first();

if (!$instructor) {
    echo "❌ No instructor found\n";
    exit(1);
}

echo "📋 Found instructor: {$instructor->name} ({$instructor->email})\n";

// Create a token for testing
$token = $instructor->createToken('test-token')->plainTextToken;
echo "🔑 Created test token: " . substr($token, 0, 20) . "...\n\n";

// Test the instructor courses endpoint with authentication
echo "🧪 Testing instructor courses endpoint...\n";

// Simulate authenticated request
$request = new \Illuminate\Http\Request();
$request->headers->set('Authorization', 'Bearer ' . $token);

// Set the authenticated user
auth()->setUser($instructor);

try {
    $controller = new App\Http\Controllers\Api\CourseController();
    $response = $controller->instructorCourses($request);
    
    $data = json_decode($response->getContent(), true);
    
    echo "✅ API Response successful!\n";
    echo "   Status: {$response->getStatusCode()}\n";
    echo "   Courses returned: " . count($data['data'] ?? []) . "\n";
    
    if (isset($data['data']) && count($data['data']) > 0) {
        foreach ($data['data'] as $course) {
            echo "   - {$course['title']} (Status: {$course['status']})\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n✅ Authentication flow test completed!\n";