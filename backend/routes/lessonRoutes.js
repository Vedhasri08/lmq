import express from "express";
import { getLessonBySlug } from "../controllers/lessonController.js";

const router = express.Router();

router.get("/:lessonSlug", getLessonBySlug);

export default router;
