import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Clerk userId
      required: true,
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Prevent duplicate progress rows
userProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export default mongoose.model("UserProgress", userProgressSchema);
