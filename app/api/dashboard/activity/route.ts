import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sessions = await prisma.workSession.findMany({
      where: { userId: session.user.id, endedAt: { not: null } },
      orderBy: { endedAt: "desc" },
      take: 5,
      include: { idea: { select: { id: true, title: true } } },
    });

    return NextResponse.json({ data: sessions });
  } catch (error) {
    console.error("[Dashboard activity error]", error);
    return NextResponse.json(
      { error: "Failed to fetch activity", detail: String(error) },
      { status: 500 }
    );
  }
}
