"use client";

import { useState } from "react";
import { FOODS } from "@/lib/foods";
import { Food, MealCategory } from "@/types";
import { AIFoodItem } from "@/types/ai";
import FoodCard from "./FoodCard";
import AITextSearch from "./AITextSearch";
import AIImageUpload from "./AIImageUpload";
import { MEAL_OPTIONS } from "@/lib/meals";

type Tab = "quick" | "text" | "photo";

interface Props {
  onAddFood: (food: Food) => void;
  onAddAIItem: (item: AIFoodItem) => Promise<void>;
  selectedMeal: MealCategory;
  onMealChange: (meal: MealCategory) => void;
}

const TABS: { id: Tab; label: string; icon: string; hint: string }[] = [
  { id: "quick", label: "Quick Add", icon: "⚡", hint: "50 Indian foods" },
  { id: "text", label: "Describe", icon: "✍️", hint: "AI" },
  { id: "photo", label: "Photo", icon: "📷", hint: "AI" },
];

export default function FoodSearch({ onAddFood, onAddAIItem, selectedMeal, onMealChange }: Props) {
  const [tab, setTab] = useState<Tab>("quick");
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? FOODS.filter(
        (f) =>
          f.name.toLowerCase().includes(query.toLowerCase()) ||
          f.category.toLowerCase().includes(query.toLowerCase())
      )
    : FOODS;

  return (
    <div>
      <div className="bg-white rounded-[1.25rem] border border-gray-100 overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        {/* Meal selector — top strip */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">
            Meal
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {MEAL_OPTIONS.map((m) => (
              <button
                key={m.id}
                onClick={() => onMealChange(m.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  selectedMeal === m.id
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                    : "bg-transparent border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-gray-100">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
                tab === t.id
                  ? "border-emerald-500 text-emerald-700 bg-emerald-50/40"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              <span className="hidden sm:inline text-xs font-normal text-gray-400">({t.hint})</span>
            </button>
          ))}
        </div>

        <div className="p-4 tab-content" key={tab}>
          {tab === "quick" && (
            <>
              <div className="relative mb-4">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search foods or categories…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-gray-50 text-sm transition-all"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl leading-none"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              {filtered.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-0.5 pb-0.5">
                  {filtered.map((food) => (
                    <FoodCard key={food.id} food={food} onAdd={onAddFood} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="font-medium text-gray-600 mb-1">No match for &ldquo;{query}&rdquo;</p>
                  <button
                    onClick={() => setTab("text")}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold underline underline-offset-2"
                  >
                    Try Describe with AI instead →
                  </button>
                </div>
              )}
            </>
          )}

          {tab === "text" && <AITextSearch onAddItem={onAddAIItem} />}
          {tab === "photo" && <AIImageUpload onAddItem={onAddAIItem} />}
        </div>
      </div>
    </div>
  );
}
