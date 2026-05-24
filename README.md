# FalconHire AI

GCC-focused interview prep: **mock HR screens** (type or **speak**), **recruiter-style scoring**, **resume** and **LinkedIn** help, plus a **public landing**. Stack: Next.js (App Router), TypeScript, Tailwind, Prisma, pluggable LLMs.

**On this page:** [Quick start](#quick-start-try-the-mvp) · [MVP at a glance](#mvp-feature-list-at-a-glance) · [Interview flow](#mock-interview-suggested-flow) · [Shipped checklist](#mvp-checklist-whats-shipped) · [Roadmap](#roadmap-next) · [Development](#development) · [Environment variables](#environment-variables)

---

## Quick start (try the MVP)

1. Run the app — see [Development](#development) (`npm install` → `npm run dev`).
2. Open the site — default [http://localhost:3000](http://localhost:3000); explore the **home** page (no login).
3. **Sign in with Google** — go to `/signin` (required for AI tools below).
4. Open **`/dashboard`** — shortcuts to interview, resume, and LinkedIn.
5. Run a **mock interview** on `/interview` (optional job description → practice → **Generate score** → **Download prep packet**).

**What you need for AI features:** at least one LLM API key (see [LLM](#llm-required-for-ai-routes)). **Optional:** `DATABASE_URL` so sessions and dashboard history persist; voice extras need keys listed under [Speech](#speech-optional-interview-page).

---

## MVP feature list (at a glance)

| Where | Who it’s for | What you get |
|--------|----------------|---------------|
| **`/`** (home) | Everyone | Marketing hero, live-style recruiter preview, feature highlights. **English / Arabic** and **light / dark** via the preferences control (saved in the browser). |
| **`/signin`** | New users | Google OAuth to unlock `/dashboard`, `/interview`, `/resume`, `/linkedin`. |
| **`/dashboard`** | Signed-in users | Mission control: jump to tools; **mock interview history** when Postgres is configured. |
| **`/interview`** | Signed-in users | JD-grounded **streaming** mock screen (UAE/GCC tone). **Type** answers or use **voice** (STT → same chat as typing). **Play** recruiter lines (TTS) when configured. **Score** + **prep packet** export. |
| **`/resume`** | Signed-in users | Upload or paste a CV; GCC-aware structured feedback (coaching, not a hiring decision). |
| **`/linkedin`** | Signed-in users | Headline, About, bullets, recruiter-facing copy aligned with GCC hiring context. |

Preferences are stored in the browser as **`falconhire-locale`** (e.g. `en` / `ar`) and **`falconhire-theme`** (`light` / `dark`).

---

## Mock interview: suggested flow

These steps match the buttons on [`/interview`](app/interview/page.tsx) ([`features/interview/interview-workspace.tsx`](features/interview/interview-workspace.tsx)).

1. **Optional:** expand **Target job description** and paste a posting (locked after you start a session).
2. Click **Start new session** — first recruiter message appears (and a DB session is created when `DATABASE_URL` is set).
3. **Answer** each question — type in the box, or set voice mode to **Voice primary** / **Both** and use **Record answer** (mic permission required).
4. After a few exchanges, click **Generate score** — structured categories (communication, confidence, professionalism, technical clarity, GCC readiness).
5. Click **Download prep packet** — Markdown file (JD + transcript + score if present) for mentors or notes.

**Voice details (short):** transcription uses OpenAI Whisper if `OPENAI_API_KEY` is set, otherwise Groq Whisper. TTS playback needs `OPENAI_API_KEY`. Only **transcripts** are stored and synced to the dashboard—not audio files. Optional **auto-play** for recruiter replies works after you click **Enable recruiter voice** (browser autoplay rules).

---

## MVP checklist (what’s shipped)

Use this as a release checklist; everything below is implemented today.

- [x] Public landing with EN/AR + light/dark ([`features/landing/landing-view.tsx`](features/landing/landing-view.tsx), [`components/providers/app-preferences-provider.tsx`](components/providers/app-preferences-provider.tsx))
- [x] Google sign-in and protected app routes
- [x] Dashboard hub + interview history when DB is on ([`/api/history`](app/api/history/route.ts))
- [x] JD-grounded streaming interview ([`/api/interview`](app/api/interview/route.ts))
- [x] Voice input (STT) + recruiter TTS + input modes ([`/api/interview/transcribe`](app/api/interview/transcribe/route.ts), [`/api/interview/tts`](app/api/interview/tts/route.ts), [`/api/interview/speech-capabilities`](app/api/interview/speech-capabilities/route.ts))
- [x] Session create + transcript sync to Postgres ([`/api/interview/session`](app/api/interview/session/route.ts), [`/api/interview/session/[sessionId]/sync`](app/api/interview/session/[sessionId]/sync/route.ts))
- [x] Structured recruiter score ([`/api/score`](app/api/score/route.ts))
- [x] Prep packet Markdown export ([`features/interview/build-prep-packet.ts`](features/interview/build-prep-packet.ts))
- [x] Resume and LinkedIn AI surfaces ([`/api/resume`](app/api/resume/route.ts), [`/api/linkedin`](app/api/linkedin/route.ts))
- [x] GCC hiring context in prompts ([`lib/prompts/gcc-hiring-context.ts`](lib/prompts/gcc-hiring-context.ts), [`lib/prompts/interview.ts`](lib/prompts/interview.ts)) — **coaching only**, not legal or immigration advice

---

## Roadmap (next)

- JD **coverage checklist** (which posting requirements were probed).
- **PDF** export and a richer “interview brief” layout.
- **7-day interview sprint** planner and optional reminders.

---

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Configure OAuth, LLMs, and the database in [Environment variables](#environment-variables).

## Environment variables

### Authentication (Google + Auth.js)

Sign-in uses **next-auth** (Auth.js v5 beta) with **Google** OAuth. Protected routes: `/dashboard`, `/interview`, `/resume`, `/linkedin`. Public: `/`, `/signin`, `/api/auth/*`.

| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` | Required in production. Generate with `openssl rand -base64 32`. |
| `AUTH_URL` | Site origin, e.g. `http://localhost:3000` (used for OAuth callbacks). |
| `AUTH_GOOGLE_ID` | Google OAuth client ID. |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret. |

In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), set **Authorized redirect URI** to `{AUTH_URL}/api/auth/callback/google` (e.g. `http://localhost:3000/api/auth/callback/google`).

**`DATABASE_URL`:** If **unset**, sign-in uses **JWT** only (no Prisma adapter, no `User`/`Account` tables). If **set**, the Prisma adapter runs on the Google callback and **requires** Auth.js tables (`User`, `Account`, …). Apply the schema first (`npx prisma db push` or `migrate dev`); otherwise the callback fails with `error=Configuration` / `AdapterError` (e.g. “table … Account does not exist”).

After changing the Prisma schema, run:

```bash
npx prisma migrate dev --name auth
```

(or `npx prisma db push` for a quick dev sync).

### LLM (required for AI routes)

All AI HTTP routes (`/api/interview`, `/api/score`, `/api/resume`, `/api/linkedin`, `/api/history`, `/api/interview/transcribe`, `/api/interview/tts`, `/api/interview/speech-capabilities`) require a **signed-in user** (session cookie). Unauthenticated requests receive **401**.

Configure **at least one** provider key. Optional `LLM_PROVIDER` forces a specific backend (`openai`, `groq`, or `anthropic`). When unset, resolution order is **OpenAI → Groq → Anthropic** based on which key is present.

| Variable | Used when |
|----------|-----------|
| `LLM_PROVIDER` | Optional. `openai` \| `groq` \| `anthropic` |
| `OPENAI_API_KEY` | OpenAI (default when set) |
| `OPENAI_BASE_URL` | Optional (e.g. Azure OpenAI-compatible gateway) |
| `LLM_MODEL_OPENAI` | Optional (default `gpt-4o-mini`) |
| `GROQ_API_KEY` | Groq |
| `GROQ_BASE_URL` | Optional (default `https://api.groq.com/openai/v1`) |
| `LLM_MODEL_GROQ` | Optional (default `llama-3.3-70b-versatile`) |
| `ANTHROPIC_API_KEY` | Anthropic Claude |
| `LLM_MODEL_ANTHROPIC` | Optional (default `claude-haiku-4-5-20251001`) |

Groq uses the official **OpenAI-compatible** HTTP API via the same `openai` npm client (`baseURL` + Groq key). Anthropic uses `@anthropic-ai/sdk`.

### Speech (optional, interview page)

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Required for **TTS** (`/api/interview/tts`). Also enables **Whisper** transcription when set (preferred STT path). |
| `OPENAI_BASE_URL` | Optional; forwarded to OpenAI client for STT/TTS when using OpenAI. |
| `GROQ_API_KEY` | Used for **Whisper** transcription when OpenAI is not configured (`/api/interview/transcribe`). |
| `GROQ_BASE_URL` | Optional (default `https://api.groq.com/openai/v1`). |
| `SPEECH_TRANSCRIBE_MODEL_OPENAI` | Optional (default `whisper-1`). |
| `SPEECH_TRANSCRIBE_MODEL_GROQ` | Optional (default `whisper-large-v3-turbo`). |
| `SPEECH_TTS_MODEL` | Optional (default `tts-1`). |
| `SPEECH_TTS_VOICE` | Optional OpenAI voice (default `alloy`). |

### Database (optional)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string for Prisma |

**Not required** for OAuth-only mode: if `DATABASE_URL` is unset, [`lib/prisma.ts`](lib/prisma.ts) skips the database; Auth.js still issues **JWT** sessions without persisting users.

**Set `DATABASE_URL` when you want:**

- Prisma adapter persistence for **User** / **Account** (recommended for production)
- `npx prisma migrate dev` / `db push` against a real Postgres instance
- Dashboard interview history from `GET /api/history` (scoped to the signed-in user)
- Optional persistence of scores / resume / LinkedIn analyses from API routes (includes `userId`)

Use your host’s Postgres URL (often with `?sslmode=require` for managed providers).

#### Prisma Postgres / `prisma bootstrap`

The CLI command `prisma bootstrap --api-key … --database …` is for **Prisma’s control plane** (create/link a workspace database). It is **not** read by FalconHire at runtime.

After bootstrap, Prisma gives you a **direct Postgres URL** (often `postgres://…@db.prisma.io:5432/…?sslmode=require`). That string is what you use as:

```bash
DATABASE_URL="postgres://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
```

**How FalconHire uses it**

1. [`prisma/schema.prisma`](prisma/schema.prisma) — `datasource db { url = env("DATABASE_URL") }` so Prisma Client and migrations target that database.
2. [`lib/prisma.ts`](lib/prisma.ts) — `getPrisma()` returns a singleton `PrismaClient` when `DATABASE_URL` is set, or `null` when it is unset (AI routes still work).
3. **Next.js** — load the variable from `.env` / `.env.local` in development, or from your host’s environment (e.g. Vercel **Environment Variables**) in production. Do **not** commit real URLs or API keys.

**First-time schema on the new database** (from project root, with `DATABASE_URL` exported or in env):

```bash
npx prisma migrate dev --name init
```

If you prefer to push the schema without migration history:

```bash
npx prisma db push
```

Then restart `npm run dev` so `getPrisma()` picks up the client against the live DB. Dashboard history (`GET /api/history`) and optional API writes use the same connection.

## Scripts

- `npm run dev` — development server
- `npm run build` — `prisma generate` + production build
- `npm run lint` — ESLint
