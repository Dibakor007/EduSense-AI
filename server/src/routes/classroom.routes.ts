import { Router } from "express";
import {
  createClassroom,
  getClassrooms,
  getClassroomById,
  joinClassroom,
  removeStudent,
} from "../controllers/classroom.controller";
import { protect, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createClassroomSchema, joinClassroomSchema } from "../validators/schemas";

const router = Router();

router.post("/", protect, authorize("teacher", "admin"), validate(createClassroomSchema), createClassroom);
router.get("/", protect, getClassrooms);
router.get("/:id", protect, getClassroomById);
router.post("/join", protect, validate(joinClassroomSchema), joinClassroom);
router.delete("/:id/students/:studentId", protect, authorize("teacher", "admin"), removeStudent);

export default router;
