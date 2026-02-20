import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import quizService from "../../services/quizService";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  BookOpen,
} from "lucide-react";

const QuizResult = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await quizService.getQuizResults(quizId);
        setResults(data);
      } catch (error) {
        toast.error("Failed to fetch quiz results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (!results?.data) {
    return (
      <p className="text-center mt-10 text-slate-600">Quiz results not found</p>
    );
  }

  const {
    data: { quiz, results: detailedResults },
  } = results;

  const score = quiz.score;
  const totalQuestions = detailedResults.length;
  const correctAnswers = detailedResults.filter((r) => r.isCorrect).length;
  const incorrectAnswers = totalQuestions - correctAnswers;

  const getPerformanceLabel = () => {
    if (score >= 80) return "Excellent Performance";
    if (score >= 60) return "Average Performance";
    return "Needs Improvement";
  };

  const AnswerBox = ({ label, value, correct, highlight }) => (
    <div
      className={`p-2.5 rounded-lg border text-xs ${
        correct
          ? "bg-green-50/60 border-green-200"
          : "bg-red-50/60 border-red-200"
      }`}
    >
      <p className="text-[10px] font-bold uppercase mb-1 text-slate-500">
        {label}
      </p>

      <p
        className={`text-xs ${
          highlight ? "text-green-600 font-semibold" : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* HERO CARD */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Circular Score */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  strokeWidth="8"
                  className="text-slate-200"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  strokeWidth="8"
                  strokeDasharray="339.3"
                  strokeDashoffset={`${339.3 - (score / 100) * 339.3}`}
                  className="text-[#4F9CF9]"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold">{score}%</span>
                <span className="text-[10px] uppercase text-slate-400 font-semibold">
                  Score
                </span>
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  score >= 80
                    ? "bg-green-50 text-green-700 border-green-100"
                    : score >= 60
                      ? "bg-blue-50 text-blue-700 border-blue-100"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {score >= 80 ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <XCircle size={14} />
                )}
                {getPerformanceLabel()}
              </div>

              <h2 className="text-xl font-bold text-[#1E293B]">
                {getPerformanceLabel()}
              </h2>

              <p className="text-sm text-slate-500 max-w-md">
                You scored {score}% on this assessment. Review detailed
                explanations below to strengthen your understanding.
              </p>

              <div className="flex gap-3 flex-wrap justify-center md:justify-start">
                <button
                  onClick={() => navigate(-2)}
                  className="px-3.5 py-1.5 bg-[#EAF4FF] text-[#1E293B]
                             text-xs font-semibold rounded-md hover:bg-[#dcecff]
                             transition flex items-center gap-1.5"
                >
                  <BookOpen size={14} />
                  Review Material
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <StatCard
            icon={<Target size={16} />}
            label="Total Questions"
            value={totalQuestions}
          />
          <StatCard
            icon={<CheckCircle2 size={16} />}
            label="Correct"
            value={correctAnswers}
            success
          />
          <StatCard
            icon={<XCircle size={16} />}
            label="Incorrect"
            value={incorrectAnswers}
            danger
          />
        </div>

        {/* FEEDBACK */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-[#4F9CF9]" />
            Question Feedback
          </h3>

          <div className="space-y-4">
            {detailedResults.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start gap-2">
                  {item.isCorrect ? (
                    <CheckCircle2 size={16} className="text-green-600 mt-0.5" />
                  ) : (
                    <XCircle size={16} className="text-red-500 mt-0.5" />
                  )}

                  <p className="text-sm font-semibold">
                    Q{index + 1}. {item.question}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-2 text-xs">
                  <AnswerBox
                    label="Your Answer"
                    value={item.selectedAnswer}
                    correct={item.isCorrect}
                    highlight={item.isCorrect}
                  />

                  {!item.isCorrect && (
                    <AnswerBox
                      label="Correct Answer"
                      value={item.correctAnswer}
                      correct
                    />
                  )}
                </div>

                {item.explanation && (
                  <div className="bg-slate-50 rounded-xl p-3 border-l-2 border-[#4F9CF9]">
                    <p className="text-[10px] font-bold uppercase text-[#4F9CF9]">
                      Explanation
                    </p>
                    <p className="text-xs text-slate-600 italic">
                      {item.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={() => navigate(-2)}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={14} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

/* STAT CARD */
const StatCard = ({ icon, label, value, success, danger }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
    <div
      className={`p-2.5 rounded-lg ${
        success
          ? "bg-green-50 text-green-600"
          : danger
            ? "bg-red-50 text-red-500"
            : "bg-[#EAF4FF] text-[#4F9CF9]"
      }`}
    >
      {icon}
    </div>

    <div>
      <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
        {label}
      </p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

export default QuizResult;
