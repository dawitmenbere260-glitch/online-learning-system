'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { courseAPI, authAPI } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: {
    name: string;
  };
  pivot?: {
    progress: number;
    completed_at: string | null;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userResponse = await authAPI.me();
      setUser(userResponse.data);

      // For now, we'll just show a placeholder for enrolled courses
      // In a real implementation, you'd have an endpoint for user's enrolled courses
      setEnrolledCourses([]);
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            {user.role === 'instructor' ? 'Manage your courses and track student progress.' : 
             user.role === 'admin' ? 'Manage the entire platform and monitor system activity.' :
             'Continue your learning journey.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {user.role === 'instructor' ? 'Your Courses' : 
                 user.role === 'admin' ? 'Platform Overview' :
                 'Enrolled Courses'}
              </h2>
              
              {enrolledCourses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    {user.role === 'instructor' 
                      ? "You haven't created any courses yet." 
                      : user.role === 'admin'
                      ? "Welcome to the admin dashboard. Use the sidebar to manage the platform."
                      : "You're not enrolled in any courses yet."
                    }
                  </p>
                  <Link
                    href={user.role === 'instructor' ? '/instructor/courses/create' : 
                          user.role === 'admin' ? '/admin' : '/courses'}
                    className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
                  >
                    {user.role === 'instructor' ? 'Create Your First Course' : 
                     user.role === 'admin' ? 'Go to Admin Dashboard' : 'Browse Courses'}
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrolledCourses.map((course) => (
                    <div key={course.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{course.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm text-gray-500">
                          by {course.instructor.name}
                        </span>
                        {course.pivot && (
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary-500 h-2 rounded-full"
                                style={{ width: `${course.pivot.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {Math.round(course.pivot.progress)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/courses"
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  Browse All Courses
                </Link>
                {user.role === 'student' && (
                  <>
                    <Link
                      href="/student/progress"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Track Progress
                    </Link>
                    <Link
                      href="/student/grades"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      View Grades
                    </Link>
                  </>
                )}
                {user.role === 'instructor' && (
                  <>
                    <Link
                      href="/instructor"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Instructor Dashboard
                    </Link>
                    <Link
                      href="/instructor/courses/create"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Create New Course
                    </Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link
                      href="/admin"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      href="/admin/users"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Manage Users
                    </Link>
                    <Link
                      href="/admin/courses"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Manage Courses
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Role:</span> {user.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}