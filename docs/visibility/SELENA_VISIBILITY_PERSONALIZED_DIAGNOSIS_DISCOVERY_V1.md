# SELENA VISIBILITY — PERSONALIZED EXPLANATION DISCOVERY V1

**Версия:** 1.0
**Дата:** 20 сентября 2026
**Тип прохода:** read-only discovery. Production feature code, public copy, routes, database, deployment и внешние интеграции не менялись.
**Против:** входящая спецификация владельца «Selena Systems — Personalized AI Visibility Diagnostic Funnel V1» (вставлена в разговор 19–20 сентября 2026).
**Канонический источник для public-site фактов:** `docs/visibility/SELENA_MASTER_CORRECTION_RECONCILIATION_V1.md` (16 августа 2026) — сам являющийся более новым, чем `docs/architecture/SELENA_SYSTEMS_VISIBILITY_PLATFORM_ARCHITECTURE_AND_CODEX_TZ_V1_2.md`, которая объявляет себя superseded в собственной шапке.

Статусы доказательности — по конвенции этого документного семейства: **VERIFIED** (прямое наблюдение кода/git), **INFERRED** (выведено из нескольких косвенных, но согласованных источников), **NEEDS_OWNER** (решение владельца), `needs_verification` (не проверено в этом проходе).

---

## 0. Важное предупреждение: документный след отстаёт от кода

`SELENA_MASTER_CORRECTION_RECONCILIATION_V1.md` датирован 16 августа 2026 и называет себя текущим SSOT для public-site. Но `git log` показывает **28+ коммитов** по `lib/visibility/`, `components/visibility/`, `app/*check*` **после** этой даты, вплоть до 19 сентября 2026 (включая полную реструктуризацию `/visibility` в текущей рабочей сессии). Ни один новый reconciliation-документ после 16 августа не создан.

**Вывод:** факты в этом discovery получены не из чтения устаревших документов, а из прямого чтения кода на HEAD (`de25879`, ветка `claude/selena-visibility-implementation-74tglz`). Документы ниже цитируются только там, где они всё ещё описывают продуктовые границы (ценник, юридические ограничения, provider-политику), а не техническую реализацию.

---

## 1. Baseline

```text
repository:  parkourcafe/SELENA-AI-COMPANY
branch:      claude/selena-visibility-implementation-74tglz
HEAD:        de25879
dirty state: clean
```

**VERIFIED**

---

## 2. Сверка входящей спецификации с существующим кодом

### 2.1. Уже реализовано (VERIFIED по коду, не по документам)

| Пункт спецификации | Статус | Где |
|---|---|---|
| §4 URL — единственный обязательный вход | ✅ | `components/visibility/VisibilityCheckForm.tsx` |
| §5, §7–9 Реальный audit engine, детерминированные правила, ограниченный по времени crawl | ✅ | `lib/visibility/liveReport.ts`, `lib/visibility/checks/*`, `lib/visibility/security/*` (SSRF-safe DNS-pinning, отдельно протестировано) |
| §6 Business context, ≤3 вопроса | ✅ (2 поля сверх URL: `siteProfile`, `primaryAction`) | `VisibilityCheckForm.tsx`. Вопросы **не совпадают** с предложенными в спецификации (`business_type`, `primary_action`, `location`) — нет отдельного поля локации. |
| §8 Ограниченный набор статусов, `not_measured` ≠ `fail` | ✅ | См. §3 ниже — детальный разбор |
| §14 Evidence UI с раскрытием источника | ✅ | `<details>`-блоки в `components/visibility/LiveReportView.tsx`, `components/visibility/EvidenceList.tsx` |
| §15–16 «Verified from your site» / «Not tested» разделение | ✅, это принцип №1 всей архитектуры, не деталь UI | Master Correction: «displayed readiness score is not AI Visibility and is never presented as a recommendation or ranking outcome»; `llms.txt` вес = 0 |
| §18 Lead capture, привязанный к audit-контексту | ✅ | `app/api/leads/route.ts`, тип `visibility_check`, обязательные поля `["contact","website","primaryAction"]` |
| §20 Product routing на платный каталог | ✅ как статичная ссылка. ❌ живого чекаута нет | `/visibility` (эта же ветка) |
| §9 Rate limiting | ✅, но самим кодом задокументирован как ненадёжный (in-memory, per-process) | `lib/visibility/security/rate-limit.ts` |
| Deterministic rules, не LLM, определяют severity/pass-fail | ✅ | Весь `lib/visibility/scoring/*`, `lib/visibility/checks/*` |

