import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const reviews = await prisma.weeklyReview.findMany({
      where: { userId: session.user.id },
      orderBy: { weekOf: "desc" },
      take: 10,
      select: { id: true, weekOf: true, content: true, createdAt: true, costUsd: true },
    });

    return NextResponse.json({ data: reviews });
  } catch (error) {
    console.error("[Weekly reviews list error]", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews", detail: String(error) },
      { status: 500 }
    );
  }
}
