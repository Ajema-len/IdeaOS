import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { anthropic, getModel, getMaxTokens, estimateCost, parseJsonResponse } from "@/lib/ai/router";
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisPrompt } from "@/lib/ai/prompts/analysis";
import type { FullAnalysisResult } from "@/types/idea";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const idea = await prisma.idea.findUnique({ where: { id: resolvedParams.id } });
    if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const model = getModel("full_analysis");

    const message = await anthropic.messages.create({
      model,
      max_tokens: getMaxTokens("full_analysis"),
      system: ANALYSIS_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildAnalysisPrompt(idea) }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "{}";

    let result: FullAnalysisResult;
    try {
      result = parseJsonResponse<FullAnalysisResult>(raw);
    } catch (error) {
      console.error("[AI analyze] Parse failed:", raw.slice(0, 300), error);
      return NextResponse.json(
        { error: "Failed to parse analysis", detail: String(error) },
        { status: 500 }
      );
    }

    const analysis = await prisma.aIAnalysis.create({
      data: {
        ideaId: resolvedParams.id,
        model: "SONNET_4_6",
        analysisType: "FULL_ANALYSIS",
        result: result as any,
        promptTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
        costUsd: estimateCost(model, message.usage.input_tokens, message.usage.output_tokens),
      },
    });

    return NextResponse.json({ data: analysis });
  } catch (error) {
    console.error("[AI analyze error]", error);
    return NextResponse.json(
      { error: "AI analysis failed", detail: String(error) },
      { status: 500 }
    );
  }
}
