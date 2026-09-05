# Selena Growth Engine — исполнимое ТЗ на реализацию

| Поле | Значение |
|---|---|
| Версия | 1.0 |
| Статус | **DRAFT для утверждения владельцем.** Не разрешение на разработку. Реализация начинается только после утверждения конкретного среза и прохождения gate GE-0 |
| Дата | 2026-09-05 |
| Парный документ | `GROWTH_ENGINE_EXTENSION_V1.0_DRAFT.md` (архитектурное дополнение; разделы 2, 5, 10, 11 там являются нормативными для этого ТЗ) |
| Режим подготовки | READ-ONLY DISCOVERY + DOCS-ONLY. Платных provider calls: 0. Публикаций: 0. Миграций: 0. Изменений env/DNS/Railway: 0 |
| Независимый review | Приложение C. Статус на момент публикации указан там |
| Поправка 1.1 (2026-09-06) | Раздел 5A: уточнение контракта, модели материалов и bindings по решению владельца (разрешение GE-1…GE-4). Реестр решений — `DECISION_LOG.md` |

## 1. Что заказано и что нет

Заказано: инженерная спецификация одного минимального вертикального среза Growth Engine и последовательности следующих этапов, с точными репозиториями, путями, зависимостями, проверками и критериями приёмки.

Не заказано и не разрешено этим ТЗ: реализация, миграции в любой общей базе, deploy, изменения DNS/auth/secrets, платные вызовы, публикации, включение HOLD-функций, повторный запуск Master ТЗ 2026-09-02.

## 2. Точная база кода

Все пути ниже даны относительно корня соответствующего репозитория. SHA проверены 2026-09-05.

| Репозиторий | Нормативная ветка | Развёрнутая ветка (Railway) | База для этого ТЗ |
|---|---|---|---|
| `parkourcafe/selena-OS` | `main` @ `39ec0ea3cf9b945babeaa288a49ef31d157035b8` | `claude/new-session-r64y7u` @ `05599f98434a8ee66496d5dfe1f523ddde98a4b8` | **r64y7u** (единственная ветка с мостом, `0032`–`0036`, provider contract). Требует решения O1 |
| `parkourcafe/Aether-Medium` | ветки `main` нет | `claude/new-session-r64y7u` @ `29d0e3814e35a8d5dc851db97163013c4cba4bf7` | **r64y7u** (bridge outbox, `0020` approvals, `0022` bridge_events). Требует O1 |
| `parkourcafe/selena-ai-visibility` | `release/selena-visibility-mvp` @ `0d18053cd0bce67939ac82526ca9258ed55fe469` (PR-ы идут сюда, не в `main`) | та же | та же |
| `parkourcafe/SELENA-AI-COMPANY` | `main` (Vercel); рабочая ветка `claude/new-session-wik9v3`, база `4bd1a053`, документы этого пакета добавлены коммитами поверх неё | `main` | `main` |

Правило: каждая ветка среза начинается от точного SHA принятой базы и указывает его в PR. Незакоммиченные изменения других людей не трогаются (на 2026-09-05 все четыре рабочих дерева чистые).

## 3. Preflight перед любой реализацией

| Проверка | Требование | Источник |
|---|---|---|
| Node.js | 24.x (`engines` selena-OS) | `AGENTS.md` selena-OS |
| pnpm | версия из `packageManager`; supply-chain controls не ослаблять | `AGENTS.md`, `pnpm-workspace.yaml` |
| Python | 3.11 (Aether CI) | `.github/workflows/ci.yml` Aether |
| Диск | ≥ 10 GiB свободно | Content OS execution plan §3.5 |
| Рабочее дерево | чистое; base SHA записан | там же |
| Секреты | `.env`, credential, key, cert файлы не читаются; значения не печатаются | там же; Master ТЗ |
| Disposable PostgreSQL | локальный кластер `127.0.0.1:5432`; `run-pgtap.sh` дропает БД по имени первого аргумента — использовать только `selena_pgtap_*` имена | `packages/lib/scripts/run-pgtap.sh` (r64y7u) |
| Сеть | Контейнер Claude Code не достигает `*.up.railway.app`, `kaiten.ru`, Hetzner; браузерные проверки выполняет владелец | REMAINING_BLOCKERS #5; MASTER_HANDOFF §9 |

Если пункт не выполнен — фиксируется и останавливается только зависимая работа.

## 4. Карта зависимостей и последовательность

```text
GE-0  Утверждение DRAFT + решения O1, O2, O3 (owner)
  │
  ├─► GE-1  Контракт v1.1 (schema + fixtures + тесты обеих сторон)      [selena-OS lib, Aether backend]  — без БД
  │      │
  │      ├─► GE-2  Bindings: миграция 0037 + pgTAP + repeat/no-op        [selena-OS]      — disposable DB, owner-authorized
  │      │      │
  │      │      └─► GE-3  Проекция события → content_version + audit     [selena-OS worker/lib] — disposable DB
  │      │
  │      └─► GE-3a Producer `content.draft_ready` + fixture-task          [Aether]         — локальный Postgres
  │
  └─► GE-4  Fixture vertical локально: Aether fixture → outbox → receiver → content_version → Inbox (Control Room UI)
              externalProviderCalls = 0, LLM calls = 0
          │
          ├─► GE-5  Staging: deploy receiver/worker (owner GO), ротация bridge secret (O9), брендовая строка bindings (owner в UI),
          │         один fixture-item в Inbox на cabinet.selenasystems.com — браузерная проверка владельцем
          │
          └─► GE-6  Одна реальная Aether-задача под существующим бюджетом (O4) → тот же путь
                       │
                       └─► следующие этапы G4–G7 (сигналы, решения, каналы, результат) — отдельные ТЗ-дельты
```

Параллельно допустимо: GE-1 и подготовка GE-2 (SQL + pgTAP без применения); GE-3 и GE-3a после freeze контракта. Последовательно обязательно: freeze контракта → producer/consumer; миграция → проекция; локальный vertical → staging.

Content OS Stage 1 (Slices 1–5) не является предпосылкой: срез использует уже существующие `content_items`/`content_versions` (`0021`) и не создаёт параллельных таблиц для профиля, research или creation. Если Slice 1 стартует раньше, оба потока делят одну нумерацию миграций (`0037+`) через Lead.

## 5. Спецификация этапов


### 5A. Уточнения по решению владельца от 2026-09-06 (приоритет над текстом GE-1…GE-4 ниже)

**5A.1. Модель материалов.** Одна fixture-задача создаёт **два материала**: `ARTICLE` и `SOCIAL_ADAPTATION` (LinkedIn). Каждый материал — отдельный агрегат со **стабильным `aggregate_id`**: `uuid5(GROWTH_MATERIAL_NAMESPACE, "<project_id>:<brief_ref>:<content_kind>")` (`brief_ref = task_id`; проект входит в имя, чтобы знание чужого `task_id` не позволяло адресовать чужой агрегат), где `GROWTH_MATERIAL_NAMESPACE` — фиксированная константа контракта `2f7f0f5e-6b1a-5c3a-9c2e-1d4b7a8e9f01` (одинаковая в обоих репозиториях, проверяется тестом). Общий `brief_ref = task_id` связывает оба материала с одним заданием. `version` — монотонная версия **агрегата-материала** (`max(version)+1` по `(destination, aggregate_id)` в outbox Aether); в Control Room `content_versions.version = envelope.version`, отдельного номера версии в payload нет. Повторная постановка того же содержимого не создаёт новую версию (сравнение `payload_hash` с последней версией агрегата); изменение одного материала даёт новую версию только его агрегата и не трогает второй. Формулировка «один Inbox item на задание» снята: **один Inbox item = одна карточка материала**; на одно задание — две карточки. Событие `task.result.ready` (v1) сохраняется без изменений: его `aggregate_id = task_id`, что не пересекается с uuid5-идентификаторами материалов; в Aether FK `bridge_events.aggregate_id → tasks(id)` снимается миграцией `0023`, ссылка на задачу переносится в новую колонку `task_id`.

**5A.2. Контракт `content.draft_ready` (schema 1.1).** Payload:

| Поле | Правило |
|---|---|
| `content_kind` | `ARTICLE` \| `SOCIAL_ADAPTATION` (остальные виды enum зарезервированы, в срезе не производятся) |
| `title` | строка 1–200 символов |
| `language` | BCP-47, 2–16 символов |
| `body_markdown` | **только inline**; 1 … **48 000 байт UTF-8** (проверка по байтам, не по символам); `artifact_ref` и внешние артефакты — вне среза |
| `metadata.cta_url` | **обязателен**; абсолютный `https://` URL ≤ 2048 символов, без userinfo, без `#fragment`; парсится `URL`/`urlsplit`; иначе `EventRejected('payload')`. Проецируется в `content_versions.cta_url` (NOT NULL по `0021`) |
| `metadata.slug`, `meta_title`, `meta_description` | опциональны, ≤ 200 / 200 / 500 |
| `metadata.internal_links[]` | ≤ 20 `https://` URL |
| `claims[]` | ≤ 50 × `{text ≤ 500, status ∈ {EXTRACTED, INTERPRETED, HYPOTHESIS, UNKNOWN}, source_ref?}` |
| `evidence[]` | ≤ 50 × `{kind, ref, captured_at}` |
| `qa_results[]` | ровно шесть проверок `FACTS, LINKS, NOVELTY, BRAND, TECHNICAL, ISOLATION`, каждая один раз, `verdict ∈ {PASS, FAIL, UNKNOWN}`, `detail ≤ 500` |
| `source` | `{kind ∈ {OWN, EXTERNAL, SYNTHETIC_FIXTURE}, ref ≤ 500, rights ≤ 200}` |
| `brief_ref` | UUID задания |
| `business_key` | `^[a-z_]{2,32}$`, проверочный alias |

