import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProgressBar = ({ value }) => (
  <div className="w-full h-2 rounded-full bg-slate-700/40 overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
      style={{ width: `${value}%` }}
    />
  </div>
);

const TopPerformingCourses = ({ courses, onViewAll }) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl bg-white text-black shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Top Performing Courses</h3>
        <button onClick={onViewAll} className="text-sm text-[#B59A5A]">
          View All Courses
        </button>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-5 gap-4 text-xs uppercase tracking-wide text-slate-400 mb-3">
        <span>Course</span>
        <span>Students</span>
        <span>Rating</span>
        <span className="col-span-2">Avg. Completion</span>
      </div>

      {/* Rows */}
      <div className="space-y-4">
        {courses.map((course) => (
          <div
            key={course.id}
            onClick={() => navigate(`/courses/${course.slug}`)}
            className="grid grid-cols-5 gap-4 items-center bg-white rounded-xl p-4 hover:text-[#B59A5A] hover:shadow-lg transition cursor-pointer"
          >
            {/* Course */}
            <div>
              <p className="font-medium">{course.title}</p>
              <p className="text-xs text-slate-400">
                {course.category || "General"}
              </p>
            </div>

            {/* Students */}
            <div className="font-medium">
              {course.students.toLocaleString()}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-medium">{course.rating ?? "—"}</span>
            </div>

            {/* Completion */}
            <div className="col-span-2">
              <ProgressBar value={course.avg_completion || 0} />
              <p className="mt-1 text-xs text-slate-400">
                {course.avg_completion ?? 0}% Completion
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopPerformingCourses;
