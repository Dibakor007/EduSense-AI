import React, { useEffect, useMemo, useState } from "react";
import AcademicLevelSelectionView from "./components/AcademicLevelSelectionView";
import AIGeneratorView from "./components/AIGeneratorView";
import { AITutor } from "./components/AITutor";
import AssessmentDetailView from "./components/AssessmentDetailView";
import AssessmentEditorView from "./components/AssessmentEditorView";
import AssessmentView from "./components/AssessmentView";
import Button from "./components/Button";
import DashboardView from "./components/DashboardView";
import DynamicLearningPathView from "./components/DynamicLearningPathView";
import EmotionAwareLearning from "./components/EmotionAwareLearning";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { BookOpenIcon, SparklesIcon } from "./components/icons";
import IQTestView from "./components/IQTestView";
import KnowledgeGraphView from "./components/KnowledgeGraphView";
import LoginView from "./components/LoginView";
import Modal from "./components/Modal";
import MyClassroomsListView from "./components/MyClassroomsListView";
import OnboardingTour from "./components/OnboardingTour";
import PersonalizedLearningPathView from "./components/PersonalizedLearningPathView";
import ProgressTimelineView from "./components/ProgressTimelineView";
import RealLifeAppContextView from "./components/RealLifeAppContextView";
import ResultsView from "./components/ResultsView";
import RewardStoreView from "./components/RewardStoreView";
import Sidebar from "./components/Sidebar";
import SkillRadarView from "./components/SkillRadarView";
import SmartClassInsightView from "./components/SmartClassInsightView";
import StudentClassroomView from "./components/StudentClassroomView";
import StudentDetailView from "./components/StudentDetailView";
import TeacherDashboardView from "./components/TeacherDashboardView";
import UserProfileView from "./components/UserProfileView";
import VoiceBasedLearningAssistant from "./components/VoiceBasedLearningAssistant";
import {
  academicSubjects,
  mockAllNotifications,
  mockAssessments,
  mockClassrooms,
  mockClassSkills,
  mockQuestions,
  mockResources,
  mockSkillProgressData,
  mockStudentGraphData,
  mockStudents,
  mockStudentSkills,
  mockSubmissions,
  mockTeacher,
  mockTimelineEvents,
  mockUser,
  studentOnboardingSteps,
  teacherOnboardingSteps,
} from "./data";
import { generateQuizQuestions } from "./services/aiService";
import { unifiedDataService } from "./services/dataService";
import {
  Assessment,
  Classroom,
  ClassroomResource,
  GraphNode,
  KnowledgeGraphData,
  Notification,
  Question,
  Result,
  SkillProgressRecord,
  StudentSkill,
  Submission,
  TimelineEvent,
  User,
} from "./types";

export type View =
  // Student Views
  | "dashboard"
  | "myClassrooms"
  | "assessment"
  | "assessmentDetail"
  | "results"
  | "skillRadar"
  | "knowledgeGraph"
  | "aiGenerator"
  | "progressTimeline"
  | "dynamicLearningPath"
  | "personalizedLearningPath"
  | "studentClassroom"
  | "rewardStore"
  | "realLifeAppContext"
  | "userProfile"
  | "iqTest"
  | "voiceAssistant"
  | "emotionAwareLearning"
  // Teacher Views
  | "teacherDashboard"
  | "teacherStudentDetail"
  | "smartClassInsight"
  | "assessmentEditor";

