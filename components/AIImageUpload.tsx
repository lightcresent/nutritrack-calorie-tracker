"use client";

import { useState, useRef, useCallback } from "react";
import { AIFoodItem, AIResponse } from "@/types/ai";

interface Props {
  onAddItem: (item: AIFoodItem) => Promise<void>;
}

export default function AIImageUpload({ onAddItem }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [adding, setAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function setFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, WebP, or HEIC).");
      return;
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    setSelected(new Set());
  }

  function reset() {
    setPreviewUrl(null);
    setImageFile(null);
    setResult(null);
    setError(null);
    setSelected(new Set());
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setFile(file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function analyze() {
    if (!imageFile || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append("image", imageFile);
      const res = await fetch("/api/ai/image", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Image analysis failed");
      const aiResult = data as AIResponse;
      setResult(aiResult);
      setSelected(new Set(aiResult.items.map((_, i) => i)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function toggleItem(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  async function handleAddSelected() {
    if (!result || adding || selected.size === 0) return;
    setAdding(true);
    const toAdd = result.items.filter((_, i) => selected.has(i));
    for (const item of toAdd) {
      await onAddItem(item);
    }
    setAdding(false);
    reset();
  }

  const selectedCalories = result
    ? result.items
        .filter((_, i) => selected.has(i))
        .reduce((sum, item) => sum + item.calories * item.quantity, 0)
    : 0;

  return (
    <div className="space-y-4">
      {!previewUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all select-none ${
            dragOver
              ? "border-emerald-400 bg-emerald-50"
              : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40"
          }`}
        >
          <div className="text-4xl mb-3">📷</div>
          <p className="font-semibold text-gray-700 mb-1">Upload a photo of your meal</p>
          <p className="text-sm text-gray-400">
            Click or drag &amp; drop · JPEG, PNG, WebP, HEIC · max 10 MB
          </p>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden bg-gray-100 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Meal preview"
            className="w-full max-h-72 object-cover"
          />
          <button
            onClick={reset}
            className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-xl leading-none transition-colors"
            aria-label="Remove image"
          >
            ×
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setFile(file);
          e.target.value = "";
        }}
      />

      {previewUrl && !result && (
        <button
          onClick={analyze}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-100 disabled:text-emerald-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
              Identifying foods…
            </>
          ) : (
            <>🔍 Analyze Image</>
          )}
        </button>
      )}

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
            {result.items.map((item, i) => (
              <label
                key={i}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={() => toggleItem(i)}
                  className="w-4 h-4 accent-emerald-600 flex-shrink-0"
                />
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
                <span
                  className={`text-sm font-bold tabular-nums whitespace-nowrap transition-colors ${
                    selected.has(i) ? "text-gray-900" : "text-gray-300"
                  }`}
                >
                  {item.calories} cal
                </span>
              </label>
            ))}
          </div>

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {selected.size}/{result.items.length} selected ·{" "}
              <strong className="text-gray-800">{selectedCalories} cal</strong>
            </span>
            <button
              onClick={handleAddSelected}
              disabled={selected.size === 0 || adding}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap flex items-center gap-2"
            >
              {adding ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  Adding…
                </>
              ) : selected.size > 0 ? (
                `Add ${selected.size} Item${selected.size > 1 ? "s" : ""}`
              ) : (
                "Select items"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
