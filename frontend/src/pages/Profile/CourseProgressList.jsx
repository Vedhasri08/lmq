import React from "react";
import { BookOpen } from "lucide-react";

const CourseProgressList = ({ courses = [] }) => {
  if (!courses.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-sm text-slate-500">
        You are not enrolled in any courses yet.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Your Courses</h3>

      <div className="space-y-3">
        {courses.map((course) => (
          <CourseRow key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
};

const CourseRow = ({ course }) => {
  const progress = course?.progress ?? 0;

  const getStatus = () => {
    if (progress === 100) return "Completed";
    if (progress > 0) return "In Progress";
    return "Not Started";
  };

  const getStatusStyle = () => {
    if (progress === 100) return "bg-emerald-50 text-emerald-600";

    if (progress > 0) return "bg-amber-50 text-amber-600";

    return "bg-slate-100 text-slate-600";
  };

  return (
    <div
      className="
        rounded-2xl
        bg-white
        p-4
        border border-slate-200
        shadow-sm
        hover:shadow-md
        transition
        group
      "
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition" />

          <h4 className="text-sm font-semibold text-slate-900">
            {course?.title || "Untitled Course"}
          </h4>
        </div>

        <span
          className={`
            px-2.5 py-1
            rounded-full
            text-[11px]
            font-medium
            ${getStatusStyle()}
          `}
        >
          {getStatus()}
        </span>
      </div>

      {/* Progress Info */}
      <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
        <span>Progress</span>
        <span className="font-medium text-slate-700">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className="
      h-full
      rounded-full
      bg-[#0F172A]
      transition-all duration-500 ease-out
    "
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default CourseProgressList;
