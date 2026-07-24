import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import { Info } from "lucide-react";

const LessonQuiz = () => {
  const { lessonId } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(2);
  const [loading, setLoading] = useState(true);

  const [showResults, setShowResults] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [quizLocked, setQuizLocked] = useState(false);
  const [previousAttempt, setPreviousAttempt] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, []);

  useEffect(() => {
    if (showResults && resultData?.score !== undefined) {
      let start = 0;
      const end = resultData.score;
      const duration = 800;
      const stepTime = 16;
      const increment = end / (duration / stepTime);

      const counter = setInterval(() => {
        start += increment;

        if (start >= end) {
          start = end;
          clearInterval(counter);
        }

        setAnimatedScore(Math.round(start));
      }, stepTime);

      return () => clearInterval(counter);
    }
  }, [showResults, resultData]);

  const handleOptionSelect = (questionIndex, option) => {
    if (showResults || quizLocked) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  const fetchQuiz = async () => {
    try {
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setQuiz(data.data);
      fetchPreviousAttempt(data.data._id);
    } catch (err) {
      toast.error("Quiz not available");
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviousAttempt = async (quizId) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(
        `http://localhost:8000/api/quizzes/${quizId}/my-attempt`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (res.status === 404) {
        setPreviousAttempt(null);
        setShowResults(false);
        setResultData(null);
        setQuizLocked(false);
        setAttemptsLeft(2);
        return;
      }

      if (!res.ok) throw new Error("Failed attempt fetch");

      const data = await res.json();
      const attempt = data.data;

      setPreviousAttempt(attempt);
      setAttemptsLeft(attempt.attemptsLeft);

      if (attempt && attempt.answers && attempt.answers.length > 0) {
        setResultData(attempt);
        setShowResults(true);
      } else {
        setShowResults(false);
      }

      if (attempt.attemptsLeft <= 0) setQuizLocked(true);

      const restoredAnswers = {};
      attempt.answers.forEach((a) => {
        restoredAnswers[a.questionIndex] = a.selectedAnswer;
      });

      setSelectedAnswers(restoredAnswers);
    } catch (err) {
      console.error("Previous attempt fetch failed", err);
    }
  };

  const handleCheckResults = async () => {
    if (!quiz) return;

    if (Object.keys(selectedAnswers).length < quiz.questions.length) {
      toast.error("Please answer all questions ⚠");
      return;
    }

    const toastId = toast.loading("Checking answers...");

    try {
      setSubmitting(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const answersPayload = Object.entries(selectedAnswers).map(
        ([questionIndex, selectedAnswer]) => ({
          questionIndex: Number(questionIndex),
          selectedAnswer,
        }),
      );

      const res = await fetch(
        `http://localhost:8000/api/quizzes/${quiz._id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ answers: answersPayload }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResultData(data.data);
      setShowResults(true);
      setAttemptsLeft(data.data.attemptsLeft);

      toast.success("Results ready ✅", { id: toastId });

      if (data.data.attemptsLeft <= 0) setQuizLocked(true);
    } catch (err) {
      toast.error(err.message || "Failed to check results ❌", {
        id: toastId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetryQuiz = () => {
    if (attemptsLeft <= 0) return;

    setSelectedAnswers({});
    setShowResults(false);
    setResultData(null);
    setQuizLocked(false);
  };

  if (loading) return <p className="p-6">Loading quiz...</p>;
  if (!quiz) return <p className="p-6">No quiz found</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{quiz.title}</h1>

      {quizLocked && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-300">
          <h2 className="font-bold text-lg">Attempts Exhausted 🚫</h2>
          {previousAttempt && (
            <p className="text-sm mt-1">
              Last Score: <b>{previousAttempt.score}%</b>
            </p>
          )}
        </div>
      )}

      {showResults && resultData && (
        <div className="mb-6 bg-slate-50 border border-blue-100 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-2">Score: {animatedScore}%</h2>

          <p className="text-sm text-slate-500 mb-4">
            Correct: {resultData.correctCount} / {resultData.totalQuestions}
          </p>

          <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-300 transition-all duration-1000"
              style={{ width: `${resultData.score}%` }}
            />
          </div>
        </div>
      )}

      {quiz.questions.map((q, index) => {
        const attemptAnswer =
          showResults && resultData?.answers
            ? resultData.answers.find((a) => a.questionIndex === index)
            : null;

        const userAnswer = attemptAnswer?.selectedAnswer ?? null;
        const isCorrect = attemptAnswer?.isCorrect ?? null;

        return (
          <div key={index} className="mb-6 bg-white rounded-xl shadow p-6">
            <p className="text-xs text-slate-400 font-bold">
              QUESTION {index + 1}
            </p>

            <p className="font-semibold mb-4">{q.question}</p>

            <div className="space-y-2">
              {q.options.map((option, i) => {
                const isSelected = selectedAnswers[index] === option;

                return (
                  <button
                    key={i}
                    onClick={() => handleOptionSelect(index, option)}
                    disabled={showResults || quizLocked}
                    className={`w-full text-left px-4 py-2 rounded-lg border ${
                      isSelected
                        ? "bg-indigo-100 border-indigo-400"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {showResults && (
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded border">
                  <p className="text-xs font-bold text-slate-500">
                    YOUR ANSWER
                  </p>
                  <p>{userAnswer || "Not Answered"}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded border">
                  <p className="text-xs font-bold text-slate-500">
                    CORRECT ANSWER
                  </p>
                  <p>{q.correctAnswer}</p>
                </div>
              </div>
            )}

            {q.explanation && showResults && (
              <div className="mt-4 p-3 border bg-slate-50 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <Info size={16} />
                  <span className="text-xs font-bold">Helpful Explanation</span>
                </div>
                <p className="text-sm">{q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}

      <div className="mt-8 flex justify-end gap-4">
        {quizLocked ? (
          <button
            disabled
            className="px-6 py-2 rounded-lg bg-slate-400 text-white"
          >
            Attempts Exhausted
          </button>
        ) : !showResults ? (
          <button
            onClick={handleCheckResults}
            disabled={submitting}
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white"
          >
            {submitting ? "Checking..." : "Check Results"}
          </button>
        ) : (
          resultData?.score < 50 &&
          attemptsLeft > 0 && (
            <button
              onClick={handleRetryQuiz}
              className="px-6 py-2 rounded-lg bg-amber-500 text-white"
            >
              Retry Quiz
            </button>
          )
        )}
      </div>

      <p className="text-sm text-slate-500 mt-4">
        Attempts left: {attemptsLeft}
      </p>
    </div>
  );
};

export default LessonQuiz;
