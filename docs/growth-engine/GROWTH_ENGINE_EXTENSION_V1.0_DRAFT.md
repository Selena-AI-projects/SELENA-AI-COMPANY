# Selena Growth Engine — архитектурное дополнение

| Поле | Значение |
|---|---|
| Версия | 1.0 |
| Статус | **DRAFT для утверждения владельцем.** Не является нормативной архитектурой, не FINAL APPROVED |
| Дата | 2026-09-05 |
| Автор | Claude Code (Lead Orchestrator), по стартовому заданию `00_START_CLAUDE_CODE.md` v1.0 от 05.09.2026 |
| Режим подготовки | READ-ONLY DISCOVERY + DOCS-ONLY. Платных provider calls: 0. Публикаций: 0. Миграций: 0. Изменений инфраструктуры: 0 |
| Парный документ | `GROWTH_ENGINE_IMPLEMENTATION_TZ_V1.0_DRAFT.md` (исполнимое ТЗ, матрица требований, аудит, независимый review) |
| Не меняет | `SELENA_SYSTEMS_FINAL_ARCHITECTURE_2026-09-04`, `SELENA_AI_VISIBILITY_SAAS_ARCHITECTURE_FINAL_APPROVED_V1.4`, `SELENA_MASTER_TZ_CLAUDE_CODE_2026-09-02` и любые нормативные файлы репозиториев |

## 0. Как читать этот документ

### 0.1. Маркировка

| Метка | Значение |
|---|---|
| `[ИСТОЧНИК]` | Пересказ требования утверждённой архитектуры или Master ТЗ. Ссылка на документ и раздел |
| `[ФАКТ]` | Проверено в коде репозитория на точном SHA либо по безопасным метаданным хостинга (имена сервисов, доменов, SHA деплоя). Значения переменных и секретов не читались |
| `[ОТЧЁТ]` | Взято из отчёта другого исполнителя, commit-сообщения или execution-документа (`docs/execution/*`, `HANDOFF.md`, `MASTER_HANDOFF`). Автором не воспроизведено; не является behavior-level evidence (v1.4 §23) |
| `[PROPOSED]` | Предложение этого документа. Не является решением до принятия владельцем |
| `[OWNER_DECISION]` | Требует отдельного явного решения владельца |
| `[UNKNOWN]` | Нет достаточного evidence. Не равно «отсутствует» и не равно «сломано» |
| `[HOLD]` / `[NO-GO]` | Ограничения из исходных документов; этот документ их не снимает |

### 0.2. Приоритет источников

1. `SELENA_SYSTEMS_FINAL_ARCHITECTURE_2026-09-04.docx` — вся экосистема (Aether, Selena OS, Control Room, Release Gateway, границы).
2. `SELENA_AI_VISIBILITY_SAAS_ARCHITECTURE_FINAL_APPROVED_V1.4_2026-09-04.docx` — внутри границ AI Visibility имеет приоритет.
3. `SELENA_MASTER_TZ_CLAUDE_CODE_2026-09-02.docx` — зависимости, ограничения, acceptance criteria. Не команда повторить работы.
4. Живой код и хостинг на точных SHA (раздел 3) — только для implementation mapping. Расхождение с архитектурой фиксируется в разделе 10, а не разрешается изменением продукта.

SHA256 исходников совпадают с `SHA256.json` пакета (проверено 2026-09-05).

## 1. Решение в одном абзаце

`[PROPOSED]` Growth Engine — не новый продукт, не новый репозиторий и не новая база. Это расширение трёх уже существующих систем одним общим контуром: **сигнал → возможность → решение → бриф → черновик-версия → проверка → Inbox → одобрение владельца → выпуск → наблюдаемый результат.** Система записи для сигналов, возможностей, версий, одобрений и выпусков — **Content OS внутри `parkourcafe/selena-OS`** (Control Room уже хранит `content_items`, `content_versions`, `approvals`, `release_intents`, Release Gateway). Исполнительный слой для research и drafting — **Aether Runtime** (`parkourcafe/Aether-Medium`), результаты которого попадают в Control Room Inbox только через уже существующий версионированный signed bridge. **AI Visibility** остаётся отдельным продуктом и отдаёт Growth Engine только разрешённые результаты через read-only API и явный owner-подтверждённый маппинг. Публичный сайт `parkourcafe/SELENA-AI-COMPANY` — один из каналов доставки и источник Search-сигналов по собственным свойствам. Второй движок измерения видимости, второй Control Room, второй scheduler платных вызовов и общая таблица результатов не создаются.

## 2. Неизменяемые границы

Пересказ требований источников. Новых прав не выдаёт.

| # | Граница | Источник |
|---|---|---|
| B1 | Aether Runtime — исполнительный слой агентных задач. Claude Code организует инженерную работу, не заменяет runtime | Final Architecture §2, §8; Start §3 |
| B2 | Selena OS / Control Room — интерфейс владельца; хранит версии, approvals, releases, publications. Исполнители, агенты и QA не выдают owner approval | Final Architecture §5–6; Master ТЗ Stage 3, 5 |
| B3 | AI Visibility — отдельный продукт с собственными repo, DB, navigation и deployment. Второй движок измерения видимости не создаётся | Final Architecture §2, §4, §11; v1.4 §0, §2, §3.3 |
| B4 | Связь между продуктами только через версионированные API/events с tenant/project IDs, schema_version, event_id, version, occurred_at, trace_id, payload hash; replay безопасен; никаких прямых записей в чужие базы и общей универсальной таблицы результатов | Final Architecture §9, §12; v1.4 §2, §5, §15 |
| B5 | Публикация проходит через одобрение конкретной неизменяемой версии и Release Gateway; QA PASS не равен разрешению выпуска; изменение версии аннулирует approval | Final Architecture §6, §9 |
| B6 | Postiz сохраняется; Blotato — в рамках общего provider contract; не более одного активного провайдера на brand/channel/environment; ни один адаптер не считается работающим без behavior-level evidence | Final Architecture §10; Master ТЗ Stage 7–8 |
| B7 | Обычная задача, изменение кода и выпуск контента — три раздельных lifecycle. GitHub PR не является условием публикации обычного контента | Final Architecture §7; Master ТЗ §3 |
| B8 | Frontend никогда не вызывает платного provider напрямую; каждый платный вызов требует permit; unknown price/cardinality = STOP | v1.4 §4.1, §10, §22.1 |
| B9 | Все HOLD/NO-GO источников сохраняются: paid recurring production NO-GO, Local AI MANUAL_ONLY, Instagram Comments BLOCKED, Social/Travel без mass rollout, публичные цены не меняются | v1.4 §11, §12, §23 |
| B10 | Не проводить production/deploy/DNS/auth/secret changes, миграции и сбросы БД, покупку подписок, платные вызовы, запуск scheduler, включение HOLD-функций и внешние публикации в рамках подготовки документов | Start §6 |

