const Improvement = ({ avgScore, improvement }) => {
  const hasData = avgScore > 0;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <MetricCard title="Average Quiz Score">
        {hasData ? (
          <p className="text-2xl font-bold text-slate-900">{avgScore}%</p>
        ) : (
          <p className="text-sm text-slate-400 italic">
            No quizzes attempted yet
          </p>
        )}
      </MetricCard>

      <MetricCard title="Improvement" accent>
        {hasData ? (
          <p
            className={`text-2xl font-bold ${
              improvement >= 0 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {improvement >= 0 ? "+" : ""}
            {improvement}%
          </p>
        ) : (
          <p className="text-sm text-slate-400 italic">
            Complete quizzes to track growth
          </p>
        )}
      </MetricCard>
    </div>
  );
};

const MetricCard = ({ title, children, accent }) => (
  <div
    className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm
    ${accent ? "border-l-4 border-l-[#B59A5A]" : ""}
  `}
  >
    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
      {title}
    </p>

    {children}
  </div>
);

export default Improvement;