Конверт: `schema_version = "1.1"`, `trace_id` — UUID, остальные поля как в v1. `payload_hash` покрывает весь payload. Лимит **всего HTTP-тела** приёмника — отдельная константа `MAX_EVENT_BODY_BYTES = 512 KiB`: она выше максимального валидного конверта при всех полевых лимитах разом (поля в code points — четырёхбайтные символы, `body_markdown` — кавычки, по два байта JSON на байт UTF-8; ≈475 KB), и тест на обеих сторонах держит это неравенство. Чтобы оценка держалась, во всех строках нагрузки запрещены управляющие символы C0, кроме `\t`, `\n`, `\r` (в каноническом JSON каждый стоит шесть байт); хосты https-адресов — только буквы, цифры, точки и дефисы (IDN в punycode) или IPv6 в скобках без zone id, порт без ведущего нуля, «почти IPv4» хосты только в строгой форме a.b.c.d — так формы, на которых разборщики URL двух платформ расходятся, не доходят до разборщика ни на одной стороне; превышение → `413 {reason: "body"}`; превышение лимита `body_markdown` → `400 {reason: "payload"}` (по проводу возвращается только код причины, текст остаётся в логе приёмника). Длины строк во всём контракте считаются в code points (как `maxLength` JSON Schema); байты считает только `body_markdown`. Даты (`occurred_at`, `evidence.captured_at`) — RFC 3339 с обязательной зоной и проверкой диапазонов (месяц, день, час, минута, секунда с високосной 60, смещение), проверяются текстом на обеих сторонах; это ужесточение затрагивает и `occurred_at` конверта v1 (ранее принимался любой разбираемый ISO-текст) — оба отправителя всегда писали строгую форму, фикстуры v1 не изменились. Одиночные суррогаты UTF-16 отвергаются. Имена неизвестных полей в сообщениях об ошибке не воспроизводятся. Опциональные строки `metadata.slug/meta_title/meta_description`, `claims.source_ref` — минимум 1 символ; `internal_links` — до 20 https-адресов по тем же правилам, что `cta_url`; `evidence.kind ≤ 50`, `evidence.ref ≤ 500`.

**Конфликт содержимого.** (`payload_hash` на проводе хранится как `payload_sha256` в `aether_events`.) Одинаковые `aggregate_id`/`version` с другим хэшем — **конфликт**, не дубль: функция записи поднимает ошибку с SQLSTATE `SE409`, приёмник отвечает `409 {reason: "conflict"}` и пишет строку в собственный лог без тела (audit-цепочку receiver не пишет: у `selena_ingestion_runtime` нет доступа к `selena_audit`, это осознанная граница); отправитель по `409` сразу переводит событие в dead-letter (`ControlRoomConflict`), не повторяя доставку; повтор того же `event_id` с другим содержимым — тот же `409`. Одинаковые `aggregate_id`/`version` с тем же хэшем — `duplicate` (202). `version` меньше уже записанной — `stale` (202).

**5A.3. Bindings и роль worker.** Таблица `selena_registry.growth_project_bindings`: `organization_id`, `brand_id`, `aether_project_id uuid NOT NULL`, `aether_business_key text NOT NULL CHECK (~ '^[a-z_]{2,32}$')`, `source_environment text NOT NULL CHECK (IN ('local','staging','production'))`, `confirmed_by`, `confirmed_at`, `revoked_at`, `revoked_by`, `revoke_reason`; composite FK `(brand_id, organization_id) → public.brands(id, organization_id)` (добавляется уникальный индекс `brands_identity_unique`); **`UNIQUE (aether_project_id, source_environment) WHERE revoked_at IS NULL`** — один активный binding на проект и среду во всей базе; `business_key` — только сверка, не ключ и не основание выбора бренда. Подтверждение и отзыв — только SECURITY DEFINER-функции `confirm_growth_binding` / `revoke_growth_binding`, доступные `selena_web_runtime` и требующие `can_human_approve` (интерактивная owner-сессия под `set_request_context`). Web читает строки по RLS `can_access_brand(..., ARRAY['web'])`.

Путь projection worker: подключение логином `selena_worker_login` → группа `selena_registry_worker_runtime` (NOINHERIT, `SET ROLE` автоматически); worker ставит `app.selena_service_identity = 'registry_worker'`, `app.selena_auth_type = 'service'`, `app.selena_actor_id = 'service:registry-worker'` и вызывает `selena_registry.resolve_growth_binding(p_aether_project_id, p_source_environment)` — SECURITY DEFINER, EXECUTE только у worker-роли, внутри проверяет `pg_has_role(session_user, 'selena_registry_worker_runtime')` и настройки контекста, возвращает **только активную** строку (`revoked_at IS NULL`) для среды, объявленной переменной `SELENA_GROWTH_SOURCE_ENVIRONMENT` самого worker. Затем worker вызывает штатный `selena_registry.set_request_context('service:registry-worker', organization_id, brand_id, 'service', <uuid>, 'registry_worker', 'service')` и пишет `content_items`/`content_versions`/`audit_events` **под RLS-политиками** `can_write_brand(..., ARRAY['registry_worker'])`, которые добавляет миграция `0039`. Отзыв binding → `resolve_*` возвращает пустой результат → событие **откладывается** (`defer_aether_event_projection`: `projection_error = 'NO_BINDING'`, `projection_attempts + 1`, `projection_next_attempt_at = now() + min(1 ч, 30 с · 2^attempts)`), версия не создаётся; после подтверждения binding (или появления `content_policies` бренда — код `NO_CONTENT_POLICY`) отложенное событие проецируется штатно при следующем сроке. Окончательные отказы (`BUSINESS_KEY_MISMATCH`, `NOT_A_MATERIAL`, `PROJECTION_FAILED`) фиксируются `mark_aether_event_projected(..., NULL, code)` с `projected_at` и не пересматриваются. Причина различия: отправитель не повторяет неизменённый материал (сравнение `payload_hash`), поэтому отсутствие предпосылки на стороне Control Room не должно навсегда терять черновик (GD-05). Ни один шаг не выполняется под `selena_schema_owner` или суперпользователем; pgTAP проверяет это отрицательными утверждениями.

**5A.4. Нумерация миграций.** Занято на 2026-09-06: `0032`–`0036` (база), `0037_content_project_profiles` (параллельная ветка `feat/content-os-slice1`). Срез использует **`0038_growth_project_bindings`** и **`0039_aether_events_content_draft`**; Aether — **`0023_bridge_material_events`**.

**5A.5. Definition of Done среза (замена п. 3 §11).** Одна fixture-задача → ровно две карточки (две `content_items`, по одной `content_versions` каждая, общий `brief_ref`); повтор доставки и повтор запуска worker не увеличивают число карточек и версий; новая версия одного материала не изменяет второй; отдельные тесты: неверная подпись, устаревшее событие, конфликт содержимого, отсутствующий и отозванный binding, чужая организация, неверный `business_key`, `QA FAIL`, `QA UNKNOWN`; approval/release в основном сценарии не создаются; provider dispatch и публикации = 0; тесты под штатными runtime-ролями; миграции воспроизводимы, повтор — no-op.

### GE-0. Утверждение

Вход: оба DRAFT-документа. Выход: письменные решения O1 (база), O2 (bindings/ID), O3 (источник для среза). Без них ни одна ветка не создаётся.

### GE-1. Контракт `control-room-event` v1.1

**Цель.** Событие может переносить содержимое черновика и результаты QA, а не только `title/status/summary`.

