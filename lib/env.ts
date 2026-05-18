const REQUIRED_ENV = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "ANTHROPIC_API_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
] as const;

export function validateEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}` +
      `\nCopy .env.example to .env.local and fill in the values.`
    );
  }
}
