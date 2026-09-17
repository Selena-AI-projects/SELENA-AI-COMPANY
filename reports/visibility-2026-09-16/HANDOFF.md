# Selena Visibility website — implementation handoff

16 September 2026, Wednesday · task started 16:33 Asia/Tashkent.

**Status: LOCAL WEBSITE ACCEPTANCE PASS within the Chromium checks documented below.** Full unit suite and actual desktop/mobile browser checks are now complete. Seven components received evidence-driven UI fixes. Changes are local and uncommitted on top of the implementation SHA; this is not a production release, cross-browser certification or activation of any gated product capability.

Continuation started 16 September 2026, Wednesday, 18:24 Asia/Tashkent. The earlier environment blockers are retained below only as historical evidence.

CONTEXT_MODE: repository_only, explicitly authorized by the owner in this task. The immutable owner specification is `SELENA_VISIBILITY_WEBSITE_FINAL_IMPLEMENTATION_TZ_2026-09-16.md`. Repository evidence and the pre-edit claim matrix are in [PREFLIGHT.md](PREFLIGHT.md).

## A. What changed — file by file

| File | Change |
| --- | --- |
| `app/(en)/visibility/page.tsx` | Hospitality sales composition, commercial metadata, preserved hreflang and Organization/WebSite/Service graph; existing verification loop reused once under methodology disclosure |
| `components/visibility/DiscoverySales.tsx` | Approved conversion sequence, labelled measurement/Telegram demos, two monitoring cards, human audit, terms before manual booking, two complete sample Action Plan cards, DIY/execution choice, 90-day managed offer, methodology, illustrative case, FAQ and final CTAs |
| `lib/visibility/sales.ts` | Central EN sales copy, EN/RU paid-plan adapter, system classes, exact audit terms and localized manual-intake copy |
| `lib/visibility/activation.ts` | Fail-closed publication gates: recurring, Telegram, payments, client proof and materiality remain off; Local Maps PARTIAL, Local AI MANUAL_ONLY |
| `lib/commercial-facts.ts` | Versioned canonical commercial names/descriptions; USD prices unchanged |
| `lib/visibility/content.en.ts` | New hero/FAQ and shared pricing data; explicit free-readiness boundary; gated recurring copy |
| `lib/visibility/content.ru.ts` | Same commercial ladder and activation boundaries for RU pricing, preserving the rest of RU content |
| `lib/data/homepage.ts` | Hospitality teaser, shared four paid offers; removed weekly activation/arithmetic claims and production-portal implication |
| `lib/data/homepage-ru.ts` | Same shared offers and recurring/portal corrections in RU |
| `lib/visibility/sample-report-data.ts` | Sample report commercial routing uses the same adapter; removed stale $399 arithmetic |
| `app/(ru)/ru/visibility/page.tsx` | Localized manual early-access, audit-terms and managed-application anchors so RU CTA destinations resolve |
| `components/visibility/VerificationCycleSection.tsx` | Explicit EN/RU preview warning before the existing seven-stage sample workflow |
| `components/visibility/PricingTracks.tsx` | Corrected heading levels and tagged plan CTAs for analytics |
| `lib/visibility/routes.ts` | Hard-closes known staging portal links; an environment flag cannot alone declare that hostname production |
| `components/visibility/LiveReportView.tsx` | Applies the same portal gate to the post-readiness authenticated free-check handoff; the readiness engine and result remain unchanged |
| `lib/structured-data.ts` | Inactive paid Visibility checkout no longer publishes purchasable Offer markup; free readiness and separate AI Automation schema preserved |
| `lib/diagnostics/analytics.ts` | Adds provider-neutral `visibility_cta_click` and `visibility_section_view` events |
| `components/analytics/PublicEventTracker.tsx` | All required CTA distinctions, actual pricing/terms visibility via IntersectionObserver, bounded action/section properties only; no customer/report payloads or new transport |
| `tests/unit/discoverySales.test.ts` | 12 acceptance tests covering free entry, plan scope, evidence separation, manual Local AI, delivery gates, audit/terms, managed scope, fictional proof, materiality, shared copy, routing and schema |
| `tests/unit/analyticsEvents.test.ts` | Updated approved event dictionary |
| `tests/unit/clientPortalFlag.test.ts` | Fail-closed staging gate, including readiness-result handoff |
| `tests/unit/commercialFacts.test.ts` | Approved commercial names in shared report routing |
| `tests/unit/seoStructuredData.test.ts` | Only free Visibility Offer is published while payment is off |
| `tests/unit/visibilityContentV12.test.ts` | Replaces superseded names and answer-count assumptions with the owner-approved scope; other readiness/route guards retained |
| `scripts/verify-discovery-html.py` | Production-prerendered HTML checks for 10 routes, internal CTA destinations, anchors, canonical/hreflang, parseable schema, heading structure and mandatory copy |
| `reports/visibility-2026-09-16/PREFLIGHT.md` | Three-repository inspection and claim/source matrix |
| `reports/visibility-2026-09-16/HANDOFF.md` | This handoff, including limitations and open activation gates |

