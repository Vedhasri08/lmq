import Flashcard from "../models/FlashCard.js";
import { generateFlashcards } from "../utils/geminiService.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export const getFlashcards = async (req, res, next) => {
  try {
    const flashcards = await Flashcard.find({
      userId: req.user.id,
      documentId: req.params.documentId,
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFlashcardsSets = async (req, res, next) => {
  try {
    const flashcardSets = await Flashcard.find({
      userId: req.user.id,
    })
      .populate("documentId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcardSets.length,
      data: flashcardSets,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewFlashcard = async (req, res) => {
  try {
    const { cardIndex } = req.body;
    const { cardId } = req.params;

    const flashcardSet = await Flashcard.findOne({
      "cards._id": cardId,
      $or: [{ userId: req.user.id }, { isGlobal: true }],
    });

    if (!flashcardSet) {
      return res.status(404).json({ success: false });
    }

    const card = flashcardSet.cards.id(cardId);

    card.reviewCount += 1;
    card.lastReviewed = new Date();

    await flashcardSet.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Review error:", err);
    res.status(500).json({ success: false });
  }
};

export const toggleStarFlashcard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const flashcardSet = await Flashcard.findOne({
      "cards._id": cardId,
      $or: [{ userId: req.user.id }, { isGlobal: true }],
    });

    if (!flashcardSet) {
      return res.status(400).json({
        success: false,
        error: "Flashcard set or card not found",
        statusCode: 400,
      });
    }

    const cardIndex = flashcardSet.cards.findIndex(
      (card) => card._id.toString() === req.params.cardId,
    );
    if (cardIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Card not found in set",
        statusCode: 404,
      });
    }

    flashcardSet.cards[cardIndex].isStarred =
      !flashcardSet.cards[cardIndex].isStarred;

    await flashcardSet.save();
    res.status(200).json({
      success: true,
      data: flashcardSet,
      message: `Flashcard ${
        flashcardSet.cards[cardIndex].isStarred ? "starred" : "unstarred"
      }`,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFlashcardSet = async (req, res, next) => {
  try {
    const flashcardSet = await Flashcard.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Card not found in set",
        statusCode: 404,
      });
    }
    await flashcardSet.deleteOne();

    res.status(200).json({
      success: true,
      message: "Flashcard set deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getLessonFlashcards = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const flashcardSets = await Flashcard.find({
      lessonId,
      $or: [{ isGlobal: true }, { userId: req.user.id }],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcardSets.length,
      data: flashcardSets,
    });
  } catch (error) {
    console.error("Get lesson flashcards error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch flashcards",
    });
  }
};

export const addLessonFlashcard = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admin can add flashcards" });
  }

  try {
    console.log("🔥 addLessonFlashcard HIT");
    console.log("Params:", req.params);
    console.log("Body:", req.body);
    console.log("User:", req.user);

    const { lessonId } = req.params;
    const { generate, count = 10 } = req.body;

    let flashcardSet = await Flashcard.findOne({ lessonId, isGlobal: true });

    if (!generate) {
      return res.status(400).json({ message: "Invalid request" });
    }
    console.log("STEP 1: Fetching lesson");

    const { data: lesson, error } = await supabase
      .from("lessons")
      .select("title, content")
      .eq("id", lessonId)
      .single();

    console.log("Generating GLOBAL flashcards...");
    console.log("lessonId:", lessonId);

    if (!lesson || error) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const text = `
Title: ${lesson.title}

${lesson.content}
`;
    console.log("STEP 2: Lesson fetched");
    const aiCards = await generateFlashcards(text, count);
    console.log("STEP 3: Gemini generated", aiCards.length);

    // ✅ CREATE if not exists
    if (!flashcardSet) {
      console.log("STEP 4: Creating global set");
      flashcardSet = await Flashcard.create({
        lessonId,
        isGlobal: true,
        userId: null,
        cards: aiCards,
      });
      console.log("✅ Global flashcards CREATED");
    }
    // ✅ APPEND if exists
    else {
      console.log("STEP 4: Appending to existing");
      flashcardSet.cards.push(...aiCards);
      await flashcardSet.save();
    }

    return res.status(201).json({
      success: true,
      data: flashcardSet.cards,
    });
  } catch (err) {
    console.error("🔥 Gemini lesson flashcard error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to generate flashcards",
    });
  }
};

export const getCourseFlashcards = async (req, res) => {
  try {
    const { courseId } = req.params;

    const flashcardSets = await Flashcard.find({
      courseId,
      $or: [{ userId: req.user.id }, { isGlobal: true }],
    });

    const cards = flashcardSets.flatMap((set) => set.cards);

    console.log("FLASHCARD SETS FROM DB:", flashcardSets);
    res.json({
      success: true,
      count: cards.length,
      data: cards,
    });
  } catch (err) {
    console.error("COURSE FLASHCARDS ERROR:", err);
    res.status(500).json({ success: false });
  }
};
