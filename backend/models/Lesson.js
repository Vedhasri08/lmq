import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    supabaseLessonId: {
      type: String,
      required: true,
      index: true,
    },
    title: String,
    content: String,

    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    order: {
      type: Number,
      required: true,
    },

    // Lesson teaching content
    content: {
      introduction: String,
      explanation: String,
      points: [String],
      codeExample: {
        language: String,
        code: String,
      },
    },

    isFree: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Fast lesson lookup
lessonSchema.index({ sectionId: 1, order: 1 });

export default mongoose.model("Lesson", lessonSchema);
