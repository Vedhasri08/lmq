import { useState } from "react";
import { Star, RotateCcw } from "lucide-react";

const Flashcard = ({ flashcard, onToggleStar }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="relative w-full h-72" style={{ perspective: "1000px" }}>
      <div
        className="relative w-full h-full cursor-pointer transition-transform duration-500 transform-gpu"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
        onClick={handleFlip}
      >
        {/* ================= FRONT (QUESTION) ================= */}
        <div
          className="absolute inset-0 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-lg p-6 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {/* Top Row */}
          <div className="flex items-center justify-between">
            <span className="bg-slate-100 text-[10px] font-semibold text-slate-600 rounded-full px-3 py-1 uppercase">
              {flashcard?.difficulty}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(flashcard._id);
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                flashcard.isStarred
                  ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/30"
                  : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-amber-500"
              }`}
            >
              <Star
                strokeWidth={2}
                fill={flashcard.isStarred ? "currentColor" : "none"}
              />
            </button>
          </div>

          {/* Question */}
          <div className="flex-1 flex items-center justify-center px-2 text-center">
            <p className="text-base font-bold text-slate-800 leading-relaxed">
              {flashcard.question}
            </p>
          </div>

          {/* Flip Hint */}
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <RotateCcw className="w-4 h-4" strokeWidth={2} />
            <span>Click to know the answer</span>
          </div>
        </div>

        {/* ================= BACK (ANSWER) ================= */}
        <div
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Star Button */}
          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(flashcard._id);
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                flashcard.isStarred
                  ? "bg-white/30 text-white border border-white/40"
                  : "bg-white/20 text-white/70 hover:bg-white/30 hover:text-white border border-white/20"
              }`}
            >
              <Star
                strokeWidth={2}
                fill={flashcard.isStarred ? "currentColor" : "none"}
              />
            </button>
          </div>

          {/* Answer */}
          <div className="flex-1 flex items-center justify-center px-2 text-center">
            <p className="text-base font-bold leading-relaxed text-white/90">
              {flashcard.answer}
            </p>
          </div>

          {/* Flip Hint */}
          <div className="flex items-center justify-center gap-2 text-sm text-white/70">
            <RotateCcw className="w-4 h-4" strokeWidth={2} />
            <span>Click to see question</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
