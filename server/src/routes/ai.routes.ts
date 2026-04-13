import { Router } from "express";
import { generateQuiz, chat, getRecommendations } from "../controllers/ai.controller";
import { protect } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { generateQuizSchema, chatSchema } from "../validators/schemas";

const router = Router();

router.post("/generate-quiz", protect, validate(generateQuizSchema), generateQuiz);
router.post("/chat", protect, validate(chatSchema), chat);
router.post("/recommendations", protect, getRecommendations);

export default router;
