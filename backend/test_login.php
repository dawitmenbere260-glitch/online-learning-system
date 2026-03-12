<?php

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Login Flow...\n\n";

// Find an instructor
$instructor = App\Models\User::where('role', 'instructor')->first();

if (!$instructor) {
    echo "❌ No instructor found\n";
    exit(1);
}

echo "📋 Found instructor: {$instructor->name} ({$instructor->email})\n";

// Test login credentials
$email = $instructor->email;
$password = 'password'; // Default password

echo "🔐 Testing login with email: {$email}\n";

// Simulate login request
$loginData = [
    'email' => $email,
    'password' => $password,
];

try {
    // Attempt to authenticate
    if (Auth::attempt($loginData)) {
        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;
        
        echo "✅ Login successful!\n";
        echo "   User: {$user->name}\n";
        echo "   Role: {$user->role}\n";
        echo "   Token: " . substr($token, 0, 20) . "...\n";
        
        // Test instructor courses with this token
        echo "\n🧪 Testing instructor courses with token...\n";
        
        $request = new \Illuminate\Http\Request();
        $request->headers->set('Authorization', 'Bearer ' . $token);
        
        auth()->setUser($user);
        
        $controller = new App\Http\Controllers\Api\CourseController();
        $response = $controller->instructorCourses($request);
        
        $data = json_decode($response->getContent(), true);
        
        echo "✅ Instructor courses API successful!\n";
        echo "   Status: {$response->getStatusCode()}\n";
        echo "   Courses: " . count($data['data'] ?? []) . "\n";
        
        foreach ($data['data'] ?? [] as $course) {
            echo "   - {$course['title']} (Status: {$course['status']})\n";
        }
        
    } else {
        echo "❌ Login failed - invalid credentials\n";
        echo "💡 Try resetting the password:\n";
        echo "   php artisan tinker\n";
        echo "   User::where('email', '{$email}')->first()->update(['password' => bcrypt('password')]);\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error during login: " . $e->getMessage() . "\n";
}

echo "\n✅ Login test completed!\n";