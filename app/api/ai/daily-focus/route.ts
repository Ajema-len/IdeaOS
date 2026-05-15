import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, getModel, getMaxTokens, estimateCost, parseJsonResponse } from "@/lib/ai/router";
import { DAILY_FOCUS_SYSTEM_PROMPT, buildDailyFocusPrompt } from "@/lib/ai/prompts/daily-focus";
import { redis, CACHE_KEYS, TTL } from "@/lib/redis";
import { format } from "date-fns";
import type { DailyFocusResult } from "@/types/idea";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = format(new Date(), "yyyy-MM-dd");
  const cacheKey = CACHE_KEYS.dailyFocus(session.user.id, today);

  const cached = await redis.get<DailyFocusResult>(cacheKey).catch(() => null);
  if (cached) return NextResponse.json({ data: cached });

  const ideas = await prisma.idea.findMany({
    where: { userId: session.user.id, status: { in: ["ACTIVE", "PAUSED"] } },
    include: { milestones: { select: { status: true } } },
    orderBy: { momentumScore: "desc" },
    take: 10,
  });

  if (ideas.length === 0) return NextResponse.json({ data: null });

  const model = getModel("daily_focus");

  const message = await anthropic.messages.create({
    model,
    max_tokens: getMaxTokens("daily_focus"),
    system: DAILY_FOCUS_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildDailyFocusPrompt(ideas.map(i => ({
      id: i.id,
      title: i.title,
      status: i.status,
      momentumScore: i.momentumScore,
      lastWorkedAt: i.lastWorkedAt,
      sessionCount: i.sessionCount,
      totalTimeHours: i.totalTimeHours,
      milestonesDone: i.milestones.filter(m => m.status === "DONE").length,
      milestonesTotal: i.milestones.length,
    }))) }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "{}";
  let result: DailyFocusResult;
  try {
    result = parseJsonResponse<DailyFocusResult>(raw);
  } catch {
    return NextResponse.json({ error: "Failed to parse focus" }, { status: 500 });
  }

  await redis.setex(cacheKey, TTL.dailyFocus, JSON.stringify(result)).catch(() => null);
  return NextResponse.json({ data: result });
}
