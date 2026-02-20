import React, { useState, useEffect } from "react";
import { Plus, Trash2, X, Box, ListOrdered } from "lucide-react";
import toast from "react-hot-toast";

import quizService from "../../services/quizService";
import aiService from "../../services/aiServices";

import Spinner from "../common/Spinner";
import QuizCard from "./QuizCard";

const QuizManager = ({ documentId }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const data = await quizService.getQuizzesForDocument(documentId);
      setQuizzes(data.data);
    } catch (error) {
      toast.error("Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) fetchQuizzes();
  }, [documentId]);

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await aiService.generateQuiz(documentId);
      toast.success("Quiz generated!");
      fetchQuizzes();
    } catch (err) {
      toast.error(err.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteRequest = (quiz) => {
    setSelectedQuiz(quiz);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedQuiz) return;

    setDeleting(true);
    try {
      await quizService.deleteQuiz(selectedQuiz._id);
      toast.success(`"${selectedQuiz.title || "Quiz"}" deleted.`);
      setQuizzes(quizzes.filter((q) => q._id !== selectedQuiz._id));
      setIsDeleteModalOpen(false);
      setSelectedQuiz(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete quiz.");
    } finally {
      setDeleting(false);
    }
  };

  const renderQuizContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      );
    }

    if (quizzes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-xl">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#4F9CF9]/10 blur-3xl rounded-full scale-150 opacity-50"></div>
            <div className="relative z-10 flex items-center justify-center w-28 h-28 rounded-full border border-slate-200 bg-white shadow-sm">
              <Box className="w-10 h-10 text-[#4F9CF9]" strokeWidth={1.5} />
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900">
            No Assessments Created
          </h2>

          <p className="text-slate-500 text-sm max-w-md text-center mt-2">
            Generate AI-powered quizzes to evaluate learning outcomes and track
            student performance.
          </p>

          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="mt-6 px-6 py-3 bg-[#1E293B] hover:bg-[#0F172A]
                       text-white text-sm font-semibold rounded-lg shadow-md transition flex items-center gap-2"
          >
            <Plus size={16} />
            Generate Quiz
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz._id} quiz={quiz} onDelete={handleDeleteRequest} />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8">
      {renderQuizContent()}

      {/* Generate Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl border border-slate-200">
            <div className="px-6 pt-6 pb-4 border-b border-slate-200">
              <div className="flex justify-between">
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">
                    Generate New Quiz
                  </h1>
                  <p className="text-sm text-slate-500">
                    Customize quiz parameters
                  </p>
                </div>

                <button
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <form onSubmit={handleGenerateQuiz} className="p-6 space-y-5">
              <div>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ListOrdered className="text-[#4F9CF9]" size={18} />
                    <span className="text-xs text-slate-400 uppercase tracking-wider">
                      Assessment Size
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-[#1E293B]">
                    {numQuestions} Questions
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="15"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="w-full accent-[#4F9CF9]"
                />
              </div>

              <div>
                <label className="text-sm text-slate-600">
                  Number of Questions
                </label>
                <input
                  type="number"
                  value={numQuestions}
                  onChange={(e) =>
                    setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-full mt-1 h-10 rounded-lg border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-[#4F9CF9]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2 bg-[#1E293B] hover:bg-[#0F172A]
                             text-white rounded-lg text-sm font-semibold"
                >
                  {generating ? "Generating..." : "Generate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200">
            <div className="p-6">
              <div className="flex justify-between mb-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  Confirm Delete
                </h2>

                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm text-slate-600">
                Are you sure you want to delete "{selectedQuiz?.title}"?
              </p>

              <p className="text-xs text-slate-500 mt-3 bg-slate-50 p-3 rounded-md border-l-2 border-[#4F9CF9]">
                This action cannot be undone.
              </p>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-lg text-sm font-semibold shadow-sm transition"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizManager;
