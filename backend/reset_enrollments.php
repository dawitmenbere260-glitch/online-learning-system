<?php

/**
 * Reset all enrollment progress to 0%
 * Run this script from the backend directory: php reset_enrollments.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Enrollment;

echo "Resetting all enrollment progress to 0%...\n";

$updated = Enrollment::query()->update([
    'progress' => 0,
    'completed_at' => null,
]);

echo "Successfully reset {$updated} enrollment(s) to 0% progress.\n";
echo "All enrollments now start at 0%.\n";
