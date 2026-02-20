import React from "react";
import ReactMarkdown from "react-markdown";

const LessonPreview = ({ content }) => {
  return (
    <div className="bg-white">
      <article
        className="
          prose prose-slate
          max-w-3xl mx-auto
          py-12

          prose-h1:text-3xl
          prose-h1:font-bold
          prose-h1:mb-4

          prose-h2:text-2xl
          prose-h2:mt-10
          prose-h2:mb-2
          prose-h2:border-b
          prose-h2:pb-1

          prose-h3:text-lg
          prose-h3:mt-6

          prose-p:text-slate-700
          prose-p:leading-relaxed

          prose-li:marker:text-[#B59A5A]

          prose-strong:text-slate-900

          prose-blockquote:border-[#B59A5A]
          prose-blockquote:bg-[#B59A5A]/5
          prose-blockquote:px-4
          prose-blockquote:py-2
          prose-blockquote:rounded-lg
        "
      >
        <ReactMarkdown>{content || "*No content yet...*"}</ReactMarkdown>
      </article>
    </div>
  );
};

export default LessonPreview;
