'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { courseAPI } from '@/lib/api';

export default function CreateCoursePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'beginner',
    duration_hours: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'instructor') {
      router.push('/dashboard');
      return;
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const courseData = {
        ...formData,
        price: 0, // Set default price to 0 (free)
        duration_hours: parseInt(formData.duration_hours),
      };

      console.log('Creating course with data:', courseData);
      
      const response = await courseAPI.create(courseData);
      
      console.log('Course created successfully:', response.data);
      
      // Show success message
      alert(`Course "${courseData.title}" created successfully!`);
      
      // Force a hard refresh to reload the instructor dashboard
      window.location.href = '/instructor';
    } catch (error: any) {
      console.error('Error creating course:', error);
      console.error('Error response:', error.response);
      setError(error.response?.data?.message || error.message || 'Failed to create course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/instructor"
            className="text-primary-600 hover:text-primary-500 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
          <p className="text-gray-600 mt-2">
            Fill in the details below to create your course
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Course Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter course title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            {/* Course Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Course Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe what students will learn in this course"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Course Level */}
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                Course Level *
              </label>
              <select
                id="level"
                name="level"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.level}
                onChange={handleChange}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration_hours" className="block text-sm font-medium text-gray-700 mb-2">
                Duration (Hours) *
              </label>
              <input
                type="number"
                id="duration_hours"
                name="duration_hours"
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="1"
                value={formData.duration_hours}
                onChange={handleChange}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/instructor"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Next Steps</h3>
          <ul className="text-blue-800 space-y-1">
            <li>• After creating your course, you'll be able to add lessons</li>
            <li>• Upload course materials and videos</li>
            <li>• Set lesson order and duration</li>
            <li>• Publish your course when ready</li>
          </ul>
        </div>
      </div>
    </div>
  );
}