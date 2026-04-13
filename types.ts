export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  avatar: string;
  stats: {
    assessmentsCompleted: number;
    averageScore: number;
    totalStudyTime: number; // minutes for students, hours for teachers
  };
  classIds?: string[];
  xp?: number;
  level?: number;
  streakDays?: number;
  educationLevel?: string;
  iqLevel?: number;
  // Teacher-specific fields
  institution?: string;
  subjects?: string[];
  experience?: number; // years
  bio?: string;
}

export interface Classroom {
  id: string;
  name: string;
  teacherId: string;
  studentIds: string[];
  classCode: string;
}

export interface ClassroomResource {
  id: string;
  classroomId: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
}

export interface Assessment {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  description: string;
  duration: number; // minutes
  totalQuestions: number;
  difficulty: "easy" | "medium" | "hard";
  startDate: string;
  classId?: string; // Link assessment to a specific class
  academicLevel?: string;
}

export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "code";

export interface Question {
  id: string;
  assessmentId: string;
  type: QuestionType;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  question: string;
  options: string[];
  correctAnswer: string;
  avgTimeToAnswer: number; // seconds
  explanation: string;
}

export interface QuestionResult {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeTaken: number; // seconds
}

export interface SkillBreakdown {
  [key: string]: {
    score: number;
    total: number;
    percentage: number;
  };
}

export interface Result {
  id: string;
  studentId: string;
  assessmentId: string;
  score: number; // out of totalQuestions
  percentage: number;
  timeTaken: number; // minutes
  submittedAt: string;
  skillBreakdown: SkillBreakdown;
  questionResults: QuestionResult[];
}

export interface TeacherFeedback {
  id: string;
  submissionId: string;
  teacherId: string;
  comments: string;
  grade?: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  studentId: string;
  assessmentId: string;
  result: Result;
  submittedAt: string;
  feedback?: TeacherFeedback; // Teacher's feedback on this submission
}

export interface LearningRecommendation {
  id: string;
  skill: string;
  contentType: "video" | "article" | "practice";
  title: string;
  duration: number; // minutes
  difficulty: "easy" | "medium" | "hard";
  thumbnail: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  description?: string;
  youtubeSearchQuery?: string;
  googleSearchQuery?: string;
  keyTopics?: string[];
  source?: "mock" | "ai";
}

export interface StudentSkill {
  subject: string;
  score: number;
  fullMark: number;
  previousMastery?: number;
}

export interface ClassSkill {
  name: string;
  classAverage: number;
}

export interface GraphNode {
  id: string;
  label: string;
  mastery: number; // 0-100
  description: string;
  suggestion?: string;
  group?: string; // For color coding by topic
  previousMastery?: number; // To show progress
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GeneratedQuestion {
  question: string;
  options?: string[]; // Optional for short answer
  correctAnswer: string;
  explanation: string;
}

export interface SkillProgressRecord {
  date: string; // YYYY-MM-DD
  skill: string;
  mastery: number; // 0-100
}

export interface LearningPlanTask {
  day: number;
  title: string;
  description: string;
  type: "video" | "read" | "practice";
  topic: string;
}

export interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  attachment?:
  | {
    type: "image";
    name: string;
    data: string; // data URL for images
  }
  | {
    type: "pdf";
    name: string;
  };
  quiz?: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  };
}

// Types for Smart Class Insight
export interface StudentPerformanceRecord {
  studentId: string;
  studentName: string;
  classId: string;
  subject: string;
  topic: string;
  score: number; // percentage
  date: string; // YYYY-MM-DD
  assessmentId: string;
}

export interface ClassInsightReport {
  generatedAt: string;
  overallAverage: number;
  weakTopics: { topic: string; averageScore: number }[];
  improvingStudents: { name: string; id: string }[];
  backlogStudents: { name: string; id: string }[];
  subjectAverages: { name: string; averageScore: number }[];
  performanceDistribution: { name: string; count: number; color: string }[];
  aiSummary: string;
}

export interface SkillDetailRecommendation {
  type: "video" | "article" | "practice";
  title: string;
  description: string;
}

export interface SkillDetailContent {
  trendAnalysis: {
    summary: string;
    keyObservation: string;
  };
  recommendations: SkillDetailRecommendation[];
}

export interface RealLifeApplication {
  useCases: {
    title: string;
    description: string;
    icon: string;
  }[];
  interactiveZone: {
    miniChallenge: string;
    solutionHint: string;
  };
  realityCheck: {
    careerConnections: {
      role: string;
      application: string;
    }[];
  };
}

export interface Notification {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface OnboardingStep {
  title: string;
  content: string;
}

export interface TimelineEvent {
  date: string; // YYYY-MM-DD
  skill: string;
  type: "assessment" | "milestone";
  title: string;
  score?: number; // percentage
}

export interface TimelineAiInsight {
  observation: string;
  tip: string;
}

export interface FutureSkillTrend {
  rank: number;
  skill: string;
  reason: string;
}

export interface SkillRadarSummary {
  topStrength: {
    skill: string;
    reason: string;
  };
  primaryWeakness: {
    skill: string;
    reason: string;
  };
  suggestion: string;
}