### 2.2. Отсутствует полностью (VERIFIED — не найдено ни одного упоминания)

| Пункт спецификации | Проверка |
|---|---|
| §21–23 LLM personalized-explanation слой | `grep -rn "anthropic\|openai\|ANTHROPIC_API_KEY\|OPENAI_API_KEY" lib/visibility lib/diagnostics` → 0 совпадений |
| §26 A/B experiment infrastructure (control/variant, bucketing) | `grep -rln "experiment\|variant\|bucketing"` по `lib`/`components`/`app` → 0 релевантных совпадений (ложные срабатывания — только слово «variant» в пропсах Button-компонента) |
| §28 LLM cost logging | Не может существовать — LLM-слоя нет |
| Стабильный per-visitor identifier (нужен для бакетинга) | `lib/leads.ts`: `createIdempotencyKey()` генерирует новый UUID на каждый сабмит, это не persisted session id. Нигде в `components`/`lib` нет чтения/записи стабильного id в `localStorage`. |

---

## 3. Semantic matrix: `unavailable` vs `not_measured` (Owner Decision 1)

### 3.1. Обнаруженная структура (VERIFIED)

Обнаружены **два разных понятия под похожими именами**, живущие в разных, не связанных друг с другом слоях:

**A. `CheckState.unavailable`** — `lib/diagnostics/contracts.ts:16`

```ts
export type CheckState = "pass" | "warn" | "fail" | "info" | "unavailable";
```

- Используется **только внутри собственного файла определения**. `grep -rn "unavailable" lib/diagnostics` не находит ни одного места, где значение `"unavailable"` присваивается или сравнивается за пределами `contracts.ts`.
- Единственный символ из `contracts.ts`, который импортирует живой production-код (`app/api/checks/route.ts`), — это `VERSIONS`. `CheckState`, `EvidenceItem`, `EvidenceKind` **не импортируются никем в живом пути**.
- Этот файл принадлежит mock/async-job слою PR-02/PR-03 (`lib/diagnostics/mockEvidence.ts`, `mockRun.ts`, `components/visibility/MockReportView.tsx`, `app/api/checks/[id]/status/route.ts`) — слою, который Decision Log DOC-021 явно **отменил** для публичного пути в пользу синхронной живой проверки. Этот код не удалён (см. DOC-011/DOC-015 — решение оставить его за флагами), но он не участвует в реальном `/check`-потоке сегодня.
- **Вывод: `unavailable` в `contracts.ts` — мёртвый (для публичного пути) артефакт отменённой архитектуры, не активное понятие, требующее согласования.**

**B. `SourceStatus.unavailable`** — `lib/visibility/measurement.ts:15`

```ts
export type SourceStatus = "sample" | "observed" | "provider" | "derived" | "unavailable";
```

- Это **другая ось измерения**: не результат проверки (pass/fail), а провенанс значения — «откуда взято это конкретное число». Комментарий в коде: «Provenance of every value rendered in a report... the other members exist so live evidence can be added later without changing the render contract».
- Live-код сегодня не присваивает `sourceStatus: "unavailable"` ни в одном месте (проверено, `grep` по `lib/visibility` за пределами объявления типа — 0 совпадений); используются `sample`/`observed`.
- **Это не тот же `unavailable`, что в A, и не должен с ним объединяться концептуально** — разные оси (результат проверки vs. происхождение значения).

