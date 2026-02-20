import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AddChapters = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchChapters = async () => {
    const { data } = await supabase
      .from("sections")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index");

    setChapters(data || []);
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  const addChapter = async () => {
    if (!title.trim()) return;

    setLoading(true);

    await supabase.from("sections").insert({
      course_id: courseId,
      title,
      order_index: chapters.length + 1,
    });

    setTitle("");
    setLoading(false);
    fetchChapters();
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add Chapters</h1>

      <div className="flex gap-3 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Chapter title"
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={addChapter}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {chapters.map((c) => (
          <li key={c.id} className="border rounded p-3 flex justify-between">
            <span>
              {c.order_index}. {c.title}
            </span>
            <button
              onClick={() => navigate(`/admin/chapters/${c.id}/lessons`)}
              className="text-blue-600"
            >
              Add Lessons →
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddChapters;
