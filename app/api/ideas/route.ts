import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { IdeaFilters } from "@/types/api";

const createIdeaSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional(),
  category: z.enum(["ML_RESEARCH","ML_PRODUCT","WEB_APP","MOBILE_APP","TOOL","PLATFORM","API_SERVICE","CONTENT","BUSINESS","OTHER"]).default("OTHER"),
  tags: z.array(z.string().max(30)).max(10).default([]),
  priority: z.number().min(0).max(2).default(0),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const filters: IdeaFilters = {
    status: searchParams.get("status") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    tags: searchParams.get("tags") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    sort: (searchParams.get("sort") as IdeaFilters["sort"]) ?? "lastWorkedAt",
    order: (searchParams.get("order") as "asc" | "desc") ?? "desc",
    page: Number(searchParams.get("page") ?? 1),
    limit: Number(searchParams.get("limit") ?? 20),
  };

  const where = {
    userId: session.user.id,
    ...(filters.status && { status: { in: filters.status.split(",") as any[] } }),
    ...(filters.category && { category: { in: filters.category.split(",") as any[] } }),
    ...(filters.tags && { tags: { hasSome: filters.tags.split(",") } }),
    ...(filters.search && {
      OR: [
        { title: { contains: filters.search, mode: "insensitive" as const } },
        { description: { contains: filters.search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [ideas, total] = await Promise.all([
    prisma.idea.findMany({
      where,
      orderBy: { [filters.sort!]: filters.order },
      skip: ((filters.page ?? 1) - 1) * (filters.limit ?? 20),
      take: filters.limit,
      include: {
        milestones: { select: { status: true } },
        _count: { select: { sessions: true } },
      },
    }),
    prisma.idea.count({ where }),
  ]);

  return NextResponse.json({ data: ideas, total, page: filters.page, limit: filters.limit, hasMore: (filters.page! * filters.limit!) < total });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createIdeaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const idea = await prisma.idea.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  // Trigger background AI jobs (fire and forget)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  Promise.all([
    fetch(`${baseUrl}/api/ai/analyze/${idea.id}`, { method: "POST" }),
    fetch(`${baseUrl}/api/ai/milestones/${idea.id}`, { method: "POST" }),
  ]).catch(console.error);

  return NextResponse.json({ data: idea }, { status: 201 });
}
