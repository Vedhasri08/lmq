import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

import { BookOpen, GraduationCap, Rocket, ArrowRight, X } from "lucide-react";

const AddCourse = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("beginner");
  const [publishType, setPublishType] = useState("now");
  const [publishDateTime, setPublishDateTime] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");

  const handleCreateCourse = async (mode) => {
    setError("");

    if (!title || !description) {
      setError("Course title and description are required");
      return;
    }

    if (publishType === "later" && !publishDateTime) {
      setError("Please select a publish date & time");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const slug = generateSlug(title);

      const publishAt =
        publishType === "later" && publishDateTime
          ? new Date(publishDateTime).toISOString()
          : null;

      const status =
        mode === "draft"
          ? "draft"
          : publishType === "later"
            ? "scheduled"
            : "published";

      const isPublished = mode === "publish" && publishType === "now";

      const { data: course, error } = await supabase
        .from("courses")
        .insert({
          title,
          slug,
          description,
          level,
          status,
          publish_at: publishAt,
          is_published: isPublished,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/admin/course/${course.id}/structure`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] text-slate-900 font-serif">
      <main className="flex-1 p-10">
        {/* Header */}
        <header className="flex justify-between items-end mb-8">
          <div>
            <nav className="flex text-xs text-slate-400 gap-2 mb-2 uppercase tracking-widest font-bold">
              <span className="hover:text-[#B59A5A] cursor-pointer">
                Courses
              </span>
              <span>/</span>
              <span className="text-slate-600">New Course</span>
            </nav>

            <h2 className="text-4xl font-semibold tracking-tight">
              Create New Course
            </h2>
          </div>

          <button
            onClick={() => handleCreateCourse("draft")}
            className="px-5 py-2.5 rounded-lg border border-[#B59A5A]/30 
            text-[#B59A5A] font-bold text-sm hover:bg-[#B59A5A]/5 transition-all"
          >
            Save Draft
          </button>
        </header>

        {/* Stepper */}
        <div className="mb-10 font-display">
          <div className="flex items-center w-full max-w-4xl mx-auto">
            {[1, 2, 3, 4].map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1 relative">
                  <div
                    className={`size-10 rounded-full border-2 flex items-center justify-center font-bold
                    ${
                      step === 1
                        ? "border-[#B59A5A] bg-[#B59A5A] text-white shadow-lg shadow-[#B59A5A]/30"
                        : "border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    {step}
                  </div>

                  <span
                    className={`absolute top-12 text-xs font-bold uppercase tracking-tighter
                    ${step === 1 ? "text-[#B59A5A]" : "text-slate-400"}`}
                  >
                    {step === 1
                      ? "Basic Info"
                      : step === 2
                        ? "Content Builder"
                        : step === 3
                          ? "Assessment"
                          : "Final Review"}
                  </span>
                </div>

                {i < 3 && (
                  <div className="h-[2px] flex-1 bg-slate-200 mx-[-20px] mb-[-4px]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div
          className="max-w-4xl mx-auto mt-16 bg-white rounded-xl 
        shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
        >
          <div className="p-8 space-y-8">
            <div className="space-y-2">
              <label className="block text-sm font-semibold uppercase tracking-wide">
                Course Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Advanced Neural Networks"
                className="w-full px-4 py-3.5 rounded-lg border border-slate-200 bg-slate-50/50
                focus:ring-2 focus:ring-[#B59A5A]/20 focus:border-[#B59A5A] outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold uppercase tracking-wide">
                Course Description
              </label>
              <textarea
                rows={5}
                value={description}
                placeholder="Provide a detailed and short explaination about the course"
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3.5 rounded-lg border border-slate-200 bg-slate-50/50
                focus:ring-2 focus:ring-[#B59A5A]/20 focus:border-[#B59A5A] outline-none"
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-4">
              <label className="block text-sm font-bold uppercase tracking-wide">
                Course Difficulty Level
              </label>

              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    key: "beginner",
                    label: "Beginner",
                    desc: "Foundational concepts",
                    icon: BookOpen,
                  },
                  {
                    key: "medium",
                    label: "Medium",
                    desc: "Intermediate practicals",
                    icon: GraduationCap,
                  },
                  {
                    key: "professional",
                    label: "Professional",
                    desc: "Advanced mastery",
                    icon: Rocket,
                  },
                ].map(({ key, label, desc, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setLevel(key)}
                    className={`p-5 border-2 rounded-xl text-center transition-all
                    ${
                      level === key
                        ? "border-[#B59A5A] bg-[#B59A5A]/5"
                        : "border-slate-100 hover:border-[#B59A5A]/40"
                    }`}
                  >
                    <Icon className="mx-auto mb-2 text-[#B59A5A]" size={28} />
                    <p className="font-bold">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
            {/* Publish */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="block text-sm font-bold uppercase tracking-wide">
                Publish Settings
              </label>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={publishType === "now"}
                    onChange={() => setPublishType("now")}
                    className="accent-[#B59A5A]"
                  />
                  Publish Now
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={publishType === "later"}
                    onChange={() => setPublishType("later")}
                    className="accent-[#B59A5A]"
                  />
                  Schedule for later
                </label>

                {publishType === "later" && (
                  <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                    <input
                      type="datetime-local"
                      value={publishDateTime}
                      onChange={(e) => setPublishDateTime(e.target.value)}
                      className="text-sm outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          {/* Footer */}
          <div className="bg-slate-50/80 p-6 flex justify-between">
            <button
              onClick={() => navigate(-1)}
              className="text-slate-500 hover:text-red-500 text-sm flex items-center gap-2"
            >
              <X size={16} />
              Cancel Creation
            </button>

            <button
              disabled={loading}
              onClick={() => handleCreateCourse("publish")}
              className="px-8 py-3 rounded-lg bg-[#B59A5A] text-white font-bold text-sm
              hover:brightness-110 shadow-lg shadow-[#1E293B]/20 flex items-center gap-2"
            >
              {loading ? "Saving..." : "Save & Continue"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddCourse;