const App: React.FC = () => {
  // Initialize user from localStorage
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("edusense_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [currentView, setCurrentView] = useState<View>(
    user
      ? user.role === "teacher"
        ? "teacherDashboard"
        : "dashboard"
      : "dashboard"
  );
  const [viewHistory, setViewHistory] = useState<View[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(
    null
  );
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [completedAssessment, setCompletedAssessment] =
    useState<Assessment | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [lastResult, setLastResult] = useState<Result | null>(null); // Persist last result for dashboard
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [lastXpGain, setLastXpGain] = useState<number | null>(null);
  const [initialPracticeTopic, setInitialPracticeTopic] = useState<
    string | null
  >(null);

  // New state for Onboarding and Notifications
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [allNotifications, setAllNotifications] =
    useState<Notification[]>(mockAllNotifications);
  const [isFirstLogin, setIsFirstLogin] = useState(true);
  const [needsAcademicLevelSelection, setNeedsAcademicLevelSelection] =
    useState(false);

  // Centralized state for classrooms and students
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => {
    try {
      const saved = localStorage.getItem("edusense_classrooms");
      if (saved && saved.trim()) {
        const parsed = JSON.parse(saved);
        // Verify data is valid
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load classrooms from localStorage:", e);
    }
    return mockClassrooms;
  });
  const [students, setStudents] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem("edusense_students");
      if (saved && saved.trim()) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load students from localStorage:", e);
    }
    return mockStudents;
  });
  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    try {
      const saved = localStorage.getItem("edusense_assessments");
      if (saved && saved.trim()) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load assessments from localStorage:", e);
    }
    return mockAssessments;
  });
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [selectedClass, setSelectedClass] = useState<Classroom | null>(null);
  const [resources, setResources] =
    useState<ClassroomResource[]>(mockResources);

  // State for modals controlled by the global header
  const [isJoinClassModalOpen, setJoinClassModalOpen] = useState(false);
  const [isAssessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [assessmentModalStep, setAssessmentModalStep] = useState<
    "subject" | "topic" | "quantity"
  >("subject");
  const [selectedSubjectForAssessment, setSelectedSubjectForAssessment] =
    useState<string | null>(null);
  const [selectedTopicForAssessment, setSelectedTopicForAssessment] = useState<
    string | null
  >(null);
  const [assessmentQuestionCount, setAssessmentQuestionCount] =
    useState<number>(10);
  const [joinClassCode, setJoinClassCode] = useState("");

  // State for AI-generated assessments
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<
    Question[] | null
  >(null);

  // State for dynamic analytics data
  const [skillProgress, setSkillProgress] = useState<SkillProgressRecord[]>(
    mockSkillProgressData
  );
  const [timelineEvents, setTimelineEvents] =
    useState<TimelineEvent[]>(mockTimelineEvents);
  const [knowledgeGraphData, setKnowledgeGraphData] =
    useState<KnowledgeGraphData>(mockStudentGraphData);
  const [studentSkills, setStudentSkills] =
    useState<StudentSkill[]>(mockStudentSkills);

  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(
    null
  );

  // Teacher specific state
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    try {
      const saved = localStorage.getItem("edusense_submissions");
      if (saved && saved.trim()) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load submissions from localStorage:", e);
    }
    return mockSubmissions;
  });
  const [selectedAssessmentForInsight, setSelectedAssessmentForInsight] =
    useState<string | null>(null);

  const notifications = useMemo(() => {
    if (!user) return [];
    return allNotifications
      .filter((n) => n.userId === user.id)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }, [user, allNotifications]);

  // Sync state with unified data service for real-time updates
  useEffect(() => {
    unifiedDataService.updateAssessments(assessments);
    unifiedDataService.updateSubmissions(submissions);
    unifiedDataService.updateClassrooms(classrooms);
  }, [assessments, submissions, classrooms]);

  // Subscribe to data changes from the unified service
  useEffect(() => {
    const unsubscribe = unifiedDataService.subscribe((data) => {
      // Update local state when unified data service changes
      setAssessments(data.assessments);
      setSubmissions(data.submissions);
      setClassrooms(data.classrooms);
    });
    return unsubscribe;
  }, []);

  // Persist classrooms to localStorage
  useEffect(() => {
    localStorage.setItem("edusense_classrooms", JSON.stringify(classrooms));
  }, [classrooms]);

  // Persist students to localStorage
  useEffect(() => {
    localStorage.setItem("edusense_students", JSON.stringify(students));
  }, [students]);

  // Persist assessments to localStorage
  useEffect(() => {
    localStorage.setItem("edusense_assessments", JSON.stringify(assessments));
  }, [assessments]);

  // Persist submissions to localStorage
  useEffect(() => {
    localStorage.setItem("edusense_submissions", JSON.stringify(submissions));
  }, [submissions]);

  const handleLogin = (credentials: {
    email: string;
    pass: string;
    role: "student" | "teacher";
  }) => {
    // In a real app, you'd validate credentials against a backend
    console.log(`Logging in as ${credentials.role} with ${credentials.email}`);
    if (credentials.role === "student") {
      // Check if user already exists in localStorage with updated data (e.g., joined classrooms)
      const savedUser = localStorage.getItem("edusense_user");
      const studentUser = savedUser ? JSON.parse(savedUser) : mockUser;
      setUser(studentUser);
      localStorage.setItem("edusense_user", JSON.stringify(studentUser));
      if (!studentUser.educationLevel) {
        setNeedsAcademicLevelSelection(true);
      } else {
        setCurrentView("dashboard");
      }
    } else {
      // Check if teacher already exists in localStorage
      const savedUser = localStorage.getItem("edusense_user");
      const teacherUser = savedUser ? JSON.parse(savedUser) : mockTeacher;
      setUser(teacherUser);
      localStorage.setItem("edusense_user", JSON.stringify(teacherUser));
      setCurrentView("teacherDashboard");
    }

    if (isFirstLogin) {
      setShowOnboarding(true);
      setIsFirstLogin(false);
    }

    setLastXpGain(null);
    setViewHistory([]);
  };

  const handleStudentSignup = (signupData: {
    name: string;
    email: string;
    pass: string;
  }) => {
    // Use funny avatar styles from dicebear
    const avatarStyles = ['avataaars', 'adventurer', 'pixel-art', 'fun-emoji', 'lorelei'];
    const randomStyle = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
    const newStudent: User = {
      id: `usr_${Date.now()}`,
      name: signupData.name,
      email: signupData.email,
      role: "student",
      avatar: `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${signupData.email}`,
      stats: { assessmentsCompleted: 0, averageScore: 0, totalStudyTime: 0 },
      classIds: [],
      xp: 0,
      level: 1,
      streakDays: 0,
      iqLevel: 0,
      educationLevel: undefined, // Let user select this after login
    };

    setStudents((prev) => [...prev, newStudent]);

    setUser(newStudent);
    localStorage.setItem("edusense_user", JSON.stringify(newStudent));
    setNeedsAcademicLevelSelection(true); // Direct new user to selection screen

    // Onboarding tour will show after academic level selection
    setIsFirstLogin(true);

    setLastXpGain(null);
    setViewHistory([]);
  };

  const handleAcademicLevelSelect = (level: string) => {
    if (!user) return;
    const updatedUser = { ...user, educationLevel: level };
    setUser(updatedUser);
    localStorage.setItem("edusense_user", JSON.stringify(updatedUser));
    setStudents((prev) =>
      prev.map((s) => (s.id === user.id ? updatedUser : s))
    );
    setNeedsAcademicLevelSelection(false);

    // Now that setup is complete, show the onboarding tour
    if (isFirstLogin) {
      setShowOnboarding(true);
      setIsFirstLogin(false);
    }
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("edusense_user");
    setViewHistory([]);
  };

  const handleUpdateUserProfile = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("edusense_user", JSON.stringify(updatedUser));
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedUser.id ? updatedUser : s))
    );
  };

  const handleMarkNotificationsRead = (notificationId?: string) => {
    if (!user) return;
    setAllNotifications((prev) =>
      prev.map((n) => {
        if (n.userId !== user.id) return n; // Only affect current user's notifications
        if (notificationId) {
          return n.id === notificationId ? { ...n, read: true } : n;
        }
        return { ...n, read: true }; // Mark all as read for the current user
      })
    );
  };

  const handleStartAssessment = async (
    subject: string,
    topic: string,
    questionCount: number,
    academicLevel: string,
    isPractice: boolean = false
  ) => {
    // Clear previous results before starting a new one
    setResult(null);
    setCompletedAssessment(null);

    setAssessmentModalOpen(false);
    setIsGeneratingQuiz(true);
    setGeneratedQuestions(null);

    const dynamicAssessment: Assessment = {
      id: `dyn-asmt-${Date.now()}`,
      title: `${topic} Assessment`,
      subject: subject,
      topic: topic,
      description: `An AI-generated assessment on ${topic} under ${subject} for ${academicLevel} level.`,
      duration: questionCount * 1.5, // 90 seconds per question
      totalQuestions: questionCount,
      difficulty: "medium", // Can be made dynamic later
      startDate: new Date().toISOString(),
      academicLevel: academicLevel,
    };

    try {
      const aiGenerated = await generateQuizQuestions(
        subject,
        topic,
        dynamicAssessment.difficulty,
        questionCount,
        academicLevel
      );

      if (!aiGenerated || aiGenerated.length === 0) {
        throw new Error("AI returned no questions.");
      }

      const mappedQuestions: Question[] = aiGenerated.map((q, index) => ({
        id: `ai-q-${dynamicAssessment.id}-${index}`,
        assessmentId: dynamicAssessment.id,
        type: "multiple_choice",
        difficulty: dynamicAssessment.difficulty,
        topic: topic,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        avgTimeToAnswer: 30, // default value
      }));

      setGeneratedQuestions(mappedQuestions);
      setActiveAssessment(dynamicAssessment);
      setIsPracticeMode(isPractice);
      handleNavigate("assessment");
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      alert(
        "Sorry, we couldn't generate the quiz questions at this time. Please try again."
      );
    } finally {
      setIsGeneratingQuiz(false);
      // Reset modal state
      setAssessmentModalStep("subject");
      setSelectedSubjectForAssessment(null);
      setAssessmentQuestionCount(10);
    }
  };

  const handleSelectAssessment = (assessment: Assessment) => {
    setAssessmentModalOpen(false); // Close modal if open
    setSelectedAssessment(assessment);
    handleNavigate("assessmentDetail");
  };

  const applyXpAndLevelUp = (currentUser: User, xpGained: number): User => {
    let currentXp = currentUser.xp ?? 0;
    let currentLevel = currentUser.level ?? 1;
    let newTotalXp = currentXp + xpGained;

    const xpToLevelUp = (level: number) => 100 + (level - 1) * 50;

    let requiredForNext = xpToLevelUp(currentLevel);
    while (newTotalXp >= requiredForNext) {
      newTotalXp -= requiredForNext;
      currentLevel++;
      requiredForNext = xpToLevelUp(currentLevel);
    }

    return {
      ...currentUser,
      xp: newTotalXp,
      level: currentLevel,
    };
  };

  const handleSubmitAssessment = (finalResult: Result) => {
    // Gamification Logic
    if (user && user.role === "student" && !isPracticeMode) {
      const assessment = activeAssessment;
      if (assessment) {
        let xpGained = 0;
        switch (assessment.difficulty) {
          case "easy":
            xpGained = 10;
            break;
          case "medium":
            xpGained = 25;
            break;
          case "hard":
            xpGained = 50;
            break;
        }

        const newStreak = (user.streakDays ?? 0) + 1;
        if (newStreak >= 3) {
          xpGained += 30; // Streak bonus
        }
        setLastXpGain(xpGained);

        let updatedUser = applyXpAndLevelUp(user, xpGained);
        updatedUser = { ...updatedUser, streakDays: newStreak };
        setUser(updatedUser);
        localStorage.setItem("edusense_user", JSON.stringify(updatedUser));

        // Add to submissions and sync with unified data service
        const newSubmission: Submission = {
          id: `sub-${Date.now()}`,
          studentId: user.id,
          assessmentId: assessment.id,
          result: finalResult,
          submittedAt: new Date().toISOString(),
        };
        setSubmissions((prev) => [...prev, newSubmission]);
        
        // Add to unified data service for real-time updates
        unifiedDataService.addSubmission(newSubmission);

        // Create notification for teacher about submission
        const assessmentForNotif = assessments.find(a => a.id === assessment.id);
        if (assessmentForNotif && assessmentForNotif.classId) {
          const classroom = classrooms.find(c => c.id === assessmentForNotif.classId);
          if (classroom && user) {
            const teacherNotification: Notification = {
              id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              userId: classroom.teacherId,
              text: `Student ${user.name} completed assessment "${assessment.title}" with a score of ${finalResult.percentage.toFixed(1)}%.`,
              timestamp: new Date().toISOString(),
              read: false,
            };
            setAllNotifications((prev) => [...prev, teacherNotification]);
            unifiedDataService.addNotification(teacherNotification);
          }
        }
      }
    }

    // --- NEW DYNAMIC DATA LOGIC ---
    const newProgressRecords: SkillProgressRecord[] = Object.entries(
      finalResult.skillBreakdown
    ).map(([skill, data]) => ({
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
      skill,
      mastery: Math.round(data.percentage),
    }));
    setSkillProgress((prev) => [...prev, ...newProgressRecords]);

    const newTimelineEvent: TimelineEvent = {
      date: new Date().toISOString().split("T")[0],
      skill: activeAssessment?.topic || activeAssessment?.subject || "General",
      type: "assessment",
      title: `Completed: ${activeAssessment?.title}`,
      score: Math.round(finalResult.percentage),
    };
    setTimelineEvents((prev) => [...prev, newTimelineEvent]);

    setKnowledgeGraphData((prevData) => {
      const newData = JSON.parse(JSON.stringify(prevData)); // Deep copy
      Object.entries(finalResult.skillBreakdown).forEach(([skill, data]) => {
        const node = newData.nodes.find((n: GraphNode) => n.label === skill);
        if (node) {
          node.previousMastery = node.mastery;
          node.mastery = Math.round(data.percentage);
        }
      });
      return newData;
    });

    setStudentSkills((prevSkills) => {
      const updatedSkills = [...prevSkills];
      Object.entries(finalResult.skillBreakdown).forEach(([subject, data]) => {
        const skillIndex = updatedSkills.findIndex(
          (s) => s.subject === subject
        );
        if (skillIndex !== -1) {
          updatedSkills[skillIndex].previousMastery =
            updatedSkills[skillIndex].score;
          updatedSkills[skillIndex].score = Math.round(data.percentage);
        } else {
          // If skill doesn't exist, add it
          updatedSkills.push({
            subject,
            score: Math.round(data.percentage),
            fullMark: 100,
          });
        }
      });
      return updatedSkills;
    });
    // --- END NEW DYNAMIC DATA LOGIC ---

    setResult(finalResult);
    setLastResult(finalResult); // Save this result for the dashboard
    setCompletedAssessment(activeAssessment);
    handleNavigate("results");
  };

  const handleCompletePractice = (
    finalDifficulty: "Easy" | "Medium" | "Hard" | "Expert"
  ) => {
    if (user && user.role === "student") {
      let xpGained = 0;
      switch (finalDifficulty) {
        case "Easy":
          xpGained = 10;
          break;
        case "Medium":
          xpGained = 20;
          break;
        case "Hard":
          xpGained = 40;
          break;
        case "Expert":
          xpGained = 60;
          break;
      }

      const newStreak = (user.streakDays ?? 0) + 1;
      setLastXpGain(xpGained);

      let updatedUser = applyXpAndLevelUp(user, xpGained);
      updatedUser = { ...updatedUser, streakDays: newStreak };
      setUser(updatedUser);
    }
  };

  const handleUpdateIqLevel = (newLevel: number) => {
    if (!user) return;
    const updatedUser = { ...user, iqLevel: newLevel };
    setUser(updatedUser);
    localStorage.setItem("edusense_user", JSON.stringify(updatedUser));
    setStudents((prev) =>
      prev.map((s) => (s.id === user.id ? updatedUser : s))
    );
  };

  const handleSpendXp = (cost: number) => {
    if (!user || user.role !== "student" || (user.xp ?? 0) < cost) return false;
    const updatedUser = { ...user, xp: (user.xp ?? 0) - cost };
    setUser(updatedUser);
    localStorage.setItem("edusense_user", JSON.stringify(updatedUser));
    return true;
  };

  const handleSelectStudentForTeacher = (student: User) => {
    setSelectedStudent(student);
    handleNavigate("teacherStudentDetail");
  };

  const handleNavigate = (view: View, payload?: any) => {
    if (
      view !== currentView ||
      (view === "smartClassInsight" &&
        payload?.assessmentId !== selectedAssessmentForInsight)
    ) {
      setViewHistory((prev) => [...prev, currentView]);
    }

    // Clear states that are context-specific when starting a new flow
    if (view !== "results") {
      setActiveAssessment(null);
      setSelectedAssessment(null);
    }

    setIsPracticeMode(false);
    setSelectedStudent(null);
    setLastXpGain(null);
    setInitialPracticeTopic(null);
    if (view !== "assessment") setGeneratedQuestions(null);

    if (view === "studentClassroom" && payload?.classId) {
      const classToView = classrooms.find((c) => c.id === payload.classId);
      setSelectedClass(classToView || null);
    } else if (
      view !== "teacherDashboard" &&
      view !== "smartClassInsight" &&
      view !== "assessmentEditor"
    ) {
      // Don't reset selectedClass when navigating within teacher views
      setSelectedClass(null);
    }

    if (view === "smartClassInsight") {
      setSelectedAssessmentForInsight(payload?.assessmentId || null);
      if (payload?.classId) {
        const classToView = classrooms.find((c) => c.id === payload.classId);
        setSelectedClass(classToView || null);
      }
    } else {
      setSelectedAssessmentForInsight(null);
    }

    if (view === "aiGenerator" && payload?.topic) {
      setInitialPracticeTopic(payload.topic);
    }
    setCurrentView(view);
  };

  const handleBack = () => {
    if (viewHistory.length > 0) {
      const previousView = viewHistory[viewHistory.length - 1];
      setViewHistory((prev) => prev.slice(0, -1));
      setCurrentView(previousView);
    }
  };

  const handleOpenJoinClassModal = () => setJoinClassModalOpen(true);

  // Fix: Add missing handlers for teacher functionality
  const handleCreateClass = (name: string) => {
    if (!user) return;
    const newClass: Classroom = {
      id: `cls_${Date.now()}`,
      name,
      teacherId: user.id,
      studentIds: [],
      classCode: `CS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    };
    setClassrooms((prev) => [...prev, newClass]);
  };

  const handleAddStudent = (classId: string, studentEmail: string) => {
    const student = students.find((s) => s.email === studentEmail);
    const classroom = classrooms.find((c) => c.id === classId);

    if (!student) {
      return { success: false, message: "Student with this email not found." };
    }
    if (!classroom) {
      return { success: false, message: "Classroom not found." };
    }
    if (classroom.studentIds.includes(student.id)) {
      return { success: false, message: "Student is already in this class." };
    }

    setClassrooms((prev) =>
      prev.map((c) =>
        c.id === classId
          ? { ...c, studentIds: [...c.studentIds, student.id] }
          : c
      )
    );

    setStudents((prev) =>
      prev.map((s) =>
        s.id === student.id
          ? { ...s, classIds: [...(s.classIds || []), classId] }
          : s
      )
    );

    return { success: true, message: "Student added successfully." };
  };

  const handleRemoveStudent = (classId: string, studentId: string) => {
    setClassrooms((prev) =>
      prev.map((c) =>
        c.id === classId
          ? { ...c, studentIds: c.studentIds.filter((id) => id !== studentId) }
          : c
      )
    );
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              classIds: (s.classIds || []).filter((id) => id !== classId),
            }
          : s
      )
    );
  };

  const handleDeleteClassroom = (classId: string) => {
    if (!user || user.role !== "teacher") {
      alert("Only teachers can delete classrooms.");
      return { success: false, message: "Only teachers can delete classrooms." };
    }

    const classroom = classrooms.find((c) => c.id === classId);
    if (!classroom) {
      return { success: false, message: "Classroom not found." };
    }

    if (classroom.teacherId !== user.id) {
      return { success: false, message: "You can only delete your own classrooms." };
    }

    // Remove classroom from all students
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        classIds: (s.classIds || []).filter((id) => id !== classId),
      }))
    );

    // Delete the classroom
    setClassrooms((prev) => prev.filter((c) => c.id !== classId));

    // Delete all assessments for this classroom
    setAssessments((prev) => prev.filter((a) => a.classId !== classId));

    // Delete all submissions for assessments in this classroom
    const assessmentIds = assessments
      .filter((a) => a.classId === classId)
      .map((a) => a.id);
    setSubmissions((prev) =>
      prev.filter((s) => !assessmentIds.includes(s.assessmentId))
    );

    // Reset selected class if it was deleted
    if (selectedClass?.id === classId) {
      setSelectedClass(null);
    }

    return { success: true, message: "Classroom deleted successfully." };
  };

  const handleCreateAndAssignAssessment = async (details: {
    title: string;
    subject: string;
    topic: string;
    description: string;
    questionCount: number;
    duration: number;
    difficulty: "easy" | "medium" | "hard";
    classIds: string[];
    academicLevel: string;
  }) => {
    setIsGeneratingQuiz(true);

    try {
      const aiGenerated = await generateQuizQuestions(
        details.subject,
        details.topic,
        details.difficulty,
        details.questionCount,
        details.academicLevel
      );

      if (!aiGenerated || aiGenerated.length === 0) {
        throw new Error("AI returned no questions.");
      }

      const newAssessments: Assessment[] = [];
      let allNewQuestions: Question[] = [];

      details.classIds.forEach((classId) => {
        const newAssessment: Assessment = {
          id: `asmt-gen-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 5)}`,
          title: details.title,
          subject: details.subject,
          topic: details.topic,
          description: details.description,
          duration: details.duration,
          totalQuestions: details.questionCount,
          difficulty: details.difficulty,
          startDate: new Date().toISOString(),
          classId: classId,
          academicLevel: details.academicLevel,
        };
        newAssessments.push(newAssessment);

        const mappedQuestions: Question[] = aiGenerated.map(
          (q: any, index: number) => ({
            id: `q-${newAssessment.id}-${index}`,
            assessmentId: newAssessment.id,
            type: "multiple_choice",
            difficulty: details.difficulty,
            topic: details.topic,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            avgTimeToAnswer: 60,
          })
        );
        allNewQuestions = [...allNewQuestions, ...mappedQuestions];
      });

      setAssessments((prev) => [...prev, ...newAssessments]);
      setQuestions((prev) => [...prev, ...allNewQuestions]);

      // Update unified data service for real-time sync
      newAssessments.forEach(assessment => {
        unifiedDataService.addAssessment(assessment);
      });

      const newStudentNotifications: Notification[] = [];
      newAssessments.forEach((assessment) => {
        const classroom = classrooms.find((c) => c.id === assessment.classId);
        if (!classroom) return;

        classroom.studentIds.forEach((studentId) => {
          const notificationText = `New assessment assigned: "${assessment.title}". Subject: ${assessment.subject}, Questions: ${assessment.totalQuestions}, Time: ${assessment.duration} mins.`;

          newStudentNotifications.push({
            id: `notif-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 5)}`,
            userId: studentId,
            text: notificationText,
            timestamp: new Date().toISOString(),
            read: false,
          });
        });
      });
      setAllNotifications((prev) => [...prev, ...newStudentNotifications]);
      
      // Add notifications to unified service
      newStudentNotifications.forEach(notif => {
        unifiedDataService.addNotification(notif);
      });

      alert(
        `${
          newAssessments.length > 1
            ? `${newAssessments.length} assessments`
            : "Assessment"
        } created and assigned successfully! Students have been notified.`
      );
    } catch (error) {
      console.error("Failed to create assessment:", error);
      alert(
        "Sorry, we couldn't create the assessment at this time. Please try again."
      );
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleCreateManualAssessment = (details: {
    title: string;
    subject: string;
    topic: string;
    description: string;
    duration: number;
    difficulty: "easy" | "medium" | "hard";
    classIds: string[];
    academicLevel: string;
  }) => {
    const newAssessments: Assessment[] = [];

    details.classIds.forEach((classId) => {
      const newAssessment: Assessment = {
        id: `asmt-man-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: details.title,
        subject: details.subject,
        topic: details.topic,
        description: details.description,
        duration: details.duration,
        totalQuestions: 0, // Starts with 0 questions
        difficulty: details.difficulty,
        startDate: new Date().toISOString(),
        classId: classId,
        academicLevel: details.academicLevel,
      };
      newAssessments.push(newAssessment);
    });

    setAssessments((prev) => [...prev, ...newAssessments]);

    // Update unified data service for real-time sync
    newAssessments.forEach(assessment => {
      unifiedDataService.addAssessment(assessment);
    });

    const newStudentNotifications: Notification[] = [];
    newAssessments.forEach((assessment) => {
      const classroom = classrooms.find((c) => c.id === assessment.classId);
      if (!classroom) return;

      classroom.studentIds.forEach((studentId) => {
        const notificationText = `New assessment "${assessment.title}" is being prepared by your teacher.`;

        newStudentNotifications.push({
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          userId: studentId,
          text: notificationText,
          timestamp: new Date().toISOString(),
          read: false,
        });
      });
    });
    setAllNotifications((prev) => [...prev, ...newStudentNotifications]);
    
    // Add notifications to unified service
    newStudentNotifications.forEach(notif => {
      unifiedDataService.addNotification(notif);
    });

    if (newAssessments.length > 0) {
      alert(
        "Assessment shell created! You will now be taken to the editor to add questions."
      );
      setEditingAssessment(newAssessments[0]);
      handleNavigate("assessmentEditor");
    }
  };

  const handleEditAssessment = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    handleNavigate("assessmentEditor");
  };

  const handleUpdateAssessmentQuestions = (
    assessmentId: string,
    updatedQuestions: Question[]
  ) => {
    const newQuestionsWithProperIds = updatedQuestions.map((q) => {
      if (q.id.startsWith("new-")) {
        return {
          ...q,
          id: `q-${assessmentId}-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 5)}`,
        };
      }
      return q;
    });

    setQuestions((prev) => {
      const otherQuestions = prev.filter(
        (q) => q.assessmentId !== assessmentId
      );
      return [...otherQuestions, ...newQuestionsWithProperIds];
    });

    setAssessments((prev) =>
      prev.map((a) =>
        a.id === assessmentId
          ? { ...a, totalQuestions: updatedQuestions.length }
          : a
      )
    );

    alert("Assessment updated successfully!");
    const classToReturnTo = classrooms.find(
      (c) => c.id === editingAssessment?.classId
    );
    if (classToReturnTo) {
      setSelectedClass(classToReturnTo);
    }
    handleNavigate("teacherDashboard");
  };

  const handleUploadResource = (classroomId: string, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      alert("File is too large. Maximum size is 10MB.");
      return;
    }
    const newResource: ClassroomResource = {
      id: `res_${Date.now()}`,
      classroomId,
      fileName: file.name,
      fileType: file.name.split(".").pop() || "file",
      uploadedAt: new Date().toISOString(),
    };
    setResources((prev) => [...prev, newResource]);
  };

  const handleDeleteResource = (resourceId: string) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
    }
  };

  const handleJoinClass = () => {
    if (!joinClassCode.trim()) {
      alert("Please enter a classroom code.");
      return;
    }

    const classroom = classrooms.find((c) => c.classCode.toUpperCase() === joinClassCode.trim().toUpperCase());
    
    if (!classroom) {
      const availableCodes = classrooms.map(c => c.classCode).join(", ");
      alert(`Invalid class code.\n\nAvailable codes: ${availableCodes || "No classrooms available"}`);
      return;
    }
    if (!user || user.role !== "student") return;

    if (classroom.studentIds.includes(user.id)) {
      alert("You are already in this class.");
      setJoinClassModalOpen(false);
      setJoinClassCode("");
      return;
    }

    setClassrooms((prev) =>
      prev.map((c) =>
        c.id === classroom.id
          ? { ...c, studentIds: [...c.studentIds, user.id] }
          : c
      )
    );
    
    const updatedUser = {
      ...user,
      classIds: [...(user.classIds || []), classroom.id],
    };
    setUser(updatedUser);
    localStorage.setItem("edusense_user", JSON.stringify(updatedUser));

    alert(`Successfully joined ${classroom.name}!`);
    setJoinClassModalOpen(false);
    setJoinClassCode("");
    handleNavigate("studentClassroom", { classId: classroom.id });
  };

  const subjectsForLevel = useMemo(() => {
    if (!user?.educationLevel) return [];
    const subjectsObject =
      academicSubjects[user.educationLevel as keyof typeof academicSubjects];
    return subjectsObject ? Object.keys(subjectsObject) : [];
  }, [user?.educationLevel]);

  const handleCloseAssessmentModal = () => {
    setAssessmentModalOpen(false);
    setTimeout(() => {
      setAssessmentModalStep("subject");
      setSelectedSubjectForAssessment(null);
      setSelectedTopicForAssessment(null);
      setAssessmentQuestionCount(10);
    }, 300); // Delay reset to allow for closing animation
  };

  const renderView = () => {
    if (!user) return null;

    switch (currentView) {
      case "dashboard":
        return (
          <DashboardView
            user={user}
            lastResult={lastResult}
            handleNavigate={handleNavigate}
            studentSkills={studentSkills}
          />
        );
      case "myClassrooms":
        const studentClassrooms = classrooms.filter((c) =>
          user.classIds?.includes(c.id)
        );
        const allUsers = [...students, mockTeacher];
        return (
          <MyClassroomsListView
            user={user}
            classrooms={studentClassrooms}
            onNavigate={handleNavigate}
            assessments={assessments}
            submissions={submissions}
            allUsers={allUsers}
          />
        );
      case "studentClassroom":
        if (!selectedClass)
          return (
            <MyClassroomsListView
              classrooms={classrooms.filter((c) =>
                user.classIds?.includes(c.id)
              )}
              onNavigate={handleNavigate}
              user={user}
              assessments={assessments}
              submissions={submissions}
              allUsers={[...students, mockTeacher]}
            />
          );
        return (
          <StudentClassroomView
            classroom={selectedClass}
            assessments={assessments}
            resources={resources}
            onStartAssessment={() => {}}
            onSelectAssessment={handleSelectAssessment}
            onBackToDashboard={() => handleNavigate("myClassrooms")}
          />
        );
      case "assessment":
        if (!activeAssessment) return <div>Error: No active assessment.</div>;
        const questionsForAssessment = generatedQuestions
          ? generatedQuestions
          : questions.filter((q) => q.assessmentId === activeAssessment.id);

        return (
          <AssessmentView
            assessment={activeAssessment}
            questions={questionsForAssessment}
            onSubmit={handleSubmitAssessment}
            isPracticeMode={isPracticeMode}
          />
        );
      case "assessmentDetail":
        if (!selectedAssessment)
          return <div>Error: No assessment selected.</div>;
        return (
          <AssessmentDetailView
            assessment={selectedAssessment}
            questions={questions.filter(
              (q) => q.assessmentId === selectedAssessment.id
            )}
            onStartAssessment={() => {}}
            onBackToDashboard={() =>
              handleNavigate("studentClassroom", {
                classId: selectedAssessment.classId,
              })
            }
          />
        );
      case "results":
        if (!result || !completedAssessment)
          return <div>Error: No result to display.</div>;
        const questionsForResults = completedAssessment.id.startsWith(
          "dyn-asmt-"
        )
          ? generatedQuestions ||
            questions.filter((q) => q.assessmentId === completedAssessment.id)
          : questions.filter((q) => q.assessmentId === completedAssessment.id);
        return (
          <ResultsView
            result={result}
            assessment={completedAssessment}
            questions={questionsForResults}
            onNavigate={handleNavigate}
            xpGained={lastXpGain}
          />
        );
      case "skillRadar":
        return (
          <SkillRadarView
            userRole={user.role}
            studentSkills={studentSkills}
            classSkills={mockClassSkills}
            skillProgressData={skillProgress}
          />
        );
      case "knowledgeGraph":
        return (
          <KnowledgeGraphView
            userRole={user.role}
            graphData={knowledgeGraphData}
          />
        );
      case "aiGenerator":
        // FIX: Use the correct state variable 'initialPracticeTopic' instead of 'initialTopic'.
        return (
          <AIGeneratorView
            lastResult={lastResult}
            onCompletePractice={handleCompletePractice}
            initialTopic={initialPracticeTopic || undefined}
          />
        );
      case "voiceAssistant":
        return (
          <VoiceBasedLearningAssistant
            isActive={true}
            context="learning"
            subject={user.educationLevel || "General"}
          />
        );
      case "emotionAwareLearning":
        return (
          <EmotionAwareLearning
            user={user}
            lastResult={lastResult}
            onClose={() => setCurrentView("dashboard")}
          />
        );
      case "progressTimeline":
        return (
          <ProgressTimelineView
            skillProgressData={skillProgress}
            timelineEvents={timelineEvents}
          />
        );
      case "dynamicLearningPath":
        return <DynamicLearningPathView studentSkills={studentSkills} />;
      case "personalizedLearningPath":
        return <PersonalizedLearningPathView user={user} />;
      case "rewardStore":
        return (
          <RewardStoreView
            user={user}
            lastResult={lastResult}
            onSpendXp={handleSpendXp}
            onBackToDashboard={() => handleNavigate("dashboard")}
          />
        );
      case "realLifeAppContext":
        return (
          <RealLifeAppContextView
            onBackToDashboard={() => handleNavigate("dashboard")}
          />
        );
      case "userProfile":
        return (
          <UserProfileView
            user={user}
            onUpdateProfile={handleUpdateUserProfile}
            onBack={() => handleNavigate("dashboard")}
            classrooms={classrooms}
            students={students}
          />
        );
      case "iqTest":
        return <IQTestView user={user} onUpdateIqLevel={handleUpdateIqLevel} />;

      // Teacher Views
      case "teacherDashboard":
        return (
          <TeacherDashboardView
            user={user}
            classrooms={classrooms.filter((c) => c.teacherId === user.id)}
            students={students}
            assessments={assessments}
            selectedClass={selectedClass}
            onSelectClass={setSelectedClass}
            onSelectStudent={handleSelectStudentForTeacher}
            onCreateClass={handleCreateClass}
            onAddStudent={handleAddStudent}
            onRemoveStudent={handleRemoveStudent}
            onDeleteClass={handleDeleteClassroom}
            onCreateAssessment={handleCreateAndAssignAssessment}
            onCreateManualAssessment={handleCreateManualAssessment}
            academicSubjects={academicSubjects}
            isGeneratingQuiz={isGeneratingQuiz}
            onEditAssessment={handleEditAssessment}
            submissions={submissions}
            onNavigate={handleNavigate}
            resources={resources}
            onUploadResource={handleUploadResource}
            onDeleteResource={handleDeleteResource}
          />
        );
      case "teacherStudentDetail":
        if (!selectedStudent) return <div>Error: No student selected.</div>;
        return (
          <StudentDetailView
            student={selectedStudent}
            onBack={() => handleNavigate("teacherDashboard")}
          />
        );
      case "smartClassInsight":
        return (
          <SmartClassInsightView
            classrooms={classrooms.filter((c) => c.teacherId === user.id)}
            students={students}
            assessments={assessments}
            allSubmissions={submissions}
            selectedClassId={selectedClass?.id || ""}
            assessmentId={selectedAssessmentForInsight}
            onBack={() => handleNavigate("teacherDashboard")}
          />
        );
      case "assessmentEditor":
        if (!editingAssessment)
          return <div>Error: No assessment selected for editing.</div>;
        return (
          <AssessmentEditorView
            assessment={editingAssessment}
            initialQuestions={questions.filter(
              (q) => q.assessmentId === editingAssessment.id
            )}
            onSaveChanges={handleUpdateAssessmentQuestions}
            onCancel={() => {
              const classToReturnTo = classrooms.find(
                (c) => c.id === editingAssessment?.classId
              );
              if (classToReturnTo) {
                setSelectedClass(classToReturnTo);
              }
              handleNavigate("teacherDashboard");
            }}
          />
        );
      default:
        // FIX: The exhaustive check for 'currentView' was throwing a type error. This path should be unreachable.
        return <div>Unknown view</div>;
    }
  };

  if (!user) {
    return (
      <LoginView onLogin={handleLogin} onStudentSignup={handleStudentSignup} />
    );
  }

  if (user.role === "student" && needsAcademicLevelSelection) {
    return <AcademicLevelSelectionView onSelect={handleAcademicLevelSelect} />;
  }

  return (
    <div className="flex h-screen bg-background font-sans">
      <Sidebar
        user={user}
        activeView={currentView}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        onCloseSidebar={() => setIsSidebarOpen(false)}
        classrooms={
          user.role === "teacher"
            ? classrooms.filter((c) => c.teacherId === user.id)
            : classrooms.filter((c) => user.classIds?.includes(c.id) ?? false)
        }
        selectedClass={selectedClass}
        hasLastResult={!!lastResult}
      />
      <div className="flex-1 flex flex-col overflow-hidden relative md:pl-64">
        <Header
          user={user}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activeView={currentView}
          onOpenJoinClassModal={handleOpenJoinClassModal}
          onOpenAssessmentModal={() => setAssessmentModalOpen(true)}
          onNavigateToSmartClassInsight={
            user.role === "teacher"
              ? () => handleNavigate("smartClassInsight")
              : undefined
          }
          onNavigateToMyClassrooms={
            user.role === "student"
              ? () => handleNavigate("myClassrooms")
              : undefined
          }
          onNavigateToUserProfile={() => handleNavigate("userProfile")}
          notifications={notifications}
          onMarkNotificationsRead={handleMarkNotificationsRead}
          onBack={handleBack}
          hasHistory={viewHistory.length > 0}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderView()}
          </div>
          <Footer />
        </main>
        <AITutor user={user} lastResult={lastResult} />

        {showOnboarding && (
          <OnboardingTour
            isOpen={showOnboarding}
            onClose={() => setShowOnboarding(false)}
            steps={
              user.role === "student"
                ? studentOnboardingSteps
                : teacherOnboardingSteps
            }
          />
        )}

        <Modal
          isOpen={isJoinClassModalOpen}
          onClose={() => setJoinClassModalOpen(false)}
          title="Join a Classroom"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleJoinClass();
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="classCode"
                className="block text-sm font-medium text-neutral-dark"
              >
                Class Code
              </label>
              <input
                id="classCode"
                type="text"
                value={joinClassCode}
                onChange={(e) => setJoinClassCode(e.target.value)}
                placeholder="Enter the code from your teacher"
                className="mt-1 block w-full px-4 py-3 bg-surface border border-neutral-light rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setJoinClassModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="secondary">
                Join Class
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={isAssessmentModalOpen}
          onClose={handleCloseAssessmentModal}
          title="Start an Assessment"
        >
          {assessmentModalStep === "subject" ? (
            <div className="space-y-4">
              <h3 className="font-bold text-neutral-dark">
                Choose a subject for your assessment
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {subjectsForLevel.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => {
                      setSelectedSubjectForAssessment(subject);
                      setAssessmentModalStep("topic");
                    }}
                    className="p-6 bg-surface/50 rounded-xl border-2 border-transparent hover:border-primary hover:bg-primary/5 transition-all text-center"
                  >
                    <BookOpenIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <span className="font-bold text-lg text-primary-dark">
                      {subject}
                    </span>
                  </button>
                ))}
              </div>
              {subjectsForLevel.length === 0 && (
                <p className="text-center text-neutral-medium py-8">
                  No subjects found for your academic level. Please update your
                  profile.
                </p>
              )}
            </div>
          ) : assessmentModalStep === "topic" ? (
            <div className="space-y-4">
              <button
                onClick={() => setAssessmentModalStep("subject")}
                className="text-sm font-semibold text-primary"
              >
                &larr; Back to subjects
              </button>
              <h3 className="font-bold text-neutral-dark">
                Choose a topic for{" "}
                <span className="text-primary">
                  {selectedSubjectForAssessment}
                </span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {(
                  academicSubjects[
                    user.educationLevel as keyof typeof academicSubjects
                  ]?.[selectedSubjectForAssessment!] || []
                ).map((topic: string) => (
                  <button
                    key={topic}
                    onClick={() => {
                      setSelectedTopicForAssessment(topic);
                      setAssessmentModalStep("quantity");
                    }}
                    className="p-6 bg-surface/50 rounded-xl border-2 border-transparent hover:border-secondary hover:bg-secondary/5 transition-all text-center"
                  >
                    <span className="font-bold text-lg text-secondary-dark">
                      {topic}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={() => setAssessmentModalStep("topic")}
                className="text-sm font-semibold text-primary"
              >
                &larr; Back to topics
              </button>
              <h3 className="text-xl font-bold text-neutral-extradark">
                Assessment for:{" "}
                <span className="text-primary">
                  {selectedTopicForAssessment}
                </span>
              </h3>
              <div>
                <label
                  htmlFor="question-count"
                  className="block text-lg font-semibold text-neutral-dark mb-2"
                >
                  Number of Questions:{" "}
                  <span className="font-bold text-2xl text-primary">
                    {assessmentQuestionCount}
                  </span>
                </label>
                <input
                  id="question-count"
                  type="range"
                  min="10"
                  max="30"
                  step="1"
                  value={assessmentQuestionCount}
                  onChange={(e) =>
                    setAssessmentQuestionCount(parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-neutral-light/50 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs font-semibold text-neutral-medium mt-1">
                  <span>10</span>
                  <span>30</span>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-black/10">
                <Button variant="outline" onClick={handleCloseAssessmentModal}>
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    handleStartAssessment(
                      selectedSubjectForAssessment!,
                      selectedTopicForAssessment!,
                      assessmentQuestionCount,
                      user.educationLevel!
                    )
                  }
                >
                  Generate & Start
                </Button>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={isGeneratingQuiz}
          onClose={() => {}}
          title="Preparing Your Assessment"
        >
          <div className="text-center p-8">
            <SparklesIcon className="h-12 w-12 text-primary mx-auto animate-pulse" />
            <p className="text-neutral-dark font-semibold mt-4 text-lg">
              Our AI is crafting a unique set of questions for you...
            </p>
            <p className="text-neutral-medium mt-2">
              This may take a moment. Please wait.
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default App;
