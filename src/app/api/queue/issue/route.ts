import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { issueQueue } from "@/lib/db/queue-state";
import { loketCodeSchema, loketNumberSchema } from "@/lib/validations/queue";

const issueSchema = z.object({
  code: loketCodeSchema,
  loket: loketNumberSchema,
  layanan: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const json: unknown = await request.json();
  const parsed = issueSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Payload tidak valid", issues: parsed.error.flatten() }, { status: 422 });
  }

  const ticket = await issueQueue({
    ...parsed.data,
    waktu: Date.now(),
  });

  return NextResponse.json({ data: ticket }, { status: 201 });
}
