import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeMomentum } from "@/lib/ideas/momentum";

export async function GET(req: NextRequest) {
  if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ideas = await prisma.idea.findMany({
    where: { status: { in: ["ACTIVE", "PAUSED", "BACKLOG"] } },
    include: { sessions: true, milestones: true },
  });

  let updated = 0;
  for (const idea of ideas) {
    const momentumScore = computeMomentum(idea);
    if (Math.abs(momentumScore - idea.momentumScore) > 0.5) {
      await prisma.idea.update({
        where: { id: idea.id },
        data: { momentumScore },
      });
      updated++;
    }
  }

  return NextResponse.json({ ok: true, checked: ideas.length, updated });
}
