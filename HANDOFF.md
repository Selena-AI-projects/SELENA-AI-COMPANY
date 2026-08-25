# Handoff — Selena Systems

Written 25 August 2026. Start here when opening a fresh session on either
repository. It says what the product is, where everything runs, what is done,
what is not, and what to do next.

Owner: Selena (`parkourcafe@gmail.com`). She is not a developer, works by voice,
and is based in Bali (UTC+8, `TZ=Asia/Makassar`). Do the work rather than
handing back instructions; when something genuinely needs her — a Railway
variable, a provider account, a DNS record — say exactly what to click and why.

## The product

Selena Systems sells **AI visibility measurement**: where a business shows up
when a person asks ChatGPT, Gemini or Perplexity for a recommendation, who gets
named instead, and what to change about it.

Two things are sold, and they are different observations that are never averaged
together:

- **Visitor View** — what a person is actually shown on a live surface. Measured
  through Bright Data collectors. The $49 plan: 3 surfaces, 25 questions, 300
  answers a month.
- **API View** — the model answering from its own knowledge, no web search.
  Measured through OpenRouter. Part of the $79 plan: both channels, 8 systems,
  800 answers a month.

Above that sit implementation services (AI Sprint, AI Automation). The free
entry point is a real technical readiness check on the site — it crawls the
submitted site and reports what it measured. It calls no AI provider and never
claims to.

The honesty rules are the product, not decoration: never invent clients, cases,
numbers, testimonials or integrations; state the measurement window next to
every number; say what a number does not prove.

## The two repositories

| | `parkourcafe/SELENA-AI-COMPANY` | `parkourcafe/selena-ai-visibility` |
|---|---|---|
| What | Public site: marketing, free check, projects journal | The measurement app and its worker |
| Stack | Next.js 15 App Router, TypeScript, Tailwind v4 | pnpm + Turborepo, Node 24, TanStack Start, Drizzle, pg-boss |
| Runs on | Vercel, deploys from `main` | Railway, `docker/Dockerfile`, services `web` and `worker` |
| Database | none in the request path | Postgres on Railway |
| Integration branch | `main` | **`release/selena-visibility-mvp`**, not `main` |
| Read first | `CLAUDE.md`, `PRODUCT.md` | `AGENTS.md`, `SELENA_OWNER_OPERATING_GUIDE.md`, `HANDOFF.md` |
| Checks | `npx tsc --noEmit`, `npm test`, `npm run lint`, `npm run build` | `pnpm test`; CI is the default validation |

Domains: `www.selenasystems.com` is the site, `app.selenasystems.com` is the app.

The app is a fork of **Elmo**, an open-source AI visibility platform. Everything
Selena-specific is `sv_` in the database and `selena-` in file names; the Elmo
product underneath is still present and still builds. Do not delete it.

## Services in use

- **Vercel** — the site. Auto-deploys from `main`.
- **Railway** — the app: `web`, `worker`, and Postgres. Environment variables
  are set per service, so a variable both need must be set twice.
- **Bright Data** — Visitor View. Three scrapers (ChatGPT, Gemini, Perplexity),
  billed per answer. Measured price: $1.50 per 1000 → $0.0015 an answer.
- **OpenRouter** — API View. Measured price: $0.00171 an answer.
- **Telegram** — where the site's lead forms deliver
  (`LEADS_TELEGRAM_BOT_TOKEN`, `LEADS_TELEGRAM_CHAT_ID`).
- **GitHub Actions** — the measurement and reporting jobs that cannot run from a
  laptop. Secrets: `OPENROUTER_API_KEY`, `GOOGLE_SERVICE_ACCOUNT_JSON`.
- **Google Search Console** — the journal's click and impression numbers.
- **Supabase** — client files and migrations exist in the site repository, and
  nothing imports them. It is scaffolding, not a live dependency. Do not
  describe the site as running on Supabase.

## Where things stand

**Working:**

