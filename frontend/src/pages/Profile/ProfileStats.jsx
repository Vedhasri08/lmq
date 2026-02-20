import { BookOpen, CheckCircle, Loader, Clock } from "lucide-react";

const ProfileStats = ({ stats }) => {
  const completionRate = stats.enrolled
    ? Math.round((stats.completed / stats.enrolled) * 100)
    : 0;

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    return `${h}h`;
  };

  const cards = [
    {
      icon: BookOpen,
      label: "Enrolled",
      value: stats.enrolled,
      subtextColor: "text-emerald-600",
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: stats.completed,
      subtext: `${completionRate}% completion rate`,
      subtextColor: "text-slate-400",
    },
    {
      icon: Loader,
      label: "In Progress",
      value: stats.inProgress,
      subtext: "Estimated 22h left",
      subtextColor: "text-slate-400",
    },
    {
      icon: Clock,
      label: "Total Time",
      value: formatTime(stats.totalMinutes),
      subtext: "Top 5% of students",
      subtextColor: "text-slate-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;

        return (
          <div
            key={i}
            className="
              bg-white
              rounded-2xl
              border border-slate-200
              shadow-sm
              p-4
              hover:shadow-md
              transition
            "
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-slate-600" />
              <p className="text-xs font-medium text-slate-500">{card.label}</p>
            </div>

            {/* Value */}
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>

            {/* Subtext */}
            <p className={`text-[11px] mt-1 ${card.subtextColor}`}>
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default ProfileStats;
