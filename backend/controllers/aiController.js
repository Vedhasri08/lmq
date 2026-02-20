import Document, { DOCUMENT_STATUS } from "../models/Document.js";
import Flashcard from "../models/FlashCard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import Lesson from "../models/Lesson.js";
import * as geminiService from "../utils/geminiService.js";
import { findRelevantChunks } from "../utils/textChunker.js";
import { getSupabaseAdmin } from "../lib/supabase.js";

export const generateFlashcards = async (req, res, next) => {
  console.log("🔥 generateFlashcards controller HIT");

  try {
    const { documentId, lessonId, count = 10 } = req.body;

    // ✅ Require at least one
    if (!documentId && !lessonId) {
      return res.status(400).json({
        success: false,
        error: "Provide documentId or lessonId",
      });
    }

    let sourceText = "";
    let flashcardPayload = {
      userId: req.user.id,
      documentId: null,
      lessonId: null,
      courseId: null,
    };

    // =========================
    // 📄 DOCUMENT FLOW
    // =========================
    if (documentId) {
      const document = await Document.findById(documentId);

      if (!document) {
        return res.status(404).json({
          success: false,
          error: "Document not found",
        });
      }

      if (document.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "Not authorized",
        });
      }

      if (document.status !== DOCUMENT_STATUS.READY) {
        return res.status(400).json({
          success: false,
          error: "Document not ready",
        });
      }

      sourceText = document.extractedText;
      flashcardPayload.documentId = document._id;
    }

    // =========================
    // 📚 LESSON FLOW
    // =========================
    if (lessonId) {
      const supabase = getSupabaseAdmin();

      const { data: lesson, error } = await supabase
        .from("lessons")
        .select("id, course_id, content")
        .eq("id", lessonId)
        .maybeSingle();
      console.log("📚 LessonId received:", lessonId);
      console.log("📚 Lesson result:", lesson);
      console.log("📚 Lesson error:", error);
      if (error || !lesson) {
        return res.status(404).json({
          success: false,
          error: "Lesson not found",
        });
      }

      sourceText = lesson.content;
      flashcardPayload.lessonId = lesson.id;
      flashcardPayload.courseId = lesson.course_id;
    }

    // ✅ Safety check
    if (!sourceText || sourceText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: "Content too short for flashcards",
      });
    }

    // 🤖 AI generation
    const cards = await geminiService.generateFlashcards(
      sourceText,
      Number(count),
    );

    const flashcardSet = await Flashcard.create({
      ...flashcardPayload,
      cards: cards.map((c) => ({
        question: c.question,
        answer: c.answer,
        difficulty: c.difficulty || "medium",
        reviewCount: 0,
        isStarred: false,
      })),
    });

    res.status(201).json({
      success: true,
      data: flashcardSet,
      message: "Flashcards generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const generateLessonFlashcards = async (req, res) => {
  try {
    const { lessonId, count = 10 } = req.body;

    const supabase = getSupabaseAdmin();
    const { data: lesson, error } = await supabase
      .from("lessons")
      .select("id, content")
      .eq("id", lessonId)
      .maybeSingle();

    if (error || !lesson) {
      return res.status(404).json({ success: false });
    }

    const cards = await geminiService.generateFlashcards(
      lesson.content,
      Number(count),
    );

    const flashcardSet = await Flashcard.create({
      userId: req.user.id,
      courseId: lesson.course_id, // ✅ THIS IS THE KEY
      lessonId: lesson.id, // Supabase lesson id
      cards: cards.map((c) => ({
        question: c.question,
        answer: c.answer,
        difficulty: c.difficulty || "medium",
      })),
    });

    res.status(201).json({
      success: true,
      data: flashcardSet,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const generateQuiz = async (req, res, next) => {
  try {
    const { documentId, numQuestions = 10, title } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Provide documentId",
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user.id,
      status: DOCUMENT_STATUS.READY,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    // 🔥 CRITICAL VALIDATION
    if (!document.extractedText || document.extractedText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: "Document content is empty or too short to generate a quiz",
      });
    }

    console.log("📄 Extracted text length:", document.extractedText.length);
    console.log("❓ Number of questions:", numQuestions);

    const questions = await geminiService.generateQuiz(
      document.extractedText,
      Number(numQuestions),
    );

    // 🔥 VALIDATE AI OUTPUT
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("AI did not return valid quiz questions");
    }

    const quiz = await Quiz.create({
      userId: req.user.id,
      documentId: document._id,
      title: title || `${document.title} - Quiz`,
      questions,
      totalQuestions: questions.length,
      userAnswers: [],
      score: 0,
    });

    return res.status(201).json({
      success: true,
      data: quiz,
      message: "Quiz generated successfully",
    });
  } catch (error) {
    // 🔥 LOG REAL ERROR
    console.error("🔥 Generate Quiz Error:", error.message);
    console.error(error.stack);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate quiz",
    });
  }
};

