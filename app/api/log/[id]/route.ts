import { NextRequest, NextResponse } from "next/server";
import { deleteEntry } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionId = request.headers.get("X-Session-Id") ?? "default";
  await deleteEntry(params.id, sessionId);
  return NextResponse.json({ success: true });
}
