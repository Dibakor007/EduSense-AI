import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import classroomRoutes from "./routes/classroom.routes";
import assessmentRoutes from "./routes/assessment.routes";
import submissionRoutes from "./routes/submission.routes";
import aiRoutes from "./routes/ai.routes";
import { errorHandler } from "./middleware/error.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// =============================================
// Security Middleware
// =============================================
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { message: "Too many requests, please try again later." },
});
app.use(limiter);

// =============================================
// Core Middleware
// =============================================
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// =============================================
// API Routes
// =============================================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/ai", aiRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "EduSense API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// =============================================
// Error Handler (must be last)
// =============================================
app.use(errorHandler);

// =============================================
// Start Server
// =============================================
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🚀 EduSense API Server Running        ║
  ║   📡 Port: ${String(PORT).padEnd(28)}║
  ║   🌍 Env: ${String(process.env.NODE_ENV || "development").padEnd(29)}║
  ║   📚 API: http://localhost:${String(PORT).padEnd(13)}║
  ╚══════════════════════════════════════════╝
  `);
});

export default app;
