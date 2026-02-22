import express from "express";
import adminOnly from "../middleware/adminOnly.js";
import {
  getQuizzes,
  getQuizById,
  getAllQuizzes,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
  getMyQuizAttempt,
  generateLessonQuiz,
  getLessonQuiz,
  getCourseScore,
} from "../controllers/quizController.js";
import protect from "../middleware/auth.js";

const router = express.Router();
router.get("/__test", (req, res) => {
  res.json({ ok: true });
});

router.use(protect);

router.get("/", getAllQuizzes);
router.get("/document/:documentId", getQuizzes);
router.get("/:quizId/my-attempt", getMyQuizAttempt);
router.post("/lesson/generate", adminOnly, generateLessonQuiz);
router.get("/lesson/:lessonId", getLessonQuiz);
router.get("/course/:courseId/score", protect, getCourseScore);
router.get("/:id", getQuizById);
router.post("/:id/submit", submitQuiz);
router.get("/:id/results", getQuizResults);
router.delete("/:id", deleteQuiz);

export default router;
