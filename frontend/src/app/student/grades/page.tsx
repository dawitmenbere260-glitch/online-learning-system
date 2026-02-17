'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { assignmentAPI, quizAPI, courseAPI } from '@/lib/api';

interface Grade {
  id: number;
  type: 'assignment' | 'quiz';
  title: string;
  course: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: string;
  submittedAt: string;
  gradedAt?: string;
  feedback?: string;
}

export default function StudentGradesPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('course');
  
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>(courseId || 'all');
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetchGrades();
    fetchCourses();
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      setIsLoading(true);
      
      // Simulated grades data
      // In a real app, you'd fetch from an endpoint like /api/student/grades
      const mockGrades: Grade[] = [
        {
          id: 1,
          type: 'assignment',
          title: 'Week 1 Assignment',
          course: 'Introduction to Programming',
          score: 85,
          maxScore: 100,
          percentage: 85,
          status: 'graded',
          submittedAt: '2026-02-10T10:00:00Z',
          gradedAt: '2026-02-12T14:30:00Z',
          feedback: 'Great work! Your code is well-structured.',
        },
        {
          id: 2,
          type: 'quiz',
          title: 'Chapter 1 Quiz',
          course: 'Introduction to Programming',
          score: 18,
          maxScore: 20,
          percentage: 90,
          status: 'graded',
          submittedAt: '2026-02-08T15:00:00Z',
          gradedAt: '2026-02-08T15:05:00Z',
        },
        {
          id: 3,
          type: 'assignment',
          title: 'Final Project',
          course: 'Web Development',
          score: 0,
          maxScore: 100,
          percentage: 0,
          status: 'submitted',
          submittedAt: '2026-02-14T18:00:00Z',
        },
      ];

      setGrades(mockGrades);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGrades = selectedCourse === 'all' 
    ? grades 
    : grades.filter(g => g.course === selectedCourse);

  const averageGrade = filteredGrades.length > 0
    ? filteredGrades
        .filter(g => g.status === 'graded')
        .reduce((sum, g) => sum + g.percentage, 0) / filteredGrades.filter(g => g.status === 'graded').length
    : 0;

  const totalAssignments = filteredGrades.filter(g => g.type === 'assignment').length;
  const totalQuizzes = filteredGrades.filter(g => g.type === 'quiz').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Grades</h1>
            <p className="text-gray-600 mt-2">View your grades and feedback</p>
          </div>
          <Link
            href="/student/progress"
            className="text-primary-600 hover:text-primary-700"
          >
            ← Back to Progress
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Assignments</p>
                <p className="text-3xl font-bold text-gray-900">{totalAssignments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Quizzes</p>
                <p className="text-3xl font-bold text-gray-900">{totalQuizzes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Grade</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round(averageGrade)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Course
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full md:w-64 border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="all">All Courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.title}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {/* Grades List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Grade History</h2>
          </div>

          {filteredGrades.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No grades available yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredGrades.map((grade) => (
                <div key={grade.id} className="px-6 py-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          grade.type === 'assignment' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {grade.type}
                        </span>
                        <h3 className="text-lg font-medium text-gray-900">
                          {grade.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{grade.course}</p>
                      
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Score:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {grade.score}/{grade.maxScore}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Percentage:</span>
                          <span className={`ml-2 font-medium ${
                            grade.percentage >= 70 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {grade.percentage}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            grade.status === 'graded' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {grade.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Submitted:</span>
                          <span className="ml-2 text-gray-900">
                            {new Date(grade.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {grade.feedback && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 mb-1">Instructor Feedback:</p>
                          <p className="text-sm text-blue-800">{grade.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