The main sales page has no AI Automation sales section. Existing global navigation/footer and the pricing page's separate AI Automation offers remain intact.

### Acceptance fixes in this continuation

| File | Demonstrated defect and fix |
| --- | --- |
| `components/landing/B2BHomeLanding.tsx` | Long CTA labels forced/clipped the paid ladder on 320–390px; RU package cards caused a 4px page overflow at 320px; hero buttons exceeded 768px row space. Allow wrapping and zero-minimum grid tracks, wrap package badge/header, remove fixed minimum copy width. The existing five-stage tracker now uses two columns at tablet width and five at desktop to avoid text collisions. |
| `components/layout/Header.tsx` | Dark wordmark/menu disappeared over EN/RU Visibility dark heroes. Reuse the existing light header treatment on these two paths; retain the light-background treatment after scrolling/menu opening. Active link uses the existing copper token over the dark hero. |
| `components/visibility/VisibilityHero.tsx` | RU primary CTA text clipped inside its pill. Allow multiline labels and wrap the CTA row. |
| `components/visibility/VisibilityCheckForm.tsx` | Submit text contrast was 3.22:1. Use existing copper-deep/copper-deeper button tokens. Readiness logic is unchanged. |
| `components/forms/EnglishContactForm.tsx` | Same 3.22:1 submit-button defect; use the existing accessible darker tokens. Validation/submission logic unchanged. |
| `components/forms/ContactForm.tsx` | Same submit-button contrast correction for RU. |
| `components/visibility/VerificationLoopReport.tsx` | RU demo-delivery attempt row overflowed its 320px container; stack time/result on mobile, preserve horizontal layout from sm. No delivery or measurement contract changed. |

Only existing CSS utility classes and the header tone predicate changed. No new dependency, content rewrite, price or runtime change. Existing design tokens/fonts were preserved. DESIGN.md and the older numbered source files named by AGENTS.md are absent; current implementation, PRODUCT.md (subject to the locked TZ) and global UI standard were read instead. React checklist review found no added hooks, requests, client state or dependency changes.

## B. Intentionally unchanged

- No edits to measurement contracts, provider adapters, Local/Ask Maps policy or Selena OS runtime.
- No provider calls, production database mutations, migrations, domain movement, paid services or live payment activation.
- No client identities, screenshots or measured client values added to proof. Demo businesses/values are explicitly fictional.
- No API/consumer blending, universal visibility score, causal improvement claim or ranking/revenue guarantee.
- No noise-band/two-consecutive-cycle rule implemented in the measurement engine or claimed as live.
- Existing Public Readiness crawler/report/recheck logic preserved. Its optional CTA into the known staging portal is hidden.
- No new package dependency or package-lock changes. No rewritten AGENTS.md, CLAUDE.md, hooks, skills or project configuration.
- No analytics provider configured. The repository's existing analytics stub remains a stub; event instrumentation is not proof of event delivery.
- No push, PR, merge or deployment. Repository-only code and a local static preview are not production delivery.

## C. Tests and exact commands

Verification ran in `/private/tmp/selena-website-verification-20260916`, a copy of this checkout excluding `.git`, `node_modules`, `.next` and secret/env files, with unchanged package.json/package-lock.json. The source checkout remains `/Users/msnigmatullaeva/Downloads/selena AI company/selena-website-implementation`.

The initial workspace dependency install was blocked by `EPERM` removing npm's temporary node_modules directories. A clean temporary directory and separate cache worked; no system permissions were changed.

| Command | Result |
| --- | --- |
| `npm ci --ignore-scripts --cache /private/tmp/selena-website-npm-cache` | PASS in temporary verification directory |
| `npm run lint` | PASS: 0 errors, 4 existing warnings |
| `npm run typecheck` | PASS: 0 TypeScript errors |
| `npm test` | PASS on the final UI sources: 310 tests, 310 passed, 0 failed/skipped. Run with approved expanded execution so loopback fixtures can listen. Earlier 274/310 result is superseded. |
| Targeted command below (initial implementation) | PASS: 83 tests, 0 failures; final full suite also covers these tests |
| Impeccable detector on the seven continuation files | PASS: `[]`, zero findings; exact arguments in `acceptance-final-gates.json` |
| `npm run build` | PASS: 75/75 pages generated |
| `python3 scripts/verify-discovery-html.py /private/tmp/selena-website-verification-20260916` | PASS: 191 checks, 0 failures across 10 production-prerendered routes; not a browser test |
| `git diff --check` | PASS |

