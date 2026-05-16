import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createMilestoneSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().datetime().optional(),
  orderIndex: z.number().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const milestones = await prisma.milestone.findMany({
    where: { ideaId: params.id },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json({ data: milestones });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const idea = await prisma.idea.findUnique({ where: { id: params.id } });
  if (!idea || idea.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = createMilestoneSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const lastMilestone = await prisma.milestone.findFirst({
    where: { ideaId: params.id },
    orderBy: { orderIndex: "desc" },
  });

  const milestone = await prisma.milestone.create({
    data: {
      ideaId: params.id,
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      orderIndex: parsed.data.orderIndex ?? (lastMilestone ? lastMilestone.orderIndex + 1 : 0),
      aiGenerated: false,
    },
  });

  return NextResponse.json({ data: milestone }, { status: 201 });
}