| Сторона | Путь | Изменение |
|---|---|---|
| selena-OS | `packages/lib/src/contracts/control-room-event.v1.1.schema.json` (новый) | `schema_version` const `"1.1"`; `event_type` enum: `task.result.ready`, **`content.draft_ready`**; payload для `content.draft_ready`: `content_kind ∈ {BRIEF, ARTICLE, PAGE_UPDATE, SOCIAL_ADAPTATION, VIDEO_SCRIPT}`, `title ≤200`, `body_markdown ≤ 48 000 байт` **или** `artifact_ref {artifact_id, sha256, bytes}` (одно из двух, `oneOf`), `language`, `metadata {slug?, meta_title?, meta_description?, internal_links[]}`, `claims[] {text, status ∈ {EXTRACTED, INTERPRETED, HYPOTHESIS, UNKNOWN}, source_ref?}`, `evidence[] {kind, ref, captured_at}`, `qa_results[] {check ∈ {FACTS, LINKS, NOVELTY, BRAND, TECHNICAL, ISOLATION}, verdict ∈ {PASS, FAIL, UNKNOWN}, detail ≤ 500}`, `source {kind ∈ {OWN, EXTERNAL, SYNTHETIC_FIXTURE}, ref, rights}`, `business_key`, `brief_ref uuid` (общий для статьи и её социальной адаптации). `trace_id` в v1.1 — UUID-паттерн. `additionalProperties: false`. `payload_hash` покрывает весь payload |
| selena-OS | `packages/lib/src/contracts/control-room-event.v1.1.fixtures.json` (новый) | Байт-в-байт копия `contracts/control-room-event.v1.1.fixtures.json` из Aether, генерируется `backend/scripts/generate_bridge_fixtures.py`; актуальный перечень кейсов (40: два принятых материала, v1-конверт, версии/stale, подпись, хеш, деривация aggregate_id, поля и лимиты, C0-символы, даты, грамматика хостов, QA FAIL/UNKNOWN) — в самом файле, а не здесь |
| selena-OS | `packages/lib/src/selena-aether-bridge.ts` | `SCHEMA_VERSIONS = ["1","1.1"]`; `parseEnvelope` ветвится по `event_type`; экспорт `EVENT_CONTENT_DRAFT_READY`. Существующие тесты (13 `it` + `it.each`×5 = 18 исполнений) не меняются; добавляются кейсы по каждой fixture |
| Aether | `contracts/control-room-event.v1.1.schema.json`, `backend/scripts/generate_bridge_fixtures.py` | Генератор детерминированных fixtures расширяется; JSON-schema идентична байт-в-байт файлу selena-OS (проверка `sha256` в тесте обеих сторон) |
| Aether | `backend/app/services/bridge_events.py`, `backend/app/services/bridge_outbox.py` | `build_envelope` принимает `event_type`; `REPORTABLE_STATUSES` (определён в `bridge_outbox.py`) не меняется; `payload_hash` — тот же canonical JSON |

**Тесты.** selena-OS: `packages/lib/src/selena-aether-bridge.test.ts` (расширить), `apps/worker/src/selena-aether-receiver.test.ts` (400 `payload` при `body_markdown` > 48 000 байт; 413 `body` при HTTP-теле > `MAX_EVENT_BODY_BYTES` = 512 KiB; `artifact_ref` в этой версии контракта не передаётся). Aether: `backend/tests/test_bridge_events.py` (расширить). Кросс-проверка: тест в каждом репозитории читает fixtures другого репозитория из зафиксированного файла (копия с SHA в комментарии).

**Критерий приёмки GE-1.** Обе схемы идентичны; fixtures проходят с обеих сторон; `pnpm --filter @workspace/lib test` и `pnpm --dir apps/worker test` зелёные; `pytest -q backend/tests/test_bridge_events.py` зелёный; v1-события принимаются без изменений. Контракт объявлен FROZEN записью в PR.

### GE-2. Реестр соответствий `growth_project_bindings`

| Путь | Содержимое |
|---|---|
| `packages/lib/src/db/migrations/0037_growth_project_bindings.sql` | Таблица `selena_registry.growth_project_bindings (id uuid pk, organization_id text not null references public.organization(id), brand_id text not null references public.brands(id), aether_project_id uuid, aether_business_key text, sv_project_id text, gsc_property text, site_repo text, site_path text, youtube_channel_ids text[] default '{}', confirmed_by text not null, confirmed_at timestamptz not null default now(), version integer not null default 1, revoked_at timestamptz)`; composite FK `(brand_id, organization_id)` → `public.brands(id, organization_id)` (индекс `channel_accounts_identity_unique` показывает принятый паттерн); `unique (brand_id) where revoked_at is null`; **`unique (aether_project_id) where revoked_at is null and aether_project_id is not null`** (глобально, не в пределах организации: один Aether-проект может принадлежать ровно одному бренду); `check ((aether_project_id is null) = (aether_business_key is null))`; `unique index if not exists brands_identity_unique on public.brands (id, organization_id)` — предпосылка composite FK, сегодня в миграциях отсутствует; `check (aether_business_key ~ '^[a-z_]{2,32}$')`; `enable row level security` + `force row level security`; политики по `selena_registry.set_request_context` как у `content_items`; `selena_web_runtime` — SELECT + INSERT только через функцию `selena_registry.confirm_growth_binding(...)` (SECURITY DEFINER, проверяет `role = 'owner'` и `auth_type = 'session'` из request context); `selena_ingestion_runtime` — **без прав** на bindings (receiver binding не ищет); `selena_registry_worker_runtime` (логин `worker`, DEPLOYING.md §2) — SELECT только `(brand_id, organization_id, aether_project_id, aether_business_key)` для projection-worker; этот grant перечисляется здесь, в `0037`, а не в `0038` |
| `packages/lib/src/db/tests/0037_growth_project_bindings.pgtap.sql` | ≥ 12 утверждений: forced RLS; чужая организация не видит строку; не-owner не может подтвердить; второй активный binding того же бренда → `23505`; тот же `business_key` во второй бренд той же организации → `23505`; revoke сохраняет историю; ingestion role не читает `gsc_property`; два бренда разных организаций не могут подтвердить один `aether_project_id` → `23505` |
| `packages/lib/src/db/migrations/meta/_journal.json` | запись idx 37; snapshot по текущей конвенции Drizzle (проверить, не предполагать) |
| `packages/lib/src/db/schema.ts` | экспорт `scrGrowthProjectBindings` |
| `apps/web/src/server/selena-growth-bindings.ts` (новый) | `confirmGrowthBindingFn` (owner-only; `assertHumanReviewer` сегодня не экспортируется из `selena-control-room.ts` — экспортировать или использовать `isInteractiveOwnerSession` из `@workspace/lib`), `getGrowthBindingFn` |
| `apps/web/src/routes/_authed/app/$brand/control-room.tsx` | Не расширяется в этом срезе: подтверждение binding — минимальная форма в Settings-разделе Content OS или серверная функция, вызываемая из существующего экрана. UI-решение фиксируется в PR |

**Правила.** Исторические миграции неизменны. Применение только в disposable БД и только после письменной авторизации владельца на этап (Content OS plan §3.4). Повторный прогон — no-op.

**Критерий приёмки GE-2.** `bash packages/lib/scripts/run-pgtap.sh selena_pgtap_ge2` проходит все 15 наборов (14 существующих + новый), 0 not ok; `node packages/lib/scripts/run-migrations.mjs` дважды на чистой БД — второй прогон no-op; ни одна строка не создаётся без owner-сессии в тесте.

### GE-3. Проекция события в Control Room