```sh
node --import tsx --test tests/unit/discoverySales.test.ts tests/unit/visibilityContentV12.test.ts tests/unit/verificationCycle.test.ts tests/unit/commercialFacts.test.ts tests/unit/clientPortalFlag.test.ts tests/unit/freeAiVisibilityHandoff.test.ts tests/unit/analyticsEvents.test.ts tests/unit/seoStructuredData.test.ts tests/unit/navigationLinks.test.ts tests/unit/localizedRoutes.test.ts

/Users/msnigmatullaeva/.agents/skills/impeccable/scripts/impeccable detect --json 'components/visibility/DiscoverySales.tsx' 'components/visibility/PricingTracks.tsx' 'components/visibility/LiveReportView.tsx' 'components/visibility/VerificationCycleSection.tsx' 'app/(en)/visibility/page.tsx' 'app/(ru)/ru/visibility/page.tsx'
```

Warnings: SiteShell's existing `<head>` warning; three existing unused-variable/import warnings in CinematicHero. Next 15 reports `next lint` deprecation. npm install reports seven dependency vulnerabilities (1 moderate, 5 high, 1 critical) in the unchanged lockfile; exploitability was not assessed and dependency upgrades were not added to this copy task. No error was suppressed and no failing fixture test was skipped or rewritten to obtain a pass.

### Reproducible final acceptance commands and evidence

Cwd for quality gates and server: `/private/tmp/selena-website-verification-20260916`.

```sh
npm run lint
npm run typecheck
npm test
/Users/msnigmatullaeva/.agents/skills/impeccable/scripts/impeccable detect --json components/landing/B2BHomeLanding.tsx components/visibility/VisibilityCheckForm.tsx components/forms/EnglishContactForm.tsx components/forms/ContactForm.tsx components/layout/Header.tsx components/visibility/VisibilityHero.tsx components/visibility/VerificationLoopReport.tsx
npm run build
python3 scripts/verify-discovery-html.py /private/tmp/selena-website-verification-20260916
npm run start -- --hostname 127.0.0.1 --port 4316
node '/Users/msnigmatullaeva/Downloads/selena AI company/output/visibility-20260916/browser-acceptance.cjs'
node '/Users/msnigmatullaeva/Downloads/selena AI company/output/visibility-20260916/browser-interactions.cjs'
node '/Users/msnigmatullaeva/Downloads/selena AI company/output/visibility-20260916/browser-contrast.cjs'
node '/Users/msnigmatullaeva/Downloads/selena AI company/output/visibility-20260916/browser-final-details.cjs'
```

Tests, server and Chrome use approved expanded execution; ordinary sandbox loopback still returns EPERM. Browser scripts use the installed Playwright runtime and isolated installed Chrome, not a user browser profile. The bundled Playwright Chromium executable is absent. Computer Use browser inventory still reports `Unable to load browser request-header policy`; it was not bypassed. The standard agent-browser CLI was unavailable, so the installed testing runtime was used. No Terminal UI workaround, external hosting or tunnel was used.

`acceptance-final-*.log` and `acceptance-final-gates.json` record final gate results. `acceptance-source-manifest.json` hashes 490 source files (excluding prohibited secrets/env and the handoff itself), verifies no differences against the temporary copy, and records the UI patch SHA-256. `acceptance-ui.patch` is the exact uncommitted seven-file patch. Browser `*-before.json` files preserve initial findings; `details.json` records the final 50-view pass.

## D. Browser verification

**PASS for the bounded local Chromium acceptance; actual hydrated production build.**

Routes: `/`, `/ru`, `/visibility`, `/ru/visibility`, `/pricing`, `/ru/pricing`, `/check`, `/ru/check`, `/methodology`, `/ru/methodology`.

