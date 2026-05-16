import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, getModel, getMaxTokens, estimateCost, parseJsonResponse } from "@/lib/ai/router";
import { CONTEXT_RESTORE_SYSTEM_PROMPT, buildContextRestorePrompt } from "@/lib/ai/prompts/context-restore";
import { redis, CACHE_KEYS, TTL } from "@/lib/redis";
import { daysSince } from "@/lib/utils";
import type { ContextRestoreResult } from "@/types/idea";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cacheKey = CACHE_KEYS.contextRestore(resolvedParams.id);
  const cached = await redis.get<ContextRestoreResult>(cacheKey).catch(() => null);
  if (cached) return NextResponse.json({ data: cached });

  const idea = await prisma.idea.findUnique({
    where: { id: resolvedParams.id },
    include: {
      sessions: { orderBy: { startedAt: "desc" }, take: 5 },
      milestones: { orderBy: { orderIndex: "asc" } },
      chatMessages: { orderBy: { createdAt: "desc" }, take: 6 },
    },
  });

  if (!idea || idea.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const gapDays = idea.lastWorkedAt ? daysSince(idea.lastWorkedAt) : 0;

  const model = getModel("context_restore");

  const message = await anthropic.messages.create({
    model,
    max_tokens: getMaxTokens("context_restore"),
    system: CONTEXT_RESTORE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildContextRestorePrompt({
      title: idea.title,
      description: idea.description,
      sessions: idea.sessions,
      milestones: idea.milestones,
      chatMessages: [...idea.chatMessages].reverse(),
      gapDays,
    }) }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "{}";
  let result: ContextRestoreResult;
  try {
    result = parseJsonResponse<ContextRestoreResult>(raw);
  } catch {
    return NextResponse.json({ error: "Failed to parse restore brief" }, { status: 500 });
  }

  await redis.setex(cacheKey, TTL.contextRestore, JSON.stringify(result)).catch(() => null);

  await prisma.aIAnalysis.create({
    data: {
      ideaId: resolvedParams.id,
      model: "SONNET_4_6",
      analysisType: "CONTEXT_RESTORE",
      result: result as any,
      promptTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      costUsd: estimateCost(model, message.usage.input_tokens, message.usage.output_tokens),
    },
  });

  return NextResponse.json({ data: result });
}
