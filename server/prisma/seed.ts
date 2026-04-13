import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.skillProgress.deleteMany();
  await prisma.teacherFeedback.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.question.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.classroomResource.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 12);

  // =============================================
  // Create Users
  // =============================================
  const teacher = await prisma.user.create({
    data: {
      id: "usr_teacher_789",
      email: "priya.singh@example.com",
      password: passwordHash,
      name: "Priya Singh",
      role: "teacher",
      avatar: "https://i.pravatar.cc/100?u=priyasingh",
      institution: "Dhaka International School",
      subjects: ["Computer Science", "Data Structures", "Algorithms"],
      experience: 8,
      bio: "Passionate educator with 8 years of experience.",
    },
  });

  const student1 = await prisma.user.create({
    data: {
      id: "usr_123",
      email: "rahul.sharma@example.com",
      password: passwordHash,
      name: "Rahul Sharma",
      role: "student",
      avatar: "https://i.pravatar.cc/100?u=rahulsharma",
      assessmentsCompleted: 5,
      averageScore: 82.1,
      totalStudyTime: 450,
      xp: 245,
      level: 3,
      streakDays: 2,
      educationLevel: "SSC (Class 9-10)",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      id: "usr_456",
      email: "anjali.mehta@example.com",
      password: passwordHash,
      name: "Anjali Mehta",
      role: "student",
      avatar: "https://i.pravatar.cc/100?u=anjalimehta",
      assessmentsCompleted: 6,
      averageScore: 88.0,
      totalStudyTime: 510,
      xp: 510,
      level: 4,
      educationLevel: "HSC (Class 11-12)",
    },
  });

  const student3 = await prisma.user.create({
    data: {
      id: "usr_789",
      email: "vikram.reddy@example.com",
      password: passwordHash,
      name: "Vikram Reddy",
      role: "student",
      avatar: "https://i.pravatar.cc/100?u=vikramreddy",
      assessmentsCompleted: 4,
      averageScore: 75.0,
      totalStudyTime: 400,
      xp: 15,
      level: 1,
      streakDays: 1,
    },
  });

  const student4 = await prisma.user.create({
    data: {
      id: "usr_101",
      email: "sneha.patel@example.com",
      password: passwordHash,
      name: "Sneha Patel",
      role: "student",
      avatar: "https://i.pravatar.cc/100?u=snehapatel",
      assessmentsCompleted: 7,
      averageScore: 91.0,
      totalStudyTime: 600,
      xp: 850,
      level: 5,
      streakDays: 4,
    },
  });

  const student5 = await prisma.user.create({
    data: {
      id: "usr_112",
      email: "arjun.kumar@example.com",
      password: passwordHash,
      name: "Arjun Kumar",
      role: "student",
      avatar: "https://i.pravatar.cc/100?u=arjunkumar",
      assessmentsCompleted: 5,
      averageScore: 81.0,
      totalStudyTime: 480,
      xp: 200,
      level: 2,
    },
  });

  console.log("✓ Users created");

  // =============================================
  // Create Classrooms
  // =============================================
  const classroom1 = await prisma.classroom.create({
    data: {
      id: "cls_cs101_2025",
      name: "CS 101: Data Structures 2025",
      classCode: "CS101-A8B2C",
      teacherId: teacher.id,
    },
  });

  const classroom2 = await prisma.classroom.create({
    data: {
      id: "cls_cs202_2025",
      name: "CS 202: Algorithms 2025",
      classCode: "CS202-X4Y5Z",
      teacherId: teacher.id,
    },
  });

  console.log("✓ Classrooms created");

  // =============================================
  // Enroll Students
  // =============================================
  const studentIds = [student1.id, student2.id, student3.id, student4.id, student5.id];
  for (const studentId of studentIds) {
    await prisma.enrollment.create({
      data: { userId: studentId, classroomId: classroom1.id },
    });
  }

  console.log("✓ Students enrolled");

  // =============================================
  // Create Assessments with Questions
  // =============================================
  const assessment1 = await prisma.assessment.create({
    data: {
      id: "asmt_456",
      title: "Data Structures Mid-term",
      subject: "Computer Science",
      topic: "Linked Lists",
      description: "Covering arrays, linked lists, stacks, and queues.",
      duration: 45,
      totalQuestions: 5,
      difficulty: "medium",
      academicLevel: "HSC (Class 11-12)",
      classroomId: classroom1.id,
      isPublished: true,
      questions: {
        create: [
          {
            type: "multiple_choice",
            difficulty: "easy",
            topic: "Arrays",
            question: "What is the time complexity of accessing an element in an array by its index?",
            options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
            correctAnswer: "O(1)",
            explanation: "Array elements are stored in contiguous memory locations.",
          },
          {
            type: "multiple_choice",
            difficulty: "medium",
            topic: "Linked Lists",
            question: "Which data structure uses LIFO (Last-In, First-Out) principle?",
            options: ["Queue", "Stack", "Array", "Linked List"],
            correctAnswer: "Stack",
            explanation: "A stack follows the Last-In, First-Out (LIFO) principle.",
          },
          {
            type: "multiple_choice",
            difficulty: "medium",
            topic: "Stacks",
            question: "What is the process of adding an element to a stack called?",
            options: ["Enqueue", "Push", "Pop", "Dequeue"],
            correctAnswer: "Push",
            explanation: "'Push' adds an element to the top of a stack.",
          },
          {
            type: "multiple_choice",
            difficulty: "hard",
            topic: "Queues",
            question: "Which of the following is not a type of queue?",
            options: ["Simple Queue", "Circular Queue", "Priority Queue", "Stacked Queue"],
            correctAnswer: "Stacked Queue",
            explanation: "'Stacked Queue' is not a standard type of queue.",
          },
          {
            type: "short_answer",
            difficulty: "medium",
            topic: "Linked Lists",
            question: "What is the term for a pointer that points to nothing?",
            options: [],
            correctAnswer: "null",
            explanation: "The end of a linked list is signified by a null pointer.",
          },
        ],
      },
    },
  });

  await prisma.assessment.create({
    data: {
      id: "asmt_789",
      title: "Algorithms Final Exam",
      subject: "Computer Science",
      topic: "Sorting Algorithms",
      description: "A comprehensive exam on sorting algorithms.",
      duration: 90,
      totalQuestions: 5,
      difficulty: "hard",
      academicLevel: "University Level",
      classroomId: classroom1.id,
      isPublished: true,
    },
  });

  await prisma.assessment.create({
    data: {
      id: "asmt_123",
      title: "Intro to CS Pop Quiz",
      subject: "Computer Science",
      topic: "Arrays",
      description: "A quick quiz to check your understanding.",
      duration: 15,
      totalQuestions: 5,
      difficulty: "easy",
      academicLevel: "SSC (Class 9-10)",
      classroomId: classroom1.id,
      isPublished: true,
    },
  });

  console.log("✓ Assessments created");

  // =============================================
  // Create Submissions
  // =============================================
  await prisma.submission.createMany({
    data: [
      {
        studentId: student4.id, assessmentId: "asmt_456",
        score: 5, percentage: 100, timeTaken: 1500,
        skillBreakdown: {}, questionResults: [],
      },
      {
        studentId: student2.id, assessmentId: "asmt_456",
        score: 4, percentage: 80, timeTaken: 1800,
        skillBreakdown: {}, questionResults: [],
      },
      {
        studentId: student1.id, assessmentId: "asmt_456",
        score: 3, percentage: 60, timeTaken: 2100,
        skillBreakdown: {}, questionResults: [],
      },
      {
        studentId: student5.id, assessmentId: "asmt_456",
        score: 5, percentage: 100, timeTaken: 1200,
        skillBreakdown: {}, questionResults: [],
      },
      {
        studentId: student4.id, assessmentId: "asmt_123",
        score: 5, percentage: 100, timeTaken: 600,
        skillBreakdown: {}, questionResults: [],
      },
      {
        studentId: student2.id, assessmentId: "asmt_123",
        score: 4, percentage: 80, timeTaken: 700,
        skillBreakdown: {}, questionResults: [],
      },
    ],
  });

  console.log("✓ Submissions created");

  // =============================================
  // Create Notifications
  // =============================================
  await prisma.notification.createMany({
    data: [
      { userId: student1.id, text: 'New assessment "Algorithms Final Exam" has been assigned.' },
      { userId: student1.id, text: 'Your AI Learning Path for "Time Complexity" is ready!' },
      { userId: teacher.id, text: 'Vikram Reddy scored 55% on "Data Structures Mid-term".' },
      { userId: teacher.id, text: '3 students have not completed the "Intro to CS Pop Quiz".' },
    ],
  });

  console.log("✓ Notifications created");

  // =============================================
  // Create Skill Progress Data
  // =============================================
  await prisma.skillProgress.createMany({
    data: [
      { userId: student1.id, skill: "Arrays", mastery: 90, date: new Date("2025-10-28") },
      { userId: student1.id, skill: "Linked Lists", mastery: 75, date: new Date("2025-10-20") },
      { userId: student1.id, skill: "Algorithms", mastery: 65, date: new Date("2025-10-18") },
      { userId: student1.id, skill: "Time Complexity", mastery: 35, date: new Date("2025-10-30") },
    ],
  });

  console.log("✓ Skill progress created");

  // =============================================
  // Create Resources
  // =============================================
  await prisma.classroomResource.createMany({
    data: [
      { classroomId: classroom1.id, fileName: "Lecture 1 - Intro to Arrays.pdf", fileType: "pdf" },
      { classroomId: classroom1.id, fileName: "Midterm Study Guide.docx", fileType: "docx" },
      { classroomId: classroom2.id, fileName: "Algorithms Cheatsheet.pptx", fileType: "pptx" },
    ],
  });

  console.log("✓ Resources created");

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📋 Login Credentials:");
  console.log("   Student: rahul.sharma@example.com / password123");
  console.log("   Teacher: priya.singh@example.com  / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