- 10 routes × 320/375/390/768/1440px = **50 views**. All return 200; no page overflow, unintended offscreen layout or clipped text remains in the final checks. Deliberately scrollable tables/filmstrip remain inside their own scroll containers.
- Browser `pageerror`: **0** in the layout run. One H1, image alt attributes, form label associations and absent staging links confirmed across all 50 views.
- **10/10 mobile menu flows**: opening moves focus into menu, Shift+Tab wraps, Escape closes and restores focus; visible 2px focus outline.
- **16/16 tested CTA transitions**: eight EN sales actions and all four paid offers on EN/RU pricing. Navigation reached the intended route/hash; target sections land about 96px below the viewport top, clear of the fixed header. Static route/anchor checks also pass 191/191.
- **8/8 form cases** at 390/1440px on EN/RU readiness and `/en/contact`, `/contact`: empty required fields show linked errors and focus the first invalid input; after filling name, contact validation focuses contact. No successful submission, message, public-site crawl or provider call was made. Interaction scripts block external destinations and non-GET requests; none were attempted in the required-field tests.
- Solid-background contrast sampling: **1,794 text elements, 0 low-contrast findings** after excluding decorative aria-hidden glyphs. **43 complex/transparent-background cases** were not assigned a numeric pass; screenshots were reviewed. Corrected form buttons use the same accessible token as the shared Button. Visibility header visual contrast is corrected and its light tone is verified on dark heroes.
- Screenshots were captured for desktop/mobile page views and inspected, including Visibility hero/plans/terms, narrow paid cards, readiness, pricing and methodology.

Evidence: output `browser/layout.json`, `browser/interactions.json`, `browser/contrast.json`, `browser/details.json`, screenshots and four saved `.cjs` scripts. `details.json` is the final layout/text verification after all seven-file fixes. Earlier layout/screenshots are intermediate evidence where superseded by final captures.

Limits: Chromium responsive viewport emulation, not real iOS/Android hardware or a Safari/Firefox run. Semantic/keyboard/contrast checks are accessibility sanity checks, not a complete screen-reader or WCAG certification. Readiness backend correctness is covered by the unit suite; no new live external readiness scan or lead delivery was part of browser validation. The old `visibility-static-preview.html` is an initial non-hydrated artifact, not final acceptance evidence.

## E. Claim gate table

| Required gate | Status | Evidence / reason |
| --- | --- | --- |
| Weekly subscription stability test | NOT RUN | No four-week / 5–8-property production stability receipt supplied or generated |
| Weekly recurring production execution | GATED | Marketing preview/early access only; runtime receipt and renewal/cancellation acceptance absent |
| Telegram production delivery | GATED | Synthetic preview; no production delivery receipt. Saved-report, verified-recipient, authenticated-link and no-duplicate-measurement boundaries stated |
| $79 Local Maps production scope | PARTIAL | OS 4e4aaff INTEGRATION_STATUS documents owner/report flow; new-customer/paid execution incomplete; availability qualified per scope |
| Ask Maps / Local AI | MANUAL_ONLY | Contract 03fb41a local-discovery.ts blocks automated execution, scraping and API calls |
| Live checkout/payment | OFF | Catalog metadata; manual inquiry/application used; paid Offer schema withheld |
| Customer portal hostname | STAGING | OS status explicitly identifies app.selenasystems.com as staging; public portal links gated |
| $399 booking/order path | MANUAL | Full terms precede existing contact destinations; no automatic reservation/payment or preparation-form workflow claimed |
| $2,490 application/order path | MANUAL | Existing contact destinations with scope, cycles and provider cap agreed before engagement |
| Proof/case-study permission | NOT APPROVED | No written client permission provided; fictional demo only |
| Materiality/noise-band claim | GATED | Rule not implemented/tested in the measurement engine; no live claim published |

## F. Remaining blockers

No remaining environment blocker for the requested local unit/browser acceptance. The original 36 loopback-fixture failures are resolved by the permitted execution context; no test was skipped or rewritten.

Production activation gates in E remain owner/runtime work. They do not block this gated local website implementation, but still block live recurring, Telegram, automated Ask Maps, payment and client-proof claims. No production acceptance, deployment or release approval is implied.

## G. Branch / commit / PR

- Repository: `Selena-AI-projects/SELENA-AI-COMPANY`.
- Branch: `codex/visibility-hospitality-20260916`.
- Base: `f74c142ef851be6b497252df6aac4f4acd356677`.
- Implementation commit SHA: `a280850673e40b70c3b3af69d563dbd473fde14b`. This exported handoff records the exact local implementation commit.
- PR: not created; no `git push` was authorized in this conversation.
- Merge/deploy: not performed.
- Review status: local acceptance complete, ready for owner code review; no merge/release authorization implied.
- Working tree: seven UI files plus this updated handoff are uncommitted. No new commit was created.
- Accepted patch SHA-256: `a7759ac681f0d129acb294d282417bc2193640f61434762a5ca8e22e028e7b99`. This patch plus implementation SHA identifies the tested UI source; the old SHA alone does not include these fixes.


