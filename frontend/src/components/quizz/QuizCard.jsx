import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, BarChart2, Trash, Trophy, Calendar } from "lucide-react";
import moment from "moment";

const QuizCard = ({ quiz, onDelete }) => {
  const navigate = useNavigate();
  const questionCount = quiz?.questions?.length ?? 0;

  return (
    <div className="group relative bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#EAF4FF] border border-slate-200 rounded-full">
          <Trophy className="w-3.5 h-3.5 text-[#4F9CF9]" strokeWidth={2} />
          <span className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">
            Score: <span className="text-[#1E293B]">{quiz?.score ?? 0}</span>
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(quiz);
          }}
          className="text-slate-400 hover:text-red-500 transition-colors"
        >
          <Trash className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>

      {/* Title */}
      <h3
        className="text-sm font-semibold text-slate-900 truncate"
        title={quiz.title}
      >
        {quiz.title || `Quiz - ${moment(quiz.createdAt).format("MMM D, YYYY")}`}
      </h3>

      {/* Date */}
      <p className="text-[11px] text-slate-500 flex items-center gap-1">
        <Calendar className="w-3 h-3" strokeWidth={2} />
        {moment(quiz.createdAt).format("MMM D, YYYY")}
      </p>

      {/* Questions */}
      <span className="inline-block w-fit px-2 py-0.5 bg-slate-50 text-slate-600 text-[10px] font-medium rounded border border-slate-100">
        {questionCount} {questionCount === 1 ? "Question" : "Questions"}
      </span>

      {/* Action Button */}
      {quiz?.userAnswers?.length > 0 ? (
        <Link to={`/quizzes/${quiz._id}/results`}>
          <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs transition">
            <BarChart2 size={14} strokeWidth={2.5} />
            Results
          </button>
        </Link>
      ) : (
        <Link to={`/quizzes/${quiz._id}`}>
          <button className="w-full bg-[#1E293B] hover:bg-[#0F172A] text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-xs uppercase tracking-wide shadow-sm transition">
            <Play size={14} strokeWidth={2.5} />
            Start
          </button>
        </Link>
      )}
    </div>
  );
};

export default QuizCard;
