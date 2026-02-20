import UserProgress from "../models/UserProgress.js";
import Lesson from "../models/Lesson.js";
import Section from "../models/Section.js";
import Flashcard from "../models/FlashCard.js";
import QuizResult from "../models/Quiz.js";
import Document from "../models/Document.js";

import Quiz from "../models/Quiz.js";

export const getDashboardOverview = async (req, res, next) => {
  try {
    const userId = req.auth?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const totalDocuments = await Document.countDocuments({ userId });
    const totalFlashcardSets = await Flashcard.countDocuments({ userId });
    const totalQuizzes = await Quiz.countDocuments({ userId });

    res.json({
      overview: {
        totalDocuments,
        totalFlashcardSets,
        totalQuizzes,
      },
      recentActivity: {
        documents: [],
        quizzes: [],
      },
    });
  } catch (err) {
    next(err);
  }
};

// 1️⃣ Mark lesson as completed
export const markLessonComplete = async (req, res, next) => {
  try {
    const { lessonId, courseId } = req.body;
    const userId = req.user?.id || "demo-user"; // replace with Clerk later

    await UserProgress.findOneAndUpdate(
      { userId, lessonId },
      { userId, lessonId, courseId, completed: true },
      { upsert: true, new: true },
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// 2️⃣ Get completed lessons (for sidebar ✔)
export const getCompletedLessons = async (req, res, next) => {
  try {
    const userId = req.user?.id || "demo-user";
    const { courseId } = req.params;

    const completed = await UserProgress.find({
      userId,
      courseId,
      completed: true,
    }).select("lessonId");

    res.json(completed.map((p) => p.lessonId));
  } catch (err) {
    next(err);
  }
};

// 3️⃣ Course progress %
export const getCourseProgress = async (req, res, next) => {
  try {
    const userId = req.user?.id || "demo-user";
    const { courseId } = req.params;

    const sections = await Section.find({ courseId }).select("_id");
    const sectionIds = sections.map((s) => s._id);

    const totalLessons = await Lesson.countDocuments({
      sectionId: { $in: sectionIds },
    });

    const completedLessons = await UserProgress.countDocuments({
      userId,
      courseId,
      completed: true,
    });

    const percentage =
      totalLessons === 0
        ? 0
        : Math.round((completedLessons / totalLessons) * 100);

    res.json({
      totalLessons,
      completedLessons,
      percentage,
    });
  } catch (err) {
    next(err);
  }
};
export const getUserLearningStats = async (req, res, next) => {
  try {
    const userId = req.auth?.userId || req.user?.id;

    const lessonsCompleted = await UserProgress.countDocuments({
      userId,
      completed: true,
    });

    const flashcardsReviewed = await Flashcard.countDocuments({
      userId,
      reviewed: true,
    });

    const quizzesTaken = await QuizResult.countDocuments({
      userId,
    });

    res.json({
      lessonsCompleted,
      flashcardsReviewed,
      quizzesTaken,
    });
  } catch (err) {
    next(err);
  }
};

// 4️⃣ Level-wise progress (Beginner / Intermediate / Advanced)
export const getLevelProgress = async (req, res, next) => {
  try {
    const userId = req.user?.id || "demo-user";
    const { courseId, level } = req.params;

    const sections = await Section.find({
      courseId,
      level,
    }).select("_id");

    const sectionIds = sections.map((s) => s._id);

    const lessons = await Lesson.find({
      sectionId: { $in: sectionIds },
    }).select("_id");

    const lessonIds = lessons.map((l) => l._id);

    const completedLessons = await UserProgress.countDocuments({
      userId,
      lessonId: { $in: lessonIds },
      completed: true,
    });

    const totalLessons = lessonIds.length;

    const percentage =
      totalLessons === 0
        ? 0
        : Math.round((completedLessons / totalLessons) * 100);

    res.json({
      level,
      totalLessons,
      completedLessons,
      percentage,
    });
  } catch (err) {
    next(err);
  }
};