| Путь | Содержимое |
|---|---|
| `packages/lib/src/db/migrations/0038_aether_events_content_draft.sql` | (a) Пересоздание CHECK на `selena_ingest_raw.aether_events.event_type` с добавлением `content.draft_ready` и `schema_version in ('1','1.1')`; колонки `projected_content_version_id uuid null references selena_registry.content_versions(id)`, `projection_error text null`; функция `selena_ingest_raw.mark_aether_event_projected(event_id, content_version_id)`. (b) `selena_registry.content_items`: additive колонки `kind text null check (kind in ('BRIEF','ARTICLE','PAGE_UPDATE','SOCIAL_ADAPTATION','VIDEO_SCRIPT'))`, `external_source text null` (`'aether'`), `external_ref uuid null` (= `aggregate_id`), `brief_ref uuid null`; partial unique `(brand_id, external_source, external_ref) where external_ref is not null`. (c) `content_versions.cta_url` сегодня `NOT NULL` (`0021`): срез **не** ослабляет ограничение; producer обязан передать `metadata.cta_url` (для статьи — канонический URL страницы бренда или явный `about:blank`-запрет отклоняется валидатором → событие `recorded`, проекция `projection_error = 'CTA_URL_MISSING'`). Решение о nullable — O14. (d) `policy_version` берётся из текущей активной `selena_registry.content_policies` бренда; при отсутствии политики проекция не выполняется (`projection_error = 'NO_CONTENT_POLICY'`). pgTAP `0038_*.pgtap.sql` ≥ 10 утверждений |
| `packages/lib/src/selena-aether-projection.ts` (новый, pure) | `projectDraftEvent(envelope, binding) → ContentDraftInput` : binding ищется **по `envelope.project_id`** (UUID Aether-проекта, обязательное поле конверта v1) — глобально уникальному ключу; затем проверка `envelope.payload.business_key == binding.aether_business_key`, иначе `ProjectionRejected('BUSINESS_KEY_MISMATCH')`; `business_key` сам по себе никогда не является ключом поиска (шесть значений не уникальны между организациями); расчёт `content_hash` через существующий `contentVersionHash`; маппинг `claims/evidence/qa_results` в `content_versions.claims/evidence` и review evidence; `UNKNOWN`-claims помечают версию `needs_verification = true` (если поля нет — в `disclosure`) |
| `packages/lib/src/content-workflow-repositories.ts` (новый, целевое место по Content OS spec §8) | `createDraftVersionFromEvent(tx, input)`: в одной транзакции под `set_request_context('service:projection-worker', organization_id, brand_id, 'service', <новый correlation uuid>, 'worker', 'service')` (`p_correlation_id` — `uuid`; `trace_id` конверта в v1 — произвольная строка, поэтому кладётся в payload audit-события, а в v1.1 ограничивается UUID-паттерном): upsert `content_items` по `(brand_id, external_ref = aggregate_id)`, insert `content_versions` с `version = payload.version`, `immutable = true`; `appendAudit('content.draft_received', {event_id, aggregate_id, version, content_hash})`; `mark_aether_event_projected`. Идемпотентность: `unique (content_id, version)` уже существует → повтор = no-op с возвратом существующего id |
| `apps/worker/src/selena-aether-receiver.ts` | **Не меняется по ответственности**: остаётся recorder под `selena_ingestion_runtime` (REVOKE ALL на `aether_events`, только EXECUTE `record_aether_event`). Единственное изменение — принимать `schema_version 1.1` и `content.draft_ready` (валидация GE-1). Интернет-facing процесс не получает прав записи в `selena_registry` |
| `apps/worker/src/selena-aether-projection-worker.ts` (новый) | Отдельный внутренний job под runtime-логином `worker` (DEPLOYING.md §2), не под ingestion-ролью: выбирает из `selena_ingest_raw.aether_events` строки `event_type = content.draft_ready and projected_content_version_id is null and projection_error is null` (`for update skip locked`), ищет binding по `project_id`; при отсутствии → `projection_error = 'NO_BINDING'` + audit; иначе → проекция; `duplicate`/`stale` в таблицу не попадают вовсе (receiver их не записывает как новые). Ошибка проекции не теряет событие: строка остаётся с `projection_error` (код, без тела). Требуемые GRANT'ы для роли worker перечисляются явно: в `0037` — SELECT нужных колонок `growth_project_bindings`; в `0038` — SELECT/UPDATE `aether_events` по нужным колонкам (`projected_content_version_id`, `projection_error`), INSERT `content_items`/`content_versions`/`audit_events`, EXECUTE `mark_aether_event_projected`; выносятся на решение O15 |
| `packages/lib/src/selena-control-room.ts` | `ReleaseBlockReason` получает `QA_FAILED` и `NEEDS_VERIFICATION`; `evaluateReleaseGate` читает их из `disclosure` версии; тест в `selena-control-room.test.ts` |
| `packages/config/src/env-registry.ts`, `turbo.json`, `apps/web/src/env.d.ts` | Флаг `GROWTH_ENGINE_STAGE1_ENABLED` (только точное `"true"`; fail-closed как `CONTENT_OS_STAGE1_ENABLED`); проекция и `confirmGrowthBindingFn` выключены без него |

**Тесты (vitest + disposable PG).** `apps/worker/src/selena-aether-receiver.test.ts` (receiver остаётся recorder): неверная подпись → 401, тело не парсится, audit; истёкшая метка времени → 401; повтор `event_id` → `duplicate`; меньшая `version` того же `aggregate_id` → `stale`; тело > лимита → 413; `schema_version 1.1` с `content.draft_ready` → `recorded`. `apps/worker/src/selena-aether-projection-worker.test.ts` (новый): одно `recorded` событие → ровно одна `content_versions`; повторный запуск worker по той же строке → 0 новых строк; `project_id` без активного binding → `projection_error = 'NO_BINDING'`, 0 строк, audit; `project_id` с binding, но `business_key` ≠ `aether_business_key` → `BUSINESS_KEY_MISMATCH`, 0 строк; попытка второй организации подтвердить тот же `aether_project_id` → `23505` (pgTAP `0037`); `qa_results` с `FAIL` → версия создаётся, `disclosure` помечает `qa_failed`, `evaluateReleaseGate` возвращает `QA_FAILED`; `claims` с `UNKNOWN` → `NEEDS_VERIFICATION`; попытка `approveContentVersionFn` от `member` → отказ (существующий тест `isInteractiveOwnerSession`). `packages/lib/src/selena-aether-projection.test.ts`: pure-маппинг, хэш стабилен, отклонения.

**Критерий приёмки GE-3.** Все перечисленные негативные проверки — отдельные `it()`; `pnpm --dir apps/worker test` зелёный; pgTAP 16 наборов 0 not ok; повторный `run-migrations.mjs` no-op; в Control Room Inbox (локальный запуск на мигрированной БД) строка версии видна с источником `Aether · SYNTHETIC_FIXTURE`.

### GE-3a. Producer в Aether

| Путь | Содержимое |
|---|---|
| `backend/app/services/bridge_events.py` | `build_content_draft_envelope(task, artifacts)`: читает из workspace задачи файлы контракта результата (ниже), собирает payload v1.1; `body_markdown` из `draft.md`, `qa_results` из `qa.json`, `claims` из `claims.json`; размер > лимита → `artifact_ref` (артефакт уже хранится в `project_files`/`artifacts`) |
| `backend/app/services/repository.py` | В `_update_task_status_in_transaction`: если задача помечена `result.kind == "content_draft"` и статус ∈ `REPORTABLE_STATUSES` — enqueue `content.draft_ready` в тот же outbox `bridge_events` (таблица `0022`), `destination='control_room'`, unique `(destination, aggregate_id, version)` уже есть |
| `backend/app/agents/skills/selena-growth-draft/SKILL.md` (новый) | Контракт результата: агент обязан записать `draft.md`, `social_linkedin.md`, `brief.json`, `claims.json` (каждое утверждение с `status`), `qa.json` (6 проверок, `UNKNOWN` разрешён), `source.json` (`kind`, `ref`, `rights`); запрет выдумывать цифры; EXTERNAL-источник только для исследования. Загружается существующим `skills.py` по префиксу `selena` |
| `backend/app/services/fixtures/growth_draft_fixture.py` (новый) | Детерминированный набор файлов результата без LLM (для GE-4); помечен `source.kind = SYNTHETIC_FIXTURE`; используется только в тестах и в явно запущенной fixture-задаче (`CreateTaskRequest.agent_key = "growth-fixture"` доступен только admin и только при `AETHER_GROWTH_FIXTURE_ENABLED = "true"`) |
| `backend/app/services/bridge_scope.py` | Без изменений: `CONTROL_ROOM_BRIDGE_BUSINESS_KEYS` остаётся единственным allow-list |

**Тесты.** `backend/tests/test_bridge_events.py` (payload v1.1, лимиты, hash), `backend/tests/test_growth_draft_fixture.py` (файлы контракта валидны по schema), `backend/tests/test_bridge_delivery.py` (без изменений: транспорт тот же). `ruff check app tests scripts` чист.

**Критерий приёмки GE-3a.** `pytest -q` зелёный на локальном Postgres 16 (CI-паттерн); одна fixture-задача создаёт ровно одну строку `bridge_events` со статусом `pending`; повторный переход статуса той же версии — 0 новых строк; задача без `business_key` или вне allow-list — 0 строк.

### GE-4. Локальный vertical (fixture)

Среда: локальные Aether (inline-режим, без Redis) и selena-OS receiver + web на disposable БД; `CONTROL_ROOM_BRIDGE_URL` указывает на локальный receiver; секрет — тестовый, сгенерированный локально, не сохраняемый.

Сценарий: admin создаёт проект `business_key=selena` → запускает `growth-fixture` → задача доходит до `pending_approval` → outbox `sent` → receiver `recorded` → проекция → в Control Room `/app/$brand/control-room#inbox` видна одна версия `ARTICLE` и одна `SOCIAL_ADAPTATION` (два события, две версии двух `content_items`, связанных `content_items.brief_ref`) → review evidence содержит 6 QA-строк → Approve недоступен для `member`, доступен `owner`, **но не выполняется в срезе** → Release не создаётся.

Доказательства: логи receiver (verdict + ids), строки `aether_events`, `content_versions`, `audit_events`; вывод счётчика внешних вызовов (`disarmedFetch`, счётчик `externalProviderCalls = 0`, LLM calls = 0 по логу Aether `agent_runs` пусто).

**Критерий приёмки GE-4.** Все строки таблицы «Обязательные негативные проверки» (раздел 7) имеют PASS с evidence; ни одного внешнего вызова; `pnpm test` и `pytest -q` полных наборов зелёные на финальном SHA каждой ветки; blind delta-review (Приложение C, процесс) без BLOCKER.

### GE-5. Staging (owner GO)

**Предупреждение.** У Aether один Railway-env `production` (Приложение B.2); staging-контура Aether не существует (`UNKNOWN`). Любой запуск fixture-producer с развёрнутого Aether — это изменение переменной production-сервиса и запись fixture-проекта в production-БД Aether, то есть production-изменение, запрещённое без отдельного решения. Default этого ТЗ: producer запускается **локально на машине владельца** (локальный Aether в inline-режиме, `CONTROL_ROOM_BRIDGE_URL` → staging receiver, секрет — новый, после O9), а production Aether не трогается. Использование production Aether — `[OWNER_DECISION]` O16.

