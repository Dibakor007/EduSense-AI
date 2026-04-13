/**
 * EduSense Frontend API Client
 * 
 * Central API layer for communicating with the backend.
 * Handles authentication tokens, error responses, and provides
 * typed methods for all API endpoints.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

// =============================================
// Core Fetch Wrapper
// =============================================
async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("edusense_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // If token is expired/invalid, clear it
    if (response.status === 401) {
      localStorage.removeItem("edusense_token");
    }
    throw new Error(data.message || "Something went wrong");
  }

  return data as T;
}

// =============================================
// Auth API
// =============================================
export const authApi = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  getProfile: () => request("/auth/me"),
};

// =============================================
// User API
// =============================================
export const userApi = {
  getById: (id: string) => request(`/users/${id}`),

  updateProfile: (data: any) =>
    request("/users/profile", { method: "PUT", body: JSON.stringify(data) }),

  getStudents: () => request("/users/students"),
};

// =============================================
// Classroom API
// =============================================
export const classroomApi = {
  create: (data: { name: string; description?: string }) =>
    request("/classrooms", { method: "POST", body: JSON.stringify(data) }),

  getAll: () => request("/classrooms"),

  getById: (id: string) => request(`/classrooms/${id}`),

  join: (classCode: string) =>
    request("/classrooms/join", { method: "POST", body: JSON.stringify({ classCode }) }),

  removeStudent: (classroomId: string, studentId: string) =>
    request(`/classrooms/${classroomId}/students/${studentId}`, { method: "DELETE" }),
};

// =============================================
// Assessment API
// =============================================
export const assessmentApi = {
  create: (data: any) =>
    request("/assessments", { method: "POST", body: JSON.stringify(data) }),

  getAll: (params?: { classroomId?: string; subject?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request(`/assessments${query ? `?${query}` : ""}`);
  },

  getById: (id: string) => request(`/assessments/${id}`),

  delete: (id: string) => request(`/assessments/${id}`, { method: "DELETE" }),
};

// =============================================
// Submission API
// =============================================
export const submissionApi = {
  submit: (data: {
    assessmentId: string;
    score: number;
    percentage: number;
    timeTaken: number;
    skillBreakdown?: any;
    questionResults?: any[];
  }) => request("/submissions", { method: "POST", body: JSON.stringify(data) }),

  getAll: (params?: { assessmentId?: string; studentId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request(`/submissions${query ? `?${query}` : ""}`);
  },

  addFeedback: (submissionId: string, data: { comments: string; grade?: number }) =>
    request(`/submissions/${submissionId}/feedback`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// =============================================
// AI API (server-side proxy)
// =============================================
export const aiApi = {
  generateQuiz: (data: {
    subject: string;
    topic: string;
    difficulty?: string;
    totalQuestions?: number;
    academicLevel?: string;
  }) => request("/ai/generate-quiz", { method: "POST", body: JSON.stringify(data) }),

  chat: (message: string, context?: string) =>
    request("/ai/chat", { method: "POST", body: JSON.stringify({ message, context }) }),

  getRecommendations: (skillGaps: any[], academicLevel: string) =>
    request("/ai/recommendations", {
      method: "POST",
      body: JSON.stringify({ skillGaps, academicLevel }),
    }),
};

// =============================================
// Token Helpers
// =============================================
export const setToken = (token: string) => localStorage.setItem("edusense_token", token);
export const getToken = () => localStorage.getItem("edusense_token");
export const removeToken = () => localStorage.removeItem("edusense_token");
export const isAuthenticated = () => !!getToken();
