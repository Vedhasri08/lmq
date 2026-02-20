import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Trash2, Notebook, BookOpen, Clock } from "lucide-react";
import moment from "moment";

const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null) return "N/A";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const DocumentCard = ({ document, onDelete }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/documents/${document._id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(document);
  };

  return (
    <tr
      onClick={handleNavigate}
      className="group cursor-pointer border-b border-slate-100 hover:bg-[#0F172A]/[0.04] transition-colors"
    >
      {/* NAME */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-[#EAF4FF] flex items-center justify-center text-[#4F9CF9] border border-[#4F9CF9]/10">
            <FileText className="w-5 h-5" strokeWidth={2} />
          </div>

          {/* Title + Type */}
          <div>
            <p className="text-sm font-bold text-slate-900 group-hover:text-[#4F9CF9] transition-colors">
              {document.title}
            </p>
            <p className="text-[11px] text-slate-400">PDF Document</p>
          </div>
        </div>
      </td>

      {/* DATE MODIFIED */}
      <td className="px-6 py-4 text-sm text-slate-500">
        {moment(document.updatedAt || document.createdAt).format(
          "MMM DD, YYYY",
        )}
      </td>

      {/* FLASHCARDS */}
      <td className="px-6 py-4 text-center">
        {document.flashcardCount !== undefined ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF4FF] text-[#4F9CF9] border border-[#4F9CF9]/20">
            {document.flashcardCount} Flashcards
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>

      {/* QUIZZES */}
      <td className="px-6 py-4 text-center">
        {document.quizCount !== undefined ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
            {document.quizCount} Quizzes
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>

      {/* SIZE */}
      <td className="px-6 py-4 text-right text-sm text-slate-500">
        {formatFileSize(document.fileSize)}
      </td>

      {/* DELETE ACTION */}
      <td className="px-4 py-4 text-right">
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 w-8 h-8 inline-flex items-center justify-center text-slate-400 hover:text-[#1E293B] hover:bg-slate-100 rounded-lg transition"
        >
          <Trash2 className="w-4 h-4" strokeWidth={2} />
        </button>
      </td>
    </tr>
  );
};

export default DocumentCard;