Предпосылки: O1 выполнен (код в базе, которую собирает Railway); O9 — ротация bridge secret обеими сторонами (comma-list, без простоя); владелец создал бренд `Selena Systems` в `cabinet.selenasystems.com` (БД staging брендов не содержит) и подтвердил binding `business_key=selena` в UI; `GROWTH_ENGINE_STAGE1_ENABLED="true"` только на staging web/receiver; `AETHER_GROWTH_FIXTURE_ENABLED="true"` только в локальном Aether владельца (или в production Aether при O16 — на время прогона).

Действие: одна fixture-задача с локального Aether владельца (или production Aether при O16) → staging receiver → projection worker → Inbox. Браузерная проверка владельцем (скриншот с URL, брендом, ролью, карточкой). Затем `AETHER_GROWTH_FIXTURE_ENABLED` выключается.

Что не делается: approve, release, публикация, изменение DNS, production AI Visibility.

### GE-6. Одна реальная задача (O4)

Та же дорожка с настоящим агентом по `selena-growth-draft` и источником по O3. LLM-затраты — в пределах `MAX_TASK_BUDGET_USD`; счётчик стоимости из `agent_runs` прилагается к отчёту. Внешние источники — выключены (`source.kind = OWN`, материал предоставлен локально). Публикации нет.

### Этапы G4–G7 (после приёмки среза; отдельные ТЗ-дельты)

| Этап | Репозиторий / путь | Что | Зависимость |
|---|---|---|---|
| G4-a Search import | `SELENA-AI-COMPANY/scripts/gsc-report.ts` → новый `scripts/gsc-export-growth.ts`: агрегаты по собственным свойствам без query-строк третьих лиц → JSON артефакт → загрузка как UPLOADED в Content OS через owner-действие | Класс UPLOADED, consent, checksum (v1.4 §13.1) | GE-4 |
| G4-b AI Visibility export | `selena-ai-visibility/apps/web/src/routes/api/v1/selena/recommendation-runs/$runId/actions.ts` (GET; API key; tenant recheck; cursor 50/200) + тест `apps/web/src/lib/__tests__/selena-recommendation-export.test.ts` | Новый cross-product data flow — предмет v1.4 §15 и §24.3: требует owner decision, оформленного как Delta к v1.4; API-ключ AIV хранится на стороне selena-OS только в managed secret store, read-only scope, tenant recheck на каждом вызове | **O17** + O2 (`sv_project_id` в binding) |
| G4-c Source registry | `selena-OS` миграции `0039+`: `growth_signal_sources`, `growth_signals` с fixture-адаптерами; live-адаптеры (Supadata, YouTube Data API, Video Radar port) — каждый под свой flag/потолок/ledger по Content OS spec §11 | O10; code-transfer authorization для Video Radar | GE-4 |
| G5 Opportunities | `selena-OS` `packages/content-workflow/src/research/` (целевое место spec §8) + `growth_opportunities` с decision enum | Не второй research module: расширение spec §7.2 | G4 |
| G6 Каналы | Подключение `createReleaseProviderRegistry` к gateway (`apps/worker/src/selena-release-gateway.ts`) и `authorize_provider_dispatch` (SQL, без TS-вызова сегодня); site-adapter по O7 | Master ТЗ Stage 7–8; owner GO на первую публикацию | O7 |
| G7 Outcome | `selena_performance.metric_snapshots` с `source=GSC` per URL; связка `publication_attempt ↔ content_version ↔ goal` | UNKNOWN по умолчанию | G6 |

## 6. Работа агентов

| Роль | Ответственность | Изоляция |
|---|---|---|
| Lead Orchestrator | DAG, leases, freeze контракта, merge только узких PR, повтор интеграционных тестов на merge SHA, финальная приёмка | Единственный интегратор |
| Contracts Agent | GE-1: schema + fixtures в обоих репозиториях; кросс-проверка sha256 | worktree в каждом репозитории, только `contracts/**`, `packages/lib/src/contracts/**`, `selena-aether-bridge.ts`, `bridge_events.py` |
| Content OS Agent | GE-2, GE-3 | worktree selena-OS; **единственный DB writer** для disposable БД (lease) |
| Aether Agent | GE-3a | worktree Aether; локальный Postgres 16 |
| QA / Reviewer Agent | Blind delta-review каждой PR по exact head SHA; получает BRIEF/DoD и diff, не выводы автора; не исправляет код | Отдельный агент; результат — findings с severities BLOCKER/MAJOR/MINOR |
| Owner | Решения O1–O17; создание бренда и binding в UI; браузерные проверки; GO на GE-5/GE-6 | — |

Правила: один агент — один worktree — одна ветка — явные пути; чужие файлы не редактируются; перед изменением disposable БД — письменный lease от Lead; GitHub Actions на каждый промежуточный commit не запускать без необходимости; локальные targeted-проверки до push. Master ТЗ: не запускается повторно; используются только его правила single-writer, leases, форматы отчётов.

## 7. Обязательные негативные проверки среза

| Проверка | Где доказывается | Ожидание |
|---|---|---|
| Дубли: тот же `event_id` дважды | receiver test; `aether_events` unique | `duplicate`, 0 новых версий |
| Конфликт: та же `(aggregate_id, version)` с другим `payload_sha256` (любой `event_id`) | pgTAP `0039`, receiver test | SQLSTATE `SE409` → `409 {reason: conflict}`; 0 версий; лог receiver; на стороне Aether событие сразу `dead` |
| Дубли: та же `(aggregate_id, version)` с тем же хэшем, другой `event_id` | pgTAP `0039` | `duplicate`; 0 версий |
| Неверная подпись / истёкшая метка времени | receiver test (fixtures `signed_with_another_secret`, `timestamp_outside_window`) | 401; тело не парсится; audit |
| Смешение проектов: `project_id` без binding; `project_id` с binding, но `business_key` не совпадает; попытка второго binding того же `project_id` другой организацией | projection-worker + projection tests; pgTAP `0037` | `NO_BINDING` / `BUSINESS_KEY_MISMATCH`; 0 версий; `23505`; чужая организация не видит строку |
| Неподтверждённые утверждения: `claims[].status = UNKNOWN`, `qa_results FAILS` | projection test + `evaluateReleaseGate` | Версия создаётся как черновик, помечена `needs_verification`; release gate блокирует |
| Изменение одобренной версии | существующий `selena-control-room.test.ts` «invalidates an approval when protected content changes» (**регрессионный, вне пути среза** — approval в срезе не создаётся); дополнительно на disposable БД: fixture-версия → owner approve → повторное событие с `version+1` → approval revoked | Approval аннулирован; новая версия |
| Отсутствие разрешения выпуска | `selena-release-publish-policy.test.ts` (31 исполнение), `SELENA_RELEASE_PUBLISH_ENABLED` не задан, окружение `STAGING` (**регрессионный, вне пути среза**) | `PublishRefusedError`; provider calls 0 |
| Сотрудник/агент одобряет | `isInteractiveOwnerSession` тест; Aether `assert_can_approve` (автор не одобряет себя) | Отказ |
| Событие из Aether без `business_key` / вне allow-list | `test_n8n_bridge_scope.py`, `test_bridge_is_off_by_default` | 0 строк outbox |

## 8. Бюджеты и ресурсы

| Ресурс | GE-1…GE-4 | GE-5 | GE-6 | G4+ |
|---|---|---|---|---|
| Платные provider calls (Bright Data, DataForSEO, Supadata, YouTube API, Gemini) | 0 | 0 | 0 | по flag и потолку каждого источника; `UNKNOWN_COST_BLOCKED` по умолчанию |
| LLM (Aether агенты) | 0 (fixture) | 0 | 1 задача ≤ `MAX_TASK_BUDGET_USD` (существующая настройка) | по задаче |
| Публикации | 0 | 0 | 0 | только после Gate 8 Master ТЗ и owner GO |
| Миграции | disposable only | staging (owner GO, `migrate` service) | — | disposable → staging по тому же правилу |
| Railway | без изменений | 2 переменные-флага на staging selena-OS (owner); production Aether не меняется без O16 | при O16: 1 флаг Aether на время прогона | — |

## 9. Recovery

- Все миграции additive; исторические файлы и ledger не правятся; откат = forward-correction или restore из snapshot (RECOVERY.md r64y7u).
- Флаги `GROWTH_ENGINE_STAGE1_ENABLED`, `AETHER_GROWTH_FIXTURE_ENABLED` скрывают функциональность без удаления данных.
- Событие, не спроецированное из-за ошибки, остаётся `recorded` в `aether_events`; повторная проекция — идемпотентная админ-операция, не повторная доставка.
- Bridge secret — ротация comma-list без простоя; компрометация → замена обеих сторон.
- Перед любым применением в staging — backup/snapshot и repeat/no-op проверка на disposable БД.

## 10. Реальные блокеры и их владельцы