**C. `not_measured`** — активная, живая ось результата проверки. Используется в **четырёх независимых локальных объявлениях**:

```ts
lib/visibility/measurement.ts:23        EvidenceState = "pass" | "warn" | "fail" | "info" | "not_measured"
lib/visibility/liveReport.ts:33         LayerState     = "pass" | "warn" | "fail" | "not_measured"
lib/visibility/checks/actionReadiness.ts:14  ReadinessState = "pass" | "warn" | "fail" | "not_measured"
lib/visibility/checks/technicalChecks.ts:14  CheckState     = "pass" | "warn" | "fail" | "not_measured"
```

- Пронизывает весь реально работающий движок: `technicalChecks.ts`, `crossPageChecks.ts`, `entityClarity.ts`, `publicReadiness.ts`, `liveReport.ts`, `actionReadiness.ts`.
- Значение `"info"` живёт только в `measurement.ts`-варианте и реально присваивается только в `lib/visibility/sample-report-data.ts` (статичный sample-отчёт), не в live-движке проверок. Live-движок никогда не производит `"info"`.

### 3.2. Ответ на вопрос Owner Decision 1

**Реального семантического конфликта между `unavailable` и `not_measured` нет** — они принадлежат разным, не пересекающимся мирам (mock-эра vs. live-движок). Настоящая, более узкая проблема: **один и тот же живой словарь (`pass|warn|fail|not_measured`) независимо продублирован в 4 файлах** без единого источника истины — это дрейф определений, не смысловая коллизия.

### 3.3. Минимальное предложенное решение

1. **Не трогать `contracts.ts` и `unavailable`.** Он всё ещё используется отключённым mock-путём (`MockReportView.tsx`, `/api/checks/[id]/status`); удаление или переименование — отдельная, не связанная с этой задачей уборка, вне scope V1.
2. **LLM explanation-слой потребляет уже существующий живой словарь как есть** (`EvidenceState`/`LayerState`/`ReadinessState`/`CheckState` из соответствующих модулей вызова) — не вводит пятый словарь из входящей спецификации (`PASS/PARTIAL/WEAK/FAIL/NOT_TESTED/NO_DATA`).
3. **Объединение 4 дублирующихся объявлений в один канонический тип** — реальная, но отдельная задача чистого рефакторинга без функциональной необходимости для этого V1. Рекомендация: не делать её в рамках этой работы, зафиксировать как отдельный low-priority tech-debt пункт.

---

## 4. `elmo-source` — проверка утверждения из вчерашнего отчёта (Owner Decision request)

**Статус: INFERRED (сильная, многоточечная корроборация), не VERIFIED** — буквальная строка `elmo-source` как имя репозитория/пакета не найдена ни в одном из трёх присоединённых репозиториев.

Найденные точки совпадения между `SELENA-AI-COMPANY` (описание в Master Correction) и `selena-OS`/`selena-ai-visibility`:

| Факт из Master Correction | Совпадение в selena-OS / selena-ai-visibility |
|---|---|
| «RC6 measurement contracts» | Файл `SELENA_RC6_OSS_COMPONENTS.md` существует в обоих репозиториях |
| «Visitor View и API View kept separate» | `SELENA_PRODUCT_CATALOG_LOCK_V1.md`: «Visitor View is ChatGPT, Gemini and Perplexity. API View is Claude, DeepSeek, Qwen, Mistral and Grok» — дословное совпадение терминологии |
| Каталог `$49/month / $79/month / $399 one-time / $2,490` | `packages/selena-visibility-contracts/src/catalog.ts`: `price: 49`, `price: 79`, `price: 399`, `price: 2490` — точное числовое совпадение всех четырёх цен |
| Продукт «Elmo» | `package.json`: `"name": "elmo"` в обоих репозиториях; README брендирован как Elmo (`github.com/elmohq/elmo`) |

