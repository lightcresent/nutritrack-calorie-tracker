"use client";

import { useState } from "react";
import { AIFoodItem, AIResponse } from "@/types/ai";

interface Props {
  onAddItem: (item: AIFoodItem) => Promise<void>;
}

export default function AITextSearch({ onAddItem }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [addedIndices, setAddedIndices] = useState<Set<number>>(new Set());
  const [addingAll, setAddingAll] = useState(false);

  async function analyze() {
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setAddedIndices(new Set());
    try {
      const res = await fetch("/api/ai/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setResult(data as AIResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddOne(item: AIFoodItem, index: number) {
    await onAddItem(item);
    setAddedIndices((prev) => new Set([...prev, index]));
  }

  async function handleAddAll() {
    if (!result || addingAll) return;
    setAddingAll(true);
    for (let i = 0; i < result.items.length; i++) {
      if (!addedIndices.has(i)) {
        await onAddItem(result.items[i]);
        setAddedIndices((prev) => new Set([...prev, i]));
      }
    }
    setAddingAll(false);
  }

  const allAdded = result != null && result.items.every((_, i) => addedIndices.has(i));

  return (
    <div className="space-y-4">
      <textarea
        rows={2}
        placeholder={`Describe what you ate…\ne.g. "two scrambled eggs with toast and a black coffee"`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            analyze();
          }
        }}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-gray-50 text-sm resize-none transition-all"
      />

      <button
        onClick={analyze}
        disabled={!query.trim() || loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-100 disabled:text-emerald-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
            Analyzing…
          </>
        ) : (
          <>✨ Analyze with AI</>
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 text-sm flex gap-2.5 items-start">
          <span className="mt-0.5 flex-shrink-0">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100 flex items-start gap-2">
            <span className="flex-shrink-0">🤖</span>
            <p className="text-sm text-emerald-800 font-medium">{result.description}</p>
          </div>

          <div className="divide-y divide-gray-100">
            {result.items.map((item, i) => {
              const added = addedIndices.has(i);
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      <span className="text-blue-500">P{item.protein}g</span>
                      <span className="mx-1 text-gray-200">·</span>
                      <span className="text-amber-500">C{item.carbs}g</span>
                      <span className="mx-1 text-gray-200">·</span>
                      <span className="text-orange-500">F{item.fat}g</span>
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 tabular-nums whitespace-nowrap">
                    {item.calories} cal
                  </span>
                  <button
                    onClick={() => handleAddOne(item, i)}
                    disabled={added}
                    className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                      added
                        ? "bg-gray-100 text-gray-400 cursor-default"
                        : "bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-700 border border-emerald-200 hover:border-emerald-500"
                    }`}
                  >
                    {added ? "✓ Added" : "+ Add"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
            <span className="text-sm text-gray-500">
              Total:{" "}
              <strong className="text-gray-800">{result.totalCalories} cal</strong>
            </span>
            <button
              onClick={handleAddAll}
              disabled={allAdded || addingAll}
              className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
                allAdded
                  ? "bg-gray-100 text-gray-400 cursor-default"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {addingAll ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  Adding…
                </>
              ) : allAdded ? (
                "✓ All Added"
              ) : (
                `Add All (${result.totalCalories} cal)`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
