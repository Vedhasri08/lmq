import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import quizService from "../../services/quizService";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import moment from "moment";

const QuizTake = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizService.getQuizById(quizId);
        setQuiz(response.data);
      } catch (error) {
        toast.error("Failed to fetch quiz.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleOptionChange = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true);

      const formattedAnswers = Object.keys(selectedAnswers).map(
        (questionId) => {
          const questionIndex = quiz.questions.findIndex(
            (q) => q._id === questionId,
          );

          const optionIndex = selectedAnswers[questionId];
          const selectedAnswer =
            quiz.questions[questionIndex].options[optionIndex];

          return { questionIndex, selectedAnswer };
        },
      );

      await quizService.submitQuiz(quizId, formattedAnswers);

      toast.success("Quiz submitted successfully!");
      navigate(`/quizzes/${quizId}/results`);
    } catch (error) {
      toast.error(error.message || "Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return (
      <div className="text-center mt-10">
        <p className="text-slate-600">Quiz not available.</p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isAnswered = selectedAnswers.hasOwnProperty(currentQuestion._id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <button onClick={() => navigate(-1)}>
        <ChevronLeft strokeWidth={2} />
        Back to document
      </button>
      <main className="flex-grow px-6 py-10">
        <div className="w-full max-w-2xl mx-auto space-y-8">
          {/* Question Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#EAF4FF] border border-[#4F9CF9]/20">
              <span className="w-2 h-2 rounded-full bg-[#4F9CF9] animate-pulse"></span>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#4F9CF9]">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1E293B] leading-snug">
              {currentQuestion.question}
            </h2>

            <p className="text-sm text-slate-500 italic">
              Select the most accurate answer below
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const selected = selectedAnswers[currentQuestion._id] === index;

              return (
                <label
                  key={index}
                  className={`group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer
                  ${
                    selected
                      ? "border-[#4F9CF9] bg-[#EAF4FF] shadow-sm"
                      : "border-slate-200 bg-white hover:border-[#4F9CF9]/40 hover:shadow-md"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all
                    ${
                      selected
                        ? "border-[#4F9CF9] bg-[#4F9CF9]"
                        : "border-slate-300"
                    }`}
                  >
                    {selected && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>

                  <input
                    type="radio"
                    className="hidden"
                    checked={selected}
                    onChange={() =>
                      handleOptionChange(currentQuestion._id, index)
                    }
                  />

                  <span
                    className={`text-sm font-medium transition-colors
                    ${
                      selected
                        ? "text-[#1E293B]"
                        : "text-slate-700 group-hover:text-[#4F9CF9]"
                    }`}
                  >
                    {option}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-lg border border-slate-300 text-slate-600
                         font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition disabled:opacity-30"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <button
              onClick={
                currentQuestionIndex === quiz.questions.length - 1
                  ? handleSubmitQuiz
                  : handleNextQuestion
              }
              disabled={!isAnswered || submitting}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#1E293B] text-white
                         font-bold text-xs uppercase tracking-widest hover:bg-[#0F172A]
                         hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
                         transition disabled:opacity-40"
            >
              {currentQuestionIndex === quiz.questions.length - 1
                ? "Submit Quiz"
                : "Next"}

              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <CheckCircle2 size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizTake;
