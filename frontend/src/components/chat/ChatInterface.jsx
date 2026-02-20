import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Sparkles,
  FileText,
  BookOpen,
  Clock,
  Paperclip,
  Mic,
} from "lucide-react";
import { useParams } from "react-router-dom";

import aiService from "../../services/aiServices";
import { useAuth } from "../../context/AuthContent";
import Spinner from "../common/Spinner";
import MarkdownRenderer from "../../components/common/MarkdownRender";

const ChatInterface = () => {
  const { id } = useParams();
  const documentId = id;

  const { user } = useAuth();

  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!documentId) return;

    const fetchChatHistory = async () => {
      try {
        setInitialLoading(true);
        const response = await aiService.getChatHistory(documentId);
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchChatHistory();
  }, [documentId]);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await aiService.chat(documentId, userMessage.content);

      const assistantMessage = {
        role: "assistant",
        content: response.data.answer,
        timestamp: new Date(),
        relevantChunks: response.data.relevantChunks,
      };

      setHistory((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };

      setHistory((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === "user";

    return (
      <div
        key={index}
        className={`flex items-start gap-3 my-4 ${isUser ? "justify-end" : ""}`}
      >
        <div
          className={`max-w-lg p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
            isUser
              ? "bg-[#1E293B] text-white rounded-br-md"
              : "bg-white border border-slate-200/60 text-slate-800 rounded-bl-md"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div className="prose prose-slate max-w-none text-sm">
              <MarkdownRenderer content={msg.content} />
            </div>
          )}
        </div>
      </div>
    );
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col h-[70vh] bg-white rounded-2xl items-center justify-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-[#EAF4FF] flex items-center justify-center">
          <MessageSquare className="w-7 h-7 text-[#4F9CF9]" />
        </div>
        <p className="text-sm text-slate-500 mt-3 font-medium">
          Loading chat history...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[70vh] relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 p-6 pb-44 overflow-y-auto bg-gradient-to-br from-slate-50/50 via-white to-slate-50/50">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-[#EAF4FF] flex items-center justify-center mb-6 shadow-sm">
              <Sparkles className="w-7 h-7 text-[#4F9CF9]" strokeWidth={1.8} />
            </div>

            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Start a conversation
            </h3>

            <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-8">
              Ask complex questions about your document, generate summaries, or
              extract key insights with Scholar AI.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
              {[
                { icon: FileText, text: "Summarize key methodology" },
                { icon: MessageSquare, text: "Extract quantitative findings" },
                { icon: BookOpen, text: "Analyze theoretical framework" },
                { icon: Clock, text: "Validate primary citations" },
              ].map((item) => (
                <button
                  key={item.text}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-[#4F9CF9]/[0.06] text-sm font-medium text-slate-700 transition"
                >
                  <item.icon className="w-4 h-4 text-[#4F9CF9]" />
                  {item.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {history.map(renderMessage)}
            <div ref={messagesEndRef} />

            {loading && (
              <div className="flex items-center gap-3 my-4">
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200/60">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* INPUT BAR */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-slate-50/70 backdrop-blur-xl border-t border-slate-200/70">
        <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/70 rounded-2xl shadow-xl shadow-slate-200/40 px-6 py-4">
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask a question about this document..."
                className="flex-1 h-12 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                disabled={loading}
              />

              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="w-11 h-11 rounded-full bg-[#1E293B] hover:bg-[#0F172A] text-white flex items-center justify-center transition shadow-lg shadow-[#1E293B]/25"
              >
                <Send className="w-4.5 h-4.5" strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex items-center gap-5 mt-2 text-slate-500">
              <button type="button" className="hover:text-[#1E293B] transition">
                <Paperclip className="w-4.5 h-4.5" />
              </button>

              <button type="button" className="hover:text-[#1E293B] transition">
                <Mic className="w-4.5 h-4.5" />
              </button>

              <span className="text-[10px] px-3.5 py-1.5 rounded-full border border-[#4F9CF9]/40 text-[#4F9CF9] bg-[#EAF4FF] uppercase tracking-wide">
                Scholar Mode
              </span>
            </div>

            <div className="text-center mt-3">
              <span className="text-[10px] tracking-[0.25em] text-slate-400">
                ORGANIC INTELLIGENCE V4.0 • VERIFIED ACADEMIC OUTPUT
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
