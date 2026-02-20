import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContent";
import { Trash2, Pencil, BookOpen, Play, X, Clock } from "lucide-react";
import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import StatusBadge from "components/StatusBadge";

const CourseCard = ({ course, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [lessonCount, setLessonCount] = useState(0);

  const MINUTES_PER_LESSON = 5;
  const totalMinutes = lessonCount * MINUTES_PER_LESSON;

  const isAdmin = user?.role === "admin";

  const openDeleteModal = (course) => {
    setSelectedCourse(course);
    setIsDeleteModalOpen(true);
  };

  useEffect(() => {
    if (!course.id) return;

    const fetchCourseData = async () => {
      try {
        const { data: sections } = await supabase
          .from("sections")
          .select("id")
          .eq("course_id", course.id);

        if (!sections?.length) {
          setLessonCount(0);
          setProgress(0);
          return;
        }

        const sectionIds = sections.map((s) => s.id);

        const { data: lessons } = await supabase
          .from("lessons")
          .select("id")
          .in("section_id", sectionIds);

        const lessonIds = lessons.map((l) => l.id);
        setLessonCount(lessonIds.length);

        if (user && !isAdmin && lessonIds.length > 0) {
          const { count } = await supabase
            .from("lesson_progress")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("completed", true)
            .in("lesson_id", lessonIds);

          setProgress(Math.round((count / lessonIds.length) * 100));
        }
      } catch (err) {
        console.error("CourseCard error:", err);
      }
    };

    fetchCourseData();
  }, [course.id, user, isAdmin]);

  const handleConfirmDelete = async () => {
    if (!selectedCourse) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", selectedCourse.id);

      if (error) throw error;

      toast.success(`${selectedCourse.title} deleted`);
      setIsDeleteModalOpen(false);
      setSelectedCourse(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete course.");
    } finally {
      setDeleting(false);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "—";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <>
      <div
        onClick={() => navigate(`/courses/${course.slug}`)}
        className="group relative cursor-pointer rounded-2xl bg-white border border-slate-200/70 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      >
        {isAdmin && (
          <div className="absolute top-4 right-4 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/course/${course.id}/edit`);
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-indigo-600"
            >
              <Pencil size={16} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openDeleteModal(course);
              }}
              className="p-2 rounded-lg text-red-400 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF4FF]">
              <BookOpen size={18} className="text-[#4F9CF9]" />
            </div>

            <span className="text-xs font-semibold tracking-[0.18em] text-slate-400">
              COURSE
            </span>
          </div>

          <span className="rounded-full bg-[#4F9CF9] px-3 py-1 text-xs font-semibold text-white">
            {course.level || "Beginner"}
          </span>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-5">
          {isAdmin && (
            <div className="space-y-1">
              <StatusBadge status={course.status} />
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900 leading-snug">
              {course.title}
            </h3>

            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
              {course.description}
            </p>
          </div>

          {!isAdmin && user && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Progress</span>
                <span className="font-semibold text-slate-700">
                  {progress}%
                </span>
              </div>

              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-2.5 w-full rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#1E293B]/90 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                <span>{lessonCount} lessons</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{formatDuration(totalMinutes)}</span>
              </div>
            </div>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full 
                bg-slate-100 text-[#1E293B] text-xs font-semibold 
                border border-slate-200"
            >
              <Play size={14} strokeWidth={2.3} />
              Resume
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <button
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>

            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#EAF4FF] flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-[#4F9CF9]" />
                </div>

                <h2 className="text-xl font-semibold text-slate-900">
                  Confirm delete
                </h2>
              </div>

              <p className="text-slate-600 text-sm">
                Delete{" "}
                <span className="font-semibold text-slate-900">
                  "{selectedCourse?.title}"
                </span>
                ?
              </p>

              <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-md border-l-2 border-[#4F9CF9] mt-4">
                This action is permanent.
              </p>
            </div>

            <div className="bg-slate-50 px-8 py-5 flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 text-sm rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 bg-[#1E293B] hover:bg-[#0F172A] text-white text-sm font-semibold rounded-lg shadow-sm"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseCard;
