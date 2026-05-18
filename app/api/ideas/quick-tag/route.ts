import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { anthropic, getModel, getMaxTokens, parseJsonResponse } from "@/lib/ai/router";
import { TAG_SYSTEM_PROMPT, buildTagPrompt } from "@/lib/ai/prompts/tag-autocomplete";
import { redis, CACHE_KEYS, TTL } from "@/lib/redis";
import { createHash } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let title = "";
    try {
      const body = await req.json();
      title = String(body.title ?? "");
    } catch {
      return NextResponse.json({ data: { tags: [] } });
    }

    if (!title || title.length < 3) return NextResponse.json({ data: { tags: [] } });

    const hash = createHash("md5").update(title.toLowerCase()).digest("hex");
    const cacheKey = CACHE_KEYS.tagSuggestions(hash);

    const cached = await redis.get<string[]>(cacheKey).catch(() => null);
    if (cached) return NextResponse.json({ data: { tags: cached } });

    const message = await anthropic.messages.create({
      model: getModel("tag_autocomplete"),
      max_tokens: getMaxTokens("tag_autocomplete"),
      system: TAG_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildTagPrompt(title) }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "[]";
    let tags: string[] = [];
    try {
      tags = parseJsonResponse<string[]>(raw);
    } catch (error) {
      console.error("Tag parse error:", error, raw);
      tags = [];
    }

    await redis.setex(cacheKey, TTL.tagSuggestions, JSON.stringify(tags)).catch(() => null);
    return NextResponse.json({ data: { tags } });
  } catch (error) {
    console.error("Quick tag error:", error);
    return NextResponse.json({ error: "Failed to fetch tag suggestions", data: { tags: [] } }, { status: 500 });
  }
}
