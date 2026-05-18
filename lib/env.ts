const REQUIRED_ENV = [
  "DATABASE_URL",
  "ANTHROPIC_API_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
] as const;

export function validateEnv() {
  const envMissing = REQUIRED_ENV.filter((key) => !process.env[key]);
  const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  const missing = authSecret ? envMissing : ["NEXTAUTH_SECRET", ...envMissing];

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}` +
      `\nCopy .env.example to .env.local and fill in the values.`
    );
  }
}