## Acceptance retry — 16 September 2026, 17:33 Asia/Tashkent

Owner authorized continuing the remaining checks. The source commit remains `a280850673e40b70c3b3af69d563dbd473fde14b`, working tree clean. Both ordinary and requested-escalation loopback probes still fail with `EPERM`. Browser inventory again fails with `Unable to load browser request-header policy`. The full suite was not needlessly rerun after its prerequisites failed. Desktop/mobile acceptance is still blocked; HOLD is unchanged. No additional code changes, commit, push, merge or deploy. Machine-readable evidence: `acceptance-retry-1733.json`.

## Acceptance continuation completed — 16 September 2026

The 18:24 Asia/Tashkent continuation supersedes the earlier HOLD: final full unit suite 310/310, lint/typecheck/build/Impeccable pass, HTML 191/191, final browser layout matrix 50/50. All evidence and limitations are in C–D. Historical retry notes above are retained as history, not current status.


---

# Selena Visibility — Messaging Amendment V1

16 September 2026, Wednesday · started 20:23 Asia/Tashkent.

**Status: implemented and verified locally; ready for owner review. Not published.**

Branch: `codex/visibility-competitive-value-20260916`, based on merged main `b55e666069b54a09b371c338fb1ba60d379d1097`. No new commit, push, PR, merge or deployment was performed for this amendment.

## 1. Files changed

| File | Change |
| --- | --- |
| `components/visibility/DiscoverySales.tsx` | Existing sections strengthened: five prominent measurement questions, competitor evidence/action comparison, mobile scenario cards instead of a wide demo table, clear recommendation labels and outcomes in $49/$79, four-level human/automatic/execution comparison before $399. Existing commercial, methodology, terms and contact surfaces retained. |
| `lib/visibility/sales.ts` | Explicit competitor/source/next-action hero promise; shared EN/RU plan descriptions and progression; fictional examples with recommended actions; distinction between automatic suggestions and human-verified priorities. |
| `components/landing/B2BHomeLanding.tsx` | Company-level hero with two visible product destinations and two concise direction summaries. The Visibility ladder is removed from the homepage hero; its existing component remains available to RU Visibility. The workspace free-check CTA still uses Public Readiness. |
| `lib/data/homepage.ts` | EN company hero and the two product descriptions. |
| `lib/data/homepage-ru.ts` | Corresponding RU company hero and product descriptions. |
| `tests/unit/discoverySales.test.ts` | Preserve free-readiness assertions at the free entry, verify both homepage destinations, recommendation inclusion, progression and fictional/non-causal demo evidence. Three new tests. |
| `reports/visibility-2026-09-16/HANDOFF.md` | Append this amendment handoff; original acceptance/release history retained. |

## 2. Exact principal copy

Visibility hero headline is unchanged. New intro:

> Selena measures how your business appears across AI and local discovery, shows which competitors are winning instead, which sources support those answers, and what you should improve next.

The first mechanism section now states **Every paid Selena measurement answers:** and shows WHERE / WHO / WHICH SOURCES / WHAT CHANGED / NEXT ACTION. The fifth question reads **What should you do next?** Changes remain qualified by comparable measurements and the inactive recurring-production gate.

Competitive block headline: **See who is winning the guests you want.**

> Selena doesn't only track your business. It tracks the businesses appearing instead of you across the guest intents that matter.

The demo is labelled **Illustrative demo · fictional businesses and values · not client results**. Each restaurant/villa/spa example has visibility, competitor, evidence and a recommendation. These are explicitly separate fictional scenarios, not one business competing across unrelated categories. A single demo cycle establishes no recurring pattern or change.

| Offer | Visible promise / label | Progression |
| --- | --- | --- |
| $49 | **See what guests see — and what to do next.** / **Automatic recommendations included** | WHERE → WHO → SOURCES → CHANGE → NEXT ACTION |
| $79 | **See the whole competitive discovery landscape.** / **Expanded recommendations included** | AI + LOCAL → COMPETITORS → SOURCES → OPPORTUNITIES → NEXT ACTION |
| $399 | **Human-verified Action Plan** | HUMAN INVESTIGATION → VERIFIED PRIORITIES → ACTION PLAN |
| $2,490 / 90 days | Existing managed scope retained | EXECUTION → MONITORING → RECHECK → ADJUSTMENT |

Explicit text before the paid cards:

> Competitors, sources and automatic recommendations are included in Visibility Snapshot. They are not reserved for the higher-priced Audit.

Bridge headline:

> Every $49 and $79 measurement includes recommendations.