export const generateSummary = async (req, res, next) => {
  try {
    const { documentId } = req.body;
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Provide documentId and concept",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: DOCUMENT_STATUS.READY,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found ",
        statusCode: 404,
      });
    }

    const summary = await geminiService.generateSummary(document.extractedText);

    res.status(201).json({
      success: true,
      data: {
        documentId: document._id,
        title: document.title,
        summary,
      },
      message: "Summary generated successfully",
    });
  } catch (error) {}
};

export const chat = async (req, res, next) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({
        success: false,
        error: "Provide documentId and Question",
        statusCode: 400,
      });
    }
    console.log("CHAT CHECK:", {
      documentId,
      userIdFromToken: req.user._id,
    });

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    if (document.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized access",
      });
    }

    if (document.status !== DOCUMENT_STATUS.READY) {
      return res.status(400).json({
        success: false,
        error: "Document not ready for chat",
      });
    }

    const relevantChunks = findRelevantChunks(document.chunks, question, 3);
    const chunkIndices = relevantChunks.map((c) => c.chunkIndex);

    let chatHistory = await ChatHistory.findOne({
      userId: req.user.id,
      documentId: document._id,
    });
    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        userId: req.user.id,
        documentId: document._id,
        messages: [],
      });
    }
    const answer = await geminiService.chatWithContext(
      question,
      relevantChunks,
    );

    chatHistory.messages.push(
      {
        role: "user",
        content: question,
        timestamp: new Date(),
        relevantChunks: [],
      },
      {
        role: "assistant",
        content: answer,
        timestamp: new Date(),
        relevantChunks: chunkIndices,
      },
    );
    console.log("AI ANSWER >>>", answer);

    await chatHistory.save();
    res.status(201).json({
      success: true,
      data: {
        question,
        answer,
        relevantChunks: chunkIndices,
        chatHistoryId: chatHistory._id,
      },
      message: "Response generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const explainConcept = async (req, res, next) => {
  try {
    const { documentId, concept } = req.body;

    if (!documentId || !concept) {
      return res.status(400).json({
        success: false,
        error: "Provide documentId and concept",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: DOCUMENT_STATUS.READY,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found ",
        statusCode: 404,
      });
    }

    const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
    const context = relevantChunks.map((c) => c.context).join("\n\n");

    const explanation = await geminiService.explainConcept(concept, context);

    res.status(200).json({
      success: true,
      data: {
        concept,
        explanation,
        relevantChunks: relevantChunks.map((c) => c.chunkIndex),
      },
      message: "Explanation generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Provide documentId",
        statusCode: 400,
      });
    }

    const chatHistoryDoc = await ChatHistory.findOne({
      userId: req.user._id,
      documentId,
    }).select("messages");

    if (!chatHistoryDoc) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No chat history found for this document",
      });
    }

    res.status(200).json({
      success: true,
      data: chatHistoryDoc.messages,
      message: "Chat history retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};
