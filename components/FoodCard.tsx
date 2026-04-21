"use client";

import { useState } from "react";
import { Food } from "@/types";

interface Props {
  food: Food;
  onAdd: (food: Food) => void;
}

const CATEGORY_ACCENT: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  Protein: {
    border: "border-l-red-400",
    bg: "bg-red-50",
    text: "text-red-600",
    badge: "bg-red-50 text-red-600 border-red-100",
  },
  Carbs: {
    border: "border-l-yellow-400",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    badge: "bg-yellow-50 text-yellow-700 border-yellow-100",
  },
  Fruit: {
    border: "border-l-green-400",
    bg: "bg-green-50",
    text: "text-green-700",
    badge: "bg-green-50 text-green-700 border-green-100",
  },
  Dairy: {
    border: "border-l-blue-400",
    bg: "bg-blue-50",
    text: "text-blue-700",
    badge: "bg-blue-50 text-blue-700 border-blue-100",
  },
  Nuts: {
    border: "border-l-amber-400",
    bg: "bg-amber-50",
    text: "text-amber-700",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
  },
  Fats: {
    border: "border-l-orange-400",
    bg: "bg-orange-50",
    text: "text-orange-700",
    badge: "bg-orange-50 text-orange-700 border-orange-100",
  },
  Vegetables: {
    border: "border-l-emerald-400",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
};

const DEFAULT_ACCENT = {
  border: "border-l-gray-300",
  bg: "bg-gray-50",
  text: "text-gray-600",
  badge: "bg-gray-50 text-gray-600 border-gray-100",
};

export default function FoodCard({ food, onAdd }: Props) {
  const [added, setAdded] = useState(false);
  const accent = CATEGORY_ACCENT[food.category] ?? DEFAULT_ACCENT;

  function handleAdd() {
    onAdd(food);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <button
      onClick={handleAdd}
      disabled={added}
      className={`bg-white rounded-xl border border-gray-100 border-l-4 ${accent.border} shadow-sm p-3 flex flex-col text-left w-full transition-all duration-200 group
        ${added ? "opacity-75 scale-[0.97]" : "hover:shadow-md hover:-translate-y-0.5 hover:border-gray-200"}`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl leading-none">{food.emoji}</span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full font-medium border ${accent.badge}`}
        >
          {food.category}
        </span>
      </div>

      <p className="font-semibold text-gray-800 text-sm leading-tight mb-1.5 flex-1">
        {food.name}
      </p>

      <div className="flex items-baseline gap-1 mb-0.5">
        <span
          className={`text-lg font-bold transition-colors ${
            added ? "text-emerald-600" : "text-gray-900"
          }`}
        >
          {food.calories}
        </span>
        <span className="text-xs text-gray-400">cal</span>
      </div>

      <p className="text-xs text-gray-400 mb-2.5">
        {food.servingSize} {food.servingUnit}
      </p>

      {/* Add button */}
      <div
        className={`w-full font-semibold text-xs py-1.5 rounded-lg transition-all text-center ${
          added
            ? "bg-emerald-500 text-white success-pop"
            : `${accent.bg} ${accent.text} group-hover:bg-emerald-500 group-hover:text-white`
        }`}
      >
        {added ? "✓ Added" : "+ Add"}
      </div>
    </button>
  );
}
