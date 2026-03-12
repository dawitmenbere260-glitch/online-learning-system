# Backend App Folder Structure Explained

## 📁 Overview

The `backend/app` folder is the heart of your Laravel application. It contains all the core business logic, models, controllers, and middleware for your online learning management system.

```
backend/app/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   ├── AssignmentController.php
│   │   │   ├── AuthController.php
│   │   │   ├── CourseController.php
│   │   │   ├── LessonController.php
│   │   │   ├── MaterialController.php
│   │   │   ├── QuizController.php
│   │   │   └── UserController.php
│   │   └── Controller.php
│   └── Middleware/
│       ├── AdminMiddleware.php
│       ├── CheckBlocked.php
│       └── InstructorMiddleware.php
├── Models/
│   ├── Assignment.php
│   ├── AssignmentSubmission.php
│   ├── Course.php
│   ├── CourseMaterial.php
│   ├── Enrollment.php
│   ├── Lesson.php
│   ├── LessonProgress.php
│   ├── Quiz.php
│   ├── QuizAttempt.php
│   ├── QuizQuestion.php
│   └── User.php
├── Policies/
│   └── CoursePolicy.php
└── Providers/
    └── AppServiceProvider.php
```

---

## 🎯 1. Http/Controllers/Api/ (API Controllers)

These handle all HTTP requests and return JSON responses for your frontend.

### **AuthController.php**
Handles user authentication and authorization.

**Key Methods:**
- `register()` - Create new user accounts (student/instructor/admin)
- `login()` - Authenticate users and generate API tokens
- `logout()` - Revoke user tokens
- `me()` - Get current authenticated user info

**Example Flow:**
```
User submits login form → AuthController validates credentials 
→ Creates token → Returns user data + token to frontend
```

---

### **CourseController.php**
Manages all course-related operations.

**Key Methods:**
- `index()` - List all published courses (public)
- `show()` - Get single course details
- `store()` - Create new course (instructor/admin only)
- `update()` - Update course details (owner/admin only)
- `destroy()` - Delete course (owner/admin only)
- `enroll()` - Enroll student in course
- `instructorDashboard()` - Get instructor statistics
- `instructorCourses()` - List instructor's courses (including drafts)
- `courseStudents()` - View students enrolled in course
- `recentActivity()` - Get recent enrollments, submissions, quiz attempts

**Authorization:**
- Public can view published courses
- Instructors can create and manage their own courses
- Admins can manage all courses

---

### **LessonController.php**
Handles lesson management within courses.

**Key Methods:**
- `index()` - List all lessons in a course
- `show()` - Get single lesson details
- `store()` - Create new lesson (instructor/admin only)
- `update()` - Update lesson (instructor/admin only)
- `destroy()` - Delete lesson (instructor/admin only)
- `markComplete()` - Mark lesson as completed by student
- `updateProgress()` - Update watch time progress

**Features:**
- Automatic lesson ordering
- Progress tracking per student
- Free lesson preview support

---

### **AssignmentController.php**
Manages assignments and submissions.

**Key Methods:**
- `index()` - List assignments for a course
- `store()` - Create assignment (instructor only)
- `update()` - Update assignment (instructor only)
- `destroy()` - Delete assignment (instructor only)
- `show()` - View assignment details
- `submit()` - Submit assignment (student)
- `submissions()` - View all submissions (instructor only)
- `grade()` - Grade submission (instructor only)
- `download()` - Download submission file

**Features:**
- File upload support (10MB max)
- Due date enforcement
- Late submission control
- Manual grading by instructor

---

### **QuizController.php**
Handles quiz creation and student attempts.

**Key Methods:**
- `index()` - List quizzes for a course
- `store()` - Create quiz (instructor only)
- `update()` - Update quiz (instructor only)
- `destroy()` - Delete quiz (instructor only)
- `addQuestion()` - Add question to quiz
- `updateQuestion()` - Update question
- `deleteQuestion()` - Delete question
- `startAttempt()` - Start quiz attempt (student)
- `submitAttempt()` - Submit quiz for grading
- `attempts()` - View all attempts (instructor only)

