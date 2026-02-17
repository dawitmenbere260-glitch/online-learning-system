'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function CreateMaterialPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pdf',
    url: '',
    is_downloadable: true,
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('is_downloadable', formData.is_downloadable ? '1' : '0');
      
      if (file) {
        formDataToSend.append('file', file);
      } else if (formData.url) {
        formDataToSend.append('url', formData.url);
      }

      await axios.post(
        `http://localhost:8000/api/courses/${courseId}/materials`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      alert('Material uploaded successfully!');
      router.push(`/instructor/courses/${courseId}/manage`);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to upload material');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href={`/instructor/courses/${courseId}/manage`}
            className="text-primary-600 hover:text-primary-500 mb-4 inline-block"
          >
            ← Back to Course
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Upload Material</h1>
          <p className="text-gray-600 mt-2">Add learning materials for your students</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Material Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Material Type *
              </label>
              <select
                id="type"
                name="type"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="link">Link</option>
                <option value="image">Image</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Method *
              </label>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Upload File</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">Max file size: 50MB</p>
                </div>
                
                <div className="text-center text-gray-500">OR</div>
                
                <div>
                  <label htmlFor="url" className="block text-sm text-gray-600 mb-2">
                    External URL
                  </label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://example.com/resource"
                    value={formData.url}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_downloadable"
                name="is_downloadable"
                checked={formData.is_downloadable}
                onChange={(e) => setFormData({ ...formData, is_downloadable: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_downloadable" className="ml-2 block text-sm text-gray-700">
                Allow students to download this material
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href={`/instructor/courses/${courseId}/manage`}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Uploading...' : 'Upload Material'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
