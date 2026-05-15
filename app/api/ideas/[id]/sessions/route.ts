import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const startSessionSchema = z.object({
  goalForSession: z.string().max(500).optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessions = await prisma.workSession.findMany({
    where: { ideaId: params.id, userId: session.user.id },
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json({ data: sessions });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const idea = await prisma.idea.findUnique({ where: { id: params.id } });
  if (!idea || idea.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const parsed = startSessionSchema.safeParse(body);

  const workSession = await prisma.workSession.create({
    data: {
      ideaId: params.id,
      userId: session.user.id,
      goalForSession: parsed.success ? parsed.data.goalForSession : undefined,
    },
  });

  // Mark idea as active if backlog
  if (idea.status === "BACKLOG") {
    await prisma.idea.update({
      where: { id: params.id },
      data: { status: "ACTIVE", startedAt: new Date() },
    });
  }

  return NextResponse.json({ data: workSession }, { status: 201 });
}
