"use client";

import { MacroTotals } from "@/types";

interface Props {
  totals: MacroTotals;
  goal: number;
}

const PROTEIN_GOAL = 125;
const CARBS_GOAL = 250;
const FAT_GOAL = 55;

export default function CalorieSummary({ totals, goal }: Props) {
  const calPercent = Math.min((totals.calories / goal) * 100, 100);
  const remaining = goal - totals.calories;
  const overGoal = remaining < 0;

  // Calories from each macro (for composition bar)
  const calFromProtein = totals.protein * 4;
  const calFromCarbs = totals.carbs * 4;
  const calFromFat = totals.fat * 9;
  const totalMacroCal = calFromProtein + calFromCarbs + calFromFat || 1;

  const pProtein = (calFromProtein / totalMacroCal) * 100;
  const pCarbs = (calFromCarbs / totalMacroCal) * 100;
  const pFat = (calFromFat / totalMacroCal) * 100;

  const barColor = overGoal
    ? "bg-red-500"
    : calPercent > 85
    ? "bg-amber-400"
    : "bg-emerald-500";

  return (
    <div
      className="bg-white rounded-[1.25rem] border border-gray-100 p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Hero calorie row */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Calories Today
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-6xl text-gray-900 leading-none tabular-nums">
              {Math.round(totals.calories)}
            </span>
            <span className="text-gray-300 text-xl font-medium">/ {goal}</span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            {overGoal ? "Over Goal" : "Remaining"}
          </p>
          <span
            className={`font-display text-4xl leading-none tabular-nums ${
              overGoal ? "text-red-500" : "text-emerald-600"
            }`}
          >
            {Math.abs(Math.round(remaining))}
          </span>
          <p className="text-xs text-gray-400 mt-1.5">
            {overGoal ? "cal over" : "cal left"}
          </p>
        </div>
      </div>

      {/* Calorie progress bar */}
      <div className="relative h-2 bg-gray-100 rounded-full mb-2 overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${calPercent}%` }}
        />
      </div>

      {/* Macro composition bar — shows protein/carbs/fat breakdown of consumed calories */}
      {totals.calories > 0 && (
        <div className="flex h-1 rounded-full overflow-hidden mb-5 gap-px">
          <div
            className="bg-blue-400 transition-all duration-700"
            style={{ width: `${pProtein}%` }}
            title={`Protein: ${Math.round(pProtein)}%`}
          />
          <div
            className="bg-amber-400 transition-all duration-700"
            style={{ width: `${pCarbs}%` }}
            title={`Carbs: ${Math.round(pCarbs)}%`}
          />
          <div
            className="bg-orange-400 transition-all duration-700"
            style={{ width: `${pFat}%` }}
            title={`Fat: ${Math.round(pFat)}%`}
          />
        </div>
      )}

      {totals.calories === 0 && <div className="mb-5" />}

      {/* Macro progress bars */}
      <div className="grid grid-cols-3 gap-4">
        <MacroBar
          label="Protein"
          value={totals.protein}
          goal={PROTEIN_GOAL}
          barClass="bg-blue-500"
          trackClass="bg-blue-50"
          textClass="text-blue-600"
        />
        <MacroBar
          label="Carbs"
          value={totals.carbs}
          goal={CARBS_GOAL}
          barClass="bg-amber-400"
          trackClass="bg-amber-50"
          textClass="text-amber-600"
        />
        <MacroBar
          label="Fat"
          value={totals.fat}
          goal={FAT_GOAL}
          barClass="bg-orange-400"
          trackClass="bg-orange-50"
          textClass="text-orange-600"
        />
      </div>
    </div>
  );
}

function MacroBar({
  label,
  value,
  goal,
  barClass,
  trackClass,
  textClass,
}: {
  label: string;
  value: number;
  goal: number;
  barClass: string;
  trackClass: string;
  textClass: string;
}) {
  const pct = Math.min(Math.round((value / goal) * 100), 100);
  const rounded = Math.round(value);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-500">{label}</span>
        <span className={`text-sm font-bold tabular-nums ${textClass}`}>{rounded}g</span>
      </div>
      <div className={`h-1.5 ${trackClass} rounded-full overflow-hidden`}>
        <div
          className={`h-full ${barClass} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-gray-400">of {goal}g</p>
        <p className={`text-xs font-semibold ${pct >= 100 ? "text-amber-500" : "text-gray-400"}`}>
          {pct}%
        </p>
      </div>
    </div>
  );
}
