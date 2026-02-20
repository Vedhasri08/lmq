import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Spinner from "../../components/common/Spinner";
import { useNavigate } from "react-router-dom";

const FlashcardList = () => {
  const [flashcardsByCourse, setFlashcardsByCourse] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlashcards = async () => {
      const { data, error } = await supabase.from("lessons").select(`
    id,
    title,
    section:sections (
      course:courses (
        id,
        title,
        slug
      )
    ),
    flashcards!flashcards_lesson_id_fkey (
      id,
      question,
      answer
    )
  `);
      console.log("LESSONS WITH FLASHCARDS", data);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      // 🔹 Group flashcards by course
      const grouped = {};

      data.forEach((lesson) => {
        const course = lesson.section?.course;
        if (!course || !lesson.flashcards || lesson.flashcards.length === 0)
          return;

        if (!grouped[course.id]) {
          grouped[course.id] = {
            id: course.id,
            title: course.title,
            slug: course.slug,
            flashcards: [],
          };
        }

        lesson.flashcards.forEach((fc) => {
          grouped[course.id].flashcards.push({
            id: fc.id,
            question: fc.question,
            answer: fc.answer,
            lessonTitle: lesson.title,
          });
        });
      });

      setFlashcardsByCourse(Object.values(grouped));
      setLoading(false);
    };

    fetchFlashcards();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Flashcards</h1>

      {flashcardsByCourse.length === 0 && (
        <p className="text-slate-500">No flashcards available</p>
      )}

      {flashcardsByCourse.map((course) => (
        <div key={course.id} className="mb-12">
          <h2
            className="text-xl font-semibold text-slate-900 mb-4 cursor-pointer hover:underline"
            onClick={() => navigate(`/courses/${course.slug}`)}
          >
            {course.title}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {course.flashcards.map((card) => (
              <div
                key={card.id}
                className="rounded-lg border bg-white p-4 hover:shadow-sm transition"
              >
                <p className="font-medium text-slate-900">Q: {card.question}</p>
                <p className="mt-2 text-slate-600 text-sm">A: {card.answer}</p>
                <p className="mt-2 text-xs text-slate-400">
                  Lesson: {card.lessonTitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlashcardList;
