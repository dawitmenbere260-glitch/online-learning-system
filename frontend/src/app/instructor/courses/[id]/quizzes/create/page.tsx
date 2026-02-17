'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

interface Question {
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options: string[];
  correct_answers: string[];
  points: number;
}

export default function CreateQuizPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time_limit_minutes: '',
    passing_score: '70',
    max_attempts: '',
    shuffle_questions: false,
    show_correct_answers: true,
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    question: '',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answers: [],
    points: 1,
  });
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
    
    if (questions.length === 0) {
      setError('Please add at least one question');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      
      // Create quiz
      const quizResponse = await axios.post(
        `http://localhost:8000/api/courses/${courseId}/quizzes`,
        {
          ...formData,
          time_limit_minutes: formData.time_limit_minutes ? parseInt(formData.time_limit_minutes) : null,
          passing_score: parseInt(formData.passing_score),
          max_attempts: formData.max_attempts ? parseInt(formData.max_attempts) : null,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const quizId = quizResponse.data.id;

      // Add questions
      for (const question of questions) {
        await axios.post(
          `http://localhost:8000/api/quizzes/${quizId}/questions`,
          question,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      alert('Quiz created successfully!');
      router.push(`/instructor/courses/${courseId}/manage`);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.question) {
      alert('Please enter a question');
      return;
    }
    if (currentQuestion.correct_answers.length === 0) {
      alert('Please select at least one correct answer');
      return;
    }

    setQuestions([...questions, currentQuestion]);
    setCurrentQuestion({
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answers: [],
      points: 1,
    });
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href={`/instructor/courses/${courseId}/manage`}
            className="text-primary-600 hover:text-primary-500 mb-4 inline-block"
          >
            ← Back to Course
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Quiz</h1>
          <p className="text-gray-600 mt-2">Create a quiz to test your students</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Quiz Details */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quiz Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.time_limit_minutes}
                    onChange={(e) => setFormData({ ...formData, time_limit_minutes: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Score (%) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.passing_score}
                    onChange={(e) => setFormData({ ...formData, passing_score: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Attempts
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.max_attempts}
                    onChange={(e) => setFormData({ ...formData, max_attempts: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="shuffle_questions"
                    checked={formData.shuffle_questions}
                    onChange={(e) => setFormData({ ...formData, shuffle_questions: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="shuffle_questions" className="ml-2 block text-sm text-gray-700">
                    Shuffle questions
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="show_correct_answers"
                    checked={formData.show_correct_answers}
                    onChange={(e) => setFormData({ ...formData, show_correct_answers: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="show_correct_answers" className="ml-2 block text-sm text-gray-700">
                    Show correct answers after submission
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Add Questions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Add Question</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question *
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Type *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={currentQuestion.type}
                    onChange={(e) => setCurrentQuestion({ 
                      ...currentQuestion, 
                      type: e.target.value as any,
                      options: e.target.value === 'true_false' ? ['True', 'False'] : ['', '', '', ''],
                      correct_answers: []
                    })}
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="short_answer">Short Answer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points *
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={currentQuestion.points}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              {currentQuestion.type === 'multiple_choice' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options (check correct answer)
                  </label>
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={currentQuestion.correct_answers.includes(option)}
                        onChange={(e) => {
                          const newCorrect = e.target.checked
                            ? [...currentQuestion.correct_answers, option]
                            : currentQuestion.correct_answers.filter(a => a !== option);
                          setCurrentQuestion({ ...currentQuestion, correct_answers: newCorrect });
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-2"
                      />
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options];
                          newOptions[index] = e.target.value;
                          setCurrentQuestion({ ...currentQuestion, options: newOptions });
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'true_false' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={currentQuestion.correct_answers[0] || ''}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, correct_answers: [e.target.value] })}
                  >
                    <option value="">Select...</option>
                    <option value="True">True</option>
                    <option value="False">False</option>
                  </select>
                </div>
              )}

              {currentQuestion.type === 'short_answer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer(s)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter correct answer"
                    value={currentQuestion.correct_answers[0] || ''}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, correct_answers: [e.target.value] })}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={addQuestion}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-primary-500 hover:text-primary-600"
              >
                + Add Question
              </button>
            </div>
          </div>

          {/* Questions List */}
          {questions.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Questions ({questions.length})</h2>
              <div className="space-y-4">
                {questions.map((q, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{index + 1}. {q.question}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Type: {q.type} | Points: {q.points}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
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
              {isSubmitting ? 'Creating...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
