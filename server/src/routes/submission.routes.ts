import { Router } from "express";
import { submitAssessment, getSubmissions, addFeedback } from "../controllers/submission.controller";
import { protect, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { submitAssessmentSchema } from "../validators/schemas";

const router = Router();

router.post("/", protect, validate(submitAssessmentSchema), submitAssessment);
router.get("/", protect, getSubmissions);
router.post("/:id/feedback", protect, authorize("teacher", "admin"), addFeedback);

export default router;