**Features:**
- Multiple question types (multiple choice, true/false, short answer)
- Auto-grading
- Time limits
- Max attempts control
- Question shuffling
- Show/hide correct answers

---

### **MaterialController.php**
Manages course materials (PDFs, videos, documents).

**Key Methods:**
- `index()` - List materials for a course
- `store()` - Upload material (instructor only)
- `update()` - Update material (instructor only)
- `destroy()` - Delete material (instructor only)
- `show()` - View material details
- `download()` - Download material file

**Features:**
- File upload support (50MB max)
- Multiple file types (PDF, video, document, link, image)
- Downloadable/non-downloadable control
- Private file storage

---

### **UserController.php**
Admin user management.

**Key Methods:**
- `index()` - List all users (admin only)
- `show()` - View user details (admin only)
- `store()` - Create user (admin only)
- `update()` - Update user (admin only)
- `destroy()` - Delete user (admin only)
- `block()` - Block user account (admin only)
- `unblock()` - Unblock user account (admin only)
- `instructorProfile()` - Get instructor profile
- `updateInstructorProfile()` - Update instructor profile

**Features:**
- User search and filtering
- Role management
- Account blocking
- Profile management

---

## 🛡️ 2. Http/Middleware/ (Security & Authorization)

Middleware intercepts requests before they reach controllers.

### **AdminMiddleware.php**
Ensures only admin users can access admin routes.

**Usage:**
```php
Route::middleware('admin')->group(function () {
    Route::get('/admin/users', [UserController::class, 'index']);
});
```

---

### **InstructorMiddleware.php**
Ensures only instructors (or admins) can access instructor routes.

**Usage:**
```php
Route::middleware('instructor')->group(function () {
    Route::get('/instructor/dashboard', [CourseController::class, 'instructorDashboard']);
});
```

---

### **CheckBlocked.php**
Prevents blocked users from accessing any protected routes.

**How it works:**
- Checks if user has `blocked_at` timestamp
- Returns 403 error if blocked
- Applied to all authenticated routes

---

## 📊 3. Models/ (Database Models)

Models represent database tables and define relationships.

### **User.php**
Represents users (students, instructors, admins).

**Key Relationships:**
- `instructedCourses()` - Courses created by instructor
- `enrolledCourses()` - Courses student is enrolled in
- `enrollments()` - Enrollment records
- `lessonProgress()` - Lesson completion records

**Helper Methods:**
- `isInstructor()` - Check if user is instructor
- `isAdmin()` - Check if user is admin
- `isStudent()` - Check if user is student
- `isBlocked()` - Check if account is blocked

---

### **Course.php**
Represents courses.

**Key Relationships:**
- `instructor()` - Course creator
- `lessons()` - Course lessons
- `enrollments()` - Student enrollments
- `students()` - Enrolled students
- `assignments()` - Course assignments
- `quizzes()` - Course quizzes
- `materials()` - Course materials

**Scopes:**
- `published()` - Only published courses
- `byLevel()` - Filter by difficulty level

**Attributes:**
- `status` - draft, published, archived
- `level` - beginner, intermediate, advanced

---

### **Lesson.php**
Represents individual lessons within courses.

**Key Relationships:**
- `course()` - Parent course
- `progress()` - Student progress records

**Helper Methods:**
- `userProgress()` - Get specific user's progress
- `isCompleted()` - Check if user completed lesson
- `getWatchTime()` - Get user's watch time

---

### **Assignment.php**
Represents assignments.

**Key Relationships:**
- `course()` - Parent course
- `lesson()` - Associated lesson (optional)
- `submissions()` - Student submissions

**Features:**
- Due dates
- Late submission control
- Max points

---

### **AssignmentSubmission.php**
Represents student assignment submissions.

**Key Relationships:**
- `assignment()` - Parent assignment
- `user()` - Student who submitted
- `grader()` - Instructor who graded

**Attributes:**
- `status` - submitted, graded
- `score` - Points earned
- `feedback` - Instructor feedback
- `file_path` - Uploaded file

---

### **Quiz.php**
Represents quizzes.

**Key Relationships:**
- `course()` - Parent course
- `lesson()` - Associated lesson (optional)
- `questions()` - Quiz questions
- `attempts()` - Student attempts

