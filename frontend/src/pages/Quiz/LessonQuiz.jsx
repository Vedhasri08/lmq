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
      const duration = 800; // animation speed
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

      // ✅ Fetch previous attempt
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
        `http://localhost:8000/api/quizzes/${quizId}/my-attempt`, // ✅ correct endpoint
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      console.log("Attempt API status:", res.status); // ✅ debug

      // ✅ HANDLE "NOT ATTEMPTED"
      if (res.status === 404) {
        console.log("✅ No previous attempt");

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

      // ✅ Restore results view
      setResultData(attempt);
      setShowResults(true);

      if (attempt.attemptsLeft <= 0) {
        setQuizLocked(true);
      }

      // ✅ Restore answers
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

      if (data.data.attemptsLeft <= 0) {
        setQuizLocked(true);
      }
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

      {/* ✅ Locked Banner */}
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

      {/* ✅ Score Panel */}
      {showResults && resultData && (
        <div className="mb-6 bg-slate-50 border border-blue-100 rounded-2xl p-8 shadow-sm w-full">
          {/* Score Header */}
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Score: {animatedScore}%
            </h2>

            <p className="text-sm font-medium text-slate-500">
              Correct: {resultData.correctCount} / {resultData.totalQuestions}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-300 transition-all duration-1000 ease-out"
              style={{ width: `${resultData.score}%` }}
            />
          </div>
        </div>
      )}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-5xl">
          {" "}
          {/* ⬅ wider container */}
          {quiz.questions.map((q, index) => {
            const attemptAnswer = resultData?.answers?.find(
              (a) => a.questionIndex === index,
            );

            const userAnswer = attemptAnswer?.selectedAnswer;
            const isCorrect = attemptAnswer?.isCorrect;

            return (
              <div
                key={index}
                className="mb-6 rounded-2xl bg-white shadow-sm overflow-hidden w-full max-w-5xl"
              >
                <div className="flex">
                  {/* Left Accent */}
                  <div
                    className={`w-1.5 ${
                      isCorrect ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  />

                  {/* Content */}
                  <div className="flex-1 px-6 py-4">
                    {" "}
                    {/* ⬅ less vertical padding */}
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 tracking-wide">
                          QUESTION {index + 1}
                        </p>

                        <p className="font-semibold text-slate-800 mt-1">
                          {q.question}
                        </p>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1
                    ${
                      isCorrect
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-500"
                    }`}
                      >
                        {isCorrect ? "✔ CORRECT" : "✖ INCORRECT"}
                      </span>
                    </div>
                    {/* Answers */}
                    <div className="grid md:grid-cols-2 gap-4 mt-3">
                      <div
                        className={`p-3 rounded-xl border
                    ${
                      isCorrect
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-red-50 border-red-200"
                    }`}
                      >
                        <p
                          className={`text-[11px] font-bold mb-1
                      ${isCorrect ? "text-emerald-600" : "text-red-500"}`}
                        >
                          YOUR ANSWER
                        </p>

                        <p className="text-sm font-medium text-slate-700">
                          {userAnswer || "Not Answered"}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl border bg-slate-50 border-slate-200">
                        <p className="text-[11px] font-bold text-slate-500 mb-1">
                          CORRECT ANSWER
                        </p>

                        <p className="text-sm font-medium text-slate-700">
                          {q.correctAnswer}
                        </p>
                      </div>
                    </div>
                    {/* Explanation */}
                    {q.explanation && (
                      <div className="mt-3 bg-slate-50 border rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                            <Info className="w-3.5 h-3.5 text-white" />
                          </div>

                          <p className="text-[11px] font-bold text-slate-600">
                            Helpful Explanation
                          </p>
                        </div>

                        <p className="text-xs text-slate-500">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* ✅ Buttons */}
      <div className="mt-8 flex justify-end gap-4">
        {quizLocked ? (
          <button
            disabled
            className="px-6 py-2.5 rounded-lg font-bold bg-slate-400 text-white"
          >
            Attempts Exhausted
          </button>
        ) : !showResults ? (
          <button
            onClick={handleCheckResults}
            disabled={submitting || attemptsLeft <= 0}
            className={`px-6 py-2.5 rounded-lg font-bold shadow-lg text-white transition
              ${
                attemptsLeft <= 0
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:opacity-90"
              }`}
          >
            {attemptsLeft <= 0
              ? "No Attempts Left"
              : submitting
                ? "Checking..."
                : "Check Results"}
          </button>
        ) : (
          resultData?.score < 50 &&
          attemptsLeft > 0 && (
            <button
              onClick={handleRetryQuiz}
              className="px-6 py-2.5 rounded-lg font-bold shadow-lg text-white bg-amber-500 hover:opacity-90"
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
