import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import FlashcardCard from "./FlashcardCard";

const CourseFlashcards = () => {
  const { lessonId } = useParams();
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      console.log("FLASHCARDS RESPONSE:", json);

      setFlashcards(json.data || []);
      setLoading(false);
    };

    fetchFlashcards();
  }, [lessonId]);

  if (loading) return <p>Loading flashcards...</p>;

  if (flashcards.length === 0) {
    return <p>No flashcards for this lesson yet.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Flashcards</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {flashcards.map((card, idx) => (
          <FlashcardCard
            key={idx}
            question={card.question}
            answer={card.answer}
          />
        ))}
      </div>
    </div>
  );
};

export default CourseFlashcards;
