'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { courseAPI } from '@/lib/api';

export default function ManageCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('materials');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'instructor' && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await courseAPI.getById(courseId);
      setCourse(response.data.course || response.data);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/instructor"
            className="text-primary-600 hover:text-primary-500 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{course?.title}</h1>
          <p className="text-gray-600 mt-2">Manage course content and assessments</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('materials')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'materials'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Materials
              </button>
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'quizzes'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Quizzes
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'assignments'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Assignments
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'materials' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Course Materials</h2>
                  <Link
                    href={`/instructor/courses/${courseId}/materials/create`}
                    className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
                  >
                    Upload Material
                  </Link>
                </div>
                <p className="text-gray-600">
                  Upload PDFs, videos, documents, and other learning materials for your students.
                </p>
              </div>
            )}

            {activeTab === 'quizzes' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Quizzes</h2>
                  <Link
                    href={`/instructor/courses/${courseId}/quizzes/create`}
                    className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
                  >
                    Create Quiz
                  </Link>
                </div>
                <p className="text-gray-600">
                  Create quizzes to test your students' knowledge and track their progress.
                </p>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Assignments</h2>
                  <Link
                    href={`/instructor/courses/${courseId}/assignments/create`}
                    className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
                  >
                    Create Assignment
                  </Link>
                </div>
                <p className="text-gray-600">
                  Create assignments for students to submit and grade their work.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
