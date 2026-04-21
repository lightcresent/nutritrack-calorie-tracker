"use client";

import { useState, useEffect, useCallback } from "react";
import { LogEntry, Food, MacroTotals, MealCategory } from "@/types";
import { AIFoodItem } from "@/types/ai";
import CalorieSummary from "./CalorieSummary";
import FoodSearch from "./FoodSearch";
import FoodLog from "./FoodLog";
import { MEAL_OPTIONS, getCurrentMeal } from "@/lib/meals";

const DAILY_GOAL = 2000;

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function CalorieTracker() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState<MealCategory>(getCurrentMeal);
  const today = getToday();

  const fetchEntries = useCallback(async () => {
    const res = await fetch(`/api/log?date=${today}`);
    const data = await res.json();
    setEntries(data);
    setLoading(false);
  }, [today]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  async function saveEntry(
    payload: Omit<LogEntry, "id" | "timestamp">
  ): Promise<void> {
    const res = await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, meal: selectedMeal }),
    });
    const newEntry: LogEntry = await res.json();
    setEntries((prev) => [...prev, newEntry]);
  }

  async function handleAddFood(food: Food) {
    await saveEntry({
      foodId: food.id,
      foodName: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      quantity: 1,
      date: today,
    });
  }

  async function handleAddAIItem(item: AIFoodItem): Promise<void> {
    await saveEntry({
      foodId: `ai-${Date.now()}`,
      foodName: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      servingSize: item.servingSize,
      servingUnit: item.servingUnit,
      quantity: item.quantity,
      date: today,
    });
  }

  async function handleRemove(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    await fetch(`/api/log/${id}`, { method: "DELETE" });
  }

  const totals: MacroTotals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10" style={{ boxShadow: "0 1px 0 0 #e5e7eb" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 flex-shrink-0 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="font-display text-white text-lg leading-none select-none">N</span>
            </div>
            <div>
              <h1 className="font-display text-xl text-gray-900 leading-tight">NutriTrack</h1>
              <p className="text-xs text-gray-400 leading-tight hidden sm:block">Calorie &amp; Macro Tracker</p>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">{formatDate(today)}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="stagger-1">
          <CalorieSummary totals={totals} goal={DAILY_GOAL} />
        </div>
        <div className="stagger-2">
          <FoodSearch
            onAddFood={handleAddFood}
            onAddAIItem={handleAddAIItem}
            selectedMeal={selectedMeal}
            onMealChange={setSelectedMeal}
          />
        </div>
        <div className="stagger-3">
          <FoodLog entries={entries} onRemove={handleRemove} loading={loading} />
        </div>
      </main>
    </div>
  );
}