`[PROPOSED]` Дополнительные границы, специфичные для Growth Engine:

| # | Граница |
|---|---|
| G1 | Growth Engine не имеет собственной базы данных. Его состояние живёт в схемах Content OS (`selena_registry`, `selena_release`, `selena_audit`, `selena_performance`) с `organization_id` и `brand_id` в каждой строке и forced RLS |
| G2 | Ни один источник сигналов не подключается автоматически. Каждый источник получает отдельный flag, credential-seam, потолок вызовов, класс доступа и ledger. По умолчанию — fixture-адаптер, `externalProviderCalls = 0` |
| G3 | Чужой контент (EXTERNAL) используется для исследования, проверки первоисточников и собственного материала, не для автоматического переписывания. Отсутствие транскрипта или кадра экрана — честная причина недоступности, не выдуманный пересказ |
| G4 | Growth Engine не смешивает отчёты AI Visibility и контентные публикации. Поисковые, AI, социальные и бизнес-показатели хранятся и показываются раздельно; недостаток данных — `UNKNOWN`, не ноль |
| G5 | Growth Engine не публикует. Он доводит материал до Inbox item и review evidence; выпуск — только существующий Release Gateway после owner approval |

## 3. Что уже существует и не строится заново

Проверено на точных SHA. Полная матрица с путями, символами и тестами — Приложение A парного ТЗ.

### 3.1. Репозитории и живые контуры

