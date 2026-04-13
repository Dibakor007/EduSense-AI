import { User, Assessment, Question, LearningRecommendation, StudentSkill, ClassSkill, KnowledgeGraphData, SkillProgressRecord, Classroom, StudentPerformanceRecord, Notification, OnboardingStep, TimelineEvent, Submission, Result, ClassroomResource } from './types';

export const mockUser: User = {
  id: "usr_123",
  name: "Rahul Sharma",
  email: "rahul.sharma@example.com",
  role: "student",
  avatar: "https://i.pravatar.cc/100?u=rahulsharma",
  stats: {
    assessmentsCompleted: 5,
    averageScore: 82.1,
    totalStudyTime: 450
  },
  classIds: ["cls_cs101_2025"],
  xp: 245,
  level: 3,
  streakDays: 2,
  educationLevel: "SSC (Class 9-10)", // Default level
  iqLevel: 0,
};

export const mockTeacher: User = {
  id: "usr_teacher_789",
  name: "Priya Singh",
  email: "priya.singh@example.com",
  role: "teacher",
  avatar: "https://i.pravatar.cc/100?u=priyasingh",
  stats: {
    assessmentsCompleted: 32,
    averageScore: 78.5,
    totalStudyTime: 120
  },
  institution: "Dhaka International School",
  subjects: ["Computer Science", "Data Structures", "Algorithms"],
  experience: 8,
  bio: "Passionate educator with 8 years of experience in computer science. My goal is to make complex topics accessible and engaging for all students.",
};

export const mockStudents: User[] = [
  mockUser,
  {
    id: "usr_456",
    name: "Anjali Mehta",
    email: "anjali.mehta@example.com",
    role: "student",
    avatar: "https://i.pravatar.cc/100?u=anjalimehta",
    stats: { assessmentsCompleted: 6, averageScore: 88.0, totalStudyTime: 510 },
    classIds: ["cls_cs101_2025"],
    xp: 510,
    level: 4,
    streakDays: 0,
    iqLevel: 2,
  },
  {
    id: "usr_789",
    name: "Vikram Reddy",
    email: "vikram.reddy@example.com",
    role: "student",
    avatar: "https://i.pravatar.cc/100?u=vikramreddy",
    stats: { assessmentsCompleted: 4, averageScore: 75.0, totalStudyTime: 400 },
    classIds: ["cls_cs101_2025"],
    xp: 15,
    level: 1,
    streakDays: 1,
    iqLevel: 1,
  },
  {
    id: "usr_101",
    name: "Sneha Patel",
    email: "sneha.patel@example.com",
    role: "student",
    avatar: "https://i.pravatar.cc/100?u=snehapatel",
    stats: { assessmentsCompleted: 7, averageScore: 91.0, totalStudyTime: 600 },
    classIds: ["cls_cs101_2025"],
    xp: 850,
    level: 5,
    streakDays: 4,
    iqLevel: 3,
  },
  {
    id: "usr_112",
    name: "Arjun Kumar",
    email: "arjun.kumar@example.com",
    role: "student",
    avatar: "https://i.pravatar.cc/100?u=arjunkumar",
    stats: { assessmentsCompleted: 5, averageScore: 81.0, totalStudyTime: 480 },
    classIds: ["cls_cs101_2025"],
    xp: 200,
    level: 2,
    streakDays: 0,
    iqLevel: 1,
  }
];

export const academicSubjects = {
    'SSC (Class 9-10)': {
        'Higher Math': ['Algebra', 'Geometry', 'Trigonometry', 'Solid Geometry'],
        'Physics': ['Motion, Force and Laws of Motion', 'Work, Power and Energy', 'States of Matter and Pressure', 'Waves and Sound'],
        'Chemistry': ['Chemical Reactions', 'Acids, Bases, and Salts', 'Periodic Table', 'Carbon Compounds'],
        'Biology': ['Cell Structure and Function', 'Genetics and Evolution', 'Human Physiology', 'Plant Physiology']
    },
    'HSC (Class 11-12)': {
        'Higher Math': ['Matrices and Determinants', 'Complex Numbers', 'Calculus', 'Vectors and 3D Geometry'],
        'Physics': ['Electromagnetism', 'Optics', 'Modern Physics', 'Thermodynamics'],
        'Chemistry': ['Chemical Bonding', 'Solutions', 'Electrochemistry', 'Organic Chemistry'],
        'Biology': ['Biotechnology', 'Ecology', 'Human Reproduction', 'Photosynthesis']
    },
    'University Level': {
        'Data Structures': ['Arrays', 'Linked Lists', 'Stacks & Queues', 'Trees & Graphs', 'Hashing'],
        'Algorithms': ['Sorting Algorithms', 'Searching Algorithms', 'Dynamic Programming', 'Greedy Algorithms', 'Graph Algorithms'],
        'Operating Systems': ['Process Management', 'Memory Management', 'File Systems', 'Concurrency'],
        'Database Management': ['SQL', 'Normalization', 'ER Diagrams', 'Transaction Management']
    },
    'Solo Leveling': {
      'Abstract Reasoning': ['Pattern Recognition', 'Logical Deduction', 'Spatial Visualization'],
      'Problem Solving': ['Algorithmic Puzzles', 'Strategic Thinking', 'Creative Solutions']
    }
};

