import axios from "axios";
import axiosInstance from "../utils/axiosinstance";
import { API_PATHS } from "../utils/apiPaths";
import { supabase } from "../lib/supabase";

const generateFlashcards = async ({ documentId, lessonId, count = 10 }) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.AI.GENERATE_FLASHCARDS,
      {
        documentId,
        lessonId,
        count,
      },
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to generate flashcards",
      }
    );
  }
};

export const generateLessonFlashcards = async (lessonId, count = 10) => {
  console.log("Generating flashcards for lesson:", lessonId);
  console.log("🔥 SERVICE CALLED", lessonId);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User not authenticated");
  }

  return axios.post(
    `http://localhost:8000/api/flashcards/lesson/${lessonId}`,
    { generate: true, count: 10 },
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  );
};

const generateQuiz = async (documentId, options = {}) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ, {
      documentId,
      ...options,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to generate quiz",
      }
    );
  }
};

const generateSummary = async (documentId) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY, {
      documentId,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to generate summary",
      }
    );
  }
};

const chat = async (documentId, message) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.CHAT, {
      documentId,
      question: message,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Chat request failed",
      }
    );
  }
};

const explainConcept = async (documentId, concept) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.EXPLAIN_CONCEPT, {
      documentId,
      concept,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to explain concept",
      }
    );
  }
};

const getChatHistory = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.AI.GET_CHAT_HISTORY(documentId),
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch chat history",
      }
    );
  }
};

const aiService = {
  generateFlashcards,
  generateLessonFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
};

export default aiService;
