import express from "express";
import {
  generateFlashcards,
  generateLessonFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
} from "../controllers/aiController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/generate-flashcards", generateFlashcards);
router.post("/generate-lesson-flashcards", protect, generateLessonFlashcards);
router.post("/generate-quiz", generateQuiz);
router.post("/generate-summary", generateSummary);
router.post("/chat", protect, chat);
router.post("/explain-concept", explainConcept);
router.get("/chat-history/:documentId", protect, getChatHistory);

export default router;
