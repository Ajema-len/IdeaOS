import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const weeklyReviewDayMap = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

const preferencesSchema = z.object({
  dailyFocusEnabled: z.boolean().optional(),
  weeklyReviewEnabled: z.boolean().optional(),
  weeklyReviewDay: z.union([
    z.number().int().min(0).max(6),
    z.enum(["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]),
  ]).optional(),
  notificationsEnabled: z.boolean().optional(),
});

type PreferencesPayload = z.infer<typeof preferencesSchema>;

function parseWeeklyReviewDay(value: PreferencesPayload["weeklyReviewDay"]) {
  if (typeof value === "number") return value;
  if (!value) return undefined;
  return weeklyReviewDayMap[value];
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const preferences = await prisma.userPreferences.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ data: preferences ?? null });
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = preferencesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid preferences payload", error: parsed.error.flatten() }, { status: 400 });
    }

    const preferences = await prisma.userPreferences.update({
      where: { userId: session.user.id },
      data: {
        dailyFocusEnabled: parsed.data.dailyFocusEnabled ?? undefined,
        weeklyReviewEnabled: parsed.data.weeklyReviewEnabled ?? undefined,
        weeklyReviewDay: parseWeeklyReviewDay(parsed.data.weeklyReviewDay) ?? undefined,
        notificationsEnabled: parsed.data.notificationsEnabled ?? undefined,
      },
    });

    return NextResponse.json({ message: "Preferences updated", preferences });
  } catch (error) {
    console.error("Preferences update error:", error);
    return NextResponse.json({ message: "Failed to update preferences" }, { status: 500 });
  }
}