Bridge body:

> But an automatic recommendation is not the same as a verified business decision. The $399 Verified Discovery & Competitive Audit investigates the 3–5 competitors actually beating you: their relevant pages, reviews, Local evidence, citations and important third-party sources. A human analyst challenges Selena’s automatic recommendations and turns the strongest findings into an implementation-ready Action Plan with the owner / GM.

Company hero:

> Get found by AI. Then make your business run better with it.
>
> Two sides of your business. AI Visibility shows who customers find. AI Automation improves how your team works.

CTAs: **Explore AI Visibility** → `/visibility`; **Explore AI Automation** → `/ai-systems`. RU: **Пусть AI находит ваш бизнес. И помогает ему работать лучше.** with separate `/ru/visibility` and `/ru#ai-systems` destinations. Both actions are visible in the inspected 390px first viewport; no claim of a timed user comprehension study is made.

All relevant EN/RU copy is exported in `exact-copy.json`; `changes.patch` contains the exact source diff.

## 3. Screenshots and preview

Local production preview, running on this Mac:

- http://127.0.0.1:4326/visibility
- http://127.0.0.1:4326/
- http://127.0.0.1:4326/ru

Screenshots in the output `browser/` directory:

- `visibility-1440-header-final.png`, `visibility-390-header-final.png` — desktop/mobile Visibility hero.
- `visibility-1440-competitors.png`, `visibility-390-competitor-example.png` — comparison and readable mobile example.
- `visibility-1440-progression.png`, `visibility-390-progression.png` — automatic/human/execution distinction.
- `home-1440-viewport.png`, `home-390-viewport.png`, `ru-390-viewport.png` — two-direction company hero.

The preview is local, not a public deployment. Screenshots are actual Chrome captures of the production build.

## 4. Verification

Cwd: `/private/tmp/selena-website-verification-20260916`. Only the six changed source files were synchronized from the canonical checkout. Their hashes are recorded in `source-manifest.json`; dependencies are unchanged.

| Command / check | Result |
| --- | --- |
| `npm run lint` | PASS: 0 errors, same 4 existing warnings |
| `npm run typecheck` | PASS |
| `npm test` | PASS: 313/313, 0 skipped/failed |
| `/Users/msnigmatullaeva/.agents/skills/impeccable/scripts/impeccable detect --json components/landing/B2BHomeLanding.tsx components/visibility/DiscoverySales.tsx` | PASS: 0 findings |
| `npm run build` | PASS: 75/75 pages |
| `python3 scripts/verify-discovery-html.py /private/tmp/selena-website-verification-20260916` | PASS: 175/175 dynamically enumerated HTML/route checks; fewer duplicated homepage links than the previous hero |
| `git diff --check` | PASS |
| Actual Chrome layout | 10 routes × 320/375/390/768/1440px: 50/50 pass, no horizontal page overflow or clipped text |
| Browser errors / semantics | 0 pageerror events; H1, alt, labels and staging-link checks pass |
| Existing navigation/form flows | 10 menu/focus flows, 16 offer CTA transitions, 8 validation cases; no messages submitted |
| New company navigation | 4/4 EN/RU product destinations reached |
| New messaging visibility | Recommendation labels present; competitors section precedes pricing at 390/1440px |
| Solid-background text contrast | 1,785 samples, 0 low-contrast findings; 43 complex-background cases not numerically certified |

Four existing lint warnings: SiteShell `<head>` usage and three unused CinematicHero symbols. The existing Next lint deprecation is unchanged. No dependencies, hooks or configuration were modified. React review: no new client state, hooks, fetches, dependencies or hydration logic.

One first screenshot/DOM pass timed out waiting for `networkidle` on a video page. The complete retry waits for DOM, H1 and fonts; it passes. The independent full clipping matrix and navigation/contrast runs also pass. This was a test wait adjustment, not an application workaround. These are Chromium responsive checks, not Safari/Firefox, physical-device or full screen-reader certification.

Exact gate commands/results: `gates.json`; browser scripts and JSON evidence are next to this handoff. `final-question.json` verifies the final fifth-question copy and width at all five breakpoints after the final rebuild.

## 5. Prices and contracts

Unchanged: free Public Readiness; $49/$79/$399/$2,490; 90 days; 60-minute session; all EN/RU audit terms; included comparable recheck; Visitor/API separation; Local Maps verification boundary; Ask Maps MANUAL_ONLY; subscriptions/Telegram early-access gates; legal seller/payment state; route architecture; measurement/backend contracts. `locked-boundaries.json` records equality checks. Commercial-facts, activation and routes files are byte-identical to base; both audit-terms arrays are identical.

