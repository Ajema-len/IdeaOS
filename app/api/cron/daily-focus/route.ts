import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Trigger daily focus generation for all users (fire and forget)
  const users = await prisma.user.findMany({ select: { id: true } });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  await Promise.allSettled(
    users.map((u) =>
      fetch(`${baseUrl}/api/ai/daily-focus`, {
        headers: { Cookie: `next-auth.session-token=cron` },
      })
    )
  );

  return NextResponse.json({ ok: true, users: users.length });
}
