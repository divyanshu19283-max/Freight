# Freight Intelligence — SIH 2026 Demo

This branch is intentionally frontend-first. Dashboard data is bundled locally so Render/FastAPI outages and CORS cannot interrupt the demonstration UI. The Freight AI assistant is optional and uses `/api/chat` with `OPENAI_API_KEY` kept server-side.

## Deploy

- Vercel build command: `npm run build`
- Output directory: `dist`
- Optional environment variables: `OPENAI_API_KEY`, `OPENAI_MODEL`

Without an LLM key the dashboard still works and the assistant uses deterministic local answers.
