import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import FlashcardCard from "./FlashcardCard";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";

const LessonFlashcards = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState("all");
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewedCards, setReviewedCards] = useState(new Set());
  const [flippedCards, setFlippedCards] = useState(new Set());

  const reviewCard = async (cardId, difficulty) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    await fetch("http://localhost:8000/api/flashcards/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ cardId, difficulty }),
    });
  };

  const markReviewed = (cardId) => {
    setReviewedCards((prev) => new Set(prev).add(cardId));
  };

  const handleCardClick = (cardId) => {
    // Flip toggle
    setFlippedCards((prev) => {
      const updated = new Set(prev);
      if (updated.has(cardId)) {
        updated.delete(cardId);
      } else {
        updated.add(cardId);
      }
      return updated;
    });

    // Review ONLY once
    if (!reviewedCards.has(cardId)) {
      reviewCard(cardId, "medium"); // difficulty optional
      markReviewed(cardId);
    }
  };

  const reviewedCount = reviewedCards.size;
  const totalCards = flashcards.length;

  const progressPercent =
    totalCards === 0 ? 0 : (reviewedCount / totalCards) * 100;

  useEffect(() => {
    if (!lessonId) return;

    const fetchFlashcards = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      const res = await fetch(
        `http://localhost:8000/api/flashcards/lesson/${lessonId}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      const json = await res.json();
      const sets = json.data || [];
      const cards = sets.flatMap((set) => set.cards || []);

      setFlashcards(cards);
      setLoading(false);
    };

    fetchFlashcards();
  }, [lessonId]);

  const sortedFlashcards = [...flashcards].sort((a, b) => {
    if (sortBy === "all") return 0;

    const order = { easy: 1, medium: 2, hard: 3 };

    if (sortBy === "difficulty") {
      return order[a.difficulty] - order[b.difficulty];
    }

    // Specific filters
    if (sortBy === "easy") return a.difficulty === "easy" ? -1 : 1;
    if (sortBy === "medium") return a.difficulty === "medium" ? -1 : 1;
    if (sortBy === "hard") return a.difficulty === "hard" ? -1 : 1;

    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f7]">
        <p className="text-slate-500 text-sm">Loading flashcards...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f7] text-slate-800">
      {/* ================= HEADER ================= */}

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center h-16">
          {/* Left */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-[#0F172A] transition-colors text-sm font-medium"
          >
            <ArrowLeft strokeWidth={1} />
            Back to Lesson
          </button>
        </div>

        {/* ================= PROGRESS ================= */}
        <div className="mb-14 max-w-2xl mx-auto">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Cards Mastered
              </p>
              <p className="text-xs text-slate-500">
                Stay consistent. Mastery takes repetition.
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-bold">{reviewedCount}</span>
              <span className="text-slate-400 font-medium">
                {" "}
                / {totalCards}
              </span>
            </div>
          </div>

          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0F172A] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ================= FILTER BAR ================= */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 border-b border-slate-200 pb-4">
          <nav className="flex items-center gap-2">
            {[
              { key: "all", label: "All Cards" },
              { key: "easy", label: "Easy" },
              { key: "medium", label: "Medium" },
              { key: "hard", label: "Hard" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSortBy(tab.key)}
                className={`
        px-4 py-2
        text-sm font-medium
        rounded-lg
        transition
        ${
          sortBy === tab.key
            ? "bg-[#0F172A] text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100"
        }
      `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedFlashcards.map((card) => (
            <div
              key={card._id}
              className="transition-transform duration-200 hover:scale-[1.02]"
            >
              <FlashcardCard
                question={card.question}
                answer={card.answer}
                difficulty={card.difficulty}
                flipped={flippedCards.has(card._id)}
                onClick={() => handleCardClick(card._id)}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LessonFlashcards;
