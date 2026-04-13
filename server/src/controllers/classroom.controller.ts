import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

// =============================================
// POST /api/classrooms
// =============================================
export const createClassroom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { name, description } = req.body;

    // Generate unique class code
    const classCode = `CS-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    const classroom = await prisma.classroom.create({
      data: {
        name,
        description,
        classCode,
        teacherId: req.user.id,
      },
    });

    res.status(201).json({ message: "Classroom created", classroom });
  } catch (error) {
    res.status(500).json({ message: "Server error creating classroom" });
  }
};

// =============================================
// GET /api/classrooms
// =============================================
export const getClassrooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    let classrooms;

    if (req.user.role === "teacher") {
      classrooms = await prisma.classroom.findMany({
        where: { teacherId: req.user.id },
        include: {
          enrollments: {
            include: {
              user: {
                select: {
                  id: true, name: true, email: true, avatar: true,
                  averageScore: true, assessmentsCompleted: true,
                },
              },
            },
          },
          assessments: true,
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Student - get enrolled classrooms
      classrooms = await prisma.classroom.findMany({
        where: {
          enrollments: { some: { userId: req.user.id } },
        },
        include: {
          teacher: {
            select: { id: true, name: true, avatar: true },
          },
          assessments: true,
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    res.json({ classrooms });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// GET /api/classrooms/:id
// =============================================
export const getClassroomById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const classroom = await prisma.classroom.findUnique({
      where: { id: req.params.id },
      include: {
        teacher: {
          select: { id: true, name: true, avatar: true, email: true },
        },
        enrollments: {
          include: {
            user: {
              select: {
                id: true, name: true, email: true, avatar: true,
                assessmentsCompleted: true, averageScore: true,
                xp: true, level: true,
              },
            },
          },
        },
        assessments: { orderBy: { createdAt: "desc" } },
        resources: { orderBy: { uploadedAt: "desc" } },
      },
    });

    if (!classroom) {
      res.status(404).json({ message: "Classroom not found" });
      return;
    }

    res.json({ classroom });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// POST /api/classrooms/join
// =============================================
export const joinClassroom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { classCode } = req.body;

    const classroom = await prisma.classroom.findUnique({
      where: { classCode },
    });

    if (!classroom) {
      res.status(404).json({ message: "Classroom not found. Check the class code." });
      return;
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_classroomId: {
          userId: req.user.id,
          classroomId: classroom.id,
        },
      },
    });

    if (existingEnrollment) {
      res.status(409).json({ message: "You are already enrolled in this classroom" });
      return;
    }

    await prisma.enrollment.create({
      data: {
        userId: req.user.id,
        classroomId: classroom.id,
      },
    });

    // Notify teacher
    await prisma.notification.create({
      data: {
        userId: classroom.teacherId,
        text: `A new student has joined "${classroom.name}"`,
      },
    });

    res.status(200).json({ message: "Successfully joined classroom", classroom });
  } catch (error) {
    res.status(500).json({ message: "Server error joining classroom" });
  }
};

// =============================================
// DELETE /api/classrooms/:id/students/:studentId
// =============================================
export const removeStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { id, studentId } = req.params;

    // Verify teacher owns this classroom
    const classroom = await prisma.classroom.findFirst({
      where: { id, teacherId: req.user.id },
    });

    if (!classroom) {
      res.status(403).json({ message: "Not authorized to modify this classroom" });
      return;
    }

    await prisma.enrollment.deleteMany({
      where: {
        userId: studentId,
        classroomId: id,
      },
    });

    res.json({ message: "Student removed from classroom" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
