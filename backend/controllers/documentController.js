import Document from "../models/Document.js";
import { DOCUMENT_STATUS } from "../models/Document.js";
import Flashcard from "../models/FlashCard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import fs from "fs/promises";
import mongoose from "mongoose";

export const uploadDocument = async (req, res, next) => {
  console.log("==== UPLOAD DEBUG ====");
  console.log("USER:", req.user);
  console.log("FILE:", req.file);
  console.log("BODY:", req.body);

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a PDF file",
        statusCode: 400,
      });
    }
    const { title } = req.body;
    if (!title) {
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        error: "Please provide a document title",
        statusCode: 400,
      });
    }

    const fileSystemPath = req.file.path;
    const baseUrl = process.env.BASE_URL || "http://localhost:8000";
    const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

    const document = await Document.create({
      userId: req.user.id,
      title,
      fileName: req.file.originalname,
      filePath: `/uploads/documents/${req.file.filename}`,
      fileUrl: fileUrl,
      fileSize: req.file.size,
      status: DOCUMENT_STATUS.UPLOADED,
    });

    processPDF(document._id, fileSystemPath).catch((err) => {
      console.log("PDF processing error:", err);
    });
    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully. Processing in progress...",
    });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};
const processPDF = async (documentId, filePath) => {
  try {
    const { text } = await extractTextFromPDF(filePath);
    const chunks = chunkText(text, 500, 50);
    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: DOCUMENT_STATUS.READY,
    });
    console.log(`Document ${documentId} processed successfully`);
  } catch (error) {
    console.log(`Error processing document ${documentId}:`, error);

    await Document.findByIdAndUpdate(documentId, {
      status: DOCUMENT_STATUS.FAILED,
    });
  }
};

export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    const enrichedDocuments = await Promise.all(
      documents.map(async (doc) => {
        const flashcardCount = await Flashcard.countDocuments({
          documentId: doc._id,
          userId: req.user.id,
        });

        const quizCount = await Quiz.countDocuments({
          documentId: doc._id,
          userId: req.user.id,
        });

        return {
          ...doc.toObject(),
          flashcardCount,
          quizCount,
        };
      }),
    );

    return res.status(200).json(enrichedDocuments);
  } catch (error) {
    console.error("getDocuments error:", error);
    next(error);
  }
};

export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }
    const flashcardCount = await Flashcard.countDocuments({
      documentId: document._id,
      userId: req.user.id,
    });
    const quizCount = await Quiz.countDocuments({
      documentId: document._id,
      userId: req.user.id,
    });

    await Document.updateOne(
      { _id: document._id },
      { $set: { lastAccessed: Date.now() } },
    );

    const documentData = document.toObject();
    documentData.flashcardCount = flashcardCount;
    documentData.quizCount = quizCount;

    res.status(200).json({
      success: true,
      data: documentData,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    await fs.unlink(document.filePath).catch(() => {});

    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: "Document deleted sucessfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateDocument = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};
