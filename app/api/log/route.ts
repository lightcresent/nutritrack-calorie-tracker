import { NextRequest, NextResponse } from "next/server";
import { getEntries, addEntry } from "@/lib/db";
import { LogEntry } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date =
    searchParams.get("date") ?? new Date().toISOString().split("T")[0];
  const sessionId = request.headers.get("X-Session-Id") ?? "default";
  return NextResponse.json(await getEntries(date, sessionId));
}

export async function POST(request: NextRequest) {
  const sessionId = request.headers.get("X-Session-Id") ?? "default";
  const body = await request.json();
  const entry: LogEntry = {
    ...body,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  await addEntry(entry, sessionId);
  return NextResponse.json(entry, { status: 201 });
}
