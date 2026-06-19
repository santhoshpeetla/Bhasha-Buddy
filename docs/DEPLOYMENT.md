# Deployment Guide

## Local Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Add `OPENROUTER_API_KEY`.
4. Optional: add Firebase and Upstash values.
5. Start the app with `npm run dev`.

## Environment Variables

Required:

```txt
OPENROUTER_API_KEY=
OPENROUTER_MODEL=deepseek/deepseek-chat-v3
OPENROUTER_FALLBACK_MODEL=meta-llama/llama-3.3-70b-instruct
OPENROUTER_VISION_MODEL=openai/gpt-4o-mini
```

Optional:

```txt
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## Vercel

1. Import the GitHub repository into Vercel.
2. Add environment variables.
3. Deploy.
4. Confirm `/api/demo?kind=scholarship` responds.
5. Run the Playwright demo path against the production URL.

## Rollback

Use Vercel's deployment history to promote the previous successful deployment. Database rollback is not required for MVP because documents and analysis are not persisted.
