import express from "express";

import {
  getQuizzes,
  getQuizById,
  getAllQuizzes,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
} from "../controllers/quizController.js";
import protect from "../middleware/auth.js";

const router = express.Router();
router.get("/__test", (req, res) => {
  res.json({ ok: true });
});

router.use(protect);

router.get("/", getAllQuizzes);
router.get("/document/:documentId", getQuizzes);
router.get("/:id", getQuizById);
router.post("/:id/submit", submitQuiz);
router.get("/:id/results", getQuizResults);
router.delete("/:id", deleteQuiz);

export default router;
