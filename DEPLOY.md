# Deployment checklist

## Required environment variables (add in Vercel dashboard)

- `DATABASE_URL` — Supabase connection string (use the pooler URL for Vercel, port 6543)
- `DIRECT_URL` — Supabase direct connection (use for migrations only, port 5432)
- `AUTH_SECRET` — 32-byte base64 random string (run `openssl rand -base64 32`)
- `NEXT_PUBLIC_APP_URL` — your Vercel deployment URL (e.g., https://ideaos.vercel.app)
- `ANTHROPIC_API_KEY` — from https://console.anthropic.com
- `UPSTASH_REDIS_REST_URL` — from https://upstash.com dashboard
- `UPSTASH_REDIS_REST_TOKEN` — from https://upstash.com dashboard

## Supabase configuration

**For Vercel (production):**
Use the connection pooler URL for `DATABASE_URL` (looks like: `postgresql://user:password@region.pooler.supabase.com:6543/postgres`)

**For local development:**
Use the direct connection URL for `DATABASE_URL` in `.env.local` (looks like: `postgresql://user:password@region.supabase.co:5432/postgres`)

The `DIRECT_URL` should always be the direct connection for running migrations.

## Deploy steps

1. **Set up environment variables**
   - Copy the required environment variables above into Vercel project settings
   - Ensure `DIRECT_URL` is set for migrations to work

2. **Push to main branch**
   - All commits to `main` will auto-deploy to Vercel

3. **Verify deployment**
   - Open your Vercel deployment URL
   - Navigate to `/register` and create a test account
   - Capture one idea (Cmd+K or Ctrl+K)
   - Verify AI analysis loads within 10-15 seconds
   - Check milestones appear
   - Start a session and end it with accomplishments

4. **Monitor logs**
   - Check Vercel function logs for any errors
   - Use Supabase dashboard to verify data is being written
   - Monitor Anthropic API usage for cost tracking

## Troubleshooting

- **"Missing required environment variables" error**: Ensure all env vars are set in Vercel project settings
- **Database migration fails**: Verify `DIRECT_URL` is the direct connection URL, not pooler
- **AI analysis doesn't appear**: Check Anthropic API key is valid and account has credits
- **Session timeout on chat**: May indicate Redis connection issue; verify `UPSTASH_REDIS_REST_URL` and token
