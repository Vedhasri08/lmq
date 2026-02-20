import React from "react";
import { FileText, Plus } from "lucide-react";

const EmptyState = ({ onActionClick, title, description, buttonText }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white">
      {/* Icon */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-6">
        <FileText className="w-8 h-8 text-slate-400" strokeWidth={2} />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>

      {/* Description */}
      <p className="text-sm text-slate-500 mb-8 max-w-sm leading-relaxed">
        {description}
      </p>

      {/* Button */}
      {buttonText && onActionClick && (
        <button
          onClick={onActionClick}
          className="group inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
