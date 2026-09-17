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

## Scoped retrieval path (prepared after archive download was rejected)
The existing artifact includes other projects and is outside this task's download scope. `npm run gsc:report -- --selena-only` requests only `https://www.selenasystems.com/`; it never enumerates account properties or queries another site. The existing manual workflow adds a default-on `selena_baseline` option; scheduled portfolio reports retain their prior behavior. Run only the manual Selena option for this task.
Scoped output retains aggregate totals and query/page/country/device/combined/date rows for both 90-day periods. Date labels use Search Console's America/Los_Angeles reporting zone, with a three-day lag. Country is search location, not business location or language; Bali requires a separate contextual analysis. API pagination cannot guarantee all rows; anonymized queries and provider row limits remain limitations. A failed scoped request writes no zero-valued baseline. The authenticated account identity is redacted from the scoped report.
Output is under ignored `reports/gsc/selena-only/`, private file permissions, and an access-controlled Actions artifact. No keys or private query rows are printed or committed. This path reuses the existing readonly GSC account; it does not expand grants. Publication and dispatch require owner authorization; preparation and mock tests alone do not produce live GSC data.
API reference checked 2026-09-17: https://developers.google.com/webmaster-tools/v1/searchanalytics/query

Scoped-export preparation checks (2026-09-17): lint PASS with the same four existing frontend warnings; typecheck PASS; all 30 GSC unit tests PASS, including property isolation, two 90-day PT windows, dimension retention, forbidden property enumeration and failure without fabricated zeros; workflow YAML parse/dispatch guards PASS; production build PASS; git diff --check PASS. These are local/mocked checks, not evidence of a live GSC export.
