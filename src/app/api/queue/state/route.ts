import { NextResponse } from "next/server";
import { getQueueSnapshot } from "@/lib/db/queue-state";

export async function GET() {
  try {
    const data = await getQueueSnapshot();
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
