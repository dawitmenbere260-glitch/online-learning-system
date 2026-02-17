'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { quizAPI } from '@/lib/api';

interface Question {
  id: number;
  question: string;
  type: string;
  options?: string[];
  points: number;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  time_limit_minutes: number | null;
  passing_score: number;
  questions: Question[];
}

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    startQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const startQuiz = async () => {
    try {
      setIsLoading(true);
      
      // Start quiz attempt
      const attemptResponse = await quizAPI.startAttempt(quizId);
      const attemptData = attemptResponse.data;
      
      setAttempt(attemptData);
      setQuiz(attemptData.quiz);
      
      // Set timer if quiz has time limit
      if (attemptData.quiz.time_limit_minutes) {
        setTimeRemaining(attemptData.quiz.time_limit_minutes * 60);
      }
    } catch (error: any) {
      console.error('Error starting quiz:', error);
      alert(error.response?.data?.message || 'Failed to start quiz');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const confirmed = window.confirm('Are you sure you want to submit your quiz?');
    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      
      const response = await quizAPI.submitAttempt(attempt.id, { answers });
      setResult(response.data);
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      alert(error.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (result) {
    const percentage = result.total_points > 0 
      ? (result.score / result.total_points) * 100 
      : 0;

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
                result.passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {result.passed ? (
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>

              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                {result.passed ? 'Congratulations!' : 'Quiz Completed'}
              </h2>
              
              <div className="mt-6 space-y-2">
                <p className="text-4xl font-bold text-gray-900">
                  {Math.round(percentage)}%
                </p>
                <p className="text-gray-600">
                  You scored {result.score} out of {result.total_points} points
                </p>
                <p className="text-sm text-gray-500">
                  Passing score: {quiz?.passing_score}%
                </p>
              </div>

              {result.passed ? (
                <p className="mt-4 text-green-600 font-medium">
                  You passed the quiz!
                </p>
              ) : (
                <p className="mt-4 text-red-600 font-medium">
                  You need {quiz?.passing_score}% to pass
                </p>
              )}

              <div className="mt-8 space-x-4">
                <button
                  onClick={() => router.back()}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Back to Course
                </button>
                <button
                  onClick={() => router.push('/student/grades')}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  View All Grades
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-gray-600 mt-2">{quiz.description}</p>
              )}
            </div>
            {timeRemaining !== null && (
              <div className={`text-right ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                <p className="text-sm font-medium">Time Remaining</p>
                <p className="text-3xl font-bold">{formatTime(timeRemaining)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {quiz.questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Question {index + 1}
                </h3>
                <span className="text-sm text-gray-500">{question.points} points</span>
              </div>

              <p className="text-gray-800 mb-4">{question.question}</p>

              {question.type === 'multiple_choice' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'true_false' && (
                <div className="space-y-2">
                  {['True', 'False'].map((option) => (
                    <label
                      key={option}
                      className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'short_answer' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  rows={3}
                  placeholder="Type your answer here..."
                />
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              {Object.keys(answers).length} of {quiz.questions.length} questions answered
            </p>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
