import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

/* ------------------ ENV VALIDATION ------------------ */
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ FATAL ERROR: GEMINI_API_KEY is not set");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* ------------------ FLASHCARDS ------------------ */
/**
 * Generate flashcards from text
 * @param {string} text
 * @param {number} count
 * @returns {Promise<Array<{question:string, answer:string, difficulty:string}>>}
 */
export const generateFlashcards = async (text, count = 10) => {
  const prompt = `
Generate exactly ${count} educational flashcards from the text below.

Format each flashcard strictly as:
Q: question
A: answer
D: easy | medium | hard

Separate each flashcard using:
---

Text:
${text.substring(0, 15000)}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;
    const cards = generatedText
      .split("---")
      .map((c) => c.trim())
      .filter(Boolean);

    const flashcards = [];

    for (const card of cards) {
      let question = "";
      let answer = "";
      let difficulty = "medium";

      const lines = card.split("\n");

      for (const line of lines) {
        if (line.startsWith("Q:")) question = line.substring(2).trim();
        if (line.startsWith("A:")) answer = line.substring(2).trim();
        if (line.startsWith("D:")) {
          const diff = line.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) difficulty = diff;
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }

    return flashcards.slice(0, count);
  } catch (error) {
    console.error("Gemini Flashcard Error:", error);
    throw new Error("Failed to generate flashcards");
  }
};

/* ------------------ QUIZ ------------------ */
/**
 * Generate quiz questions
 */
export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `
Generate exactly ${numQuestions} multiple-choice questions.

Format:
Q: Question
01: Option A
02: Option B
03: Option C
04: Option D
C: Correct option text
E: Explanation
D: easy | medium | hard

Separate each question using:
---

Text:
${text.substring(0, 15000)}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;
    const blocks = generatedText
      .split("---")
      .map((b) => b.trim())
      .filter(Boolean);

    const questions = [];

    for (const block of blocks) {
      let question = "";
      let options = [];
      let correctAnswer = "";
      let explanation = "";
      let difficulty = "medium";

      const lines = block.split("\n");

      for (const line of lines) {
        const t = line.trim();
        if (t.startsWith("Q:")) question = t.substring(2).trim();
        else if (/^0\d:/.test(t)) options.push(t.substring(3).trim());
        else if (t.startsWith("C:")) correctAnswer = t.substring(2).trim();
        else if (t.startsWith("E:")) explanation = t.substring(2).trim();
        else if (t.startsWith("D:")) {
          const diff = t.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) difficulty = diff;
        }
      }

      if (question && options.length === 4 && correctAnswer) {
        questions.push({
          question,
          options,
          correctAnswer,
          explanation,
          difficulty,
        });
      }
    }

    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    throw new Error("Failed to generate quiz");
  }
};

/* ------------------ SUMMARY ------------------ */
export const generateSummary = async (text) => {
  const prompt = `
Provide a concise, structured summary highlighting key ideas.

Text:
${text.substring(0, 20000)}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    throw new Error("Failed to generate summary");
  }
};

/* ------------------ CHAT WITH CONTEXT ------------------ */
export const chatWithContext = async (question, chunks) => {
  const context = chunks
    .map((c, i) => `[Chunk ${i + 1}]\n${c.content}`)
    .join("\n\n");

  const prompt = `
Answer the question using ONLY the context below.
If the answer is not present, say so.

Context:
${context}

Question:
${question}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw new Error("Failed to process chat");
  }
};

/* ------------------ EXPLAIN CONCEPT ------------------ */
export const explainConcept = async (concept, context) => {
  const prompt = `
Explain "${concept}" clearly using the context below.
Use simple language and examples if helpful.

Context:
${context.substring(0, 10000)}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Explain Error:", error);
    throw new Error("Failed to explain concept");
  }
};
