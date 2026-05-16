import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, getModel, getMaxTokens } from "@/lib/ai/router";
import { buildChatSystemPrompt } from "@/lib/ai/prompts/chat-system";
import { getIdeaFullContext } from "@/lib/ideas/context";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messages = await prisma.chatMessage.findMany({
    where: { ideaId: resolvedParams.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ data: messages });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message } = await request.json();
  if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const context = await getIdeaFullContext(resolvedParams.id);
  if (context.idea.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const systemPrompt = buildChatSystemPrompt(
    context.idea,
    context.sessions,
    context.milestones
  );

  const history = context.chatMessages.slice(-20).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const model = getModel("chat");

  await prisma.chatMessage.create({
    data: { ideaId: resolvedParams.id, role: "user", content: message },
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = "";
      let promptTokens = 0;
      let outputTokens = 0;

      try {
        const aiStream = await anthropic.messages.stream({
          model,
          max_tokens: getMaxTokens("chat"),
          system: systemPrompt,
          messages: [...history, { role: "user", content: message }],
        });

        for await (const chunk of aiStream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            fullResponse += chunk.delta.text;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk.delta.text })}\n\n`));
          }
          if (chunk.type === "message_start") promptTokens = chunk.message.usage.input_tokens;
          if (chunk.type === "message_delta") outputTokens = chunk.usage.output_tokens;
        }

        await prisma.chatMessage.create({
          data: {
            ideaId: resolvedParams.id,
            role: "assistant",
            content: fullResponse,
            model: "SONNET_4_6",
            tokens: promptTokens + outputTokens,
          },
        });

        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
