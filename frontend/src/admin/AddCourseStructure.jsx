import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  ChevronLeft,
  ChevronDown,
  Save,
  Trash2,
  GripVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import LessonPreview from "./LessonPreview";

const timeAgo = (date) => {
  if (!date) return "";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
};

/* ───────────────── Main Component ───────────────── */
const AddCourseStructure = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [courseTitle, setCourseTitle] = useState("");
  const [sections, setSections] = useState([]);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [deleteChapterIndex, setDeleteChapterIndex] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const isEditing = Boolean(courseId);
  const canEdit = Boolean(courseId && lastSavedAt);
  /* ───────── Fetch course title ───────── */
  useEffect(() => {
    if (!courseId) return;

    const fetchCourseStructure = async () => {
      const { data, error } = await supabase
        .from("sections")
        .select(
          `
        id,
        title,
        order_index,
        lessons (
          id,
          title,
          content,
          order_index
        )
      `,
        )
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (error) {
        console.error(error);
        toast.error("Failed to load course content");
        return;
      }

      // 🔁 Convert DB → UI format
      const formattedSections = data.map((section) => ({
        id: section.id,
        title: section.title,
        open: true,
        lessons: section.lessons
          .sort((a, b) => a.order_index - b.order_index)
          .map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            content: lesson.content,
            preview: false,
          })),
      }));

      setSections(formattedSections);
    };

    fetchCourseStructure();
  }, [courseId]);

  /* ───────── Actions ───────── */
  const addChapter = () => {
    setSections([
      ...sections,
      {
        title: "",
        open: true,
        lessons: [{ title: "", content: "" }],
      },
    ]);
  };

  const updateChapter = (index, updated) => {
    const copy = [...sections];
    copy[index] = updated;
    setSections(copy);
  };

  const deleteChapter = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  /* ───────── Save (same behavior) ───────── */
  const handleSave = async () => {
    setSaving(true);

    try {
      // 1️⃣ fetch section ids
      const { data: existingSections, error: sectionFetchError } =
        await supabase.from("sections").select("id").eq("course_id", courseId);

      if (sectionFetchError) throw sectionFetchError;

      const sectionIds = existingSections.map((s) => s.id);

      // 2️⃣ delete lessons
      if (sectionIds.length > 0) {
        const { error } = await supabase
          .from("lessons")
          .delete()
          .in("section_id", sectionIds);

        if (error) throw error;
      }

      // 3️⃣ delete sections
      const { error: sectionDeleteError } = await supabase
        .from("sections")
        .delete()
        .eq("course_id", courseId);

      if (sectionDeleteError) throw sectionDeleteError;

      // 4️⃣ insert new structure
      for (let i = 0; i < sections.length; i++) {
        const { data: section, error: sectionInsertError } = await supabase
          .from("sections")
          .insert({
            course_id: courseId,
            title: sections[i].title,
            order_index: i + 1,
          })
          .select()
          .single();

        if (sectionInsertError) throw sectionInsertError;

        const { error: lessonInsertError } = await supabase
          .from("lessons")
          .insert(
            sections[i].lessons.map((lesson, j) => ({
              section_id: section.id,
              title: lesson.title,
              content: lesson.content,
              order_index: j + 1,
            })),
          );

        if (lessonInsertError) throw lessonInsertError;
      }

      // ✅ SUCCESS (ONLY HERE)
      setLastSavedAt(new Date());
      setHasChanges(false);
      toast.success(isEditing ? "Course updated" : "Course saved");
    } catch (error) {
      console.error("SAVE FAILED:", error);
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* ───────── HEADER (MATCH IMAGE) ───────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          {/* LEFT */}
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <span className="text-sm font-medium text-slate-900">
              {courseTitle}
            </span>
          </div>

          {/* CENTER */}
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
              Draft
            </span>

            <span>
              {sections.length} chapters •{" "}
              {sections.reduce((acc, s) => acc + s.lessons.length, 0)} lessons
            </span>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
            >
              <Save size={16} />
              {isEditing ? "Update Course" : "Save Course"}
            </button>

            {canEdit && (
              <button
                onClick={() => navigate(`/admin/course/${courseId}/edit`)}
                className="text-sm font-medium text-indigo-600 hover:underline"
              >
                Edit Course
              </button>
            )}

            <span className="flex items-center gap-1 text-sm text-slate-500 min-w-[120px]">
              {saving ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  <span className="text-green-600">✓</span>
                  Saved {lastSavedAt ? timeAgo(lastSavedAt) : "just now"}
                </>
              )}
            </span>
          </div>
        </div>
      </header>

      {/* ───────── PAGE BACKGROUND ───────── */}
      <main className="bg-slate-50 min-h-screen py-8">
        <div className="max-w-5xl mx-auto space-y-8 px-4 sm:px-6">
          {sections.map((section, sIndex) => (
            <div
              key={sIndex}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Chapter Header */}
              <div
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4 bg-slate-50 cursor-pointer gap-3"
                onClick={() =>
                  updateChapter(sIndex, { ...section, open: !section.open })
                }
              >
                <div className="flex items-center gap-3">
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ease-in-out ${
                      section.open ? "rotate-0" : "-rotate-90"
                    }`}
                  />

                  <div className="h-6 w-6 rounded-full border border-slate-300 text-xs flex items-center justify-center">
                    {sIndex + 1}
                  </div>

                  <input
                    className="text-sm font-medium bg-transparent outline-none text-slate-900"
                    placeholder="Chapter title"
                    value={section.title}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      updateChapter(sIndex, {
                        ...section,
                        title: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-500 sm:justify-end">
                  <span>{section.lessons.length} lessons</span>

                  {canEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/course/${courseId}/edit`);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-medium transition"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteChapterIndex(sIndex);
                    }}
                    className="text-slate-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Lessons */}
              {section.open && (
                <div
                  className={`expand ${
                    section.open ? "expand-open" : "expand-closed"
                  }`}
                >
                  <div className="relative px-4 sm:px-8 py-6 space-y-8">
                    {/* Vertical connector */}
                    <div className="hidden sm:block absolute left-6 top-0 bottom-0 w-px bg-slate-200" />

                    {section.lessons.map((lesson, lIndex) => (
                      <div
                        key={lIndex}
                        className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-fade-slide"
                      >
                        {/* Left indicators */}
                        <div className="flex items-center gap-3 sm:pt-1">
                          <GripVertical size={16} className="text-slate-300" />

                          <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium flex items-center justify-center">
                            {lIndex + 1}
                          </div>
                        </div>

                        {/* Lesson content */}
                        <div className="flex-1 space-y-3">
                          {/* Title + Toggle */}
                          <div className="flex items-center justify-between">
                            <input
                              className="w-full text-sm font-medium bg-transparent outline-none text-slate-900"
                              placeholder="Lesson title"
                              value={lesson.title}
                              onChange={(e) => {
                                const lessons = [...section.lessons];
                                lessons[lIndex].title = e.target.value;
                                updateChapter(sIndex, { ...section, lessons });
                              }}
                            />

                            <button
                              onClick={() => {
                                const lessons = [...section.lessons];
                                lessons[lIndex].preview =
                                  !lessons[lIndex].preview;
                                updateChapter(sIndex, { ...section, lessons });
                              }}
                              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 ml-3"
                            >
                              {lesson.preview ? "Edit" : "Preview"}
                            </button>
                          </div>

                          {/* Content */}
                          {lesson.preview ? (
                            <div className="rounded-xl border border-slate-200 bg-slate-50/40 px-6 py-5">
                              <LessonPreview
                                content={
                                  lesson.content || "*No content yet...*"
                                }
                              />
                            </div>
                          ) : (
                            <textarea
                              rows={4}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700 focus:outline-none"
                              placeholder="What will students learn in this lesson?"
                              value={lesson.content}
                              onChange={(e) => {
                                const lessons = [...section.lessons];
                                lessons[lIndex].content = e.target.value;
                                updateChapter(sIndex, { ...section, lessons });
                              }}
                            />
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Add Lesson */}
                    <button
                      onClick={() =>
                        updateChapter(sIndex, {
                          ...section,
                          lessons: [
                            ...section.lessons,
                            { title: "", content: "" },
                          ],
                        })
                      }
                      className="w-full py-3 sm:py-3 rounded-xl border-2 border-dashed border-indigo-300 text-indigo-600 text-sm font-medium hover:bg-indigo-50 hover:scale-[1.01] active:scale-[0.98] transition"
                    >
                      + Add Lesson
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add Chapter */}
          <button
            onClick={addChapter}
            className="w-full py-4 rounded-xl border-2 border-dashed border-indigo-300 text-indigo-600 text-sm font-medium hover:bg-indigo-50"
          >
            + Add Chapter
          </button>
        </div>
      </main>
      {deleteChapterIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setDeleteChapterIndex(null)}
        >
          <div className="bg-white w-[90%] sm:w-full max-w-md rounded-2xl shadow-xl p-6 relative animate-fade-slide">
            {/* Close */}
            <button
              onClick={() => setDeleteChapterIndex(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>

            {/* Icon */}
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#EAF4FF] text-[#4F9CF9] mb-4">
              <Trash2 size={16} />
            </div>

            {/* Title */}
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Confirm delete
            </h2>

            {/* Description */}
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete this chapter?{" "}
              <span className="text-[#4F9CF9] font-medium">
                This action cannot be undone.
              </span>
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setDeleteChapterIndex(null)}
                className="flex-1 h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                onClick={() => {
                  deleteChapter(deleteChapterIndex);
                  setHasChanges(true);
                  setDeleteChapterIndex(null);
                  toast.success("Chapter deleted");
                }}
                className="flex-1 h-11 rounded-xl bg-[#1E293B] hover:bg-[#0F172A] text-sm font-semibold text-white disabled:opacity-50 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddCourseStructure;