Это не подтверждает конкретный remote/путь `elmo-source`, но подтверждает с высокой уверенностью: **описанный в Master Correction «paid technical base» — это тот же продукт, что живёт в `selena-OS`/`selena-ai-visibility`.** Обе кодовые базы (по структуре репозитория) выглядят как зеркала/форки одного продукта, а не два разных.

**Практическое следствие:** реальное измерение AI Visibility (вызовы ChatGPT/Gemini/Perplexity/Claude/DeepSeek/Qwen/Mistral/Grok) физически не находится в `SELENA-AI-COMPANY`. Этот репозиторий хостит только (а) бесплатный Public Readiness и (б) статичные продающие страницы платного каталога — без живого выполнения провайдеров. Это ограничивает то, что personalized-explanation слой может честно утверждать про AI Visibility: он не имеет доступа к paid-измерениям и не должен на них ссылаться как на измеренные.

---

## 5. Инфраструктура для LLM cost protection (Owner Decision 3)

**VERIFIED, всё нижеперечисленное проверено прямым чтением кода:**

| Кандидат | Состояние |
|---|---|
| Supabase | Клиентский код существует (`lib/supabase/server.ts`, `@supabase/supabase-js` в зависимостях), но `getSupabaseServerClient()` возвращает `null`, пока не заданы `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`. Оба пусты в `.env.example` и (судя по документам) ни в одном окружении. Блокировано D-005 (NEEDS_OWNER), как и было. |
| Redis/KV/Upstash | Не установлено ни одной зависимости этого класса в `package.json`. |
| In-memory rate limiter | Единственная существующая защита. `lib/visibility/security/rate-limit.ts`: 5 запросов/час на IP по умолчанию, соль на процесс, **сам код документирует себя как ненадёжный** («KNOWN LIMITATION: state lives in process memory, so on serverless each instance counts separately and a cold start resets the window»). |
| Персистентность самого `/check` | `/api/checks` полностью синхронный и **ничего не сохраняет** — ни в БД, ни в durable store. Нет `audit_id`, переживающего запрос. |
| Стабильный per-visitor id для кэширования/бакетинга | Не существует нигде в коде. |

**Следствие для «cache/reuse explanation по audit_id + evidence_hash + context_hash» (пункт 5 запроса владельца):** технически невозможно сегодня без персистентного хранилища — `/check` не сохраняет ничего между запросами, поэтому кэшировать по `audit_id` физически негде. Это не решается выбором алгоритма кэширования — это блокировано тем же D-005, что блокирует всё остальное персистентное.

---

## 6. Analytics: скрытый блокер, не упомянутый во входящей спецификации

**VERIFIED.** `lib/diagnostics/analytics.ts`, функция `track()`:

```ts
export function track(event: DiagnosticEvent): void {
  const safeEvent = { ...event, properties: safeProperties(event.properties) };
  if (process.env.NODE_ENV !== "production") {
    console.debug("[diagnostics:event]", safeEvent.eventName, safeEvent.consentClass);
  }
}
```

**В production эта функция не делает ничего** — ни одного сетевого вызова, ни одной записи. Заблокировано D-018 (analytics provider/consent, NEEDS_OWNER). `components/analytics/PublicEventTracker.tsx` уже существует и уже вызывает `trackPublicEvent` на 15+ уже определённых событий (`hero_view`, `pricing_view`, `visibility_cta_click` и т.д.) — ни одно из них сегодня никуда не долетает.

**Следствие:** расширение `EVENT_NAMES`/`PublicEventTracker.tsx` новыми событиями из спецификации (`check_completed`, `personalized_explanation_viewed`, `evidence_opened`, `lead_submitted`, `snapshot_cta_clicked`) — правильный архитектурный шаг (не создаём второй слой), но он **не даёт никакой видимости данных**, пока D-018 не решён. Это нужно сказать явно, а не подразумевать, что «добавили аналитику» = «теперь видно воронку».

---

## 7. Итог Discovery V1

