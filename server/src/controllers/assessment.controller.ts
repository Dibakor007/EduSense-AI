import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

// =============================================
// POST /api/assessments
// =============================================
export const createAssessment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { title, subject, topic, description, duration, totalQuestions, difficulty, academicLevel, classroomId, questions } = req.body;

    const assessment = await prisma.assessment.create({
      data: {
        title,
        subject,
        topic,
        description,
        duration,
        totalQuestions,
        difficulty,
        academicLevel,
        classroomId,
        isPublished: true,
        questions: questions
          ? {
              create: questions.map((q: any) => ({
                type: q.type || "multiple_choice",
                difficulty: q.difficulty,
                topic: q.topic,
                question: q.question,
                options: q.options || [],
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                avgTimeToAnswer: q.avgTimeToAnswer || 30,
              })),
            }
          : undefined,
      },
      include: { questions: true },
    });

    // Notify students in the classroom
    if (classroomId) {
      const enrollments = await prisma.enrollment.findMany({
        where: { classroomId },
        select: { userId: true },
      });

      if (enrollments.length > 0) {
        await prisma.notification.createMany({
          data: enrollments.map((e) => ({
            userId: e.userId,
            text: `New assessment "${title}" has been assigned.`,
          })),
        });
      }
    }

    res.status(201).json({ message: "Assessment created", assessment });
  } catch (error) {
    console.error("Create assessment error:", error);
    res.status(500).json({ message: "Server error creating assessment" });
  }
};

// =============================================
// GET /api/assessments
// =============================================
export const getAssessments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { classroomId, subject } = req.query;

    const where: any = {};
    if (classroomId) where.classroomId = classroomId as string;
    if (subject) where.subject = subject as string;

    // For teachers, show all assessments in their classrooms
    if (req.user.role === "teacher") {
      const classrooms = await prisma.classroom.findMany({
        where: { teacherId: req.user.id },
        select: { id: true },
      });
      where.classroomId = { in: classrooms.map((c) => c.id) };
    }

    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        _count: { select: { submissions: true, questions: true } },
        classroom: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ assessments });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// GET /api/assessments/:id
// =============================================
export const getAssessmentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.id },
      include: {
        questions: true,
        classroom: { select: { id: true, name: true } },
        _count: { select: { submissions: true } },
      },
    });

    if (!assessment) {
      res.status(404).json({ message: "Assessment not found" });
      return;
    }

    res.json({ assessment });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// DELETE /api/assessments/:id
// =============================================
export const deleteAssessment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.assessment.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Assessment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
