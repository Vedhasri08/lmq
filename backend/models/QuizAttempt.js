import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    userId: {
      type: String,
      required: true,
    },

    answers: [
      {
        questionIndex: Number,
        selectedAnswer: String,
        isCorrect: Boolean,
      },
    ],

    score: {
      type: Number,
      default: 0,
    },

    attemptsLeft: {
      // ✅ ADD THIS
      type: Number,
      default: 1,
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// ✅ Normal index (NOT unique)
quizAttemptSchema.index({ quizId: 1, userId: 1 });

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

export default QuizAttempt;
