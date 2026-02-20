import Course from "../models/Course.js";
import Section from "../models/Section.js";
import Lesson from "../models/Lesson.js";

/**
 * GET /api/courses/:slug
 */
export const getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ slug });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const sections = await Section.find({ courseId: course._id })
      .sort("order")
      .lean();

    const sectionIds = sections.map((s) => s._id);

    const lessons = await Lesson.find({
      sectionId: { $in: sectionIds },
    })
      .select("title slug order sectionId")
      .sort("order")
      .lean();

    const sectionsWithLessons = sections.map((section) => ({
      ...section,
      lessons: lessons.filter(
        (lesson) => lesson.sectionId.toString() === section._id.toString(),
      ),
    }));

    res.json({
      course: {
        title: course.title,
        slug: course.slug,
        description: course.description,
      },
      sections: sectionsWithLessons,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/courses
 */
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({})
      .select("title slug description")
      .lean();

    res.status(200).json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

/**
 * GET /api/courses/featured
 */
export const getFeaturedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isFeatured: true })
      .select("title slug description")
      .limit(3)
      .lean();

    res.status(200).json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch featured courses" });
  }
};
