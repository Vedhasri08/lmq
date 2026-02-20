import React, { useState, useEffect } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowLeft,
  Sparkles,
  X,
  Brain,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiServices";

import Spinner from "../common/Spinner";
import Flashcard from "./Flashcards";

const FlashcardManager = ({ documentId, lessonId }) => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);

  const fetchFlashcardSets = async () => {
    setLoading(true);

    try {
      let response;

      if (lessonId) {
        response = await flashcardService.getFlashcardsForLesson(lessonId);
      } else if (documentId) {
        response = await flashcardService.getFlashcardsForDocument(documentId);
      }

      setFlashcardSets(response.data);
    } catch (error) {
      toast.error("Failed to fetch flashcard sets.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId || lessonId) {
      fetchFlashcardSets();
    }
  }, [documentId, lessonId]);

  const handleGenerateFlashcards = async () => {
    setGenerating(true);

    try {
      await aiService.generateFlashcards({
        documentId,
        lessonId,
      });

      toast.success("Flashcards generated!");

      await fetchFlashcardSets();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleNextCard = () => {
    if (selectedSet) {
      handleReview(currentCardIndex);
      setCurrentCardIndex(
        (prevIndex) => (prevIndex + 1) % selectedSet.cards.length,
      );
    }
  };

  const handlePrevCard = () => {
    if (selectedSet) {
      handleReview(currentCardIndex);
      setCurrentCardIndex(
        (prevIndex) =>
          (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length,
      );
    }
  };

  const handleReview = async (index) => {
    const currentCard = selectedSet?.cards[currentCardIndex];
    if (!currentCard) return;

    try {
      await flashcardService.reviewFlashcard(currentCard._id, index);
      toast.success("Flashcard reviewed!");
    } catch (error) {
      toast.error("Failed to review flashcard.");
    }
  };

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);

      const updatedSets = flashcardSets.map((set) => {
        if (set._id === selectedSet._id) {
          const updatedCards = set.cards.map((card) =>
            card._id === cardId
              ? { ...card, isStarred: !card.isStarred }
              : card,
          );

          return { ...set, cards: updatedCards };
        }

        return set;
      });

      setFlashcardSets(updatedSets);
      setSelectedSet(updatedSets.find((set) => set._id === selectedSet._id));

      toast.success("Flashcard starred status updated!");
    } catch (error) {
      toast.error("Failed to update star status.");
    }
  };

  const handleDeleteRequest = (e, set) => {
    e.stopPropagation();
    setSetToDelete(set);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!setToDelete) return;

    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(setToDelete._id);
      toast.success("Flashcard set deleted successfully!");
      setIsDeleteModalOpen(false);
      setSetToDelete(null);
      fetchFlashcardSets();
    } catch (error) {
      toast.error(error.message || "Failed to delete flashcard set.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSelectSet = (set) => {
    setSelectedSet(set);
    setCurrentCardIndex(0);
  };

  const renderFlashcardViewer = () => {
    const currentCard = selectedSet.cards[currentCardIndex];

    return (
      <div className="space-y-8">
        {/* Back Button */}
        <button
          onClick={() => setSelectedSet(null)}
          className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors duration-200"
        >
          <ArrowLeft
            className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
            strokeWidth={2}
          />
          Back to Sets
        </button>

        {/* Flashcard Display */}
        <div className="flex flex-col items-center space-y-8">
          <div className="w-full max-w-2xl">
            <Flashcard
              flashcard={currentCard}
              onToggleStar={handleToggleStar}
            />
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={handlePrevCard}
              disabled={selectedSet.cards.length <= 1}
              className="group flex items-center gap-2 px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-200"
            >
              <ChevronLeft
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200"
                strokeWidth={2.5}
              />
              Previous
            </button>

            <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-sm font-semibold text-slate-700">
                {currentCardIndex + 1}{" "}
                <span className="text-slate-400 font-normal">/</span>{" "}
                {selectedSet.cards.length}
              </span>
            </div>

            <button
              onClick={handleNextCard}
              disabled={selectedSet.cards.length <= 1}
              className="group flex items-center gap-2 px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-100"
            >
              Next
              <ChevronRight
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200"
                strokeWidth={2.5}
              />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSetList = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      );
    }

    if (flashcardSets.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <Brain className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 text-sm mb-6">
            No flashcard sets available
          </p>
          <button
            onClick={handleGenerateFlashcards}
            disabled={generating}
            className="flex items-center gap-2 px-5 h-10 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Generate New Set
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Your Flashcard Sets
            </h3>
            <p className="text-sm text-slate-500">
              {flashcardSets.length} sets available
            </p>
          </div>

          <button
            onClick={handleGenerateFlashcards}
            disabled={generating}
            className={` group relative flex items-center gap-2 px-5 h-11 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-500  text-white  shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
  `}
          >
            {generating ? (
              <>Generating…</>
            ) : (
              <>
                <Plus className="w-4 h-4 transition-transform " />
                Generate New Set
              </>
            )}
          </button>
        </div>

        {/* Cards */}
        <div className="flex flex-wrap gap-4">
          {flashcardSets.map((set) => (
            <div
              key={set._id}
              onClick={() => handleSelectSet(set)}
              className="relative w-[260px] bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 transition"
            >
              {/* Delete */}
              <button
                onClick={(e) => handleDeleteRequest(e, set)}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Icon */}
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-50 mb-3">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>

              {/* Text */}
              <h4 className="text-sm font-semibold text-slate-900">
                Flashcard Set
              </h4>

              <p className="text-xs text-slate-500 mt-1 uppercase">
                Created {moment(set.createdAt).format("MMM D, YYYY")}
              </p>

              {/* Cards Count */}
              <div className="mt-4">
                <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md">
                  {set.cards.length} cards
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Main content */}
      <div className="bg-white/80 backdrop-blur-xl border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-8">
        {selectedSet ? renderFlashcardViewer() : renderSetList()}
      </div>

      {/* Delete confirmation modal  */}
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
                Are you sure you want to delete "{setToDelete?.title}"?
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
    </>
  );
};

export default FlashcardManager;
