import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import { ArrowLeft, ExternalLink } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Tabs from "../../components/common/Tabs";
import FlashcardManager from "../../components/flashcards/FlashcardManager";
import QuizManager from "../../components/quizz/QuizManager";
import ChatInterface from "../../components/chat/ChatInterface";
const DocumentDetailPage = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Content");

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data);
      } catch (error) {
        toast.error("Failed to fetch document details.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span>
          <Spinner />
        </span>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center py-20">
        <span>Document not found</span>
      </div>
    );
  }
  const getPdfUrl = () => {
    if (!document?.data?.filePath) return null;

    const filePath = document.data.filePath;

    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }

    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

    return `${baseUrl}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (!document || !document.data || !document.data.filePath) {
      return <div className="">PDF not available.</div>;
    }

    const pdfUrl = getPdfUrl();

    return (
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-300">
          <span className="text-sm font-medium text-gray-700">doc viewer</span>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {" "}
            <ExternalLink size={16} />
          </a>
        </div>
        <div className="bg-gray-100 p-1">
          <iframe
            src={pdfUrl}
            className="w-full h-[70vh] bg-white rounded border border-gray-300"
            title="PDF viewer"
            frameBorder="0"
            style={{ colorScheme: "light" }}
          />
        </div>
      </div>
    );
  };

  const renderChat = () => {
    return <ChatInterface />;
  };

  const renderFlashcardsTab = () => {
    if (!document?.data) return null;

    return (
      <FlashcardManager
        documentId={document.data._id}
        documentStatus={document.data.status}
      />
    );
  };

  const renderQuizzesTab = () => {
    return <QuizManager documentId={document.data._id} />;
  };

  const tabs = [
    { name: "Content", label: "Content", content: renderContent() },
    { name: "Chat", label: "Chat", content: renderChat() },
    { name: "Flashcards", label: "Flashcards", content: renderFlashcardsTab() },
    { name: "Quizzes", label: "Quizzes", content: renderQuizzesTab() },
  ];

  if (loading) {
    return <Spinner />;
  }

  if (!document) {
    return <div className="text-center p-8">Document not found.</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          to="/documents"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Documents
        </Link>
      </div>
      <PageHeader title={document.data.title} />

      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default DocumentDetailPage;
