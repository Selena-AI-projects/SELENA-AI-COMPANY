# AGENTS.md

## Project overview

Russian-language website for KORA: AI implementation, AI automation, AI training, AI content systems, AI concierge/bots, AI knowledge bases, and AI-assisted packaging for entrepreneurs, experts, service businesses, and small teams.

## Main goal

Build a clear, premium, practical website that sells AI services without hype, fake claims, fake case studies, or generic “AI future” clichés.

## MVP pages

```text
/
/services
/ai-training
/ai-automation
/ai-content
/about
/contact
```

## Content source files

Before making content or UI decisions, read:

- `docs/01-site-architecture.md`
- `docs/02-homepage-wireframe.md`
- `docs/03-homepage-copy.md`
- `docs/04-services-catalog.md`
- `docs/05-design-system.md`
- `docs/06-seo-and-metadata.md`
- `docs/07-lead-form-brief.md`
- `docs/08-content-qa-checklist.md`
- `docs/09-implementation-tasks.md`
- files in `data/`

## Setup commands

Use the package manager detected in the repository.

Typical commands if available:

```bash
npm install
npm run dev
npm run lint
npm run build
```

If the project uses pnpm/yarn/bun, use the matching commands instead.

## Code style

- TypeScript where possible.
- Clear component names.
- Mobile-first responsive layout.
- Semantic HTML.
- Accessible forms.
- Reusable content sections.
- No unnecessary dependencies.
- No over-engineering.

## Brand voice

Russian copy should be:

- clear;
- confident;
- practical;
- warm but not fluffy;
- direct;
- not corporate;
- not hype-driven.

Avoid:

- “проводник в мир AI”;
- “AI заменит сотрудников”;
- “заработайте на нейросетях”;
- fake urgency;
- fake metrics;
- fake testimonials.

## Testing instructions

Before finishing:

- run lint if configured;
- run typecheck if configured;
- run build if configured;
- check mobile layout;
- check contact form validation;
- check obvious accessibility issues.

## Security and privacy

Do not hardcode private keys, tokens, emails, API credentials, or webhook URLs.

If a form integration is needed but no endpoint is provided, create a safe placeholder and document the TODO.

<!-- ai-standard:start -->
## Autonomous model routing (project only)
- Break each brief into verifiable stages and select helpers autonomously without asking the owner to choose models again.
- The primary agent owns the final result and validates every helper result against evidence and acceptance criteria before use.
- Handle small tasks directly. Use ordinary scripts for calculations, sorting and deterministic validation.
- Use custom agent `routine` for narrow processing of supplied data, fact extraction and preliminary classification under explicit rules; keep final strategy with the primary agent.
- Use custom agent `expert` for difficult bugs, consequential ambiguity, or problems unresolved after a reasoned primary attempt. Supply the evidence and prior attempt.
- Use at most two helpers concurrently. Execute dependent stages sequentially; assign disjoint file ownership before edits. Helpers must preserve others' changes.
- If routine fails validation, the primary fixes or takes over. Escalate remaining difficult problems to expert. After two failed correction/verification cycles on the same problem, stop that branch and report the concrete blocker and needed next action.
- Missing access or source data is a blocker, not a reason to upgrade models. Mark unavailable metrics NO_DATA; never invent sources, statistics or test results.
- Spawn named project custom agents; if unavailable, report it rather than silently replacing a model. For APIs requiring context selection, use fresh/bounded context with a self-contained handoff.
- Model configuration does not authorize publishing, production mutations or changes outside the approved scope.
- For setup verification, overrides and rollback, read `docs/codex-model-routing.md`.
<!-- ai-standard:end -->
