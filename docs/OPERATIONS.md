# Operations — env, deploy, transferability

## Env vars (Vercel project settings; never committed)
| Var | Purpose | Notes |
|---|---|---|
| ~~`ANTHROPIC_API_KEY`~~ · ~~`ANTHROPIC_MODEL_NARRATION` / `ANTHROPIC_MODEL_PREMIUM`~~ | **unused since 2026-09-23** (owner ruling BA-10: templates only). Every model route and narrator was deleted and `src/app/no-model-text.test.ts` fails the build if one returns | safe to delete from the Vercel project; nothing reads them |
| `NEXT_PUBLIC_BASE_URL` | share/OG absolute origin | required for correct unfurls |
| `PAYMENTS_PROVIDER`, `DODO_PAYMENT_LINK`, `DODO_API_KEY`, `DODO_MODE` | MoR checkout (spec §24) | unconfigured → 501 + dev-unlock in non-prod |
| `NEXT_PUBLIC_VOICE_AB` | §26 voice experiment gate | dormant |

## Env self-check (added 2026-07-16, brief §3.A2)
`GET /api/health` → `{ ok, missing, env: {var: boolean}, poolVersion }` — presence booleans only, never values. `ok: false` = the D6 pipe is dark. Missing analytics env also warns at build time (next.config.ts) and shows a dev banner (EnvBanner). **Verified live in prod 2026-07-16:** PostHog key present in the deployed bundle; capture requests return 200.

## Deploy
Push to `main` → Vercel auto-deploy. Pre-deploy gate: `npm run build` + `npx vitest run` green. Card-route font tracing per spec §19.D.

## Transferability flags (diligence)
- **Dodo account is personal** (mainland-China founder constraint, spec §24). Buyer path: their own MoR/Stripe behind the provider-agnostic adapter (`src/lib/payments/`).
- **Vercel + GitHub on personal accounts**; repo transfer + env re-entry is the whole migration.
- **Domain not owned** — `NEXT_PUBLIC_BASE_URL` is the only binding (spec §19.C). "Vibe Check" name is generic/contested (spec §23.A) — treat brand as replaceable.
- **Key rotation:** none needed — the site holds no model key since 2026-09-23 (BA-10).

## Analytics events (Vercel Hobby workaround)
Vercel WA **custom events are Pro-only** — on Hobby, `track()` events are invisible (pageviews only). Second sink: **PostHog free cloud** (1M events/mo, funnels UI), SDK-free via the capture API in `src/lib/analytics.ts`. Setup (once, ~5 min): create a free PostHog account (US cloud) → Project Settings → copy the **Project API key** → add to Vercel env as `NEXT_PUBLIC_POSTHOG_KEY` (+ `NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com` only if you chose EU) → redeploy. No key = silent no-op. Diligence note: PostHog account is personal — list alongside Vercel/Dodo for transfer.
