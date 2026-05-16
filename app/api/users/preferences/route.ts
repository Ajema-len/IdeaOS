import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { dailyFocusEnabled, weeklyReviewEnabled, weeklyReviewDay, notificationsEnabled } = await request.json();

    const preferences = await prisma.userPreferences.update({
      where: { userId: session.user.id },
      data: {
        dailyFocusEnabled: dailyFocusEnabled ?? undefined,
        weeklyReviewEnabled: weeklyReviewEnabled ?? undefined,
        weeklyReviewDay: weeklyReviewDay ?? undefined,
        notificationsEnabled: notificationsEnabled ?? undefined,
      },
    });

    return NextResponse.json({ message: "Preferences updated", preferences });
  } catch (error) {
    console.error("Preferences update error:", error);
    return NextResponse.json({ message: "Failed to update preferences" }, { status: 500 });
  }
}
