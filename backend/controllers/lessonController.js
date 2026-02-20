import Lesson from "../models/Lesson.js";

export const getLessonBySlug = async (req, res, next) => {
  try {
    const { lessonSlug } = req.params;

    const lesson = await Lesson.findOne({ slug: lessonSlug });

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json(lesson);
  } catch (err) {
    next(err);
  }
};