| Система | Репозиторий | Ветка / SHA, проверенные 2026-09-05 | Живой контур (безопасные метаданные) |
|---|---|---|---|
| Selena OS + Control Room + Content OS | `parkourcafe/selena-OS` | `main` @ `39ec0ea3` («Establish Content OS Stage 1 foundation (#26)»). **Развёрнута другая ветка:** `claude/new-session-r64y7u` @ `05599f98` (2026-09-05), +55 файлов к `main`, миграции `0032`–`0036` | Railway project `selena-os-staging` (создан 2026-09-02): сервисы `web`, `worker`, `gateway`, `receiver`, `migrate`, `Postgres`; env называется `production`; custom domain **`cabinet.selenasystems.com`** |
| Aether Runtime / Studio | `parkourcafe/Aether-Medium` | Клон по умолчанию `claude/friendly-mccarthy-z6bla5` @ `e6fd6590`. **Развёрнута ветка** `claude/new-session-r64y7u` @ `29d0e381` (2026-09-04), +88 файлов; ветки `main` в remote нет | Railway project `OS Selena agent systems`: сервисы `OS Selens Agent` (web+API), `worker`, `Redis`; домены **`os.selenasystems.com` и `studio.selenasystems.com`** ведут в один сервис |
| AI Visibility SaaS | `parkourcafe/selena-ai-visibility` | Integration branch `release/selena-visibility-mvp` @ `0d18053c` (= рабочая ветка сессии) | Railway project `selena-ai-visibility`: env `staging` обслуживает **`app.selenasystems.com`** и `staging.selenasystems.com` (web, worker, measure, migrate, publish); env `production` содержит только PostgreSQL, приложения не развёрнуты. `SELENA_EMERGENCY_STOP=true` по HANDOFF |
| Публичный сайт | `parkourcafe/SELENA-AI-COMPANY` | рабочая ветка `claude/new-session-wik9v3`, база `4bd1a053`; документы этого пакета добавлены коммитами поверх неё | Vercel из `main` (по HANDOFF); контейнер сессии не имеет сети кроме GitHub и Google APIs |
| Knowledge OS | `parkourcafe/ai-council` | `main` @ `7947502e` (2026-08-02); карта экосистемы на ветке `docs/selena-ecosystem-map` (2026-09-01), не в `main` | Не runtime |

### 3.2. Готовые строительные блоки

| Блок | Где | Статус | Значение для Growth Engine |
|---|---|---|---|
| Content Control Room: 8 разделов, `content_items`/`content_versions` (immutable, `content_hash`), `approvals` (actor, `binding_hash`, scope `channel_account_id`, `expires_at`, revoke append-only), `release_intents`, `release_manifests` (Ed25519), `kill_switches`, outbound outbox с DLQ | `selena-OS` `apps/web/src/routes/_authed/app/$brand/control-room.tsx`, `apps/web/src/server/selena-control-room.ts`, `packages/lib/src/selena-control-room.ts`, миграции `0021`–`0031`, pgTAP | `[ФАКТ]` код и тесты (vitest, 9 pgTAP-наборов в `main`, 14 на r64y7u). `[ОТЧЁТ]` pgTAP 145 ok на чистой базе, живой запуск 200 с восемью разделами, скриншот владельца 2026-09-05 — по `docs/execution/EVIDENCE/index.md` и commit-сообщению `05599f98`. Deployed acceptance матрицы гап-репорта 27.08 остаётся 0/12 по строгому критерию | Это система записи Growth Engine. Не дублировать |
| Правило «изменение контента аннулирует approval», «сотрудник не одобряет», идемпотентный release intent | `packages/lib/src/selena-control-room.test.ts` | `[ФАКТ]` EXISTING_WITH_TESTS | Переиспользуется без изменений |
| Provider-neutral contract, Postiz adapter, Blotato adapter, «один активный провайдер» как ограничение БД (`0032`), allowlist провайдеров (`0033`), запрет публикации на трёх уровнях (environment, точный flag `SELENA_RELEASE_PUBLISH_ENABLED`, транспорт) | `selena-OS` ветка r64y7u, `packages/lib/src/selena-postiz.ts`, миграции `0032`–`0033` | `[ФАКТ]` на развёрнутой ветке (pgTAP `0032` 13, `0033` 11; 31 тест publish policy); в `main` Blotato отсутствует, ограничение только `(brand, platform, provider_account_ref)`. create-post calls = 0. Контракт и адаптеры не импортируются из `apps/` (D15) | Канал LinkedIn готов к dry-run на уровне библиотеки; подключение к gateway и реальная публикация — отдельные шаги и решения |
| Aether → Control Room bridge: versioned event contract v1 (`control-room-event.v1.schema.json` + fixtures), transactional outbox в Aether (HMAC-SHA256, окно ±5 мин, DLQ после 8 попыток), signed receiver в `selena-OS` worker (`/v1/bridge/aether`), inbox `selena_ingest_raw.aether_events` (`0035`), signing key custody `0036` | `Aether-Medium` r64y7u `backend/app/services/bridge_*.py`; `selena-OS` r64y7u `apps/worker/src/selena-aether-receiver.ts`, `packages/lib/src/selena-aether-bridge.ts` | `[ФАКТ]` код и тесты на развёрнутых ветках. `[ОТЧЁТ]` сквозной прогон на живом контуре 2026-09-03 (событие Other Bali `sent`, повтор опознан как `duplicate`) — по `EVIDENCE/index.md`. **Ограничение:** единственный тип события `task.result.ready`; payload — только `title`, `status`, `summary ≤4000`, `artifact_count`; приёмник пишет **сырую строку события**, Inbox item / `content_versions` не создаёт, web-код таблицу не читает. В `main` обоих репозиториев моста нет | Единственный разрешённый транспорт результата агента. Для Growth Engine не хватает проекции события в Inbox item и переноса содержимого черновика (см. D14) |
| Aether: registry из 20 агентов (seo, copywriter, smm, research, fact-checker, qa, weekly-report…), skill packs по 6 бизнесам, 22 файловых `SKILL.md` (в т.ч. `selena-personal-brand-system`, `weekly-ai-business-report`, `otherbali-editorial-page-builder`), `project_records` с дедупликацией, YouTube транскрипты через Supadata (`backend/app/services/youtube.py`, без тестов), Redis/ARQ очередь, immutable approval record (`0020` на r64y7u), envelope-шифрование секретов | `Aether-Medium` | `[ФАКТ]` код и 39 pytest-файлов на r64y7u (`[ОТЧЁТ]` 227 passed по `EXECUTION_REPORT.md`); `youtube.py` CODE_ONLY | Исполнительный слой research/drafting. Not a system of record для контента |
| AI Visibility: `sv_recommendation_{runs,manifests,evidence,findings,actions,tasks}` с `evidence_ids[]`, `validateGrounding`, `blocked/block_reason`, `verification_plan`; permits, journal claims, pre-transport boundary, `SELENA_EMERGENCY_STOP` | `selena-ai-visibility` `packages/lib/src/recommendation-engine.ts`, schema | `[ФАКТ]` EXISTING_WITH_TESTS. Входа `GET /recommendations` нет; recommendations читаются через `findings`, `dashboard` или `action_plan jsonb` | Источник Growth-сигналов класса DERIVED. Нужен read-only export endpoint, не доступ к БД |
| Search intelligence по собственным свойствам: GSC report (12 properties), SEO validate-sitemap, `data/seo-control.json`, Public Readiness free check | `SELENA-AI-COMPANY` `scripts/gsc-report.ts`, `gsc-report.yml` (cron), `validate-sitemap.mjs`, `app/api/checks` | `[ФАКТ]` EXISTING_WITH_TESTS; отчёты GSC — только artifact, gitignored (несут live-данные чужих свойств) | Готовый SEARCH-адаптер для бренда Selena Systems и 11 портфельных свойств |
| Competitor intelligence | `SELENA-AI-COMPANY` `data/competitors.json`, `competitor-patterns.json` (internal only) | `[ФАКТ]` статические дossier от 2026-07-06, без refresh | Стартовый EXTERNAL-источник без сбора |
| Growth-методология | `ai-council` ветка `claude/content-promotion-methods-uaoywq`: skill `selena-growth-method-operator` с карточками методик (Outlier Score, 30-second intro и др.), статусы `[EXTRACTED]/[INTERPRETED]/[HYPOTHESIS]/[UNKNOWN]/[DECISION]` | Knowledge OS | `[ФАКТ]` не runtime; 2026-08-06 | Правила отбора методик; источник для decision rules Growth Engine |
| Content OS YouTube Stage 1: технический spec (profile → research через Video Radar → 6 идей → script → thumbnail → editorial approval → «publication unavailable»), execution plan со slices 0–5 | `selena-OS` `docs/control-room/CONTENT_OS_YOUTUBE_STAGE1_TECHNICAL_SPEC.md`; план на ветке `docs/content-os-stage1-execution-plan` (PR #27 CHANGES_REQUESTED) | `[ФАКТ]` Slice 0 MERGED; Slices 1–5 `NOT_STARTED` | Ближайший существующий каркас Growth Engine. Growth Engine — его надстройка, не альтернатива |
| Remotion | `SELENA-AI-COMPANY/remotion` — 10 `<Still>` композиций, без видео, не в CI | `[ФАКТ]` CODE_ONLY | Видео — later; не автоматически |
| Daily blog draft (paid Anthropic + Oxylabs, cron 13:00 UTC, PR-only) | `selena-ai-visibility` и `selena-OS` `.github/workflows/daily-blog-draft.yaml` | `[ФАКТ]` унаследовано от Elmo; единственный scheduled paid workflow | См. расхождение D10 |

## 4. Целевая архитектура Growth Engine

`[PROPOSED]` Семь слоёв. Каждый слой имеет одного владельца состояния и ни один не обходит границы раздела 2.

```text
 SIGNALS ──► OPPORTUNITIES ──► DECISION ──► PRODUCTION ──► VERIFICATION ──► HANDOFF (Inbox) ──► [owner approval] ──► RELEASE ──► OUTCOME
 Content OS  Content OS        Content OS   Aether agents  Aether QA +     Aether outbox →      Control Room       Release      Control Room
 (source     (research         (decision    (skills) или   Content OS      signed receiver →    Review             Gateway →    Performance +
 registry,   registry,         enum,        Content OS     review evidence Inbox item                               provider     внешние
 fixtures)   evidence)         priority)    fixtures                                                                 adapters     источники
```

### 4.1. Слой сигналов (входы)

| Источник | Класс доступа (v1.4 §13.1) | Владелец состояния | Существующий адаптер | Режим по умолчанию |
|---|---|---|---|---|
| SEARCH: Google Search Console по свойствам | CONNECTED (service account, read-only scope) | Content OS source registry; сырой отчёт не хранится в git | `SELENA-AI-COMPANY/scripts/gsc-report.ts` | Импорт агрегатов как UPLOADED артефакт; live-подключение из selena-OS — отдельный flag |
| SITE: собственные страницы, readiness | PUBLIC | Content OS | Public Readiness free check (`SELENA-AI-COMPANY/app/api/checks`, `selena-ai-visibility` readiness API) | Разрешён: 0 paid calls |
| COMPETITOR | PUBLIC / EXTERNAL | Content OS | `data/competitors.json` (static) | Static import; сбор — later, только после capability gate |
| YOUTUBE OWN / EXTERNAL | PUBLIC; права различаются | Content OS research registry (реестр каналов, видео, транскриптов, provenance, timecodes, ограничения использования) | `Aether youtube.py` (Supadata, CODE_ONLY), Video Radar port (spec, не построен) | Fixture; live — отдельный flag + потолок + ledger |
| AI_VISIBILITY результаты | DERIVED | Остаётся в AI Visibility; Growth хранит только ссылку (`sv_recommendation_run_id`, `action_id`, `evidence_ids`) | нет export endpoint | Только read-only API AI Visibility + явный маппинг (раздел 5). Прямого чтения БД нет |
| OWN_CONTENT: Lab, journal, существующие страницы | PUBLIC/OWN | Content OS | `lib/lab/content.ts`, journal | Разрешён |

Граница с AI Visibility: YouTube в Growth — реестр источников, транскриптов и provenance для редакционной работы, не измерение Social-видимости; Social family (v1.4 §12, включая YouTube) остаётся в AI Visibility под своими HOLD.

Правила: реестр источников хранит `kind`, `access_class`, `rights` (OWN/EXTERNAL/LICENSED/UNKNOWN), `provenance`, `captured_at`, `language`, `transcript_available`, `limitations`. Речевой транскрипт демонстрации интерфейса не является доказательством того, что было видно на экране; такой факт помечается `UNVERIFIED_VISUAL`.

### 4.2. Слой возможностей

Объединение сигналов, дедупликация, evidence, связь с существующей страницей/материалом и целью бизнеса.

`[PROPOSED]` Решения: `CREATE | UPDATE | REPURPOSE | TECHNICAL_TASK | LOCAL_TASK | EXPERIMENT | IGNORE`. Каждая возможность хранит `value_rationale`, `confidence` (`HIGH/MEDIUM/LOW/UNKNOWN`), `effort` (`S/M/L/UNKNOWN`), `evidence_refs[]`, `linked_content_item_id?`, `goal_id?`. Объёмы поиска и конверсии не выдумываются: если источник не даёт числа, поле `UNKNOWN`. Приоритет объясняется текстом, не composite score.

Это расширение research module из Content OS spec §7.2 (opportunities «evidence-bearing, decide»), не параллельная таблица.

### 4.3. Слой производства

Бриф → черновик страницы или обновления → внутренние ссылки → метаданные → социальные адаптации.

Исполнитель по архитектуре — Aether Runtime (B1). Content OS spec §7.3 предусматривает creation module с fixture- и Gemini-адаптерами внутри `selena-OS`. `[PROPOSED]` Для Growth Engine: drafting выполняют Aether-агенты по skill-пакам бизнеса, результат приходит в Content OS как версия через bridge; Content OS creation module остаётся для fixture-проверок и для YouTube-контура Stage 1. Оба пути пишут в одни и те же `content_items`/`content_versions`. Выбор — `[OWNER_DECISION]` O5.

Видео через Remotion — опциональный кандидат после проверки ресурсов, прав и стоимости. Не каждый материал становится видео.

### 4.4. Слой проверки

Независимые проверки, каждая — отдельная evidence-запись на версии контента, не изменяющая её хэш:

| Проверка | Чем | Результат |
|---|---|---|
| Факты и утверждения | Aether `fact-checker-agent` (WebSearch) + `verify-before-recommend` правила Knowledge OS | `claims[]` с статусами EXTRACTED/INTERPRETED/HYPOTHESIS/UNKNOWN |
| Ссылки | детерминированный link-check (SEO validate) | список битых/редиректов |
| Новизна / дубли | сравнение с `content_items` бренда, `project_records`, sitemap | `NOVELTY_OK / DUPLICATE_OF <id>` |
| Бренд | `qa_rules_md` skill-пака, запреты из `AGENTS.md` сайта | PASS/FAIL с цитатой правила |
| Техническая корректность | metadata, H1, canonical, hreflang, JSON-LD (существующий `validate-sitemap` набор) | PASS/FAIL |
| Изоляция проектов | `organization_id`+`brand_id` версии = контексту задачи Aether (`business_key` через маппинг раздела 5) | PASS/BLOCK |

QA PASS не равен разрешению выпуска (B5).

### 4.5. Передача в Inbox

Целевой поток: Aether result → transactional outbox → signed HTTPS receiver в `selena-OS` worker → один Inbox item на `(aggregate_id, version)`. Duplicate и out-of-order не создают копий; недоверенное событие отклоняется и аудируется.

`[ФАКТ]` Сегодня контракт `control-room-event.v1` знает один тип `task.result.ready`, payload не содержит тела черновика, а приёмник останавливается на сырой строке в `selena_ingest_raw.aether_events` (`recorded/duplicate/stale`). Inbox Control Room читает `content_versions` и `approvals`, не `aether_events`. Значит «Inbox item» пока означает «принятое событие», а не карточку контента.

`[PROPOSED]` Growth Engine закрывает разрыв двумя шагами, не меняя транспорт:

1. **Проекция**: серверная функция в `selena-OS`, которая из принятого события создаёт или обновляет `content_items`/`content_versions` бренда (по binding раздела 5), идемпотентно по `(aggregate_id, version)`; запись в `audit_events`.
2. **Содержимое**: minor-версия контракта `control-room-event.v1.1` с типом `content.draft_ready` и payload, несущим `content_kind`, `body_markdown` (или ссылку на artifact + `artifact_sha256`), `metadata`, `claims[]`, `evidence[]`, `qa_results[]`; `payload_hash` покрывает всё. Размер ограничен (receiver уже отвергает тело > 64 KiB — лимит пересматривается или вводится artifact fetch по подписанной ссылке). Fixtures генерируются на стороне Aether и проверяются приёмником, как сейчас.

Точный список полей и тестов — ТЗ, этап G3.

### 4.6. Слой доставки

| Канал | Адаптер сегодня | Статус | Решение |
|---|---|---|---|
| LinkedIn Page | Postiz (contract, allowlist) + Blotato (r64y7u), один активный на канал/окружение | dry-run only; create-post = 0 | Реальная публикация — отдельное owner GO (Master ТЗ Stage 8) |
| Сайт `selenasystems.com` | Нет адаптера. Контент сайта — TypeScript-коллекции в `SELENA-AI-COMPANY`, деплой из `main` через Vercel | Публикация страницы физически равна commit+PR, что противоречит B7 для «обычного контента» | `[OWNER_DECISION]` O7: (a) git-adapter за Release Gateway (approval в Control Room, PR — транспорт адаптера, автор PR — сервисная identity), (b) CMS/Payload (ADR-003 phase-0), (c) сайт вне Growth MVP |
| Telegram-канал | Нет publishing-адаптера. Aether `delivery.py` доставляет результаты задач владельцу; `/api/leads` шлёт лиды | NOT_FOUND | Later; provider contract |
| YouTube | Нет адаптера; Stage 1 spec: «publication unavailable» | NOT_FOUND | Stage 3 решение (Postiz vs Blotato vs direct) |
| Instagram/TikTok | Нет | HOLD по v1.4 §12 (Comments BLOCKED) | Не в Growth MVP |

Один провайдер не предполагается поддерживающим все каналы, форматы и метрики. Каналы сопоставляются с реально поддерживаемыми адаптерами и capability matrix (v1.4 §12.1) на момент выпуска.

### 4.7. Слой результата

Привязка материала к цели (`goal`), публикации (`publication_attempt_id`) и версии (`content_version_id`). Метрики раздельно:

| Показатель | Источник | Хранение |
|---|---|---|
| Поисковые (impressions, clicks, position по URL) | GSC отчёт | `selena_performance.metric_snapshots` с `source=GSC`, `access_class=CONNECTED` |
| AI-видимость | AI Visibility (Visitor/API View раздельно) | Только ссылка на run/report AI Visibility. Не копируется и не смешивается |
| Социальные | provider metrics ingestion (`0031_postiz_performance_ingestion`) | `metric_snapshots` |
| Бизнес (лиды, брифы) | `/api/leads` → Telegram; CRM отсутствует в коде | `UNKNOWN` до появления integration evidence |

Рост показов не объявляется причиной роста бронирований (v1.4 §3.3, §16). Причинность — только с отдельным стандартом evidence.

## 5. Идентичность, brand и organization

Дополнительная проверка по запросу владельца. `[ФАКТ]`, если не указано иное.

| Система | Корень tenancy | Единица работы | Связь |
|---|---|---|---|
| `selena-OS` (Control Room / Content OS) | Better Auth `public.organization` | `public.brands.organization_id`; `brandId` — канонический идентификатор проекта Content OS (spec §6) | Каждая строка Control Room несёт **и** `organization_id`, **и** `brand_id`; контекст ставится `selena_registry.set_request_context(...)`; brand выбирается server-side под организацией (commit 8ac08e39 на r64y7u закрыл кросс-организационный выбор brand). `[ОТЧЁТ]` staging-БД «не содержит brands вообще» — commit-сообщение `ae74c818` на r64y7u (2026-09-05) |
| `selena-ai-visibility` | `public.organization` | `sv_projects.organization_id`; **FK на Elmo `brands` нет**; бренд — free-text `sv_project_profiles.brand_name` и иерархия `sv_entities` (`MASTER_BRAND/SUBBRAND/…`) | RLS `app.organization_id`, 35 политик (`0034`), forced RLS в поздних миграциях. `TENANT_ISOLATION_DESIGN.md` устарел в §4 |
| `Aether-Medium` | Команда 2–3 человека; роли admin/editor/viewer; organization как сущности нет | `projects.business_key ∈ {other_bali, kora, petid, doki, archidom, selena}` (CHECK constraint) | Skill pack и bridge scope привязаны к `business_key`. Кросс-системного ID нет |
| `ai-council` (Knowledge OS) | — | `registry/projects.json`: 7 проектов; contradiction #8 предлагает portfolio-wide `project_id`, `business_key` как alias | DRAFT 2026-09-01 |

Вывод: **три несвязанные модели идентичности** и ни одной таблицы соответствия. Content OS spec §6 и ledger решений явно откладывают `brand ↔ sv_project` до решения владельца.

`[PROPOSED]` Growth Engine вводит один owner-подтверждаемый реестр соответствий в `selena-OS` (additive migration, forced RLS, `organization_id` + `brand_id`):

```text
growth_project_bindings
  brand_id (canonical, FK public.brands)  ·  organization_id
  aether_project_id?        — UUID проекта Aether; глобально уникален среди активных bindings; ключ поиска при проекции событий
  aether_business_key?      — alias для skill packs/bridge scope; шесть значений не уникальны между организациями, поэтому НЕ ключ поиска
  sv_project_id?            — только после явного подтверждения владельца; без вывода по имени или URL
  gsc_property?             — свойство Search Console из config/gsc-properties.json
  site_repo? / site_path?   — канал «сайт»
  youtube_channel_ids[]     — OWN каналы
  confirmed_by, confirmed_at, version
```

Канонический ID — `brand_id` из `selena-OS`, потому что там уже живут approvals и releases. Четвёртый идентификатор не вводится; предложение Knowledge OS о portfolio-wide `project_id` совместимо: `brand_id` играет эту роль, остальные — aliases. Это `[OWNER_DECISION]` O2.

Правило изоляции: событие Aether проецируется в бренд только по `project_id` конверта, совпавшему с `aether_project_id` активного binding, и только если `business_key` события равен `aether_business_key` этого binding. Иначе — отказ (`NO_BINDING` / `BUSINESS_KEY_MISMATCH`) и audit. Receiver при этом остаётся recorder под ingestion-ролью; проекцию выполняет отдельный внутренний worker (ТЗ GE-3, решение O15).

## 6. Данные и контракты

`[PROPOSED]` Минимальные добавления к Content OS, только additive-миграции после `0036` (номера `0032`–`0036` заняты на развёрнутой ветке; номера `0032`–`0034` из Content OS spec §9 устарели, см. D5).

| Сущность | Назначение | Замечание |
|---|---|---|
| `growth_project_bindings` | раздел 5 | новая |
| `growth_signal_sources`, `growth_signals` | реестр источников и нормализованных сигналов с provenance, access_class, rights | могут быть реализованы как research registry из spec §9.2 с расширением |
| `growth_opportunities` | раздел 4.2: decision enum, rationale, evidence_refs, linked content | расширение opportunities spec §7.2 |
| `content_items.kind`, `content_versions.kind` | `BRIEF / ARTICLE / PAGE_UPDATE / SOCIAL_ADAPTATION / VIDEO_SCRIPT` | если колонки нет — additive |
| review evidence | результаты проверок 4.4 как evidence на версии | существующая модель `claims/evidence` в `content_versions` + `addReviewEvidenceFn` |
| события bridge v1.x | `content.draft_ready`, `content.qa_evidence`, `content.brief_ready` | minor-версия существующей схемы; fixtures обязательны |
| AI Visibility read-only export | `GET /api/v1/selena/recommendation-runs/{id}/actions` (или аналог) с API key и tenant recheck | новый endpoint в `selena-ai-visibility`; никакого доступа к БД из Growth. Это cross-product data flow по v1.4 §15/§24.3 → `[OWNER_DECISION]` O17 и Delta к v1.4; ключ AIV — только в managed secret store selena-OS, read-only scope |

Универсальная таблица результатов запрещена (v1.4 §5, B4). Review, social post, статья, транскрипт остаются в своих сущностях и связываются ссылками.

## 7. Роли и права

| Роль | Разрешено в Growth Engine | Запрещено |
|---|---|---|
| Владелец | Подтверждать bindings, источники, бюджеты, approvals, release, публикацию | — |
| Сотрудник (Aether Studio) | Ставить задачи research/drafting, править бриф, запускать QA | Owner approval, release, изменение bindings |
| Aether-агент | Research, draft, QA evidence, отправка результата в outbox | Approval, release, прямая запись в Control Room DB, вызов provider без permit |
| Selena Analyst (по v1.4) | Reviewer status на AI Visibility стороне | Не выдаёт content approval |
| Runtime: receiver/worker `selena-OS` | Принять событие, создать Inbox item, записать audit | Менять approvals, releases |
| Release Gateway | Проверить approval/policy/hash/manifest/provider/kill switch; dispatch только при `PRODUCTION` + точный flag + live transport | Всё остальное |

## 8. Ограничения и бюджеты

- Платные вызовы источников (Supadata, YouTube Data API, Bright Data datasets, DataForSEO, Gemini/LLM генерация внутри selena-OS): по умолчанию выключены; включение — per-provider flag + credential seam + `max_calls` + `cost_ceiling` или `UNKNOWN_COST_BLOCKED` + idempotency + durable ledger до dispatch (Content OS spec §11 = v1.4 §10).
- LLM-затраты Aether-агентов — тоже spend. Существующие лимиты `MAX_TASK_BUDGET_USD` и `MONTHLY_BUDGET_USD` в `app_settings` являются потолком; Growth-задача не может их поднимать. Первый срез проверяется на fixture без LLM, затем одна реальная задача — только по owner GO.
- Никакой scheduler не запускает research/drafting/publishing автоматически. Ежедневный Elmo-workflow `daily-blog-draft` не расширяется на Growth Engine (см. D10).
- Данные: GSC-отчёты и readiness остаются вне git; в Content OS — только агрегаты по своим свойствам; чужие бренды из query-листов не публикуются (правило journal в `SELENA-AI-COMPANY`).
- Social comments / conversation — PII classification, volume cap, retention/deletion перед любым сбором (v1.4 §21). Instagram Comments — BLOCKED.

## 9. MVP и последующие этапы

| Этап | Содержимое | Условие входа |
|---|---|---|
| **G0 — этот пакет** | Аудит, дополнение, ТЗ, review | Выполнено 2026-09-05, DRAFT |
| **G1 — гигиена интеграции** | Решение по развёрнутым веткам `claude/new-session-r64y7u` (merge в `main` через PR в обоих репозиториях или объявление их базой); перевыпуск bridge secret; браузерная проверка `cabinet` | `[OWNER_DECISION]` O1 |
| **G2 — идентичность** | `growth_project_bindings`, одна подтверждённая строка для бренда `Selena Systems` (`business_key=selena`), UI/серверная функция подтверждения | O2 |
| **G3 — первый срез** | Один разрешённый текстовый источник (локально предоставленный OWN-материал или помеченный синтетический fixture) → одно обоснованное решение (`REPURPOSE`) → один черновик статьи + одна LinkedIn-адаптация → QA evidence (6 проверок) → один Inbox item на проверенном staging. Без Remotion, без публикации, без live-источников | G1, G2; owner start gate |
| **G4 — сигналы** | Импорт GSC-агрегатов как UPLOADED; read-only export AI Visibility; реестр источников с fixture-адаптерами | G3 принят |
| **G5 — возможности и решения** | Fusion/dedupe, decision enum, priority rationale, связь с целями | G4 |
| **G6 — каналы** | Site-адаптер (по O7), LinkedIn dry-run → owner GO на первую реальную публикацию (Master ТЗ Stage 8) | O7; Gate 8 |
| **G7 — результат** | GSC per-URL snapshots, provider metrics, раздельные панели, UNKNOWN по умолчанию | G6 |
| **Later** | YouTube live research (Video Radar port / Supadata flag), Remotion видео, Telegram-канал, competitor refresh, Instagram/TikTok | отдельные capability/cost/rights gates |

Широкий линейный план «весь SEO → весь YouTube → все видео» не используется: каждый этап ограничен зависимостью и отдельным gate.

## 10. Расхождения реализации с утверждённой архитектурой

Фиксируются, не разрешаются этим документом. Продукт не переписывается под них.

| # | Расхождение | Evidence | Что делать |
|---|---|---|---|
| D1 | **Развёрнутый код ≠ `main`.** `selena-OS` staging и Aether production собираются с `claude/new-session-r64y7u`; в `main` selena-OS нет моста, Blotato, миграций 0032–0036; в Aether ветки `main` нет вовсе | Railway deployments meta; `git diff main origin/claude/new-session-r64y7u` | O1: merge через PR или объявить базу. Любое ТЗ обязано указывать точную базу |
| D2 | **Домены.** Selena OS web на `cabinet.selenasystems.com`, которого нет в Final Architecture §1; `os.` и `studio.` оба ведут в Aether | Railway domains | Архитектура: `os` → Selena OS после отдельного cutover. `cabinet` — временная дверь; зафиксировать или переименовать решением владельца |
| D3 | **Один web-деплой на два продукта в `selena-OS`.** Репозиторий несёт Elmo AI Visibility base (22 `sv_*` таблицы, routes, product switcher) рядом с Control Room; gap report R-003/R-004 говорит «one account for both products» | agent audit; `SELENA_OS_MVP_IMPLEMENTATION_GAP_REPORT.md` | Final Architecture §2/§4 требует раздельности продуктов. Клиентский AI Visibility SaaS реально живёт в `selena-ai-visibility`; Elmo-база в `selena-OS` — наследие форка. Нужна формулировка владельца: «AI Visibility в selena-OS — не продукт» либо план удаления навигации |
| D4 | Knowledge OS карта (2026-09-01) описывает Selena OS как «AI Visibility и Content OS» | `START_HERE.md` на `docs/selena-ecosystem-map` | Архитектура 2026-09-04 новее и имеет приоритет; карту обновить |
| D5 | Content OS spec §9 планирует миграции `0032`–`0034`; на развёрнутой ветке `0032`–`0036` уже заняты другим содержимым | migrations diff | Growth/Content OS Slice 1 начинаются с `0037+`; spec требует правки номеров |
| D6 | Content OS spec размещает генерацию (Gemini adapter) внутри `selena-OS`; Final Architecture называет Aether исполнительным слоем | spec §7.3 vs Final Arch §2 | O5 |
| D7 | `main` selena-OS: уникальность провайдера `(brand, platform, provider_account_ref)` без `environment` и без `status=ACTIVE`; на r64y7u — `0032_channel_provider_binding` | agent audit | Проверить `0032` при merge (ТЗ, Приложение A) |
| D8 | Aether на клонированной ветке: bridge только в n8n, без подписи и envelope-полей, без DLQ и тестов; на r64y7u — versioned contract, тесты, Control Room bridge | два аудита | Подтверждает O1: только r64y7u соответствует B4 |
| D9 | `TENANT_ISOLATION_DESIGN.md` (AI Visibility) утверждает отсутствие RLS-политик; миграция `0034` содержит 35 политик | audit | Обновить документ; `reports` без `organization_id` — актуально |
| D10 | `daily-blog-draft.yaml` (в обоих Elmo-форках) — scheduled paid workflow (Anthropic `claude-opus-5` до $3+$1, Oxylabs) с cron | workflow yaml | Не относится к Growth Engine напрямую, но противоречит духу «0 scheduled paid calls». `[OWNER_DECISION]` O8: оставить/выключить |
| D11 | Perplexity Visitor View заблокирован auth wall; v1.4 §12 называет Perplexity «existing» | HANDOFF, issue #141 | Не задача Growth Engine; влияет на AI_VISIBILITY-сигналы (UNKNOWN для Perplexity) |
| D12 | Aether `POST /tasks/{id}/approve` на клонированной ветке без state guard и без immutable record; на r64y7u — `0020` immutable approval | два аудита | O1 |
| D13 | Railway env selena-os-staging называется `production`; Final Architecture требует отдельный staging/production контур | Railway meta | Зафиксировать как staging по назначению; переименование — owner/infra решение, вне этого пакета |
| D14 | **Мост доставляет событие, не контент.** Payload `task.result.ready` = title/status/summary/artifact_count; receiver пишет только `aether_events`; проекции в `content_versions` нет; документы r64y7u называют это «один Inbox item» | `selena-aether-receiver.ts`, `0035`, `COVERAGE.md` Gate 6 | Для Growth Engine — первый инженерный элемент (раздел 4.5). Формулировку «Inbox item» в отчётах читать как «принятое событие» |
| D15 | Provider-neutral contract, registry, Postiz/Blotato release providers, publish policy и `authorize_provider_dispatch` существуют и покрыты тестами только в `packages/lib` и SQL; ни один файл в `apps/` их не импортирует | git grep на r64y7u | Канал LinkedIn — CODE_ONLY на уровне приложения; в ТЗ учтено как зависимость этапа G6 |
| D16 | Внутренние противоречия execution-документов r64y7u: число миграций (32/35/36/37), pgTAP (145/157/171), `DECISIONS.md` §9 «кода Blotato нет» при наличии `selena-blotato.ts`, `EXECUTION_REPORT.md` с устаревшими BLOCKED-строками, `REMAINING_BLOCKERS.md` #5 не обновлён после скриншота владельца 05.09 | agent audit | Не влияет на архитектуру; при merge (O1) документы синхронизировать |
| D17 | Aether: approval задачи выдаёт admin или project owner (не только владелец компании); это approval задачи со scope `send/publish/all`, а не content approval Control Room. Final Architecture: owner approval контента — только в Control Room | `approvals.py`, `0020` | Не конфликт при чтении «две разные approvals»: Aether-approval (scope `send`) управляет доставкой результата клиенту через `delivery.py`; мост в Control Room срабатывает на статусах `REPORTABLE_STATUSES` (уже при `pending_approval`) независимо от него; Control Room-approval — единственный approval выпуска. Growth Engine закрепляет это словами в контракте |

## 11. Решения владельца, необходимые до реализации

| # | Решение | Безопасный default до решения |
|---|---|---|
| O1 | База кода для Growth Engine: merge `claude/new-session-r64y7u` → `main` (оба репозитория) через PR с review, либо объявить r64y7u базой | Ничего не строить; ТЗ ссылается на r64y7u SHA как на «развёрнутую базу», на `main` как на «нормативную» |
| O2 | Канонический ID Growth = `brand_id` selena-OS; реестр `growth_project_bindings`; первая строка `Selena Systems ↔ business_key=selena`; `sv_project` не маппится | Нет маппинга; Growth только для бренда Selena Systems |
| O3 | Первый источник для среза G3: локальный OWN-материал (например, текст со страницы методологии `selenasystems.com`) или синтетический fixture, явно помеченный | Синтетический fixture; sample не выдаётся за исследование реального канала |
| O4 | Разрешение на одну реальную Aether-задачу (LLM spend в пределах существующих `MAX_TASK_BUDGET_USD`) после fixture-прогона | 0 LLM вызовов; только fixture |
| O5 | Где живёт drafting: Aether-агенты (default по архитектуре) или creation module Content OS с провайдер-адаптерами | Aether для Growth; Content OS creation остаётся для YouTube Stage 1 |
| O6 | Порядок относительно Content OS Stage 1: Growth G3 использует существующие `content_items/content_versions` и не ждёт Slices 1–5; Slice 1 (profile) идёт параллельно | G3 не блокируется Stage 1, но не создаёт параллельных таблиц для тех же понятий |
| O7 | Канал «сайт»: git-adapter за Release Gateway / CMS / вне MVP | Сайт вне MVP; первый срез заканчивается Inbox item |
| O8 | Судьба `daily-blog-draft.yaml` (scheduled paid) в двух репозиториях | Не трогать в рамках этого пакета |
| O9 | Перевыпуск `SELENA_AETHER_BRIDGE_SECRET` / `CONTROL_ROOM_BRIDGE_SECRET` (REMAINING_BLOCKERS #3) | Мост считается NOT-VERIFIED для новых событий до ротации |
| O10 | Live-источники (Supadata, YouTube Data API, Video Radar port с code-transfer authorization, Gemini) — по каждому отдельно: flag, потолок, права | Все выключены |
| O11 | Лимит тела `content.draft_ready`: payload ≤ 48 KB с расширением лимита приёмника до 96 KiB, либо `artifact_ref` + подписанный fetch | payload ≤ 48 KB; `artifact_ref` для большего |
| O12 | UI подтверждения binding: форма в Content OS Settings или серверная функция без UI в первом срезе | Серверная функция + минимальная форма |
| O13 | Нумерация миграций между Growth и Content OS Slice 1 | Lead выдаёт номера последовательно от `0037` |
| O14 | `content_versions.cta_url NOT NULL` (`0021`): требовать CTA от producer или ослабить до nullable additive-миграцией | Требовать от producer; ограничение не трогать |
| O15 | Исполнитель проекции события в `content_versions`: отдельный worker под логином `worker` (default) или расширение прав ingestion-роли receiver | Отдельный worker |
| O16 | Fixture-прогон GE-5 с production Aether (production-изменение) или с локального Aether владельца | Локальный Aether владельца |
| O17 | Экспорт результатов AI Visibility в Growth: pull-API/signed event, custody ключа, Delta к v1.4 §15/§24.3 | Не подключать |

## 12. Связь с утверждёнными архитектурами

| Раздел этого документа | Final Architecture | AI Visibility v1.4 | Master ТЗ |
|---|---|---|---|
| 1, 4 | §2 границы, §5 Control Room, §8–9 потоки | §2 связь с Selena OS, §3.3 не-цели | §2 неизменяемые решения |
| 4.5 | §9 Bridge, §6 Release Gateway | §2 versioned API/event | Stage 6 контракт |
| 4.6 | §10 Postiz/Blotato | — | Stage 7–8 |
| 4.7 | §9 Performance | §5 OUTCOMES, §16 | — |
| 5 | §4 репозитории и базы, §12 источник истины | §7 роли, §13 классы данных, §21 RLS | Wave 0 isolation checks |
| 8 | §13 безопасность | §10 permits/бюджеты, §22.1 stop conditions | Абсолютные запреты |
| 10 | §16 «если документы расходятся» | §23 не путать архитектуру и готовность | Wave 0 FACT/UNKNOWN |

## 13. Таблица изменений

| Что | Изменение |
|---|---|
| Нормативные документы (три исходника) | Не изменены |
| Репозитории | Добавлены только два DRAFT-файла в `SELENA-AI-COMPANY/docs/growth-engine/` коммитами на ветке `claude/new-session-wik9v3`. Код, миграции, workflows, env, DNS, Railway — не изменены |
| Внешние вызовы | Платных provider calls: 0. Публикаций: 0. Railway: только read-only метаданные (списки проектов, сервисов, доменов, деплоев). Значения переменных не читались |
| Клоны для аудита | `selena-OS`, `Aether-Medium`, `ai-council` подключены к сессии read-only; ветки `claude/new-session-r64y7u`, `docs/content-os-stage1-execution-plan`, `docs/selena-ecosystem-map`, `claude/content-promotion-methods-uaoywq` получены shallow-fetch для чтения |

Этот документ не объявляет Growth Engine работающим и не разрешает переход к разработке. Следующий шаг — решения O1–O3 и утверждение конкретного объёма среза G3 по парному ТЗ.
