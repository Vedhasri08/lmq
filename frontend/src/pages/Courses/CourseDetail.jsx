import { useParams, useNavigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getCourseBySlug,
  getSectionsByCourse,
  getLessonsBySection,
} from "../../services/courseService";
import { supabase } from "../../lib/supabase";
import { ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";
import Spinner from "components/common/Spinner";

const CourseDetail = () => {
  const navigate = useNavigate();
  const { lessonId, slug } = useParams();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [lessons, setLessons] = useState({});
  const [openSections, setOpenSections] = useState({});
  const [completedLessons, setCompletedLessons] = useState([]);
  const [userId, setUserId] = useState(null);

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const markLessonCompleted = async (lessonId) => {
    if (!userId) return;

    const { error } = await supabase.from("lesson_progress").upsert({
      user_id: userId,
      lesson_id: lessonId,
    });

    if (!error) {
      setCompletedLessons((prev) =>
        prev.includes(lessonId) ? prev : [...prev, lessonId],
      );
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) setUserId(user.id);

      const courseRes = await getCourseBySlug(slug);
      const courseObj = courseRes?.data ?? courseRes;
      setCourse(courseObj);

      const sectionData = await getSectionsByCourse(courseObj.id);
      setSections(sectionData);

      const lessonMap = {};
      for (const section of sectionData) {
        lessonMap[section.id] = await getLessonsBySection(section.id);
      }
      setLessons(lessonMap);

      if (user) {
        const { data } = await supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("user_id", user.id);

        setCompletedLessons(data?.map((p) => p.lesson_id) || []);
      }
    };

    fetchAll();
  }, [slug]);

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-500">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* ===== Sidebar ===== */}
      <aside className="w-80 border-r bg-white flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <button
            onClick={() => navigate("/dashboard")}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#1E293B] transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <h2 className="text-lg font-semibold text-slate-900">
            {course.title}
          </h2>

          <p className="mt-1 text-sm text-slate-600 line-clamp-3">
            {course.description}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {sections.map((section) => {
            const sectionLessons = lessons[section.id] || [];

            const completedCount = sectionLessons.filter((l) =>
              completedLessons.includes(l.id),
            ).length;

            const percent =
              sectionLessons.length === 0
                ? 0
                : Math.round((completedCount / sectionLessons.length) * 100);

            return (
              <div
                key={section.id}
                className="rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                {/* Section Toggle */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between px-4 pt-4 pb-2"
                >
                  <span className="text-lg font-bold text-slate-900">
                    {section.title}
                  </span>

                  <div className="flex items-center gap-2 text-sm text-[#4F9CF9] font-semibold">
                    {completedCount}/{sectionLessons.length}
                    {openSections[section.id] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {/* Progress Bar */}
                <div className="px-4 pb-3">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full">
                    <div
                      className="h-full bg-[#1E293B] rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Lessons */}
                {openSections[section.id] && (
                  <ul className="pb-4">
                    {sectionLessons.map((lesson) => {
                      const isActive = lesson.id === lessonId;
                      const isCompleted = completedLessons.includes(lesson.id);

                      return (
                        <li
                          key={lesson.id}
                          onClick={() => navigate(`lessons/${lesson.id}`)}
                          className={`mx-2 mt-1 px-3 py-2 rounded-lg cursor-pointer transition-all relative ${
                            isActive
                              ? "bg-[#4F9CF9]/10 text-[#1E293B]"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-0 h-full w-1 bg-[#4F9CF9] rounded-l-lg" />
                          )}

                          <div className="flex items-center justify-between">
                            <span
                              className={`truncate ${
                                isActive ? "font-semibold" : "font-medium"
                              }`}
                            >
                              {lesson.title}
                            </span>

                            {isCompleted && (
                              <span className="text-[#4F9CF9]">✔</span>
                            )}
                          </div>

                          {isActive && !isCompleted && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markLessonCompleted(lesson.id);
                              }}
                              className="mt-2 text-xs font-semibold text-[#4F9CF9] hover:underline"
                            >
                              Mark as completed
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200 bg-white">
          <button
            onClick={() => navigate(`/lessons/${lessonId}/flashcards`)}
            className="w-full rounded-lg bg-[#1E293B] 
               hover:bg-[#0F172A]
               px-4 py-2.5 text-white text-sm font-bold 
               shadow-lg transition-all"
          >
            View Flashcards
          </button>
          <button className="w-full px-4 py-2.5 text-[#1E293B] hover:text-[#0F172A] text-sm font-bold mt-3">
            Go to Quiz
          </button>
        </div>
      </aside>

      {/* ===== Content Area ===== */}
      <main className="flex-1 overflow-y-auto p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default CourseDetail;
