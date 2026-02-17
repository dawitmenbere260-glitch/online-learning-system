'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { courseAPI, lessonAPI } from '@/lib/api';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  level: string;
  duration_hours: number;
  instructor: {
    id: number;
    name: string;
    bio?: string;
  };
  lessons: Lesson[];
  is_enrolled: boolean;
  enrollment?: {
    progress: number;
    completed_at: string | null;
  };
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  is_free: boolean;
  order: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    if (params.id) {
      fetchCourse();
    }
  }, [params.id]);

  const fetchCourse = async () => {
    try {
      const response = await courseAPI.getById(params.id as string);
      setCourse(response.data.course);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsEnrolling(true);
    try {
      await courseAPI.enroll(params.id as string);
      // Refresh course data to show enrollment status
      await fetchCourse();
    } catch (error: any) {
      console.error('Error enrolling:', error);
      alert(error.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <Link href="/courses" className="text-primary-600 hover:text-primary-500">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/courses" className="text-primary-600 hover:text-primary-500">
            ← Back to Courses
          </Link>
        </nav>

        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {course.title}
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  {course.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                    course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {course.level}
                  </span>
                  <span className="text-sm text-gray-500">
                    {course.duration_hours} hours
                  </span>
                  <span className="text-sm text-gray-500">
                    {course.lessons?.length || 0} lessons
                  </span>
                </div>

                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">
                        {course.instructor.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      {course.instructor.name}
                    </p>
                    <p className="text-sm text-gray-500">Instructor</p>
                  </div>
                </div>
              </div>

              <div className="lg:ml-8 lg:flex-shrink-0">
                <div className="bg-gray-50 rounded-lg p-6 lg:w-80">
                  <div className="text-center mb-6">
                    <span className="text-2xl font-bold text-green-600">
                      FREE COURSE
                    </span>
                  </div>

                  {course.is_enrolled ? (
                    <div className="space-y-4">
                      <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-center font-medium">
                        ✓ Enrolled
                      </div>
                      {course.enrollment && (
                        <div>
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{Math.round(course.enrollment.progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-500 h-2 rounded-full"
                              style={{ width: `${course.enrollment.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      <Link
                        href={`/courses/${course.id}/learn`}
                        className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-600 transition-colors text-center block"
                      >
                        Continue Learning
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                      className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
                    >
                      {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
          
          {course.lessons && course.lessons.length > 0 ? (
            <div className="space-y-4">
              {course.lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {index + 1}. {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {lesson.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      {lesson.is_free && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                          Free
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {lesson.duration_minutes} min
                      </span>
                      {(course.is_enrolled || lesson.is_free) && (
                        <button className="text-primary-600 hover:text-primary-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M9 18h6" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No lessons available yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}