export const mockClassrooms: Classroom[] = [
  {
    id: "cls_cs101_2025",
    name: "CS 101: Data Structures 2025",
    teacherId: "usr_teacher_789",
    studentIds: ["usr_123", "usr_456", "usr_789", "usr_101", "usr_112"],
    classCode: "CS101-A8B2C",
  },
  {
    id: "cls_cs202_2025",
    name: "CS 202: Algorithms 2025",
    teacherId: "usr_teacher_789",
    studentIds: [],
    classCode: "CS202-X4Y5Z",
  }
];

export const mockResources: ClassroomResource[] = [
  {
    id: 'res_1',
    classroomId: 'cls_cs101_2025',
    fileName: 'Lecture 1 - Intro to Arrays.pdf',
    fileType: 'pdf',
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'res_2',
    classroomId: 'cls_cs101_2025',
    fileName: 'Midterm Study Guide.docx',
    fileType: 'docx',
    uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'res_3',
    classroomId: 'cls_cs202_2025',
    fileName: 'Algorithms Cheatsheet.pptx',
    fileType: 'pptx',
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const mockClassAnalytics = {
  "cls_cs101_2025": {
    skillAverages: [
      { skill: 'Arrays', averageScore: 88 },
      { skill: 'Linked Lists', averageScore: 75 },
      { skill: 'Stacks', averageScore: 92 },
      { skill: 'Queues', averageScore: 78 },
      { skill: 'Complexity', averageScore: 65 },
    ],
    performanceDistribution: [
      { name: 'High Performers (>80%)', count: 3, color: '#10B981' },
      { name: 'Average Performers (60-80%)', count: 1, color: '#F59E0B' },
      { name: 'Developing (<60%)', count: 1, color: '#EF4444' },
    ],
    studentPerformance: [
        { id: "usr_101", name: "Sneha Patel", avatar: "https://i.pravatar.cc/100?u=snehapatel", score: 91, completionRate: 100, lastActivity: "1 day ago" },
        { id: "usr_456", name: "Anjali Mehta", avatar: "https://i.pravatar.cc/100?u=anjalimehta", score: 88, completionRate: 100, lastActivity: "2 days ago" },
        { id: "usr_112", name: "Arjun Kumar", avatar: "https://i.pravatar.cc/100?u=arjunkumar", score: 81, completionRate: 100, lastActivity: "1 day ago" },
        { id: "usr_123", name: "Rahul Sharma", avatar: "https://i.pravatar.cc/100?u=rahulsharma", score: 78, completionRate: 80, lastActivity: "3 days ago" },
        { id: "usr_789", name: "Vikram Reddy", avatar: "https://i.pravatar.cc/100?u=vikramreddy", score: 55, completionRate: 60, lastActivity: "1 week ago" },
    ]
  }
};

export const mockAssessments: Assessment[] = [
  {
    id: "asmt_456",
    title: "Data Structures Mid-term",
    subject: "Computer Science",
    topic: "Linked Lists",
    description: "Covering arrays, linked lists, stacks, and queues. This assessment will test your foundational knowledge.",
    duration: 45,
    totalQuestions: 5,
    difficulty: "medium",
    startDate: "2024-11-10T10:00:00Z",
    classId: "cls_cs101_2025", // Assigned to a class
    academicLevel: "HSC (Class 11-12)",
  },
  {
    id: "asmt_789",
    title: "Algorithms Final Exam",
    subject: "Computer Science",
    topic: "Sorting Algorithms",
    description: "A comprehensive exam on sorting algorithms, time complexity, and graph traversal.",
    duration: 90,
    totalQuestions: 5,
    difficulty: "hard",
    startDate: "2024-12-15T09:00:00Z",
    classId: "cls_cs101_2025",
    academicLevel: "University Level",
  },
  {
    id: "asmt_123",
    title: "Intro to CS Pop Quiz",
    subject: "Computer Science",
    topic: "Arrays",
    description: "A quick quiz to check your understanding of fundamental concepts.",
    duration: 15,
    totalQuestions: 5,
    difficulty: "easy",
    startDate: "2024-10-25T14:00:00Z",
    classId: "cls_cs101_2025",
    academicLevel: "SSC (Class 9-10)",
  }
];

export const mockQuestions: Question[] = [
  {
    id: "q_01",
    assessmentId: "asmt_456",
    type: "multiple_choice",
    difficulty: "easy",
    topic: "Arrays",
    question: "What is the time complexity of accessing an element in an array by its index?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
    correctAnswer: "O(1)",
    avgTimeToAnswer: 20,
    explanation: "Array elements are stored in contiguous memory locations, so accessing any element by its index is a constant time operation.",
  },
  {
    id: "q_02",
    assessmentId: "asmt_456",
    type: "multiple_choice",
    difficulty: "medium",
    topic: "Linked Lists",
    question: "Which data structure uses LIFO (Last-In, First-Out) principle?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correctAnswer: "Stack",
    avgTimeToAnswer: 25,
    explanation: "A stack follows the Last-In, First-Out (LIFO) principle, where the last element added is the first one to be removed.",
  },
  {
    id: "q_03",
    assessmentId: "asmt_456",
    type: "multiple_choice",
    difficulty: "medium",
    topic: "Stacks",
    question: "What is the process of adding an element to a stack called?",
    options: ["Enqueue", "Push", "Pop", "Dequeue"],
    correctAnswer: "Push",
    avgTimeToAnswer: 20,
    explanation: "'Push' is the term used for adding an element to the top of a stack. 'Pop' is used for removing an element.",
  },
  {
    id: "q_04",
    assessmentId: "asmt_456",
    type: "multiple_choice",
    difficulty: "hard",
    topic: "Queues",
    question: "Which of the following is not a type of queue?",
    options: ["Simple Queue", "Circular Queue", "Priority Queue", "Stacked Queue"],
    correctAnswer: "Stacked Queue",
    avgTimeToAnswer: 30,
    explanation: "'Stacked Queue' is not a standard type of queue. The others are all valid implementations of the queue data structure.",
  },
  {
    id: "q_05",
    assessmentId: "asmt_456",
    type: "short_answer",
    difficulty: "medium",
    topic: "Linked Lists",
    question: "What is the term for a pointer that points to nothing, often used at the end of a linked list?",
    options: [],
    correctAnswer: "null",
    avgTimeToAnswer: 35,
    explanation: "The end of a linked list is signified by a pointer that is set to null, indicating there are no more nodes.",
  }
];

export const mockClassAverages: { [key: string]: number } = {
  "Arrays": 88,
  "Linked Lists": 75,
  "Stacks": 92,
  "Queues": 78,
  "Algorithms": 71,
  "System Design": 68,
  "Time Complexity": 45,
};

export const allMockRecommendations: LearningRecommendation[] = [
  {
    id: "rec_ll_1",
    skill: "Linked Lists",
    contentType: "video",
    title: "Visualizing Linked List Operations",
    duration: 12,
    difficulty: "easy",
    thumbnail: "https://picsum.photos/seed/rec_ll_1/300/200",
    completed: false,
    priority: 'medium',
  },
  {
    id: "rec_ll_2",
    skill: "Linked Lists",
    contentType: "practice",
    title: "Challenge: Reverse a Linked List",
    duration: 20,
    difficulty: "hard",
    thumbnail: "https://picsum.photos/seed/rec_ll_2/300/200",
    completed: false,
    priority: 'high',
  },
  {
    id: "rec_q_1",
    skill: "Queues",
    contentType: "article",
    title: "Implementing Queues with Arrays",
    duration: 8,
    difficulty: "easy",
    thumbnail: "https://picsum.photos/seed/rec_q_1/300/200",
    completed: false,
    priority: 'low',
  },
  {
    id: "rec_q_2",
    skill: "Queues",
    contentType: "video",
    title: "Circular Queues Explained",
    duration: 15,
    difficulty: "medium",
    thumbnail: "https://picsum.photos/seed/rec_q_2/300/200",
    completed: false,
    priority: 'medium',
  },
  {
    id: "rec_s_1",
    skill: "Stacks",
    contentType: "practice",
    title: "Balancing Parentheses with Stacks",
    duration: 18,
    difficulty: "medium",
    thumbnail: "https://picsum.photos/seed/rec_s_1/300/200",
    completed: false,
    priority: 'high',
  },
  {
    id: "rec_s_2",
    skill: "Stacks",
    contentType: "article",
    title: "The Call Stack: How Functions Work",
    duration: 10,
    difficulty: "easy",
    thumbnail: "https://picsum.photos/seed/rec_s_2/300/200",
    completed: false,
    priority: 'low',
  },
  {
    id: "rec_a_1",
    skill: "Arrays",
    contentType: "video",
    title: "2D Arrays (Matrices) in Depth",
    duration: 22,
    difficulty: "hard",
    thumbnail: "https://picsum.photos/seed/rec_a_1/300/200",
    completed: false,
    priority: 'medium',
  },
];

export const mockStudentSkills: StudentSkill[] = [
  { subject: 'Arrays', score: 90, fullMark: 100 },
  { subject: 'Linked Lists', score: 75, fullMark: 100 },
  { subject: 'Stacks', score: 95, fullMark: 100 },
  { subject: 'Queues', score: 82, fullMark: 100 },
  { subject: 'Algorithms', score: 65, fullMark: 100 },
  { subject: 'System Design', score: 70, fullMark: 100 },
  { subject: 'Time Complexity', score: 35, fullMark: 100},
];

export const mockClassSkills: ClassSkill[] = [
  { name: 'Arrays', classAverage: 88 },
  { name: 'Linked Lists', classAverage: 75 },
  { name: 'Stacks', classAverage: 92 },
  { name: 'Queues', classAverage: 78 },
  { name: 'Algorithms', classAverage: 71 },
  { name: 'System Design', classAverage: 68 },
];

export const mockStudentPerformanceHistory = [
    { date: '2025-09-01', score: 65 },
    { date: '2025-09-15', score: 72 },
    { date: '2025-10-01', score: 70 },
    { date: '2025-10-15', score: 85 },
    { date: '2025-11-01', score: 82 },
];

export const mockStudentRecentActivity: { type: 'assessment' | 'learning' | 'practice', title: string, detail: string, time: string, skill: string }[] = [
    { type: 'assessment', title: 'Completed: Data Structures Mid-term', detail: 'Score: 85%', time: '2 days ago', skill: 'Arrays' },
    { type: 'learning', title: 'Watched: "2D Arrays in Depth"', detail: '22 min video', time: '3 days ago', skill: 'Arrays' },
    { type: 'practice', title: 'Generated: Practice Quiz on Queues', detail: '5 questions', time: '4 hours ago', skill: 'Queues' },
    { type: 'assessment', title: 'Completed: Intro to CS Pop Quiz', detail: 'Score: 72%', time: '1 week ago', skill: 'Arrays' },
    { type: 'practice', title: 'Challenge: Reverse a Linked List', detail: 'Completed', time: '5 days ago', skill: 'Linked Lists' },
];

export const mockStudentGraphData: KnowledgeGraphData = {
  nodes: [
    { id: 'cs', label: 'CompSci Fundamentals', mastery: 82, group: 'Core Concepts', description: 'Overall understanding of core CS concepts.' },
    { id: 'ds', label: 'Data Structures', mastery: 85, group: 'Data Structures', description: 'Strong grasp of most data structures.', previousMastery: 80 },
    { id: 'arrays', label: 'Arrays', mastery: 90, group: 'Data Structures', description: 'Excellent performance on array-based questions.' },
    { id: 'lists', label: 'Linked Lists', mastery: 75, group: 'Data Structures', description: 'Good, but room for improvement in edge cases.', previousMastery: 78 },
    { id: 'stacks', label: 'Stacks & Queues', mastery: 88, group: 'Data Structures', description: 'Solid understanding of LIFO and FIFO principles.' },
    { id: 'algos', label: 'Algorithms', mastery: 65, group: 'Algorithms', description: 'Basic knowledge, but needs more practice.', previousMastery: 60 },
    { id: 'sorting', label: 'Sorting', mastery: 78, group: 'Algorithms', description: 'Understands common sorting algorithms like Bubble and Merge sort.' },
    { id: 'complexity', label: 'Time Complexity', mastery: 35, group: 'Algorithms', description: 'Struggles with Big O notation and analysis.', suggestion: 'Suggested Next Step', previousMastery: 40 },
  ],
  edges: [
    { source: 'cs', target: 'ds' },
    { source: 'cs', target: 'algos' },
    { source: 'ds', target: 'arrays' },
    { source: 'ds', target: 'lists' },
    { source: 'ds', target: 'stacks' },
    { source: 'algos', target: 'sorting' },
    { source: 'ds', target: 'complexity' },
    { source: 'algos', target: 'complexity' },
  ],
};

export const mockClassGraphData: KnowledgeGraphData = {
  nodes: [
    { id: 'cs', label: 'CompSci Fundamentals', mastery: 76, group: 'Core Concepts', description: 'Class average on core concepts.' },
    { id: 'ds', label: 'Data Structures', mastery: 83, group: 'Data Structures', description: 'Class is generally strong in this area.', previousMastery: 80 },
    { id: 'arrays', label: 'Arrays', mastery: 88, group: 'Data Structures', description: 'Highest performing topic for the class.' },
    { id: 'lists', label: 'Linked Lists', mastery: 75, group: 'Data Structures', description: 'Some students struggle with pointer manipulation.' },
    { id: 'stacks', label: 'Stacks & Queues', mastery: 85, group: 'Data Structures', description: 'Well understood by the majority of the class.' },
    { id: 'algos', label: 'Algorithms', mastery: 58, group: 'Algorithms', description: 'A common area of difficulty for the class.', suggestion: 'Class-wide Weakness', previousMastery: 62 },
    { id: 'sorting', label: 'Sorting', mastery: 71, group: 'Algorithms', description: 'Students understand the concepts but struggle with implementation.' },
    { id: 'complexity', label: 'Time Complexity', mastery: 45, group: 'Algorithms', description: 'A significant knowledge gap for many students.', suggestion: 'Class-wide Weakness' },
  ],
  edges: [
    { source: 'cs', target: 'ds' },
    { source: 'cs', target: 'algos' },
    { source: 'ds', target: 'arrays' },
    { source: 'ds', target: 'lists' },
    { source: 'ds', target: 'stacks' },
    { source: 'algos', target: 'sorting' },
    { source: 'ds', target: 'complexity' },
    { source: 'algos', target: 'complexity' },
  ],
};

export const mockSkillProgressData: SkillProgressRecord[] = [
  // Arrays Data
  { date: '2025-09-01', skill: 'Arrays', mastery: 60 },
  { date: '2025-09-10', skill: 'Arrays', mastery: 65 },
  { date: '2025-09-20', skill: 'Arrays', mastery: 72 },
  { date: '2025-10-01', skill: 'Arrays', mastery: 70 },
  { date: '2025-10-15', skill: 'Arrays', mastery: 85 },
  { date: '2025-10-28', skill: 'Arrays', mastery: 90 },

  // Linked Lists Data
  { date: '2025-09-05', skill: 'Linked Lists', mastery: 45 },
  { date: '2025-09-18', skill: 'Linked Lists', mastery: 55 },
  { date: '2025-10-05', skill: 'Linked Lists', mastery: 60 },
  { date: '2025-10-20', skill: 'Linked Lists', mastery: 75 },

  // Algorithms Data
  { date: '2025-09-03', skill: 'Algorithms', mastery: 80 },
  { date: '2025-09-15', skill: 'Algorithms', mastery: 75 },
  { date: '2025-10-02', skill: 'Algorithms', mastery: 78 },
  { date: '2025-10-18', skill: 'Algorithms', mastery: 65 },
  
  // Time Complexity
  { date: '2025-10-01', skill: 'Time Complexity', mastery: 20 },
  { date: '2025-10-10', skill: 'Time Complexity', mastery: 25 },
  { date: '2025-10-20', skill: 'Time Complexity', mastery: 30 },
  { date: '2025-10-30', skill: 'Time Complexity', mastery: 35 },
];

export const mockTimelineEvents: TimelineEvent[] = [
    { date: '2025-09-20', skill: 'Arrays', type: 'assessment', title: 'Array Pop Quiz', score: 72 },
    { date: '2025-10-15', skill: 'Arrays', type: 'assessment', title: 'Data Structures Mid-term', score: 85 },
    { date: '2025-10-28', skill: 'Arrays', type: 'milestone', title: 'Mastery Achieved!', score: 90 },
    { date: '2025-10-05', skill: 'Linked Lists', type: 'milestone', title: 'Started Linked Lists module' },
    { date: '2025-10-20', skill: 'Linked Lists', type: 'assessment', title: 'Linked Lists Challenge', score: 75 },
    { date: '2025-10-01', skill: 'Time Complexity', type: 'assessment', title: 'Big O Notation Quiz', score: 20 },
    { date: '2025-10-30', skill: 'Time Complexity', type: 'assessment', title: 'Complexity Analysis Test', score: 35 },
];

export const mockStudentPerformanceData: StudentPerformanceRecord[] = [
    // Rahul Sharma (improving)
    { studentId: "usr_123", studentName: "Rahul Sharma", classId: "cls_cs101_2025", subject: "Computer Science", topic: "Arrays", score: 70, date: "2024-10-25", assessmentId: "asmt_123"},
    { studentId: "usr_123", studentName: "Rahul Sharma", classId: "cls_cs101_2025", subject: "Computer Science", topic: "Linked Lists", score: 75, date: "2024-11-10", assessmentId: "asmt_456"},
    { studentId: "usr_123", studentName: "Rahul Sharma", classId: "cls_cs101_2025", subject: "Computer Science", topic: "Time Complexity", score: 80, date: "2024-12-15", assessmentId: "asmt_789"},
    // Anjali Mehta (high performer)
    { studentId: "usr_456", studentName: "Anjali Mehta", classId: "cls_cs101_2025", subject: "Computer Science", topic: "Arrays", score: 95, date: "2024-10-25", assessmentId: "asmt_123"},
    { studentId: "usr_456", studentName: "Anjali Mehta", classId: "cls_cs101_2025", subject: "Computer Science", topic: "Stacks", score: 90, date: "2024-11-10", assessmentId: "asmt_456"},
    { studentId: "usr_456", studentName: "Anjali Mehta", classId: "cls_cs101_2025", subject: "Computer Science", topic: "Algorithms", score: 88, date: "2024-12-15", assessmentId: "asmt_789"},
    // Vikram Reddy (struggling, backlog)
    { studentId: "usr_789", studentName: "Vikram Reddy", classId: "cls_cs101_2025", subject: "Computer Science", topic: "Arrays", score: 60, date: "2024-10-25", assessmentId: "asmt_123"},
    // Sneha Patel (high performer)
    { studentId: "usr_101", studentName: "Sneha Patel", classId: "cls_cs101_2025", subject: "Computer Science", topic: "Arrays", score: 92, date: "2024-10-25", assessmentId: "asmt_123"},
    { studentId: "usr_101", studentName: "Sneha Patel", classId: "cls_cs101_2025", subject: "Computer Science", topic: "Queues", score: 88, date: "2024-11-10", assessmentId: "asmt_456"},
    { studentId: "usr_101", studentName: "Sneha Patel", classId: "cls_cs101_2025", subject: "Computer Science", topic: "Algorithms", score: 95, date: "2024-12-15", assessmentId: "asmt_789"},
    // Arjun Kumar (average, improving)
    { studentId: "usr_112", studentName: "Arjun Kumar", classId: "cls_cs101_2025", subject: "Computer Science", topic: "Arrays", score: 75, date: "2024-10-25", assessmentId: "asmt_123"},
    { studentId: "usr_112", studentName: "Arjun Kumar", classId: "cls_cs101_2025", subject: "Computer Science", topic: "Linked Lists", score: 80, date: "2024-11-10", assessmentId: "asmt_456"},
    { studentId: "usr_112", studentName: "Arjun Kumar", classId: "cls_cs101_2025", subject: "Computer Science", topic: "Time Complexity", score: 82, date: "2024-12-15", assessmentId: "asmt_789"},
];

// --- New Mock Data ---

export const mockAllNotifications: Notification[] = [
  // Student (usr_123) notifications
  { id: 'n1', userId: 'usr_123', text: 'New assessment "Algorithms Final Exam" has been assigned.', timestamp: '2024-07-29T10:00:00Z', read: false },
  { id: 'n2', userId: 'usr_123', text: 'Your AI Learning Path for "Time Complexity" is ready!', timestamp: '2024-07-29T08:00:00Z', read: false },
  { id: 'n3', userId: 'usr_123', text: 'You unlocked a new badge: "Streak Starter"!', timestamp: '2024-07-28T12:00:00Z', read: true },
  
  // Other students for demonstration
  { id: 'n4', userId: 'usr_456', text: 'Welcome to CS 101: Data Structures 2025!', timestamp: '2024-07-27T09:00:00Z', read: true },

  // Teacher (usr_teacher_789) notifications
  { id: 't1', userId: 'usr_teacher_789', text: 'Vikram Reddy scored 55% on "Data Structures Mid-term".', timestamp: '2024-07-29T09:25:00Z', read: false },
  { id: 't2', userId: 'usr_teacher_789', text: '3 students have not completed the "Intro to CS Pop Quiz".', timestamp: '2024-07-29T09:00:00Z', read: false },
  { id: 't3', userId: 'usr_teacher_789', text: 'Smart Class Insight for "CS 101" has been updated.', timestamp: '2024-07-28T15:00:00Z', read: true },
];

const createResult = (studentId: string, assessmentId: string, score: number, total: number): Result => {
    return {
        id: `res-${studentId}-${assessmentId}`,
        studentId,
        assessmentId,
        score,
        percentage: (score / total) * 100,
        timeTaken: 25,
        submittedAt: new Date().toISOString(),
        skillBreakdown: {}, // For simplicity in mock data
        questionResults: [], // For simplicity in mock data
    };
};

export const mockSubmissions: Submission[] = [
    // Submissions for asmt_456 (Data Structures Mid-term)
    {
        id: 'sub-1', studentId: 'usr_101', assessmentId: 'asmt_456',
        result: createResult('usr_101', 'asmt_456', 5, 5), submittedAt: new Date().toISOString()
    },
    {
        id: 'sub-2', studentId: 'usr_456', assessmentId: 'asmt_456',
        result: createResult('usr_456', 'asmt_456', 4, 5), submittedAt: new Date().toISOString()
    },
    {
        id: 'sub-3', studentId: 'usr_123', assessmentId: 'asmt_456',
        result: createResult('usr_123', 'asmt_456', 3, 5), submittedAt: new Date().toISOString()
    },
    {
        id: 'sub-4', studentId: 'usr_112', assessmentId: 'asmt_456',
        result: createResult('usr_112', 'asmt_456', 5, 5), submittedAt: new Date().toISOString()
    },
    // Submissions for asmt_123 (Intro to CS Pop Quiz)
    {
        id: 'sub-5', studentId: 'usr_101', assessmentId: 'asmt_123',
        result: createResult('usr_101', 'asmt_123', 5, 5), submittedAt: new Date().toISOString()
    },
    {
        id: 'sub-6', studentId: 'usr_456', assessmentId: 'asmt_123',
        result: createResult('usr_456', 'asmt_123', 4, 5), submittedAt: new Date().toISOString()
    },
];

export const studentOnboardingSteps: OnboardingStep[] = [
    { title: 'Welcome to Your Dashboard!', content: 'This is your mission control for learning. Here you can see your progress, strengths, and weaknesses at a glance.' },
    { title: 'AI-Powered Learning Path', content: 'Navigate to the "Learning Path" in the sidebar. We create a personalized list of videos and exercises to help you improve.' },
    { title: 'Adaptive Practice', content: 'Use the "AI Quiz Generator" to practice any topic. The questions get harder or easier based on your answers!' },
    { title: 'Track Your Journey', content: 'Check out the "Progress Timeline" and "Skill Radar" to see how far you\'ve come and where you stand.' },
    { title: 'Chat with Sparky', content: 'Have a question? Your AI Tutor, Sparky, is always here to help. Just click the icon in the bottom right.' },
];

export const teacherOnboardingSteps: OnboardingStep[] = [
    { title: 'Welcome, Teacher!', content: 'This is your command center. Manage your classrooms, assign assessments, and monitor student progress all in one place.' },
    { title: 'Manage Your Classrooms', content: 'Click "Manage Class" to add students, assign work, and see how your class is performing.' },
    { title: 'Get Smart Insights', content: 'Use the "Smart Class Insight" feature to get an AI-powered analysis of your class\'s strengths, weaknesses, and trends.' },
    { title: 'You\'re All Set!', content: 'You\'re ready to empower your students with personalized learning. Good luck!' },
];