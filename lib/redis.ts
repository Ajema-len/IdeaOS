import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const CACHE_KEYS = {
  contextRestore: (ideaId: string) => `context-restore:${ideaId}`,
  dailyFocus: (userId: string, date: string) => `daily-focus:${userId}:${date}`,
  tagSuggestions: (hash: string) => `tags:${hash}`,
  graphData: (userId: string) => `graph:${userId}`,
  momentumRanking: (userId: string) => `momentum:${userId}`,
} as const;

export const TTL = {
  contextRestore: 3600,       // 1 hour
  dailyFocus: 86400,          // 24 hours
  tagSuggestions: 300,        // 5 minutes
  graphData: 900,             // 15 minutes
  momentumRanking: 3600,      // 1 hour
} as const;
