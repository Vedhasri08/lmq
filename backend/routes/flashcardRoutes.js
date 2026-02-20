import express from "express";
import {
  getFlashcards,
  getAllFlashcardsSets,
  reviewFlashcard,
  toggleStarFlashcard,
  deleteFlashcardSet,
  getLessonFlashcards,
  addLessonFlashcard,
  getCourseFlashcards,
} from "../controllers/flashcardController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// Fetch
router.get("/", getAllFlashcardsSets);
router.get("/document/:documentId", getFlashcards);
router.get("/lesson/:lessonId", getLessonFlashcards);
router.get("/course/:courseId", getCourseFlashcards);

router.post("/lesson/:lessonId", addLessonFlashcard);
// Card actions
router.post("/:cardId/review", reviewFlashcard);
router.put("/:cardId/star", toggleStarFlashcard);

// Delete set
router.delete("/:id", deleteFlashcardSet);

export default router;