- The site, its free readiness check, and the projects journal at `/ru/projects`
  — seven of the owner's own projects, each with dates, the measurement window
  beside every number, and an honest line about what it does not prove. Two
  third-party Bali businesses (Big Dragon Villas, Chito Bistro) have question
  sets prepared and are deliberately unpublished: a test fails if someone else's
  business appears in the journal without a recorded consent.
- API View: a real paid measurement has run end to end. Cost per answer is
  measured, not estimated.
- The order desk in the app: profile → questions → configuration lock → quote →
  order → recorded test payment → approval → queue.
- Free measurement by promo code (`AUGUST2026`, ends 31 August).

**Not working yet — this is the next job:**

- **Visitor View has never completed a run.** Everything is wired and three
  faults in that exact path were found and fixed on 25 August: the adapter
  attributed evidence to its internal collector key instead of the surface the
  customer bought (so every measurement was silently discarded), the worker
  built the adapter without an extraction resolver, and one adapter name served
  every system of a multi-surface plan. Fixed and tested — but no run has proven
  it end to end.
- Automatic start of free orders is **built and switched off**
  (`SELENA_FREE_AUTO_DISPATCH_ENABLED`), and stays off until one Visitor View
  run succeeds by hand. Turning it on first means the first customer gets an
  automated failure.

## What to do next, in order

1. Set the Railway variables below and redeploy both app services.
2. Run **one** measurement by hand from `/app/selena-admin` and read the result.
3. If it produces real numbers: turn on `SELENA_FREE_AUTO_DISPATCH_ENABLED` on
   the `web` service. Clients then get their answer without anyone clicking.
4. If it does not: the failure reason is on the run row and in `sv_audit_events`.
   The open questions about Bright Data's response shape are listed at the
   bottom of `SELENA_VISITOR_VIEW_BRIGHTDATA_WIRING.md`.

Also open, lower priority: refreshing the journal's numbers automatically from
the weekly Search Console job, and an English version of the journal for the
Australia/New Zealand and US markets.

## Owner variables

Names only — values live in Railway and GitHub, never in a repository.

| Service | Variable | Note |
|---|---|---|
| Railway `worker` | `SELENA_MEASUREMENT_ENABLED` | `true` |
| Railway `worker` | `SELENA_MEASUREMENT_ADAPTER` | `brightdata` — a routing family, see below |
| Railway `worker` | `BRIGHTDATA_API_TOKEN` | the only Bright Data value needed |
| Railway `worker` | `OPENROUTER_API_KEY` | API View only |
| Railway `web` | `SELENA_MEASUREMENT_ENABLED` | `true` |
| Railway `web` | `SELENA_PAYMENTS_ENABLED` | `true` — test mode; live payments are blocked separately in code |
| Railway `web` | `SELENA_PROMO_CODES` | `AUGUST2026` |
| Railway `web` | `SELENA_FREE_AUTO_DISPATCH_ENABLED` | off until a Visitor View run succeeds |
| Vercel | `LEADS_TELEGRAM_BOT_TOKEN`, `LEADS_TELEGRAM_CHAT_ID`, `NEXT_PUBLIC_SITE_URL` | |
| GitHub Actions | `OPENROUTER_API_KEY`, `GOOGLE_SERVICE_ACCOUNT_JSON` | |

`SELENA_MEASUREMENT_ADAPTER=brightdata` (Visitor View) and `=auto` (both
channels) are **families**: they choose the adapter per question, from the
system that question was sold under. A plain name like `brightdata-chatgpt` pins
one adapter for every question, so a three-surface order spends its Gemini and
Perplexity answers on the ChatGPT collector and the result is then refused as
evidence. Paid, and no numbers. Use the family.

## Things that will bite a fresh session

- The container has **no outbound network** except GitHub and Google APIs. It
  cannot reach the sites, Railway, OpenRouter or Bright Data. Anything that
  needs the network runs from GitHub Actions.
- Pull requests in the app repository go to `release/selena-visibility-mvp`.
  Opening one against `main` is rejected.
- Migrations are never run without the owner explicitly asking.
- The app repository enforces pnpm supply-chain controls. If an install fails
  because of them, that is the system working — report it, never weaken them.