**Features:**
- Time limits
- Passing score percentage
- Max attempts
- Question shuffling

---

### **QuizQuestion.php**
Represents individual quiz questions.

**Key Relationships:**
- `quiz()` - Parent quiz

**Attributes:**
- `type` - multiple_choice, true_false, short_answer
- `options` - JSON array of choices
- `correct_answers` - JSON array of correct answers
- `points` - Points for correct answer

---

### **QuizAttempt.php**
Represents student quiz attempts.

**Key Relationships:**
- `quiz()` - Parent quiz
- `user()` - Student

**Attributes:**
- `answers` - JSON of student answers
- `score` - Points earned
- `total_points` - Maximum possible points
- `passed` - Boolean if passed
- `started_at` - When attempt started
- `completed_at` - When submitted

---

### **CourseMaterial.php**
Represents course materials (files, links).

**Key Relationships:**
- `course()` - Parent course
- `lesson()` - Associated lesson (optional)

**Attributes:**
- `type` - pdf, video, document, link, image, other
- `file_path` - Stored file path
- `url` - External link
- `is_downloadable` - Allow downloads

---

### **Enrollment.php**
Represents student course enrollments.

**Key Relationships:**
- `user()` - Enrolled student
- `course()` - Enrolled course

**Helper Methods:**
- `updateProgress()` - Calculate completion percentage
- `markAsCompleted()` - Mark course as completed
- `isCompleted()` - Check if completed

**Attributes:**
- `progress` - Completion percentage (0-100)
- `completed_at` - Completion timestamp

---

### **LessonProgress.php**
Tracks student progress on individual lessons.

**Key Relationships:**
- `user()` - Student
- `lesson()` - Lesson

**Helper Methods:**
- `markAsCompleted()` - Mark lesson complete and update course progress

**Attributes:**
- `completed` - Boolean
- `watch_time_seconds` - Video watch time
- `completed_at` - Completion timestamp

---

## 🔐 4. Policies/ (Authorization Policies)

### **CoursePolicy.php**
Defines authorization rules for course actions.

**Note:** Currently not actively used. Authorization is handled directly in controllers for simplicity.

---

## ⚙️ 5. Providers/ (Service Providers)

### **AppServiceProvider.php**
Bootstraps application services.

**Common Uses:**
- Register service bindings
- Configure application settings
- Set up observers
- Define global query scopes

---

## 🔄 How It All Works Together

### Example: Student Enrolls in Course

1. **Frontend** sends POST request to `/api/courses/{id}/enroll`
2. **Middleware** (`auth:sanctum`, `check.blocked`) validates token and checks if user is blocked
3. **CourseController** `enroll()` method:
   - Checks if already enrolled
   - Creates `Enrollment` record
   - Returns success response
4. **Frontend** receives enrollment data and updates UI

### Example: Instructor Creates Quiz

1. **Frontend** sends POST to `/api/courses/{id}/quizzes`
2. **Middleware** validates authentication
3. **QuizController** `store()` method:
   - Checks if user is course instructor
   - Validates quiz data
   - Creates `Quiz` record
   - Returns quiz data
4. Instructor can then add questions via `/api/quizzes/{id}/questions`

---

## 🎯 Key Design Patterns

### 1. **RESTful API Design**
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Resource-based URLs
- JSON responses

### 2. **Authorization Layers**
- Middleware for role-based access
- Controller-level ownership checks
- Admin override capabilities

### 3. **Relationship Management**
- Eloquent ORM relationships
- Eager loading for performance
- Cascade deletes where appropriate

### 4. **Progress Tracking**
- Automatic progress calculation
- Real-time updates
- Completion tracking

---

## 📝 Summary

The `backend/app` folder is organized into:

- **Controllers** - Handle HTTP requests and business logic
- **Models** - Represent database tables and relationships
- **Middleware** - Security and authorization checks
- **Policies** - Authorization rules (optional)
- **Providers** - Application bootstrapping

This structure follows Laravel's MVC (Model-View-Controller) pattern, making the codebase:
- ✅ Easy to maintain
- ✅ Scalable
- ✅ Well-organized
- ✅ Secure
- ✅ Testable