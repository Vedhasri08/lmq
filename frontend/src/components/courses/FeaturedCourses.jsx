import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseCard from "./CourseCard";
import { getFeaturedCourses } from "../../services/courseService";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FeaturedCourses = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await getFeaturedCourses();
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to load featured courses", err);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-900">Courses</h2>

        <Link
          to="/courses"
          aria-label="Explore all courses"
          className="group inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <span>Explore more</span>

          <ArrowRight
            aria-hidden
            className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onClick={() => navigate(`/courses/${course.slug}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedCourses;