```text
STATUS: GO для Phase 1 (delta design) с учётом owner decisions ниже

- unavailable/not_measured: не конфликт, а дублирование объявлений одного live-словаря;
  минимальное решение — не трогать словарь для V1 (§3.3).
- elmo-source: INFERRED с сильной корроборацией, не VERIFIED буквально (§4).
- LLM cost protection: не может опираться на существующую персистентность — её нет (§5).
- Analytics: расширение оправдано архитектурно, но бессмысленно без решения D-018 (§6).
- Стабильный visitor id для A/B: не существует, потребует минимального нового клиентского
  примитива (не нового вендора).
```

Все три owner decisions и связанные с ними записи см. в обновлённом `SELENA_VISIBILITY_DECISION_LOG.md`.

---

## 8. Staging acceptance gates (Phase 2)

Эти пункты обязаны быть закрыты до production activation эксперимента. Они не блокируют commit кода и не блокируют staging deploy с выключенным флагом.

### 8.1. VERIFY VERCEL CUSTOM EVENT PROPERTY LIMIT BEFORE STAGING ANALYTICS ACCEPTANCE

**Статус: RESOLVED 2026-09-22.**

Установленный пакет `@vercel/analytics@2.0.1` в `parseProperties` (`dist/index.mjs:48-69`) валидирует только **тип** значений — строки, числа, булевы, `null`; вложенные объекты либо вырезаются (в production), либо бросают ошибку. Ограничение на количество свойств — серверное/плановое, код его не видит; проверено напрямую в дашборде Vercel (**Analytics → Enable Web Analytics**, диалог выбора плана, 2026-09-22):

```text
Web Analytics (включён в план)        — Custom Events с 2 свойствами
Web Analytics Plus ($10/мес)          — Custom Events с 8 свойствами
```

Текущая схема события — 5–6 плоских свойств (`experiment_id`, `variant`, `audit_id`, `site_profile`, `primary_action`, при необходимости `finding_count`). Базового плана (2 свойства) было бы недостаточно. Владелец подключил **Web Analytics Plus** — 8 свойств с запасом покрывают схему как есть, без урезания. Лимит длины значения отдельно не проверялся — при текущих значениях (короткие enum-строки, `audit_id` — короткий hex) риска не видно.

### 8.2. LLM_STAGING_ACCEPTANCE — controlled smoke run

**Статус: RESOLVED 2026-09-22.**

Требуется 20–30 представительных случаев, не один happy path: разные `siteProfile`, разные `primaryAction`, severity `critical`/`important`/`later`, один finding, несколько findings, ноль findings, не-латинский контекст. Измерить: schema success rate, fallback rate, p50/p95 input/output tokens, p50/p95 latency, фактическую стоимость, projected cost / 1 000 explanations, и отдельно — что LLM не ввёл ни одного нового finding (должно быть ровно 0).

Прогон выполнен временным secret-gated диагностическим роутом (`app/api/internal/explanation-smoke-test/route.ts`, удалён после записи результатов — см. Decision Log D-033) — 24 фиксированных синтетических случая, оба locale, все `SiteProfile`, большинство `PrimaryAction`, severity critical/important/later, 22 случая с находками (реальный вызов `generateExplanation()`) + 2 случая с нулём находок (корректно short-circuit без сетевого вызова).

