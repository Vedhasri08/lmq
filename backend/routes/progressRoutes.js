import express from "express";
import {
  markLessonComplete,
  getCourseProgress,
  getLevelProgress,
  getCompletedLessons,
} from "../controllers/progressController.js";
import { getUserLearningStats } from "../controllers/progressController.js";
import { getDashboardOverview } from "../controllers/progressController.js";
import requireAuth from "../middleware/auth.js";
const router = express.Router();

router.use(requireAuth);
router.get("/dashboard", getDashboardOverview);

router.post("/complete", markLessonComplete);
router.get("/course/:courseId", getCourseProgress);
router.get("/level/:courseId/:level", getLevelProgress);
router.get("/completed/:courseId", getCompletedLessons);

export default router;
