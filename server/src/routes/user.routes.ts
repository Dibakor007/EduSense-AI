import { Router } from "express";
import { getUserById, updateProfile, getStudents } from "../controllers/user.controller";
import { protect, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { updateProfileSchema } from "../validators/schemas";

const router = Router();

router.get("/students", protect, authorize("teacher", "admin"), getStudents);
router.get("/:id", protect, getUserById);
router.put("/profile", protect, validate(updateProfileSchema), updateProfile);

export default router;
