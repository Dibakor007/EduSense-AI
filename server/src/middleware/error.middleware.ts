import { Request, Response, NextFunction } from "express";

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("❌ Error:", err.message);
  
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  // Prisma known errors
  if (err.code === "P2002") {
    res.status(409).json({
      message: "A record with this value already exists",
      field: err.meta?.target,
    });
    return;
  }

  if (err.code === "P2025") {
    res.status(404).json({ message: "Record not found" });
    return;
  }

  // Zod validation errors
  if (err.name === "ZodError") {
    res.status(400).json({
      message: "Validation failed",
      errors: err.errors,
    });
    return;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({ message: "Token expired" });
    return;
  }

  // Default
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
