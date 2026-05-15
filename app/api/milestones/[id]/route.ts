import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.enum(["TODO","IN_PROGRESS","DONE","SKIPPED"]).optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const milestone = await prisma.milestone.findUnique({
    where: { id: params.id },
    include: { idea: { select: { userId: true } } },
  });

  if (!milestone || milestone.idea.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.milestone.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      completedAt: parsed.data.status === "DONE" ? new Date() : parsed.data.status ? null : undefined,
    },
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const milestone = await prisma.milestone.findUnique({
    where: { id: params.id },
    include: { idea: { select: { userId: true } } },
  });

  if (!milestone || milestone.idea.userId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.milestone.delete({ where: { id: params.id } });
  return NextResponse.json({ data: { ok: true } });
}
