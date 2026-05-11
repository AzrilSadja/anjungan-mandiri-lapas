import { NextRequest, NextResponse } from "next/server";
import { ensureBootToken } from "@/lib/services/boot-token-service";
import { bootTokenQuerySchema } from "@/lib/validations/boot-token";

type BootTokenResponse = {
  token: string;
};

export async function GET(request: NextRequest): Promise<NextResponse<BootTokenResponse>> {
  const queryObject = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = bootTokenQuerySchema.safeParse(queryObject);

  if (!parsed.success) {
    return NextResponse.json({ token: "" }, { status: 400 });
  }

  const token = await ensureBootToken(parsed.data.refresh);
  return NextResponse.json({ token });
}
