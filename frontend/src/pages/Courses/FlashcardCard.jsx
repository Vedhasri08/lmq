const FlashcardCard = ({ question, answer, difficulty, flipped, onClick }) => {
  const difficultyColors = {
    easy: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    hard: "bg-red-100 text-red-700",
  };

  return (
    <div className="w-full h-64 perspective cursor-pointer" onClick={onClick}>
      <div
        className={`relative w-full h-full transition-transform duration-500 preserve-3d ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        {/* FRONT */}
        <div className="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-sm p-6">
          {/* Difficulty Badge */}
          <div className="absolute top-3 right-3">
            <span
              className={`px-2 py-1 text-[10px] font-semibold rounded-full capitalize ${
                difficultyColors[difficulty] || "bg-slate-100 text-slate-600"
              }`}
            >
              {difficulty || "new"}
            </span>
          </div>

          <div className="h-full flex items-center justify-center">
            <p className="text-sm font-medium text-slate-800 text-center">
              {question}
            </p>
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#0F172A] text-white rounded-2xl shadow-md shadow-slate-900/30 p-6">
          {/* Difficulty Badge */}
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-white/10 backdrop-blur-sm capitalize">
              {difficulty || "new"}
            </span>
          </div>

          <div className="h-full flex items-center justify-center">
            <p className="text-sm font-medium text-center">{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardCard;
