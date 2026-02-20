import ReactMarkdown from "react-markdown";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";
import useIsAdmin from "../../hooks/useIsAdmin";
import { generateLessonFlashcards } from "../../services/aiServices";

const LessonDetail = () => {
  const { lessonId, slug } = useParams();
  console.log("LESSON ID FROM ROUTE:", lessonId);

  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isUser, setIsUser] = useState(false);

  const [flashcards, setFlashcards] = useState([]);
  const [hasFlashcards, setHasFlashcards] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [flashcardStatus, setFlashcardStatus] = useState(null);

  useEffect(() => {
    fetchLesson();
    checkProgress();
    fetchFlashcards();
  }, [lessonId]);

  useEffect(() => {
    if (flashcardStatus === "success") {
      toast.success("Flashcards generated");
      setFlashcardStatus(null); // prevents repeat
    }

    if (flashcardStatus === "error") {
      toast.error("Flashcards already exist or generation failed");
      setFlashcardStatus(null);
    }
  }, [flashcardStatus]);

  const fetchLesson = async () => {
    const { data } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .single();

    setLesson(data);
    setLoading(false);
  };

  const checkProgress = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("lesson_progress")
      .select("id")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    if (data) setIsCompleted(true);
  };

  const fetchFlashcards = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    const res = await fetch(
      `http://localhost:8000/api/flashcards/lesson/${lessonId}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );

    if (!res.ok) {
      console.error("Failed to fetch flashcards");
      return;
    }

    const json = await res.json();

    console.log("FULL FLASHCARD API RESPONSE:", json);

    const cards = json.data || [];

    console.log("CARDS:", cards);
    console.log("CARDS LENGTH:", cards.length);

    setFlashcards(cards);
    setHasFlashcards(cards.length > 0);
  };

  const handleGenerateFlashcards = async () => {
    console.log("🔥 BUTTON CLICKED"); // 👈 ADD THIS

    const toastId = toast.loading("Generating flashcards...");

    try {
      setGenerating(true);

      await generateLessonFlashcards(lessonId);

      toast.success("Flashcards generated", { id: toastId });
      await fetchFlashcards();
    } catch (error) {
      toast.error("Flashcards already exist or generation failed", {
        id: toastId,
      });
    } finally {
      setGenerating(false);
    }
  };

  const markAsCompleted = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("lesson_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        completed: true,
      },
      { onConflict: "user_id,lesson_id" },
    );

    setIsCompleted(true);
    setShowSuccess(true);
  };

  if (loading) return <p className="p-6">Loading lesson...</p>;
  if (!lesson) return <p className="p-6">Lesson not found</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>

      <div className="prose prose-slate max-w-none">
        <ReactMarkdown>{lesson.content}</ReactMarkdown>
      </div>

      <div className="mt-8 flex flex-wrap items-start gap-3">
        {isUser && !isCompleted && (
          <button
            onClick={markAsCompleted}
            className="bg-emerald-600 text-white px-4 py-2 rounded"
          >
            Mark as completed
          </button>
        )}

        {isAdmin && !adminLoading && (
          <>
            <button
              onClick={handleGenerateFlashcards}
              disabled={generating}
              className="  rounded-lg bg-[#b5995a] px-4 py-2.5 text-white text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-60"
            >
              {generating ? "Generating..." : "Generate Flashcards "}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LessonDetail;
