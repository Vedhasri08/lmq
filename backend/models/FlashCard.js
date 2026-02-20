import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
  {
    isGlobal: {
      type: Boolean,
      default: false,
      index: true,
    },

    userId: {
      type: String,
      required: false,
    },

    documentId: {
      type: String,
    },
    courseId: {
      type: String,
      required: false,
    },
    lessonId: {
      type: String,
      index: true,
    },

    supabaseLessonId: {
      type: String,
      index: true,
    },

    cards: [
      {
        question: {
          type: String,
          required: true,
        },

        answer: {
          type: String,
          required: true,
        },

        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          default: "medium",
        },

        lastReviewed: {
          type: Date,
          default: null,
        },

        reviewCount: {
          type: Number,
          default: 0,
        },

        isStarred: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

flashcardSchema.index(
  { userId: 1, documentId: 1 },
  {
    unique: true,
    partialFilterExpression: { documentId: { $exists: true, $ne: null } },
  },
);

flashcardSchema.index(
  { userId: 1, lessonId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      lessonId: { $exists: true, $ne: null },
      isGlobal: false,
    },
  },
);

const Flashcard =
  mongoose.models.Flashcard || mongoose.model("Flashcard", flashcardSchema);

export default Flashcard;
