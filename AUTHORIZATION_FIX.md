# Authorization Fix - Course Creation Error

## Problem
When creating courses, the system threw an error:
```
Call to undefined method App\Http\Controllers\Api\CourseController::authorize()
```

## Root Cause
The controllers were using Laravel's `$this->authorize()` method which requires:
1. Policies to be properly registered
2. The `AuthorizesRequests` trait to be included in the controller

In Laravel 11, the authorization system works differently, and the `authorize()` method wasn't available in the base Controller class.

## Solution
Replaced all `$this->authorize()` calls with manual authorization checks using direct role and ownership verification.

## Files Fixed

### 1. CourseController.php
**Changed:**
- `store()` method - Check if user is instructor or admin
- `update()` method - Check if user owns the course or is admin
- `destroy()` method - Check if user owns the course or is admin

**Before:**
```php
$this->authorize('create', Course::class);
```

**After:**
```php
if (!auth()->user()->isInstructor() && !auth()->user()->isAdmin()) {
    return response()->json(['message' => 'Unauthorized. Only instructors can create courses.'], 403);
}
```

### 2. LessonController.php
**Changed:**
- `store()` method - Check if user owns the course or is admin
- `update()` method - Check if user owns the course or is admin
- `destroy()` method - Check if user owns the course or is admin

**Before:**
```php
$this->authorize('update', $course);
```

**After:**
```php
if (auth()->id() !== $course->instructor_id && !auth()->user()->isAdmin()) {
    return response()->json(['message' => 'Unauthorized. You can only add lessons to your own courses.'], 403);
}
```

## Authorization Logic

### Course Creation
- ✅ User must be an instructor OR admin
- ✅ Returns 403 if user is a student

### Course Update/Delete
- ✅ User must be the course owner (instructor_id matches) OR admin
- ✅ Returns 403 if user doesn't own the course

### Lesson Create/Update/Delete
- ✅ User must be the course owner OR admin
- ✅ Returns 403 if user doesn't own the course
- ✅ Returns 404 if lesson doesn't belong to the course

## Testing

### Test Course Creation
1. Login as instructor
2. Navigate to `/instructor/courses/create`
3. Fill in course details
4. Submit → Should create successfully ✅

### Test Unauthorized Access
1. Login as student
2. Try to create a course via API
3. Should receive 403 error ✅

### Test Course Update
1. Login as instructor
2. Try to update your own course → Should work ✅
3. Try to update another instructor's course → Should receive 403 ✅

### Test Admin Override
1. Login as admin
2. Can create, update, delete any course ✅

## Benefits of This Approach

1. **Explicit Authorization** - Clear and readable authorization logic
2. **No Policy Dependencies** - Doesn't rely on policy registration
3. **Consistent Error Messages** - Clear feedback to users
4. **Role-Based** - Uses existing User model methods (isInstructor, isAdmin)
5. **Ownership Checks** - Verifies course ownership directly

## Security

All authorization checks are in place:
- ✅ Students cannot create courses
- ✅ Instructors can only manage their own courses
- ✅ Admins can manage all courses
- ✅ Proper 403 responses for unauthorized access
- ✅ Ownership verification for updates and deletes

## Status

✅ **FIXED** - Course creation now works correctly for instructors and admins.

## How to Verify

1. Clear any cached routes/config:
```bash
cd backend
php artisan config:clear
php artisan route:clear
```

2. Test course creation:
   - Login as instructor
   - Go to `/instructor/courses/create`
   - Create a course
   - Should work without errors

3. Verify authorization:
   - Try creating a course as a student (should fail)
   - Try updating another instructor's course (should fail)
   - Try as admin (should work for all operations)
