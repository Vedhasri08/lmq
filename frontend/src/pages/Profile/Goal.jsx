import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const Goal = () => {
  const [goals, setGoals] = useState([
    { id: 1, text: "Complete React Course", completed: false },
    { id: 2, text: "Score 80% in next quiz", completed: false },
  ]);

  const [newGoal, setNewGoal] = useState("");

  const addGoal = () => {
    if (!newGoal.trim()) return;

    setGoals([{ id: Date.now(), text: newGoal, completed: false }, ...goals]);
    setNewGoal("");
  };

  const toggleGoal = (id) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal,
      ),
    );
  };

  const deleteGoal = (id) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  const completedCount = goals.filter((g) => g.completed).length;

  return (
    <div
      className="
        bg-white/90 backdrop-blur-sm
        rounded-2xl
        border border-slate-200/70
        shadow-[0_10px_30px_rgba(15,23,42,0.06)]
        p-5
        hover:shadow-[0_12px_35px_rgba(15,23,42,0.08)]
        transition
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-[#0F172A]">Active Goals</h3>
        <span className="text-[11px] font-medium bg-sky-50 text-[#0F172A] px-3 py-1 rounded-full">
          {" "}
          {completedCount}/{goals.length} completed
        </span>
      </div>

      {/* Add Goal */}
      <div className="flex items-center gap-2 mb-5">
        <input
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="Add a new goal"
          className="
            flex-1 text-xs px-3 py-2.5
            rounded-xl border border-slate-200
            focus:outline-none
            focus:ring-2 focus:ring-sky-100
            focus:border-sky-300
            transition
          "
          onKeyDown={(e) => e.key === "Enter" && addGoal()}
        />

        <button
          onClick={addGoal}
          className="
            w-8 h-8 rounded-xl
            bg-gradient-to-br from-[#0F172A] to-slate-800
            text-white
            flex items-center justify-center
            hover:scale-105 active:scale-95
            transition
          "
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Goals */}
      <div className="space-y-2.5">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="
              flex items-center justify-between
              bg-slate-50/80
              hover:bg-sky-50/70
              rounded-xl
              px-3.5 py-2.5
              group
              transition
            "
          >
            {/* Left (checkbox + text) */}
            <div
              onClick={() => toggleGoal(goal.id)}
              className="flex items-center gap-3 cursor-pointer"
            >
              {/* Checkbox */}
              <div
                className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all duration-200 ${
                  goal.completed
                    ? "bg-[#0F172A] border-[#0F172A] scale-105"
                    : "border-slate-300 group-hover:border-sky-400"
                }
  `}
              >
                {goal.completed && (
                  <svg
                    className="w-3 h-3 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>

              {/* Text */}
              <span
                className={`
                  text-xs font-medium
                  ${
                    goal.completed
                      ? "text-slate-400 line-through"
                      : "text-slate-700 group-hover:text-[#0F172A]"
                  }
                `}
              >
                {goal.text}
              </span>
            </div>

            {/* Delete (appears on hover) */}
            <button
              onClick={() => deleteGoal(goal.id)}
              className="
                opacity-0 group-hover:opacity-100
                text-slate-400 hover:text-red-500
                transition
              "
              title="Delete goal"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Goal;
