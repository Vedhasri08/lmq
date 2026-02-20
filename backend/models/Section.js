import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
      index: true,
    },

    order: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);
sectionSchema.index({ courseId: 1, level: 1, order: 1 });

export default mongoose.model("Section", sectionSchema);
