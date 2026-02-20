import { Clock, CheckCircle2, Pencil } from "lucide-react";

const STATUS_CONFIG = {
  published: {
    label: "Published",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  },
  scheduled: {
    label: "Scheduled",
    icon: Clock,
    className: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  },
  draft: {
    label: "Draft",
    icon: Pencil,
    className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  },
};

export default function StatusBadge({ status }) {
  if (!status || !STATUS_CONFIG[status]) return null;

  const { label, icon: Icon, className } = STATUS_CONFIG[status];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1
        text-xs font-medium
        rounded-full
        backdrop-blur
        transition-all duration-200
        hover:scale-[1.03]
        ${className}
      `}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
