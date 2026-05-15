import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { anthropic, getModel, getMaxTokens, estimateCost, parseJsonResponse } from "@/lib/ai/router";
import { MILESTONE_SYSTEM_PROMPT, buildMilestonePrompt } from "@/lib/ai/prompts/milestones";
import type { MilestonePlanResult } from "@/types/idea";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const idea = await prisma.idea.findUnique({ where: { id: params.id } });
  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const model = getModel("milestone_generation");

  const message = await anthropic.messages.create({
    model,
    max_tokens: getMaxTokens("milestone_generation"),
    system: MILESTONE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildMilestonePrompt(idea) }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "{}";

  let result: MilestonePlanResult;
  try {
    result = parseJsonResponse<MilestonePlanResult>(raw);
  } catch {
    return NextResponse.json({ error: "Failed to parse milestones" }, { status: 500 });
  }

  // Create milestone records
  const milestones = await prisma.$transaction(
    result.milestones.map((m, index) =>
      prisma.milestone.create({
        data: {
          ideaId: params.id,
          title: m.title,
          description: m.description,
          orderIndex: index,
          aiGenerated: true,
        },
      })
    )
  );

  await prisma.aIAnalysis.create({
    data: {
      ideaId: params.id,
      model: "SONNET_4_6",
      analysisType: "MILESTONE_PLAN",
      result: result as any,
      promptTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      costUsd: estimateCost(model, message.usage.input_tokens, message.usage.output_tokens),
    },
  });

  return NextResponse.json({ data: milestones });
}
