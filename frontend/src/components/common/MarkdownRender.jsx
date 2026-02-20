import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

const MarkdownRenderer = ({ content }) => {
  // 🔒 GUARANTEE string input
  const safeContent =
    typeof content === "string"
      ? content
      : content
        ? JSON.stringify(content, null, 2)
        : "";

  return (
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />
          ),
          h2: (props) => (
            <h2 className="text-xl font-semibold mt-4 mb-2" {...props} />
          ),
          h3: (props) => (
            <h3 className="text-lg font-semibold mt-3 mb-1" {...props} />
          ),
          h4: (props) => (
            <h4 className="text-base font-semibold mt-2 mb-1" {...props} />
          ),
          p: (props) => (
            <p className="text-sm leading-relaxed mb-2" {...props} />
          ),
          a: (props) => (
            <a
              className="text-indigo-600 underline hover:text-indigo-700"
              {...props}
            />
          ),
          ul: (props) => <ul className="list-disc pl-6 mb-2" {...props} />,
          ol: (props) => <ol className="list-decimal pl-6 mb-2" {...props} />,
          li: (props) => <li className="mb-1" {...props} />,
          blockquote: (props) => (
            <blockquote
              className="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-3"
              {...props}
            />
          ),
          code: ({ inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");

            return !inline && match ? (
              <SyntaxHighlighter
                style={dracula}
                language={match[1]}
                PreTag="div"
                className="rounded-lg my-3 text-sm"
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code
                className="bg-slate-100 px-1 py-0.5 rounded text-sm"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
