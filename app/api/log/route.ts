import { NextRequest, NextResponse } from "next/server";
import { getEntries, addEntry } from "@/lib/db";
import { LogEntry } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date =
    searchParams.get("date") ?? new Date().toISOString().split("T")[0];
  return NextResponse.json(getEntries(date));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const entry: LogEntry = {
    ...body,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  addEntry(entry);
  return NextResponse.json(entry, { status: 201 });
}
