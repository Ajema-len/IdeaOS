import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, getModel, getMaxTokens, estimateCost } from "@/lib/ai/router";
import { startOfWeek } from "date-fns";

export async function POST(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const weekOf = startOfWeek(new Date(), { weekStartsOn: 1 });

    const ideas = await prisma.idea.findMany({
      where: { userId: session.user.id, status: { in: ["ACTIVE", "PAUSED", "SHIPPED"] } },
      include: {
        milestones: { select: { status: true } },
        sessions: { orderBy: { startedAt: "desc" }, take: 3 },
      },
    });

    const model = getModel("weekly_review");
    const ideaSummary = ideas
      .map(
        (i) =>
          `- ${i.title} [${i.status}] — ${i.totalTimeHours.toFixed(1)}h invested, ` +
          `${i.milestones.filter((m) => m.status === "DONE").length}/${i.milestones.length} milestones done`
      )
      .join("\n");

    const message = await anthropic.messages.create({
      model,
      max_tokens: getMaxTokens("weekly_review"),
      messages: [
        {
          role: "user",
          content:
            `You are reviewing an ML engineer's idea portfolio for the week of ${weekOf.toLocaleDateString()}.\n\n` +
            `ACTIVE IDEAS:\n${ideaSummary}\n\n` +
            `Write a strategic weekly review covering: portfolio health, what to focus on next week, ` +
            `ideas to consider shipping, ideas to consider abandoning, and overall momentum assessment. ` +
            `Be direct and specific. 400-600 words.`,
        },
      ],
    });

    const content = message.content[0].type === "text" ? message.content[0].text : "";

    const review = await prisma.weeklyReview.upsert({
      where: { userId_weekOf: { userId: session.user.id, weekOf } },
      create: {
        userId: session.user.id,
        weekOf,
        content,
        ideasCovered: ideas.map((i) => i.id),
        model: "OPUS_4_6",
        tokens: message.usage.input_tokens + message.usage.output_tokens,
        costUsd: estimateCost(model, message.usage.input_tokens, message.usage.output_tokens),
      },
      update: {
        content,
        tokens: message.usage.input_tokens + message.usage.output_tokens,
      },
    });

    return NextResponse.json({ data: review });
  } catch (error) {
    console.error("[Weekly review error]", error);
    return NextResponse.json(
      { error: "Weekly review generation failed", detail: String(error) },
      { status: 500 }
    );
  }
}
