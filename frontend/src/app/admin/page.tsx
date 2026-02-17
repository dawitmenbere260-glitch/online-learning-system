'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { courseAPI, authAPI } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Course {
  id: number;
  title: string;
  instructor: {
    name: string;
  };
  status: string;
  enrollments_count: number;
  price: number;
}

export default function AdminDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      window.location.href = '/login';
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }

    setUser(parsedUser);
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const coursesResponse = await courseAPI.getAll();
      const allCourses = coursesResponse.data.data || [];
      setCourses(allCourses);

      // Calculate stats
      const totalEnrollments = allCourses.reduce((sum: number, course: Course) => 
        sum + (course.enrollments_count || 0), 0
      );

      setStats({
        totalUsers: 5, // This would come from a users API endpoint
        totalCourses: allCourses.length,
        totalEnrollments: totalEnrollments,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseStatusChange = async (courseId: number, newStatus: string) => {
    try {
      await courseAPI.update(courseId.toString(), { status: newStatus });
      // Refresh courses
      await fetchAdminData();
    } catch (error) {
      console.error('Error updating course status:', error);
      alert('Failed to update course status');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage users, courses, and platform settings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Courses</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Enrollments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalEnrollments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/admin/students"
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
              >
                Manage Students
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
              <Link
                href="/admin/reports"
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
              >
                View Reports
              </Link>
              <Link
                href="/admin/settings"
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
              >
                Platform Settings
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">New user registration</span>
                  <span className="text-xs text-gray-400">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Course published</span>
                  <span className="text-xs text-gray-400">5 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">New enrollment</span>
                  <span className="text-xs text-gray-400">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Management */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Course Management</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {courses.map((course) => (
              <div key={course.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      by {course.instructor.name}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        course.status === 'published' ? 'bg-green-100 text-green-800' :
                        course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {course.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {course.enrollments_count || 0} enrollments
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={course.status}
                      onChange={(e) => handleCourseStatusChange(course.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                    <Link
                      href={`/courses/${course.id}`}
                      className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}