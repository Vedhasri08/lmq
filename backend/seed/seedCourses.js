import mongoose from "mongoose";
import dotenv from "dotenv";

import Course from "../models/Course.js";
import Section from "../models/Section.js";
import Lesson from "../models/Lesson.js";

import cpp from "./data/cpp.js";
import java from "./data/java.js";
import nextjs from "./data/nextjs.js";

dotenv.config();

const seedCourse = async (data) => {
  const { course, sections } = data;

  const createdCourse = await Course.create(course);

  for (let i = 0; i < sections.length; i++) {
    const section = await Section.create({
      courseId: createdCourse._id,
      title: sections[i].title,
      level: sections[i].level,
      order: i + 1,
    });

    for (let j = 0; j < sections[i].lessons.length; j++) {
      await Lesson.create({
        sectionId: section._id,
        title: sections[i].lessons[j].title,
        slug: sections[i].lessons[j].slug,
        order: j + 1,
        content: sections[i].lessons[j].content || {},
      });
    }
  }
};

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // OPTIONAL: clear old data
    await Course.deleteMany({});
    await Section.deleteMany({});
    await Lesson.deleteMany({});

    await seedCourse(cpp);
    await seedCourse(java);
    await seedCourse(nextjs);

    console.log("All courses seeded successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

runSeed();