## 6. Runtime / marketing conflicts

No new runtime capability was introduced or claimed. Patterns and change require comparable observations; Local coverage remains qualified and Ask Maps manual. The supplied mixed-vertical demo was explicitly separated into fictional scenarios to avoid implying that one business competes in restaurant, villa and spa categories.

Live-state mismatch remains: a separate public HTTP check returned the old homepage H1 **When customers ask AI, is your business in the answer?** and Visibility H1 **AI visibility you can verify.** (`public-state.json`). This amendment has not been published. Earlier Git merge and local green checks are not hosted proof; the Vercel publication access/integration issue is not resolved by these copy changes.

## 7. Owner-review result

Review the local preview and desktop/mobile screenshots above. The implementation is ready locally on the new branch; production is unchanged. No additional service, competitor product or recommendations product was created.


---

# Homepage two-product amendment + locked Local entitlement boundary

16 September 2026. Local owner-review preview; changes are uncommitted on `codex/visibility-competitive-value-20260916`, based on `b55e666`.

## Files changed in this follow-up

- `components/landing/B2BHomeLanding.tsx`: dedicated `CompanyHomeLanding`, using existing typography, colors, Button and owned repository images. Two equal hero descriptions/CTAs, two product doors, four shared principles, neutral industry strip and final product choice. Retains the detailed legacy component/data; those sections no longer render on `/` or `/ru`. Manual Ask Maps detail is excluded from the compact RU Visibility hero ladder.
- `app/(en)/page.tsx`, `app/(ru)/ru/page.tsx`: render the company homepage and use non-sequential company metadata; hreflang pairs preserved.
- `lib/data/homepage.ts`, `lib/data/homepage-ru.ts`: approved hero copy, descriptions, outcomes, audiences, principles and final choice. EN navigation now says Approach and targets the real `/#approach` section instead of a removed proof anchor.
- `components/layout/Header.tsx`: light-header treatment on the new light homepages; no Book AI Audit button above the two product choices on homepages. Product-page header behavior retained.
- `components/visibility/DiscoverySales.tsx`: remove Ask Maps and Local AI from the EN hero/system list; $79 automated Local scope; $399 human competitive investigation wording; detailed automated-plan boundaries.
- `lib/visibility/sales.ts`: apply the locked entitlement boundary to EN/RU plans, audit details, managed scope, FAQ and outcome descriptions. `MANUAL_ONLY` is a method, not subscription entitlement.
- `lib/commercial-facts.ts`: update only the $79 marketing descriptions. All other facts including prices, currency, IDs, names, seller facts and public state compare equal after excluding description fields.
- `lib/visibility/content.en.ts`, `lib/visibility/content.ru.ts`: pricing summary and RU FAQ explicitly distinguish automated subscriptions from human investigation.
- `tests/unit/discoverySales.test.ts`: verify the company choice and manual/automated boundary in both languages; replace the superseded expectation that manual Ask Maps is inside $79.
- `scripts/verify-discovery-html.py`: assert the new boundary by actual HTML section; expand checks to all internal links/anchors on the checked pages.
- `reports/visibility-2026-09-16/HANDOFF.md`: append this handoff. Existing history is retained; this LOCKED boundary supersedes earlier statements that included manual Ask Maps in $79.

## Before / after homepage hero

Merged-main hero: **When customers ask AI, is your business in the answer?** The earlier local draft was **Get found by AI. Then make your business run better with it.** Both are replaced.

New eyebrow: **AI VISIBILITY + AI AUTOMATION**

New headline: **AI for how customers find you — and how your business runs.**

New subheadline: **Selena Systems works on both sides of growth.**

AI Visibility: **See where customers discover your competitors instead of you, which sources influence those recommendations, and what to improve next.**

AI Automation: **Turn repetitive work across sales, operations, content, knowledge and customer communication into practical AI-supported workflows.**

Both CTAs use the same component variant/classes and equal visual hierarchy. On mobile, each description is followed by its own CTA, in the requested Visibility → Automation reading order. At 390×900, both products and both CTAs fit in the first viewport. This is observed layout evidence, not a timed ten-second usability study.

## CTA destinations

| Locale | Visibility | Automation |
| --- | --- | --- |
| EN | `/visibility` | `/ai-systems` |
| RU | `/ru/visibility` | `/ai-automation` |

There is no existing `/ru/ai-systems` counterpart. RU therefore uses the existing Russian Automation page instead of inventing a route or navigating back to the homepage card. The existing `/ru#ai-systems` menu anchor still resolves to that card.

## Content removed from the homepage surface

