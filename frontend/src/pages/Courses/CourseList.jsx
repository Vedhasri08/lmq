import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCourses } from "../../services/courseService";
import CourseCard from "../../components/courses/CourseCard";
import { ArrowLeft } from "lucide-react";

const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchCourses = async () => {
      try {
        const data = await getAllCourses();
        if (isMounted) {
          setCourses(data);
        }
      } catch (err) {
        if (err?.name === "AbortError") return; // 👈 important
        console.error("Failed to fetch courses:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">All Courses</h1>

      <button
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="group mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        ) : (
          <p className="text-sm text-slate-500">No courses found</p>
        )}
      </div>
    </div>
  );
};

export default CoursesList;
