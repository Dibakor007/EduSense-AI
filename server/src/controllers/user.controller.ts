import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

// =============================================
// GET /api/users/:id
// =============================================
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        assessmentsCompleted: true,
        averageScore: true,
        totalStudyTime: true,
        xp: true,
        level: true,
        streakDays: true,
        educationLevel: true,
        iqLevel: true,
        institution: true,
        subjects: true,
        experience: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// PUT /api/users/profile
// =============================================
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: req.body,
    });

    const { password, ...safeUser } = user;
    res.json({ message: "Profile updated", user: safeUser });
  } catch (error) {
    res.status(500).json({ message: "Server error updating profile" });
  }
};

// =============================================
// GET /api/users/students (Teacher only - get students in their classrooms)
// =============================================
export const getStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    // Get all classrooms taught by this teacher
    const classrooms = await prisma.classroom.findMany({
      where: { teacherId: req.user.id },
      include: {
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                assessmentsCompleted: true,
                averageScore: true,
                totalStudyTime: true,
                xp: true,
                level: true,
                streakDays: true,
                educationLevel: true,
                iqLevel: true,
              },
            },
          },
        },
      },
    });

    // Flatten and deduplicate students
    const studentMap = new Map<string, any>();
    classrooms.forEach((classroom) => {
      classroom.enrollments.forEach((enrollment) => {
        if (!studentMap.has(enrollment.user.id)) {
          studentMap.set(enrollment.user.id, {
            ...enrollment.user,
            classIds: [classroom.id],
          });
        } else {
          const existing = studentMap.get(enrollment.user.id);
          existing.classIds.push(classroom.id);
        }
      });
    });

    res.json({ students: Array.from(studentMap.values()) });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
