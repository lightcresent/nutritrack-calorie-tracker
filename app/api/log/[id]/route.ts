import { NextRequest, NextResponse } from "next/server";
import { deleteEntry } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  deleteEntry(params.id);
  return NextResponse.json({ success: true });
}
