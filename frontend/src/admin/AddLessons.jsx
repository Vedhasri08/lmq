import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { ArrowLeft } from "lucide-react";

const AddLessons = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLessons = async () => {
    const { data } = await supabase
      .from("lessons")
      .select("*")
      .eq("section_id", sectionId)
      .order("order_index");

    setLessons(data || []);
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const addLesson = async () => {
    if (!title.trim() || !content.trim()) return;

    setLoading(true);

    await supabase.from("lessons").insert({
      section_id: sectionId,
      title,
      content,
      order_index: lessons.length + 1,
    });

    setTitle("");
    setContent("");
    setLoading(false);
    fetchLessons();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="text-3xl font-bold mb-6">Add Lessons</h1>

      {/* Add lesson form */}
      <div className="space-y-4 mb-8">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Lesson title"
          className="w-full border rounded px-3 py-2"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Lesson content (you can use markdown)"
          rows={8}
          className="w-full border rounded px-3 py-2"
        />

        <button
          onClick={addLesson}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 text-white rounded"
        >
          Add Lesson
        </button>
      </div>

      {/* Lessons list */}
      <h2 className="text-xl font-semibold mb-3">Lessons</h2>

      <ul className="space-y-2">
        {lessons.map((lesson) => (
          <li key={lesson.id} className="border rounded p-3">
            {lesson.order_index}. {lesson.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddLessons;
