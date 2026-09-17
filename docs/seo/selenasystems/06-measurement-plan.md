# Measurement plan
## Baseline and access
GSC requested: 2026-06-17–2026-09-14 vs 2026-03-19–2026-06-16; actual metrics NO_DATA. Use only the selenasystems.com property, export query/page/country/device for both windows and aggregates separately; pagination and anonymized-query suppression must be disclosed. Store raw private exports under ignored reports/gsc/, not this public PR.
Analytics transport is not configured; event existence is not a conversion baseline. Choose existing approved analytics destination/consent class before wiring. Required funnel: landing view → readiness_start → readiness_complete → qualified inquiry. Registration/purchase remain out of the active funnel until operationally verified. Deduplicate starts/completions per run; exclude staff and QA. Country of search is not business country and RU is not Russia.

## AI measurement protocol
Use ai-prompt-baseline.csv as a versioned set, not generated answers. Ten questions cover four countries and four segments; ID/UZ drafts need native-language validation before measurement. P10 is branded factual accuracy; never blend it into non-branded discovery rate. Client guest prompts remain a separate library.
Run ChatGPT consumer search, Gemini and Perplexity separately only with approved access and provider budget; API tests are a separate evidence class. Record exact system/model if exposed, date/time/timezone, interface, search enabled, location setting and whether verified, fresh session, prompt revision, full answer, links, errors and refusals. Ask three repeats per question on different dates; cost ceiling must be set before paid runs. Current system/date/answers are NO_DATA; no paid calls were made.
Mention rate = valid answers naming Selena / valid answers; citation rate = valid answers linking Selena / valid answers. Report counts and denominators by system/market/language. Errors/refusals are reported separately, never zeros or silently removed. One answer does not prove a trend. Do not compare a changed prompt set or consumer/API channels as one series.

## Post-release comparison
Release date D is UNKNOWN until owner approval. D+7: crawl/render/CTA and event receipt review. D+28: first equal 28-day GSC and funnel comparison with the preceding 28 days, with reporting lag. D+56: second comparison and AI repetitions under the same lock. Owner: Selena; execution: project primary agent. Control: unchanged /pricing and /lab, descriptive only (not randomized causality). Log seasonality, model changes and other releases.
Hypotheses: C1 improves query/offer clarity; C2 increases qualified onward visits; C3 improves comprehension before inquiry. Without measured traffic/conversions no uplift is claimed. Continue when rendering and funnel work and qualified engagement improves; revise based on actual query mismatch; stop unsupported landing expansion while demand remains NO_DATA.

## Next batch
1. Restore scoped GSC read access and approved analytics transport; verify event delivery before quantitative prioritization (owner access decision; high value).
2. Reconcile live deployed content with main and verify free-check completion and contact delivery without creating paid orders (release operator).
3. Capture actual geolocated SERPs for K1–K7; update priorities from impressions, intent, conversion and effort (SEO owner).
4. Consider /visibility RU owner questions after source review; validate ID/UZ copy before any language expansion (content owner).
5. Create a segment page only when distinct intent, native copy, supported offer and evidence justify it; beach-club demand currently NO_DATA.
