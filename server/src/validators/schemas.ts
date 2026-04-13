import { z } from "zod";

// =============================================
// Auth Schemas
// =============================================
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "teacher"]).default("student"),
  institution: z.string().optional(),
  educationLevel: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// =============================================
// Classroom Schemas
// =============================================
export const createClassroomSchema = z.object({
  name: z.string().min(2, "Classroom name must be at least 2 characters").max(200),
  description: z.string().optional(),
});

export const joinClassroomSchema = z.object({
  classCode: z.string().min(1, "Class code is required"),
});

// =============================================
// Assessment Schemas
// =============================================
export const createAssessmentSchema = z.object({
  title: z.string().min(2).max(200),
  subject: z.string().min(1),
  topic: z.string().optional(),
  description: z.string().min(1),
  duration: z.number().int().positive(),
  totalQuestions: z.number().int().positive(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  academicLevel: z.string().optional(),
  classroomId: z.string().uuid().optional(),
  questions: z.array(z.object({
    type: z.enum(["multiple_choice", "true_false", "short_answer", "code"]).default("multiple_choice"),
    difficulty: z.enum(["easy", "medium", "hard"]),
    topic: z.string(),
    question: z.string(),
    options: z.array(z.string()).default([]),
    correctAnswer: z.string(),
    explanation: z.string(),
    avgTimeToAnswer: z.number().int().default(30),
  })).optional(),
});

// =============================================
// Submission Schemas
// =============================================
export const submitAssessmentSchema = z.object({
  assessmentId: z.string().uuid(),
  score: z.number().min(0),
  percentage: z.number().min(0).max(100),
  timeTaken: z.number().int().positive(),
  skillBreakdown: z.record(z.any()).default({}),
  questionResults: z.array(z.any()).default([]),
});

// =============================================
// AI Schemas
// =============================================
export const generateQuizSchema = z.object({
  subject: z.string().min(1),
  topic: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  totalQuestions: z.number().int().min(1).max(50).default(10),
  academicLevel: z.string().default("General"),
});

export const chatSchema = z.object({
  message: z.string().min(1),
  context: z.string().optional(),
});

// =============================================
// User Update Schema
// =============================================
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar: z.string().url().optional(),
  educationLevel: z.string().optional(),
  institution: z.string().optional(),
  bio: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  experience: z.number().int().optional(),
});
