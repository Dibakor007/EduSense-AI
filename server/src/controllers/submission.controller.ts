import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

// =============================================
// POST /api/submissions
// =============================================
export const submitAssessment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { assessmentId, score, percentage, timeTaken, skillBreakdown, questionResults } = req.body;

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        studentId: req.user.id,
        assessmentId,
        score,
        percentage,
        timeTaken,
        skillBreakdown,
        questionResults,
      },
      include: {
        assessment: {
          select: { title: true, classroomId: true },
        },
      },
    });

    // Update student stats
    const allSubmissions = await prisma.submission.findMany({
      where: { studentId: req.user.id },
    });

    const totalAssessments = allSubmissions.length;
    const avgScore = allSubmissions.reduce((acc, s) => acc + s.percentage, 0) / totalAssessments;

    // Calculate XP gain
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    let xpGained = 0;
    if (assessment) {
      switch (assessment.difficulty) {
        case "easy": xpGained = 10; break;
        case "medium": xpGained = 25; break;
        case "hard": xpGained = 50; break;
      }
    }

    // Level up logic
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (currentUser) {
      let newXp = (currentUser.xp || 0) + xpGained;
      let newLevel = currentUser.level || 1;
      const xpToLevelUp = (level: number) => 100 + (level - 1) * 50;

      while (newXp >= xpToLevelUp(newLevel)) {
        newXp -= xpToLevelUp(newLevel);
        newLevel++;
      }

      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          assessmentsCompleted: totalAssessments,
          averageScore: Math.round(avgScore * 10) / 10,
          xp: newXp,
          level: newLevel,
        },
      });
    }

    // Store skill progress records
    if (skillBreakdown && typeof skillBreakdown === "object") {
      const progressEntries = Object.entries(skillBreakdown).map(([skill, data]: [string, any]) => ({
        userId: req.user!.id,
        skill,
        mastery: Math.round(data.percentage || 0),
      }));

      if (progressEntries.length > 0) {
        await prisma.skillProgress.createMany({ data: progressEntries });
      }
    }

    // Notify teacher
    if (submission.assessment.classroomId) {
      const classroom = await prisma.classroom.findUnique({
        where: { id: submission.assessment.classroomId },
      });

      if (classroom) {
        await prisma.notification.create({
          data: {
            userId: classroom.teacherId,
            text: `Student completed "${submission.assessment.title}" with ${percentage.toFixed(1)}%`,
          },
        });
      }
    }

    res.status(201).json({
      message: "Assessment submitted",
      submission,
      xpGained,
    });
  } catch (error) {
    console.error("Submit error:", error);
    res.status(500).json({ message: "Server error submitting assessment" });
  }
};

// =============================================
// GET /api/submissions
// =============================================
export const getSubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { assessmentId, studentId } = req.query;
    const where: any = {};

    if (req.user.role === "student") {
      where.studentId = req.user.id;
    } else if (studentId) {
      where.studentId = studentId as string;
    }

    if (assessmentId) where.assessmentId = assessmentId as string;

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        assessment: {
          select: { id: true, title: true, subject: true, topic: true, difficulty: true },
        },
        student: {
          select: { id: true, name: true, avatar: true },
        },
        feedback: true,
      },
      orderBy: { submittedAt: "desc" },
    });

    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// POST /api/submissions/:id/feedback (Teacher)
// =============================================
export const addFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { comments, grade } = req.body;

    const feedback = await prisma.teacherFeedback.create({
      data: {
        submissionId: req.params.id,
        teacherId: req.user.id,
        comments,
        grade,
      },
    });

    // Notify the student
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: { assessment: { select: { title: true } } },
    });

    if (submission) {
      await prisma.notification.create({
        data: {
          userId: submission.studentId,
          text: `Your teacher left feedback on "${submission.assessment.title}"`,
        },
      });
    }

    res.status(201).json({ message: "Feedback added", feedback });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
