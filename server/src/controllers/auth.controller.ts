import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

const JWT_SECRET = process.env.JWT_SECRET || "edusense_jwt_secret_key_change_in_production_2024";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function generateToken(user: { id: string; role: string; email: string }): string {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function sanitizeUser(user: any) {
  const { password, ...safe } = user;
  return safe;
}

// =============================================
// POST /api/auth/register
// =============================================
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, institution, educationLevel } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ message: "An account with this email already exists" });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const avatarStyles = ["avataaars", "adventurer", "pixel-art", "fun-emoji", "lorelei"];
    const randomStyle = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "student",
        avatar: `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${email}`,
        institution: institution || null,
        educationLevel: educationLevel || null,
      },
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// =============================================
// POST /api/auth/login
// =============================================
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Update streak
    await prisma.user.update({
      where: { id: user.id },
      data: { streakDays: user.streakDays + 1 },
    });

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// =============================================
// GET /api/auth/me
// =============================================
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        enrollments: {
          include: { classroom: true },
        },
        taughtClassrooms: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
