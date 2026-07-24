import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { getSupabaseAdmin } from "../lib/supabase.js";
import * as geminiService from "../utils/geminiService.js";

// controller
export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    const quizzesWithAttempts = await Promise.all(
      quizzes.map(async (quiz) => {
        const attempt = await QuizAttempt.findOne({
          quizId: quiz._id,
          userId: req.user.id,
        }).sort({ createdAt: -1 });

        return {
          ...quiz.toObject(),
          attemptNumber: attempt?.attemptNumber || 0,
          score: attempt?.score || 0,
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: quizzesWithAttempts,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch quizzes",
    });
  }
};
export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      userId: req.user.id,
      documentId: req.params.documentId,
    })
      .populate("documentId", "title name")
      .sort({ createdAt: -1 });

    const quizzesWithAttempts = await Promise.all(
      quizzes.map(async (quiz) => {
        const attempt = await QuizAttempt.findOne({
          quizId: quiz._id,
          userId: req.user.id,
        }).sort({ createdAt: -1 });

        return {
          ...quiz.toObject(),
          attemptNumber: attempt?.attemptNumber || 0,
          score: attempt?.score || 0,
          completedAt: attempt ? new Date() : null,
        };
      }),
    );

    res.status(200).json({
      success: true,
      count: quizzesWithAttempts.length,
      data: quizzesWithAttempts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch quizzes",
    });
  }
};

export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {}
};

export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers.length) {
      return res.status(400).json({
        success: false,
        error: "Quiz cannot be submitted without answers",
      });
    }
    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: "Answers must be an array",
      });
    }

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
      });
    }

    // ✅ COUNT EXISTING ATTEMPTS
    const attemptsCount = await QuizAttempt.countDocuments({
      quizId: quiz._id,
      userId: req.user.id,
    });

    if (attemptsCount >= 2) {
      return res.status(400).json({
        success: false,
        error: "Maximum attempts reached (2).",
      });
    }

    let correctCount = 0;
    const evaluatedAnswers = [];

    answers.forEach(({ questionIndex, selectedAnswer }) => {
      const question = quiz.questions[questionIndex];
      if (!question) return;

      const isCorrect = selectedAnswer === question.correctAnswer;
      if (isCorrect) correctCount++;

      evaluatedAnswers.push({
        questionIndex,
        selectedAnswer,
        isCorrect,
      });
    });

    const score = Math.round((correctCount / quiz.totalQuestions) * 100);

    // ✅ CALCULATE ATTEMPT METRICS
    const attemptNumber = attemptsCount + 1;
    const attemptsLeft = 2 - attemptNumber;

    // ✅ SAVE ATTEMPT WITH LMS DATA
    await QuizAttempt.create({
      quizId: quiz._id,
      userId: req.user.id,
      answers: evaluatedAnswers,
      score,
      attemptsLeft,
      attemptNumber,
    });

    quiz.completedAt = new Date();
    quiz.score = score;

    await quiz.save();
    res.status(200).json({
      success: true,
      data: {
        score,
        correctCount,
        totalQuestions: quiz.totalQuestions,
        attemptNumber,
        attemptsLeft,
      },
    });
  } catch (err) {
    console.error("SUBMIT QUIZ ERROR:", err);

    res.status(500).json({
      success: false,
      error: "Failed to submit quiz",
    });
  }
};

export const getQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
      });
    }

    const attempt = await QuizAttempt.findOne({
      quizId: quiz._id,
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: "No attempt found",
      });
    }

    const detailedResults = quiz.questions.map((question, index) => {
      const answer = attempt.answers.find((a) => a.questionIndex === index);

      return {
        questionIndex: index,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        selectedAnswer: answer?.selectedAnswer || null,
        isCorrect: answer?.isCorrect || false,
        explanation: question.explanation,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        score: attempt.score,
        attemptNumber: attempt.attemptNumber,
        attemptsLeft: attempt.attemptsLeft,
        totalQuestions: quiz.totalQuestions,
        results: detailedResults,
      },
    });
  } catch (err) {
    console.error("RESULT ERROR:", err);

    res.status(500).json({
      success: false,
      error: "Failed to fetch results",
    });
  }
};

export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {}
};

export const generateLessonQuiz = async (req, res) => {
  try {
    console.log("BODY:", req.body); // ✅ HERE

    const { lessonId, numQuestions = 5 } = req.body;

    const supabase = getSupabaseAdmin();

    const { data: lesson, error } = await supabase
      .from("lessons")
      .select("id, title, content, course_id")
      .eq("id", lessonId)
      .maybeSingle();

    console.log("LESSON:", lesson); // ✅ AFTER FETCH

    if (error || !lesson) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    const questions = await geminiService.generateQuiz(
      lesson.content,
      Number(numQuestions),
    );

    console.log("QUESTIONS:", questions); // ✅ AFTER AI

    const existingQuiz = await Quiz.findOne({
      lessonId: lesson.id,
      isShared: true,
    });

    if (existingQuiz) {
      return res.status(400).json({
        success: false,
        error: "Quiz already exists for this lesson",
      });
    }

    const quiz = await Quiz.create({
      lessonId: lesson.id,
      courseId: lesson.course_id,
      title: `${lesson.title} - Quiz`,
      questions,
      totalQuestions: questions.length,
      isShared: true,
    });

    res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (err) {
    console.error("QUIZ GENERATION ERROR:", err);
    res.status(500).json({
      success: false,
      error: "Failed to generate lesson quiz",
    });
  }
};

export const getMyQuizAttempt = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({
      quizId: req.params.quizId,
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: "Attempt not found",
      });
    }

    const correctCount = attempt.answers.filter((a) => a.isCorrect).length;

    res.status(200).json({
      success: true,
      data: {
        score: attempt.score,
        correctCount,
        totalQuestions: attempt.answers.length,
        attemptsLeft: 2 - (attempt.attemptNumber ?? 0), // ✅ FIXED
        answers: attempt.answers,
      },
    });
  } catch (err) {
    console.error("GET ATTEMPT ERROR:", err);
    res.status(500).json({ success: false });
  }
};

export const getLessonQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const quiz = await Quiz.findOne({
      lessonId,
      isShared: true,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found for this lesson",
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (err) {
    console.error("GET LESSON QUIZ ERROR:", err);

    res.status(500).json({
      success: false,
      error: "Failed to fetch lesson quiz",
    });
  }
};

export const getCourseScore = async (req, res) => {
  try {
    const { courseId } = req.params;

    const attempts = await QuizAttempt.find({
      userId: req.user.id,
      courseId,
    });

    if (!attempts.length) {
      return res.status(200).json({
        success: true,
        data: { averageScore: 0 },
      });
    }

    const avg = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;

    res.status(200).json({
      success: true,
      data: {
        averageScore: Math.round(avg),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to calculate course score",
    });
  }
};
