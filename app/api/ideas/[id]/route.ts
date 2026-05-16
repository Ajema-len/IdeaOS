import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateIdeaSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  status: z.enum(["ACTIVE","PAUSED","BACKLOG","SHIPPED","ABANDONED"]).optional(),
  category: z.enum(["ML_RESEARCH","ML_PRODUCT","WEB_APP","MOBILE_APP","TOOL","PLATFORM","API_SERVICE","CONTENT","BUSINESS","OTHER"]).optional(),
  tags: z.array(z.string()).optional(),
  priority: z.number().min(0).max(2).optional(),
  isPinned: z.boolean().optional(),
});

async function getIdeaOrFail(id: string, userId: string) {
  const idea = await prisma.idea.findUnique({ where: { id } });
  if (!idea || idea.userId !== userId) return null;
  return idea;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const idea = await prisma.idea.findUnique({
    where: { id: resolvedParams.id },
    include: {
      sessions: { orderBy: { startedAt: "desc" }, take: 20 },
      milestones: { orderBy: { orderIndex: "asc" } },
      analysis: { orderBy: { createdAt: "desc" }, take: 5 },
      chatMessages: { orderBy: { createdAt: "asc" }, take: 50 },
      notes: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!idea || idea.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: idea });
}

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const idea = await getIdeaOrFail(resolvedParams.id, session.user.id);
  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await _req.json();
  const parsed = updateIdeaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const statusTransitions: Partial<Record<string, { startedAt?: Date; shippedAt?: Date; abandonedAt?: Date }>> = {
    ACTIVE:    { startedAt: idea.startedAt ?? new Date() },
    SHIPPED:   { shippedAt: new Date() },
    ABANDONED: { abandonedAt: new Date() },
  };

  const updated = await prisma.idea.update({
    where: { id: resolvedParams.id },
    data: {
      ...parsed.data,
      ...(parsed.data.status ? statusTransitions[parsed.data.status] : {}),
    },
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const idea = await getIdeaOrFail(resolvedParams.id, session.user.id);
  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.idea.update({
    where: { id: resolvedParams.id },
    data: { status: "ABANDONED", abandonedAt: new Date() },
  });

  return NextResponse.json({ data: { ok: true } });
}