The homepage no longer renders the full Visibility ladder, workspace demo, measurement filmstrip, sequential product-switch banner, full Automation problem/solution/Sprint/process/tracker/pricing sequence, old project-metric block, Lab teaser or one-sided final Audit CTA. Useful source components and data are retained. `/ai-systems`, its four offer destinations and existing Automation scope/timeline/handover content remain unchanged and are reached through the Automation door. No new product-page architecture was introduced.

No invented Selected Real Proof section was added. The existing homepage project-metric block was not carried over as verified customer evidence without supporting receipts. The shared block states principles; the industry strip says **Hospitality & Experience focus**, not Trusted by. Existing portfolio/operating-range pages are unchanged. This is the one deliberate conditional omission from the requested final flow.

The supplied concept was used for hierarchy, not as a bitmap or a brand replacement. Existing ivory/charcoal/copper colors and Commissioner/Cormorant typography remain. The two existing repository illustrations were reused; no external image, logo or testimonial was added.

## LOCKED tariff boundary

- **$49**: ChatGPT, Gemini, Perplexity; measurement, competitors, comparison, sources and recommendations.
- **$79**: everything in $49 plus separate API/model systems and Google Maps / Local Visibility **only where production-capable automated measurement is verified**. No manual Ask Maps / Local AI entitlement.
- **$399**: human competitive investigation, including **Includes manual Google Ask Maps / Local AI investigation where relevant**, the 60-minute session and verified Action Plan.
- **$2,490 / 90 days**: agreed implementation and automated-surface monitoring; manual baseline/check/recheck only if explicitly included in the agreed scope, not a weekly automatic Ask Maps promise.

EN/RU pricing, detailed offer copy, FAQ and compact ladder use this boundary. Ask Maps/Local AI are absent from both Visibility heroes. Hero note is **Local Discovery where verified.** The $79 scope line is **Expanded AI + Google Maps / Local Visibility where automated measurement is verified.** The $399 ladder says **Human competitive investigation + Action Plan**.

## Verification

Source hashes and temporary-copy equality are in `source-manifest.json`. Cwd for build/test: `/private/tmp/selena-website-verification-20260916`.

| Check | Result |
| --- | --- |
| `npm run lint` | PASS, 0 errors / 4 pre-existing warnings |
| `npm run typecheck` | PASS |
| `npm test` | 314/314 PASS, 0 failed/skipped |
| Impeccable changed TSX targets | 0 findings; exact command in `gates.json` |
| `npm run build` | PASS, 75 pages |
| `python3 scripts/verify-discovery-html.py /private/tmp/selena-website-verification-20260916` | 344/344 PASS |
| Chrome 10 routes × 320/375/390/768/1440px | 50/50; no overflow/clipped text; 0 pageerrors |
| Real CTA navigation | 4/4 EN/RU product destinations reached |
| Entitlements in rendered UI | Both heroes contain no Ask Maps/Local AI; $79 cards contain no manual surface; $399 cards/details contain manual research |
| Equal homepage CTAs | Same classes; exactly two primary product CTAs; no tariff amounts/8 systems/25 questions in hero |
| Solid-background contrast | 1,374 samples, 0 low-contrast findings; 33 complex cases not numerically certified |
| `git diff --check` | PASS |

Warnings remain SiteShell `<head>` and three unused CinematicHero symbols. The unused CinemaLoop import introduced by the earlier local amendment was removed. An initial import-path error and an outdated hero-copy test were corrected; the final gates above pass. The old HTML expectation for manual observation was replaced by stronger section-level entitlement checks, not suppressed.

Price/contract verification: activation flags and routing contracts are byte-identical to base; both EN/RU audit-terms arrays are identical; commercial facts excluding marketing descriptions compare equal. `/ai-systems` page source is unchanged. No payment, DB, provider, recurring/Telegram activation or backend mutation occurred. Homepage changes and the separate owner-approved tariff-boundary correction are distinct scopes.

Limits: local production build in isolated Chrome; no Safari/Firefox or physical-device certification; no timed user study, live payment, external readiness scan or message delivery. Production is not updated by this preview.

## Owner preview / screenshots

- Local homepage: http://127.0.0.1:4326/
- Russian homepage: http://127.0.0.1:4326/ru
- Visibility: http://127.0.0.1:4326/visibility
- Desktop: `home-full-1440.png` and `home-1440.png`
- Mobile: `home-full-390.png` and `home-390.png`
- Locked ladder: `visibility-ladder-desktop.png`

The preview remains running on this Mac. No commit, push, PR or deployment was performed for these latest amendments.
