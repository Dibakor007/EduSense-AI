import { Router } from "express";
import {
  createAssessment,
  getAssessments,
  getAssessmentById,
  deleteAssessment,
} from "../controllers/assessment.controller";
import { protect, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createAssessmentSchema } from "../validators/schemas";

const router = Router();

router.post("/", protect, authorize("teacher", "admin"), validate(createAssessmentSchema), createAssessment);
router.get("/", protect, getAssessments);
router.get("/:id", protect, getAssessmentById);
router.delete("/:id", protect, authorize("teacher", "admin"), deleteAssessment);

export default router;