**Первый прогон (до фикса, PR #139 / `5feb6a2`): 0% schema success rate** — все 22 вызова с находками провалились. Причина: `gpt-5-mini` — reasoning model, скрытые reasoning tokens списываются с того же `max_completion_tokens`, что и видимый ответ; при `MAX_OUTPUT_TOKENS = 600` (`lib/visibility/explanation/generate.ts`) модель тратила весь бюджет на рассуждение и возвращала пустой `content` каждый раз — подтверждено: у каждого провалившегося случая `outputTokens` было равно ровно 600. Три отдельных прогона до фикса дали 0%, 5% и 14% — не улучшение, шум вокруг одной и той же сигнатуры отказа.

**Фикс (`5feb6a2`, уже на `main`):** `MAX_OUTPUT_TOKENS` поднят `600 → 2500`, добавлен `reasoning_effort: "minimal"` — короткая перефразировка уже решённого факта не требует глубокого рассуждения; поднятый лимит токенов остаётся основной защитой, `reasoning_effort` — вторичной (по отчётам сообщества иногда игнорируется в сочетании с `max_completion_tokens` на моделях семейства gpt-5).

**Второй прогон (после фикса, против production, 2026-09-22):**

```json
{
  "generatedAt": "2026-09-22T17:57:40.582Z",
  "model": "gpt-5-mini",
  "wallMs": 10276,
  "aggregate": {
    "casesTotal": 24,
    "casesCalledProvider": 22,
    "casesSkippedNoFindings": 2,
    "schemaSuccessRate": 1,
    "fallbackRate": 0,
    "failureReasons": {},
    "latencyMsP50": 2056,
    "latencyMsP95": 3327,
    "inputTokensP50": 350,
    "inputTokensP95": 646,
    "outputTokensP50": 91,
    "outputTokensP95": 233,
    "totalInputTokens": 8924,
    "totalOutputTokens": 2744,
    "totalCostUsd": 0.007719,
    "projectedCostPer1000Usd": 0.3508636363636364
  }
}
```

22/22 provider calls succeeded (100% schema success rate, 0% fallback rate). Стоимость этого прогона: $0.0077. Projected cost / 1 000 explanations: **$0.35 (UNVERIFIED ESTIMATE** — публичные pricing tracker'ы, не OpenAI billing console). Все 22 explanation-строки выборочно проверены вручную: короткие on-topic перефразировки только переданной находки, ни одной новой находки/оценки/вердикта не обнаружено — согласуется с жёстким ограничением схемы (`findingId` — enum только из id, переданных в конкретный вызов).

Повторный прогон не требуется и не запланирован: фикс целенаправленно устраняет задокументированную причину отказа (reasoning-token starvation), результат воспроизводимо перешёл от устойчивого ~0% (три прогона до фикса, все с одинаковой сигнатурой «`outputTokens` упёрт в старый потолок») к чистым 100%, а latency/token/cost числа внутренне согласованы и правдоподобны (p50 latency упала с ~5.6с до фикса до ~2.1с после — ровно то, что ожидается, когда модель перестаёт тратить весь бюджет на скрытое рассуждение). Каждый дополнительный прогон тратит реальные деньги без дополнительного диагностического сигнала на этом этапе.

### 8.3. STAGING_DEPLOY_BLOCKED — деплой недоступен

**Статус: RESOLVED 2026-09-21.**

Причина была одна и находилась в репозитории: `vercel.json` содержал `"git": { "deploymentEnabled": false }`, что выключает git-триггерные деплои для всех веток сразу — и preview, и production. Коммит `11c14f1` («chore: disable Vercel automatic runs», 2026-09-18) вводил это, судя по формулировке, ради подавления preview-деплоев на агентских ветках, но заодно остановил и production.

Блокировка аккаунта Vercel, о которой сообщалось отдельно («Account is blocked» в checks PR #133), **не подтвердилась и никогда не проверялась из среды разработки**. После снятия конфигурационного ограничения деплой прошёл штатно, что делает гипотезу о блокировке аккаунта излишней для объяснения наблюдаемого.

Решение (коммит `a354c8c` на `main`): production-ветка включена явно, все остальные выключены двумя catch-all-ключами.

```json
"deploymentEnabled": { "*": false, "**": false, "main": true }
```

Два catch-all, а не один, по двум причинам: неуказанная ветка у Vercel по умолчанию **включена**, поэтому нужен явный `false`; и одиночный `*` не проходит через `/`, а рабочие ветки этого репозитория — `claude/...`.

Подтверждение деплоя (наблюдение владельца в дашборде, не из среды разработки): деплой `4iq7AGsLr`, `Branch: main, Commit: a354c8c`, Next.js 15.5.23, Deployment Checks 1 ✓ / 0 ✗, Assigning Custom Domains ✓.

Остаточное наблюдение из того же лога сборки, не блокирующее: `npm warn allow-scripts` для `esbuild@0.28.1` и `unrs-resolver@1.12.2` — их postinstall-скрипты не выполняются. Сборка проходит; это место стоит вспомнить, если однажды появится необъяснимая ошибка сборки вокруг esbuild.

### 8.4. LLM_STAGING_ACCEPTANCE_BLOCKED_NO_CREDENTIALS

**Статус: RESOLVED 2026-09-22.** `OPENAI_API_KEY` добавлен владельцем в Vercel Production environment. Подтверждено двумя независимыми путями: (а) `GET /api/internal/explanation-smoke-test/status` (публичный, без секрета, без сетевого вызова, без утечки значения — только booleans) вернул `explanationProviderConfigured: true`; (б) §8.2 — 22 реальных успешных вызова OpenAI в production в рамках того же прогона. Ключ не попадал и не попадает в репозиторий. Оценка стоимости в §8.2 остаётся `UNVERIFIED ESTIMATE` (публичные pricing tracker'ы, не сам OpenAI billing console) — это не блокирует резолюцию гейта, стоимость сама по себе не требует подтверждения курсом OpenAI, только порядок величины.

### 8.5. Provider-side spend protection

**Статус: OPEN, вне репозитория.** Лимит расходов на стороне проекта OpenAI — настройка аккаунта, а не кода. In-memory дневной счётчик в `lib/visibility/security/rate-limit.ts` — **best-effort guardrail, не hard cap** (на serverless это N независимых счётчиков, не один).

Активация эксперимента (`SELENA_VISIBILITY_DECISION_LOG.md`, D-034) состоялась **до** закрытия этого пункта — владелец сделала это осознанно, взвесив цифры: дефолтная in-memory защита (3 вызова/IP/час, 200/день) и реальная стоимость вызова из §8.2 (~$0.00035) дают худший случай ≈$0.07/день. Пункт остаётся открытым и стоит закрыть, когда будет удобно — но он больше не блокирует activation, это состоявшееся решение, а не забытый шаг.

### 8.6. VERCEL_WEB_ANALYTICS_NOT_ENABLED — измерительный слой инертен

**Статус: включение подтверждено 2026-09-22 (Web Analytics Plus). End-to-end доставка событий — needs_verification.**

Обнаружено 2026-09-21 при разборе первого успешного деплоя: в дашборде проекта `selena-ai-company` карточка **Web Analytics** имела состояние **Not Enabled**.

D-018 был закрыт выбором Vercel Web Analytics как провайдера, и код под это написан: `components/layout/SiteShell.tsx` монтирует `<Analytics />` из `@vercel/analytics/next`, а `lib/diagnostics/analytics.ts` вызывает `track()` из `@vercel/analytics`. Но включение провайдера в коде — только половина; вторая половина это переключатель в настройках проекта. Пока он был выключен, Vercel не отдавал `/_vercel/insights/script.js`, объект `window.va` в браузере не появлялся, и `track()` оставался тем же no-op, каким был до D-018.

2026-09-22 владелец включил **Web Analytics Plus** ($10/мес) в дашборде проекта — тем же действием закрыт и §8.1 (план даёт 8 свойств на custom event, схема из 5–6 укладывается). Деплой заново не требовался: Vercel отдаёт скрипт аналитики сразу после переключения тумблера, без пересборки.

**Не подтверждено этим проходом** — из среды разработки: реально ли долетают события до дашборда (визит `/check`, «1 online» в реальном времени, появление `personalized_explanation_viewed` в списке custom events после ручного прогона с включённым флагом). `vercel.com` и production-домен закрыты egress-прокси (попытки `curl` возвращают 403 от прокси, не от сайта), токена Vercel в среде нет — эта проверка технически недоступна отсюда и должна быть подтверждена владельцем в дашборде перед §8.2 (LLM smoke-run) и активацией эксперимента.
