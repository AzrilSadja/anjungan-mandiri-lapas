import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { callNextQueueByLoket } from "@/lib/db/queue-state";
import { loketNumberSchema } from "@/lib/validations/queue";

const callSchema = z.object({
  loket: loketNumberSchema,
});

export async function POST(request: NextRequest) {
  const json: unknown = await request.json();
  const parsed = callSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Payload tidak valid", issues: parsed.error.flatten() }, { status: 422 });
  }

  const called = await callNextQueueByLoket(parsed.data.loket);
  if (!called) {
    return NextResponse.json({ message: "Belum ada antrean untuk loket ini" }, { status: 404 });
  }

  return NextResponse.json({ data: called });
}
