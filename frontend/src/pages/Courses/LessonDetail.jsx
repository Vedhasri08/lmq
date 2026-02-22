import ReactMarkdown from "react-markdown";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";
import useIsAdmin from "../../hooks/useIsAdmin";
import { generateLessonFlashcards } from "../../services/aiServices";

const LessonDetail = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const [flashcards, setFlashcards] = useState([]);
  const [hasFlashcards, setHasFlashcards] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  const [quizExists, setQuizExists] = useState(false);
  const [checkingQuiz, setCheckingQuiz] = useState(true);
  const [overallScore, setOverallScore] = useState(null);
  const [progress, setProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);

  // ✅ Initial Load
  useEffect(() => {
    fetchLesson();
    checkProgress();
    fetchFlashcards();
    checkQuizExists();
  }, [lessonId]);

  // ✅ Recalculate progress when course_id available
  useEffect(() => {
    if (lesson?.course_id) {
      fetchOverallProgress(lesson.course_id);
    }
  }, [lesson?.course_id]);

  // ---------------- FETCH LESSON ----------------
  const fetchLesson = async () => {
    try {
      const { data } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single();

      setLesson(data);
    } catch (err) {
      console.error("Lesson fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- CHECK COMPLETION ----------------
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

  // ---------------- FETCH FLASHCARDS ----------------
  const fetchFlashcards = async () => {
    try {
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

      if (!res.ok) return;

      const json = await res.json();
      const cards = json.data || [];

      setFlashcards(cards);
      setHasFlashcards(cards.length > 0);
    } catch (err) {
      console.error("Flashcard fetch failed:", err);
    }
  };
  const fetchOverallScore = async (courseId) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !courseId) return;

      const session = await supabase.auth.getSession();
      const token = session.data.session.access_token;

      const res = await fetch(
        `http://localhost:8000/api/quizzes/course/${courseId}/score`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOverallScore(data.data.averageScore);
    } catch (err) {
      console.error("Score fetch failed:", err);
    }
  };
  // ---------------- GENERATE FLASHCARDS ----------------
  const handleGenerateFlashcards = async () => {
    const toastId = toast.loading("Generating flashcards...");

    try {
      setGenerating(true);
      await generateLessonFlashcards(lessonId);

      toast.success("Flashcards generated ✅", { id: toastId });
      fetchFlashcards();
    } catch (err) {
      toast.error("Flashcards already exist ❌", { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  // ---------------- GENERATE QUIZ ----------------
  const handleGenerateQuiz = async () => {
    const toastId = toast.loading("Generating quiz...");

    try {
      setGeneratingQuiz(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(
        "http://localhost:8000/api/quizzes/lesson/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            lessonId,
            numQuestions: 5,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Quiz generated ✅", { id: toastId });
      setQuizExists(true);
    } catch (err) {
      toast.error(err.message || "Quiz already exists ❌", {
        id: toastId,
      });
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // ---------------- CHECK QUIZ ----------------
  const checkQuizExists = async () => {
    try {
      setCheckingQuiz(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(
        `http://localhost:8000/api/quizzes/lesson/${lessonId}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      setQuizExists(res.ok);
    } catch (err) {
      console.error("Quiz check failed:", err);
    } finally {
      setCheckingQuiz(false);
    }
  };

  // ---------------- MARK COMPLETED ----------------
  const markAsCompleted = async () => {
    try {
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
      toast.success("Lesson Completed 🎉");

      // ✅ Refresh progress instantly
      fetchOverallProgress(lesson.course_id);
    } catch (err) {
      toast.error("Failed to mark completed ❌");
    }
  };

  // ---------------- OVERALL PROGRESS ----------------
  const fetchOverallProgress = async (courseId) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !courseId) return;

      const { data: lessons } = await supabase
        .from("lessons")
        .select("id")
        .eq("course_id", courseId);

      const { data: completed } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("completed", true);

      const total = lessons?.length || 0;
      const done = completed?.length || 0;

      setTotalLessons(total);
      setCompletedCount(done);

      const percent = total > 0 ? Math.round((done / total) * 100) : 0;
      setProgress(percent);

      // ✅ NEW LOGIC
      if (done === total && total > 0) {
        fetchOverallScore(courseId);
      }
    } catch (err) {
      console.error("Progress fetch failed:", err);
    }
  };
  if (loading) return <p className="p-6">Loading lesson...</p>;
  if (!lesson) return <p className="p-6">Lesson not found</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>

      <div className="prose prose-slate max-w-none">
        <ReactMarkdown>{lesson.content}</ReactMarkdown>
      </div>

      {/* ✅ ACTION BUTTONS */}
      <div className="mt-8 flex flex-wrap gap-3">
        {!isCompleted && (
          <button
            onClick={markAsCompleted}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Mark as completed
          </button>
        )}

        {isAdmin && !adminLoading && (
          <>
            <button
              onClick={handleGenerateFlashcards}
              disabled={generating}
              className="rounded-lg bg-[#b5995a] px-4 py-2.5 text-white text-sm font-bold shadow-lg"
            >
              {generating ? "Generating..." : "Generate Flashcards"}
            </button>

            <button
              onClick={handleGenerateQuiz}
              disabled={generatingQuiz || quizExists || checkingQuiz}
              className={`rounded-lg px-4 py-2.5 text-white text-sm font-bold shadow-lg
                ${
                  quizExists ? "bg-slate-400" : "bg-indigo-600 hover:opacity-90"
                }`}
            >
              {checkingQuiz
                ? "Checking..."
                : quizExists
                  ? "Quiz Already Generated"
                  : generatingQuiz
                    ? "Generating..."
                    : "Generate Quiz"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LessonDetail;
