import { NextResponse } from "next/server";
import { forceResetQueues } from "@/lib/db/queue-state";

export async function POST() {
  await forceResetQueues();
  return NextResponse.json({ data: { reset: true } });
}
