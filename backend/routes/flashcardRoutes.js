import express from "express";
import {
  getFlashcards,
  getAllFlashcardsSets,
  reviewFlashcard,
  toggleStarFlashcard,
  deleteFlashcardSet,
} from "../controllers/flashcardController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getAllFlashcardsSets);
router.get("/:documentId", getFlashcards);
router.post("/:cardId/review", reviewFlashcard);
router.put("/:cardId/star", toggleStarFlashcard);
router.delete("/:id", deleteFlashcardSet);

export default router;
