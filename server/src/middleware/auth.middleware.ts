import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "edusense_jwt_secret_key_change_in_production_2024";

export interface AuthPayload {
  id: string;
  role: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

/**
 * Middleware to protect routes - verifies JWT token
 */
export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Not authorized - no token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized - invalid token" });
  }
};

/**
 * Middleware to restrict access by role
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden - insufficient permissions" });
      return;
    }

    next();
  };
};