| # | Блокер | Владелец | Разблокирует |
|---|---|---|---|
| B-1 | База кода: развёрнутые ветки `claude/new-session-r64y7u` не в `main` (оба репозитория); в Aether `main` отсутствует | Владелец (O1) | GE-1 |
| B-2 | Бренд в staging БД selena-OS отсутствует; binding подтверждает только owner в UI | Владелец | GE-5 |
| B-3 | Ротация bridge secret (REMAINING_BLOCKERS #3) | Владелец | GE-5 |
| B-4 | Сетевая политика контейнера: `*.up.railway.app`, `kaiten.ru`, Hetzner недоступны; браузерные проверки — владелец | Среда | GE-5 evidence |
| B-5 | Источник для среза (OWN-материал или fixture) не выбран | Владелец (O3) | GE-6 |
| B-6 | Content OS Stage 1 Slice 1–5 `NOT_STARTED`; execution plan PR #27 в `CHANGES_REQUESTED`; нумерация миграций spec устарела | Владелец / Lead | Совместная нумерация `0037+` |

Не блокеры: TODO в коде, зелёный CI, наличие таблиц или UI без behavior-level evidence.

## 11. Definition of Done среза G3 (GE-1…GE-4)

Срез принят, когда одновременно:

1. Контракт v1.1 FROZEN, схемы идентичны в двух репозиториях, fixtures проходят с обеих сторон.
2. Миграции `0037`, `0038` применяются на чистой disposable БД, повторный прогон no-op, pgTAP 16 наборов 0 not ok, forced RLS на новых таблицах.
3. Одна fixture-задача создаёт ровно две карточки (см. 5A.5); все строки раздела 7 — PASS с evidence.
4. `externalProviderCalls = 0`, LLM calls = 0, create-post = 0, публикаций 0.
5. Полные `pnpm test` (selena-OS) и `pytest -q` (Aether) зелёные на финальных SHA; `ruff` чист; `turbo run check-types` 0 ошибок.
6. Каждая PR имеет exact base/head SHA, реальный CI и blind delta-review без BLOCKER; merge — решение владельца.
7. Ни один нормативный документ не изменён; в PR нет secret-like значений и приватных идентификаторов.

Приёмка среза не является staging- или production-приёмкой и не разрешает GE-5/GE-6 автоматически.

## 12. Что разрешено после отправки этого ТЗ и что требует решения

| Действие | После отправки ТЗ | Требует решения владельца |
|---|---|---|
| Чтение кода, подготовка веток без push, локальные тесты без БД | Да | — |
| Создание веток и PR по GE-1 | — | Утверждение среза + O1 |
| Disposable миграции GE-2/GE-3 | — | Авторизация на этап (Content OS plan §2.1) |
| Локальный vertical GE-4 | — | Утверждение среза |
| Staging deploy, флаги, ротация секрета | — | O9 + GO на GE-5 |
| Реальная LLM-задача | — | O4 |
| Любой внешний источник, публикация, Remotion | — | O10, O7, Gate 8 |

---

## Приложение A. Матрица требований и пробелов (этап B стартового задания)

Статусы: `EXISTING_VERIFIED` (код + тест/pgTAP + при наличии живое evidence), `CODE_ONLY`, `NOT_FOUND_IN_INSPECTED_SCOPE`, `UNKNOWN`, `PROPOSED`, `BLOCKED`. Отсутствие в одном репозитории не означает отсутствие в системе — колонка «Repo» называет, где искали.

| ID | Требование | Источник | Назначение | Владелец состояния | Repo / path / symbol | Статус | Evidence | Пробел | Зависимость | Следующий безопасный шаг |
|---|---|---|---|---|---|---|---|---|---|---|
| R01 | Control Room с 8 разделами внутри Selena OS | FA §5; MT Stage 5 | Кабинет владельца | selena-OS | `apps/web/src/routes/_authed/app/$brand/control-room.tsx` (hash-секции), `apps/web/src/server/selena-control-room.ts` | EXISTING_VERIFIED (code+tests); live — REPORTED | vitest + pgTAP; live 200 с 8 секциями и скриншот владельца 05.09 — по `docs/execution/EVIDENCE/index.md` r64y7u, автором не воспроизведены | Разделы — фрагменты одного route; исполнитель не может открыть браузер | — | Использовать как есть |
| R02 | Immutable content versions + hash | FA §6 | Основа approvals | selena-OS | `selena_registry.content_versions` (`0021`), `contentVersionHash` | EXISTING_VERIFIED | `selena-control-room.test.ts` | — | — | Использовать |
| R03 | Approval привязан к версии; изменение аннулирует; сотрудник не одобряет | FA §6; MT Stage 3 | Fail-closed выпуск | selena-OS | `approvals` (append-only revoke), `isInteractiveOwnerSession`, `evaluateReleaseGate` | EXISTING_VERIFIED | тесты L45, L163; pgTAP `0024`, `0027` | — | — | Использовать |
| R04 | Release Gateway: manifest, подпись, expiry, kill switch, idempotent intent | FA §6; MT Stage 7 | Выпуск | selena-OS | `packages/lib/src/selena-release-gateway.ts` (Ed25519), `apps/worker/src/selena-release-gateway.ts`, `0027`, `0036` | EXISTING_VERIFIED (lib) | тесты + pgTAP 14 на `0036` | Gateway не вызывает provider registry (D15) | — | G6 |
| R05 | Один активный провайдер на channel/environment; allowlist провайдеров | FA §10; MT Stage 7 | Без второго dispatch | selena-OS r64y7u | `0032_channel_provider_binding.sql`, `0033_release_provider_allowlist.sql` | EXISTING_VERIFIED (DB) | pgTAP 13 + 11 | В `main` нет; `authorize_provider_dispatch` без TS-вызова | O1 | G6 |
| R06 | Postiz сохранён; Blotato как второй адаптер; create-post = 0 | FA §10; MT Stage 8 | Каналы | selena-OS r64y7u | `selena-postiz.ts`, `selena-blotato.ts`, `selena-release-provider-*.ts`, `selena-release-publish-policy.ts` | CODE_ONLY (app), EXISTING_VERIFIED (lib) | 31 тест policy; 0 вызовов | Не импортируется из `apps/` | O1 | G6 |
| R07 | Aether → Control Room bridge: envelope, подпись, replay, idempotency, DLQ | FA §9; MT Stage 6 | Единственный путь результата | Aether + selena-OS r64y7u | `bridge_events.py`, `bridge_delivery.py`, `0022`; `selena-aether-receiver.ts`, `selena-aether-bridge.ts`, `0035` | EXISTING_VERIFIED (code+tests); live — REPORTED | pytest: `test_bridge_events.py` 25 `def test_`, `test_bridge_delivery.py` 17; vitest: `selena-aether-bridge.test.ts` 18 исполнений, `selena-aether-receiver.test.ts` 14; сквозной прогон 03.09 — по `EVIDENCE/index.md`, не воспроизведён автором | Один тип события; payload без контента; нет проекции в Inbox (D14) | O1, O9 | GE-1, GE-3 |
| R08 | Ровно один Inbox item на результат | MT Gate 6 | Idempotent handoff | selena-OS | `record_aether_event` → `recorded/duplicate/stale` | CODE_ONLY как «Inbox item» | `aether_events` unique; UI не читает | Проекция отсутствует | R07 | GE-3 |
| R09 | Immutable approval record в Aether; автор не одобряет | MT Stage 3 | Task lifecycle | Aether r64y7u | `approvals.py`, `0020_task_approvals.sql` | EXISTING_VERIFIED | `test_task_approvals.py` 15 | Комментарии в коде ссылаются на «0019»; TTL env-var не существует | O1 | Мелкие правки в PR |
| R10 | Секреты зашифрованы, fail-closed, ротация | MT Stage 1 | Security | Aether r64y7u | `crypto.py` (`enc:v2`), `redact.py`, `test_secret_leaks.py` | EXISTING_VERIFIED | 13 + тесты утечек | Перевыпуск 5 credentials — действие владельца (NOT-VERIFIED) | Владелец | Не в scope Growth |
| R11 | Три lifecycle раздельны; GitHub не в content lifecycle | FA §7 | Границы | все | Content OS без PR; Aether task без PR | EXISTING_VERIFIED (по конструкции) | — | Канал «сайт» технически PR-based (O7) | O7 | G6 |
| R12 | AI Visibility отдельно: repo, DB, deployment | FA §4; v1.4 §2 | Изоляция | selena-ai-visibility | Railway project `selena-ai-visibility`; миграции расходятся с `0021` | EXISTING_VERIFIED | migration diff; Railway meta | Elmo-база внутри selena-OS (D3) | — | Формулировка владельца |
| R13 | Cross-product только versioned API/events | FA §9; v1.4 §2 | Изоляция | selena-ai-visibility | `packages/selena-visibility-contracts` 0.1.0; API keys; idempotency records | EXISTING_VERIFIED | тесты idempotency | Нет export recommendations; нет событий в Selena OS | O2 | G4-b |
| R14 | Recommendation с evidence IDs; grounding | v1.4 §5, §13 | Growth-сигнал DERIVED | selena-ai-visibility | `sv_recommendation_*`, `validateGrounding` | EXISTING_VERIFIED | `recommendation-engine.test.ts` | Ingress только POST action-plan | — | G4-b |
| R15 | Permits, emergency stop, journal claims | v1.4 §10, §22 | Spend control | selena-ai-visibility | `spend-gate.ts`, `sv_run_permits`, `sv_journal_*` | EXISTING_VERIFIED | `spend-gate.test.ts` и др. | Perplexity BLOCKED (D11) | — | Не в scope |
| R16 | Tenant RLS | v1.4 §21 | Isolation | selena-ai-visibility | `0034_tenant_rls_policies.sql` (35 политик), `withOrganizationTransaction` | EXISTING_VERIFIED | тесты | `TENANT_ISOLATION_DESIGN.md` устарел; `reports` без org | — | Обновить документ |
| R17 | Tenancy Control Room: organization + brand в каждой строке; server-side brand | FA §13; spec §6 | Isolation | selena-OS | `public.brands.organization_id`, `set_request_context`, `getContentOsBrandFn` | EXISTING_VERIFIED | pgTAP `0021`,`0023`; commit 8ac08e39 | Staging БД без брендов | Владелец | GE-5 |
| R18 | Явный маппинг brand ↔ sv_project ↔ business_key | spec §6; Start §4 | Growth identity | — | нет ни в одном репозитории | NOT_FOUND_IN_INSPECTED_SCOPE | 3 аудита | Нет таблицы | O2 | GE-2 |
| R19 | Реестр YouTube каналов/видео/транскриптов с provenance, OWN/EXTERNAL | Start §4 | Входы | — | Aether `youtube.py` (Supadata, без тестов, без реестра); spec Video Radar не построен | CODE_ONLY (ingest) / NOT_FOUND (реестр) | audit | Реестра нет; live вызовы платные | O10 | G4-c |
| R20 | Search/site intelligence | Start §4 | Входы | SELENA-AI-COMPANY | `scripts/gsc-report.ts`, `gsc-report.yml`, `config/gsc-properties.json` (12), `validate-sitemap.mjs` | EXISTING_VERIFIED | `gscReport.test.ts` | Отчёты gitignored; в Content OS не попадают | — | G4-a |
| R21 | Competitor intelligence | Start §4 | Входы | SELENA-AI-COMPANY | `data/competitors.json`, `competitor-patterns.json` | CODE_ONLY | static 2026-07-06 | Нет сбора; internal only | O10 | Later |
| R22 | Opportunities: fusion, dedupe, decision enum, priority rationale | Start §4 | Решения | — | spec §7.2 (не построен); Aether `project_records/check` (дедуп записей) | PROPOSED | — | Нет модели | G4 | G5 |
| R23 | Производство: brief, draft, links, metadata, social | Start §4 | Контент | Aether | агенты `copywriter/seo/smm`, skills `selena-personal-brand-system`, `otherbali-editorial-page-builder`; Elmo `daily-blog-draft` (PR bot) | CODE_ONLY | 20 агентов в реестре; skills тесты | Нет контракта результата; нет доставки в Control Room | GE-1 | GE-3a (skill контракт) |
| R24 | QA: факты, ссылки, новизна, бренд, техника, изоляция | Start §4 | Проверка | Aether + selena-OS | `fact-checker-agent`, `qa-agent`, `COMMON_QA`, `validate-sitemap`, `content_policies` | CODE_ONLY | — | Нет `qa.json` контракта и связи с review evidence | GE-1 | GE-3a/GE-3 |
| R25 | Каналы: сайт, соцсети, Telegram ↔ адаптеры | Start §4 | Доставка | selena-OS / SELENA-AI-COMPANY | LinkedIn: Postiz/Blotato lib; сайт: нет; Telegram publish: нет (Aether `delivery.py` — доставка результата владельцу) | CODE_ONLY / NOT_FOUND | audit | Site adapter (O7); Telegram provider | O7 | G6 |
| R26 | Результат: раздельные метрики, UNKNOWN | Start §4; v1.4 §16 | Outcome | selena-OS / SELENA-AI-COMPANY | `selena_performance.metric_snapshots`, `0031` Postiz ingestion; GSC отчёт; `/api/leads` → Telegram | CODE_ONLY | — | Нет связки publication ↔ version ↔ goal | G6 | G7 |
| R27 | Remotion — опциональный кандидат | Start §4 | Видео | SELENA-AI-COMPANY | `remotion/Root.tsx` (10 stills) | CODE_ONLY | — | Видео-композиций нет | O10 | Later |
| R28 | Никакой scheduler платных вызовов | v1.4 §4.1; Start §6 | Spend | оба Elmo-форка | `daily-blog-draft.yaml` cron, `claude-opus-5` до $3+$1, Oxylabs | EXISTING (нарушение духа) | yaml | Scheduled paid workflow существует | O8 | Решение владельца |
| R29 | Разделение сред: production/staging/smoke | v1.4 §20; FA §13 | Ops | все | selena-OS: один env `production` в проекте `selena-os-staging`; AIV: `staging` обслуживает `app.`; production — только Postgres | UNKNOWN (по назначению) | Railway meta | Имена env расходятся с ролью | Владелец/infra | Зафиксировать словами |
| R30 | Домены: os/app/studio/www | FA §1 | Двери | Railway | `os.`+`studio.` → Aether; `app.` → AIV staging; `cabinet.` → selena-OS | EXISTING (частично) | Railway domains | `cabinet` вне архитектуры; `os` cutover не сделан; DNS mismatch `app.` (MASTER_HANDOFF §10) | Владелец | Отдельное решение |
| R31 | Один исполнительный слой — Aether; агентам запрещён Bash | FA §2; Aether policy | Runtime | Aether r64y7u | `AGENT_TOOL_VOCABULARY`, `disallowed_tools=["Bash"]`, MCP per agent (`0019`) | EXISTING_VERIFIED | `test_agent_tools_policy.py` | Ни одна реальная задача агента не доказана в проде (MASTER_HANDOFF §11) | Владелец (canary) | Вне Growth; предпосылка GE-6 |
| R32 | Knowledge OS: правила отбора методик | ai-council | Decision rules | ai-council ветка `claude/content-promotion-methods-uaoywq` | `selena-growth-method-operator/SKILL.md` | CODE_ONLY (docs) | — | Не в `main`; не runtime | — | Источник для G5 правил |
| R33 | Content OS Stage 1 slices | spec; execution plan | Каркас | selena-OS | Slice 0 MERGED (`e63da891`→#25/#26); Slices 1–5 NOT_STARTED; plan PR #27 CHANGES_REQUESTED | CODE_ONLY (shell) | plan §5 | Нумерация миграций spec устарела (D5) | Владелец | Синхронизировать с GE-2 |
| R34 | Central Memory как канонический слой памяти | FA §12 | Память | `parkourcafe/central-memory` | не клонирован в этой сессии | UNKNOWN | MASTER_HANDOFF: «нигде не развёрнут» | Две правды при развёртывании (skill_packs/project_records) | Владелец | Вне scope Growth; отметить |

Сокращения: FA — Final Architecture 2026-09-04; MT — Master ТЗ 2026-09-02; spec — Content OS YouTube Stage 1 spec; Start — `00_START_CLAUDE_CODE.md`.

## Приложение B. Аудит исходного состояния (этап A)

### B.1. Репозитории

| Repo | Ветка / SHA | Dirty | Тесты | CI | Миграции |
|---|---|---|---|---|---|
| selena-ai-visibility | `claude/new-session-wik9v3` = `release/selena-visibility-mvp` @ `0d18053c` | 0 | 195 `*.test.ts` (88 selena-специфичных) | 10 workflows; платные: `daily-blog-draft` (cron), `claude.yml`; `test-providers` и `selena-first-live-order` — без provider calls | 63 (`0000`–`0062`) |
| selena-OS `main` | `39ec0ea3` | 0 | 99 `*.test.ts`, 9 pgTAP, 6 Playwright | 9 workflows; платные: `daily-blog-draft`, `test-providers` (cron, Elmo-провайдеры), `claude.yml` | 32 (`0000`–`0031`); совпадают с AIV до `0020` |
| selena-OS r64y7u | `05599f98` | — | +vitest в worker; 14 pgTAP | — | 37 (`0000`–`0036`) |
| Aether-Medium (клон) | `claude/friendly-mccarthy-z6bla5` @ `e6fd6590` | 0 | 27 pytest файлов | 1 workflow `CI` (ruff, pytest на Postgres 16, frontend build) | 18 |
| Aether-Medium r64y7u | `29d0e381` | — | 39 pytest файлов (227 passed по отчёту) | тот же | 22 (`0019`–`0022` новые) |
| SELENA-AI-COMPANY | `claude/new-session-wik9v3`, база `4bd1a053` (+ коммиты с этими документами) | 0 до коммита документов | 36 unit-test файлов (node --test) | 7 workflows; платные — только `workflow_dispatch` (Bright Data, OpenRouter) с бюджетом; `gsc-report` cron бесплатный | Supabase scaffolding 5 файлов (4 миграции + `seed.sql`), не используется |
| ai-council | `main` @ `7947502e` (2026-08-02) | 0 | — | — | — |

### B.2. Хостинг (только безопасные метаданные)

| Railway project | Сервисы | Домены | Собирается с |
|---|---|---|---|
| `selena-os-staging` (2026-09-02) | web, worker, gateway, receiver, migrate, Postgres; env `production` | `cabinet.selenasystems.com` (плюс сгенерированный Railway-домен, не воспроизводится) | selena-OS `claude/new-session-r64y7u` @ 05599f98 (deploy 2026-09-05 01:19 UTC, SUCCESS для web/receiver/migrate) |
| `OS Selena agent systems` | OS Selens Agent, worker, Redis; env `production` | `os.selenasystems.com`, `studio.selenasystems.com` (плюс два сгенерированных Railway-домена) | Aether `claude/new-session-r64y7u` @ 29d0e381 (2026-09-04 23:48 UTC, SUCCESS) |
| `selena-ai-visibility` | env `staging`: web, worker, measure, migrate, publish + 8 вспомогательных/disposable Postgres; env `production`: `Postgres-production`, `Postgres-W_9y` | staging web: `app.selenasystems.com`, `staging.selenasystems.com` | `release/selena-visibility-mvp` @ 0d18053c (migrate SUCCESS 2026-09-05 07:22 UTC; measure SKIPPED) |

Значения переменных не запрашивались и не читались. Приватные идентификаторы сервисов в документ не переносятся.

### B.3. Дополнительные документы, влияющие на Growth

- `selena-OS` `docs/control-room/CONTENT_OS_YOUTUBE_STAGE1_TECHNICAL_SPEC.md` (2026-09-01) и `docs/control-room/STAGE1_EXECUTION_PLAN.md` (ветка `docs/content-os-stage1-execution-plan`, PR #27).
- `selena-OS` r64y7u `docs/execution/*` (SNAPSHOT, EXECUTION_REPORT, COVERAGE Gates 0–8, DECISIONS, EVIDENCE, RECOVERY, REMAINING_BLOCKERS, SECURITY_REPORT), `docs/control-room/DEPLOYING.md`.
- `Aether-Medium` r64y7u `docs/MASTER_HANDOFF_2026-09-04.md`, `docs/MIGRATIONS.md`, `backend/app/agents/skills/_system/*`.
- `selena-ai-visibility` `HANDOFF.md` (Perplexity auth wall 05.09), `docs/selena-visibility/PLATFORM_AUDIT_2026-09-03.md` (62/100, NO-GO production), `ACCEPTANCE_MATRIX_V1_3.md` overlay 03.09.
- `SELENA-AI-COMPANY` `HANDOFF.md`, `SELENA_SEO_GROWTH_AUDIT_2026-08-17.md`, `docs/20-seo-top5-system.md`, `docs/21-seo-control.md`, `docs/18-kora-content-engine-and-lead-magnets.md`.
- `ai-council` ветка `docs/selena-ecosystem-map`: `START_HERE.md`, `00-governance/DECISION_LOG.md` (решения 2026-09-01 по Kaiten), `02-research/2026-09-01__project-operating-architecture/02-contradictions.md`.

### B.4. Что не удалось проверить

| Что | Почему | Статус |
|---|---|---|
| Поведение живых контуров в браузере (`cabinet.`, `os.`, `studio.`, `app.`) | сетевая политика контейнера | UNKNOWN; evidence только из документов и метаданных Railway |
| Значения env, секреты, subscription за `CLAUDE_CODE_OAUTH_TOKEN` | намеренно не запрашивались | UNKNOWN |
| `parkourcafe/central-memory`, `video-radar-marketing-tool`, `youtube-pro` | не подключались к сессии; не требовались для docs-only этапа | UNKNOWN |
| Merge-статус r64y7u в `main` | ветки существуют; PR не открыты (по списку веток) | ФАКТ: не смержены |
| Реальный прогон Aether-агента в проде | MASTER_HANDOFF §11: canary не выполнен | UNKNOWN |

## Приложение C. Независимый review (этап D)

Заполняется после проверки отдельным reviewer-агентом, не являющимся автором. Reviewer получает: три исходника, `00_START_CLAUDE_CODE.md`, оба DRAFT-документа, отчёты аудита. Проверяет: противоречия архитектурам, самовольное снятие HOLD, дублирование Aether/AI Visibility, пропущенные approvals, выдуманные пути или integrations, отсутствие проверяемого DoD.

### C.1. Результат первого прохода (2026-09-05)

Reviewer — отдельный агент, не автор; read-only; сеть и БД не использовались. Вердикт **CHANGES_REQUESTED**: 1 BLOCKER, 7 MAJOR, 14 MINOR; 49 spot-check строк, из них WRONG: 4 (колонка `external_ref`, числа тестов, путь `REPORTABLE_STATUSES`, число файлов supabase), NOT_VERIFIED: Railway-метаданные и живое поведение контуров (reviewer не использовал сеть).

| ID | Sev | Суть | Исправление в v1.0 |
|---|---|---|---|
| F-01 | BLOCKER | Поиск binding по `business_key`, уникальному только в пределах организации → риск проекции в чужой бренд | Ключ поиска — `envelope.project_id` (UUID Aether-проекта), `unique (aether_project_id)` глобально; `business_key` — только контроль совпадения (GE-2, GE-3, §7) |
| F-02 | MAJOR | Receiver (интернет-facing, ingestion-роль) становился писателем `selena_registry` | Проекция вынесена в отдельный worker-job под логином `worker`; receiver остаётся recorder; GRANT'ы явно в `0038`; O15 |
| F-03 | MAJOR | GE-5 использовал production Aether без пометки production-изменения | Default — локальный Aether владельца → staging receiver; production Aether только по O16 |
| F-04 | MAJOR | `content_items.external_ref` не существует | Additive колонки `kind`, `external_source`, `external_ref`, `brief_ref` в `0038` |
| F-05 | MAJOR | Числа тестов моста не совпадали с кодом | Заменены на статические подсчёты с методом (declarations / executions) |
| F-06 | MAJOR | Evidence из отчётов и commit-сообщений помечено `[ФАКТ]` | Введена метка `[ОТЧЁТ]`; статусы R01/R07 разделены на code+tests / live REPORTED; источник «staging без brands» указан как commit-сообщение |
| F-07 | MAJOR | Экспорт AIV — cross-product flow без change control v1.4 | O17 + Delta к v1.4; custody ключа (F-22) |
| F-08 | MAJOR | Внутренний Railway-hostname в B.2 | Удалён |
| F-09…F-21 | MINOR | SHA/коммит документов, путь `REPORTABLE_STATUSES`, формулировка D17, C.1 placeholder, индекс `brands(id, organization_id)`, correlation uuid vs `trace_id`, `cta_url`/`policy_version`, `brief_id`, `evaluateReleaseGate` reason-коды, регрессионные тесты вне пути среза, граница YouTube vs Social AIV, экспорт `assertHumanReviewer`, 5 файлов supabase | Все внесены |

### C.2. Повторный проход (2026-09-05)

Тот же независимый reviewer перечитал исправленные документы целиком (коммит `d12b479`). Вердикт **PASS**: 0 BLOCKER, 0 MAJOR; по F-ID — 20 CLOSED, 2 PARTIAL (текстовые остатки F-01/F-02 в абзаце тестов GE-3 и в GRANT'ах bindings), 0 OPEN. Три MINOR-остатка N-01 (абзац тестов GE-3 по старой модели ключа и файлу), N-02 (grant ingestion-роли на bindings вместо роли worker), N-03 (устаревшие диапазоны «O1–O10», дублирование O15–O17) — внесены в этой версии. Не проверено reviewer'ом: Railway-метаданные, статус PR #27, живое поведение контуров, фактические прогоны тестов, `SHA256.json` (сеть и запуск тестов недоступны в режиме review).

Статус документов: **INDEPENDENTLY_REVIEWED — PASS (второй проход), остаётся DRAFT до утверждения владельцем.**

## Приложение D. Реестр расхождений

См. `GROWTH_ENGINE_EXTENSION_V1.0_DRAFT.md` §10 (D1–D17). Этот ТЗ не разрешает расхождения и не меняет продукт под них.

## Приложение E. Решения владельца

Полный реестр O1–O17 ведётся в `GROWTH_ENGINE_EXTENSION_V1.0_DRAFT.md` §11 (единый дом). Ниже — только решения, специфичные для этого ТЗ, с теми же номерами:

| # | Решение | Default |
|---|---|---|
| O11 | Лимит тела `content.draft_ready`: только inline `body_markdown` ≤ 48 000 байт UTF-8; лимит HTTP-тела приёмника — отдельная константа `MAX_EVENT_BODY_BYTES` = 512 KiB, выведенная из худшего валидного конверта (см. 5A.2); `artifact_ref` вне среза | Закрыто в GD-04: inline ≤ 48 000 байт, приёмник 512 KiB, `artifact_ref` не передаётся |
| O12 | UI подтверждения binding: отдельная форма в Content OS Settings или серверная функция без UI в первом срезе | Серверная функция + минимальная форма; без расширения route Control Room |
| O13 | Нумерация миграций между Growth и Content OS Slice 1 | Lead выдаёт номера последовательно от `0037` |
| O14 | `content_versions.cta_url NOT NULL` (`0021`): требовать CTA от producer или ослабить до nullable отдельной additive-миграцией | Требовать от producer; ограничение не трогать |

---

Публикаций: 0. Платных provider calls: 0. Документ не объявляет Growth Engine работающим.
