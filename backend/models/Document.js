import mongoose from "mongoose";

export const DOCUMENT_STATUS = {
  UPLOADED: 0,
  PROCESSING: 1,
  READY: 2,
  FAILED: -1,
};

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Please provide a document title"],
      trim: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },
    status: {
      type: Number,
      enum: Object.values(DOCUMENT_STATUS),
      default: DOCUMENT_STATUS.UPLOADED,
    },

    extractedText: {
      type: String,
      default: "",
    },

    chunks: [
      {
        content: {
          type: String,
          required: true,
        },

        pageNumber: {
          type: Number,
          default: 0,
        },

        chunkIndex: {
          type: Number,
          required: true,
        },
      },
    ],

    uploadDate: {
      type: Date,
      default: Date.now,
    },
    lastAccessed: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ userId: 1, uploadDate: -1 });
documentSchema.index({ status: 1 });

const Document = mongoose.model("Document", documentSchema);
export default Document;
