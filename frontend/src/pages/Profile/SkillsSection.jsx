const SkillsSection = ({ courses }) => {
  const skills = [...new Set(courses.flatMap((course) => course.skills || []))];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-900 mb-4">
        Skills Learned
      </h3>

      {/* Skills */}
      {skills.length ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-2 text-xs font-semibold text-[#0F172A] bg-slate-100 rounded-md hover:bg-slate-200 transition
              "
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">
          Skills will appear as you complete courses
        </p>
      )}
    </div>
  );
};

export default SkillsSection;
