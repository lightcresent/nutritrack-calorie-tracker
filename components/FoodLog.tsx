"use client";

import { LogEntry, MealCategory } from "@/types";

interface Props {
  entries: LogEntry[];
  onRemove: (id: string) => void;
  loading: boolean;
}

const MEAL_ORDER: MealCategory[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

const MEAL_CONFIG: Record<MealCategory, { icon: string; label: string; accent: string; badge: string }> = {
  Breakfast: {
    icon: "☀️",
    label: "Breakfast",
    accent: "text-amber-700",
    badge: "bg-amber-50 border-amber-100 text-amber-700",
  },
  Lunch: {
    icon: "🌤",
    label: "Lunch",
    accent: "text-sky-700",
    badge: "bg-sky-50 border-sky-100 text-sky-700",
  },
  Dinner: {
    icon: "🌙",
    label: "Dinner",
    accent: "text-indigo-700",
    badge: "bg-indigo-50 border-indigo-100 text-indigo-700",
  },
  Snack: {
    icon: "🍎",
    label: "Snack",
    accent: "text-emerald-700",
    badge: "bg-emerald-50 border-emerald-100 text-emerald-700",
  },
};

export default function FoodLog({ entries, onRemove, loading }: Props) {
  if (loading) {
    return (
      <div>
        <SectionHeader />
        <SkeletonLog />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div>
        <SectionHeader />
        <EmptyState />
      </div>
    );
  }

  const grouped = MEAL_ORDER.reduce((acc, meal) => {
    const items = entries.filter((e) => (e.meal ?? "Snack") === meal);
    if (items.length > 0) acc[meal] = items;
    return acc;
  }, {} as Partial<Record<MealCategory, LogEntry[]>>);

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div>
      <SectionHeader />
      <div className="space-y-3">
        {MEAL_ORDER.map((meal) => {
          const group = grouped[meal];
          if (!group) return null;
          const cfg = MEAL_CONFIG[meal];
          const mealCals = group.reduce((s, e) => s + e.calories, 0);

          return (
            <div key={meal} className="bg-white rounded-[1.25rem] border border-gray-100 overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
              {/* Meal header */}
              <div className="px-5 py-3 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{cfg.icon}</span>
                  <span className={`font-semibold text-sm ${cfg.accent}`}>{cfg.label}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                    {group.length} item{group.length > 1 ? "s" : ""}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-500 tabular-nums">
                  {Math.round(mealCals)} cal
                </span>
              </div>

              {/* Entries */}
              <div className="divide-y divide-gray-50">
                {group.map((entry) => (
                  <EntryRow key={entry.id} entry={entry} onRemove={onRemove} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Daily total bar */}
        <div className="bg-gray-900 text-white rounded-[1.25rem] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <span className="font-semibold text-sm text-gray-400">Daily Total</span>
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <span className="text-blue-300 font-medium tabular-nums">P {Math.round(totals.protein)}g</span>
            <span className="text-amber-300 font-medium tabular-nums">C {Math.round(totals.carbs)}g</span>
            <span className="text-orange-300 font-medium tabular-nums">F {Math.round(totals.fat)}g</span>
            <span className="font-display text-xl text-white tabular-nums">{Math.round(totals.calories)} cal</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader() {
  return (
    <h2 className="text-base font-semibold text-gray-700 mb-3">Today&apos;s Log</h2>
  );
}

function EntryRow({ entry, onRemove }: { entry: LogEntry; onRemove: (id: string) => void }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/70 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 text-sm truncate">{entry.foodName}</p>
        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
          <span>{entry.quantity} × {entry.servingSize} {entry.servingUnit}</span>
          <span className="text-gray-200">·</span>
          <span className="text-blue-500 font-medium">P{Math.round(entry.protein)}g</span>
          <span className="text-gray-200">·</span>
          <span className="text-amber-500 font-medium">C{Math.round(entry.carbs)}g</span>
          <span className="text-gray-200">·</span>
          <span className="text-orange-500 font-medium">F{Math.round(entry.fat)}g</span>
        </p>
      </div>
      <span className="font-bold text-gray-900 text-sm tabular-nums whitespace-nowrap">
        {Math.round(entry.calories)} cal
      </span>
      {/* Always-visible on mobile (reduced opacity), hover-visible on desktop */}
      <button
        onClick={() => onRemove(entry.id)}
        className="w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all flex-shrink-0 text-lg leading-none opacity-40 hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
        aria-label={`Remove ${entry.foodName}`}
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        ×
      </button>
    </div>
  );
}

function SkeletonLog() {
  return (
    <div className="bg-white rounded-[1.25rem] border border-gray-100 overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-3">
        <div className="skeleton w-16 h-3" />
        <div className="skeleton w-10 h-3" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 last:border-0">
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-1/2" />
            <div className="skeleton h-2 w-1/3" />
          </div>
          <div className="skeleton h-3 w-14" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-[1.25rem] border border-gray-100 p-14 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">🍽️</span>
      </div>
      <p className="font-display text-xl text-gray-800 mb-2">Nothing logged yet</p>
      <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
        Use Quick Add, Describe, or Photo above to start tracking today&apos;s meals.
      </p>
    </div>
  );
}
