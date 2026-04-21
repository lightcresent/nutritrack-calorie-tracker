import { NextRequest, NextResponse } from "next/server";
import { deleteEntry } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await deleteEntry(params.id);
  return NextResponse.json({ success: true });
}
