import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/register', data),
  login: (data: any) => api.post('/login', data),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
};

// Course API
export const courseAPI = {
  getAll: (params?: any) => api.get('/courses', { params }),
  getById: (id: string) => api.get(`/courses/${id}`),
  create: (data: any) => api.post('/courses', data),
  update: (id: string, data: any) => api.put(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
  enroll: (id: string) => api.post(`/courses/${id}/enroll`),
};

// Lesson API
export const lessonAPI = {
  getByCourse: (courseId: string) => api.get(`/courses/${courseId}/lessons`),
  getById: (courseId: string, lessonId: string) => api.get(`/courses/${courseId}/lessons/${lessonId}`),
  create: (courseId: string, data: any) => api.post(`/courses/${courseId}/lessons`, data),
  update: (courseId: string, lessonId: string, data: any) => api.put(`/courses/${courseId}/lessons/${lessonId}`, data),
  delete: (courseId: string, lessonId: string) => api.delete(`/courses/${courseId}/lessons/${lessonId}`),
  markComplete: (courseId: string, lessonId: string, data?: any) => api.post(`/courses/${courseId}/lessons/${lessonId}/complete`, data),
  updateProgress: (courseId: string, lessonId: string, data: any) => api.post(`/courses/${courseId}/lessons/${lessonId}/progress`, data),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  
  // User management
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  createUser: (data: any) => api.post('/admin/users', data),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  blockUser: (id: string) => api.post(`/admin/users/${id}/block`),
  unblockUser: (id: string) => api.post(`/admin/users/${id}/unblock`),
};

// Assignment API
export const assignmentAPI = {
  getByCourse: (courseId: string) => api.get(`/courses/${courseId}/assignments`),
  getById: (id: string) => api.get(`/assignments/${id}`),
  create: (courseId: string, data: any) => api.post(`/courses/${courseId}/assignments`, data),
  update: (id: string, data: any) => api.put(`/assignments/${id}`, data),
  delete: (id: string) => api.delete(`/assignments/${id}`),
  getSubmissions: (id: string) => api.get(`/assignments/${id}/submissions`),
  submit: (id: string, data: any) => api.post(`/assignments/${id}/submit`, data),
  grade: (submissionId: string, data: any) => api.put(`/submissions/${submissionId}/grade`, data),
  downloadSubmission: (submissionId: string) => api.get(`/submissions/${submissionId}/download`, { responseType: 'blob' }),
};

// Quiz API
export const quizAPI = {
  getByCourse: (courseId: string) => api.get(`/courses/${courseId}/quizzes`),
  getById: (id: string) => api.get(`/quizzes/${id}`),
  create: (courseId: string, data: any) => api.post(`/courses/${courseId}/quizzes`, data),
  update: (id: string, data: any) => api.put(`/quizzes/${id}`, data),
  delete: (id: string) => api.delete(`/quizzes/${id}`),
  addQuestion: (quizId: string, data: any) => api.post(`/quizzes/${quizId}/questions`, data),
  updateQuestion: (questionId: string, data: any) => api.put(`/quiz-questions/${questionId}`, data),
  deleteQuestion: (questionId: string) => api.delete(`/quiz-questions/${questionId}`),
  startAttempt: (quizId: string) => api.post(`/quizzes/${quizId}/attempt`),
  submitAttempt: (attemptId: string, data: any) => api.post(`/quiz-attempts/${attemptId}/submit`, data),
  getAttempts: (quizId: string) => api.get(`/quizzes/${quizId}/attempts`),
};

// Material API
export const materialAPI = {
  getByCourse: (courseId: string) => api.get(`/courses/${courseId}/materials`),
  getById: (id: string) => api.get(`/materials/${id}`),
  create: (courseId: string, data: any) => api.post(`/courses/${courseId}/materials`, data),
  update: (id: string, data: any) => api.put(`/materials/${id}`, data),
  delete: (id: string) => api.delete(`/materials/${id}`),
  download: (id: string) => api.get(`/materials/${id}/download`, { responseType: 'blob' }),
};