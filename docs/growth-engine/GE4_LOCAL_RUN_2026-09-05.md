# GE-4. Локальный сквозной прогон Growth Engine (GE-1…GE-4), 2026-09-05

Статус: **выполнено локально на одноразовых базах**. Это не готовность Growth Engine и не
проверка staging/production. Ни одной реальной записи, binding'а, секрета или публикации
не создавалось; все данные синтетические и помечены как синтетические.

## Точки кода

| Репозиторий | База среза | Вершина среза | Ветка |
|---|---|---|---|
| `parkourcafe/Aether-Medium` (worktree `aether-growth`) | `29d0e3814e35a8d5dc851db97163013c4cba4bf7` | `afab98f` | `growth/ge1-4-local-slice` |
| `parkourcafe/selena-OS` (worktree `selena-os-growth`) | `05599f98434a8ee66496d5dfe1f523ddde98a4b8` | `0874517` | `growth/ge1-4-local-slice` |
| `parkourcafe/SELENA-AI-COMPANY` (документы) | `507aaa8` | см. журнал коммитов ветки `claude/new-session-wik9v3` | |

Коммиты Aether (в порядке появления): `b001012` контракт 1.1 и валидатор → `6c21804`,
`f411aeb`, `7a4df5a` правки по трём проходам независимого review → `afab98f` outbox материалов,
миграция `0023`, fixture-агент.

Коммиты selena-OS: `e2fe3d3` приём 1.1 → `b6efd97` bindings (`0038`) → `50a16ae`, `2f31b1f`
правки по review → `94f7148` проекция (`0039`, worker, receiver 409) → `3680dfe` Inbox/Sources UI
→ `0874517` отложенная проекция (GD-05).

## Что поднималось

Всё — на этой машине, из рабочих деревьев, на локальном Postgres 16:

- Aether: FastAPI (`uvicorn app.main:app`, порт 8000, inline-режим без Redis), база `aether_ge4`
  (bootstrap + 23 миграции, как в `tests/conftest.py`), без `ANTHROPIC_API_KEY` и
  `CLAUDE_CODE_OAUTH_TOKEN` — вызов модели физически невозможен; `CONTROL_ROOM_BRIDGE_ENABLED=true`,
  `CONTROL_ROOM_BRIDGE_BUSINESS_KEYS=selena`, `AETHER_GROWTH_FIXTURE_ENABLED=true`.
- selena-OS: база `selena_ge4` (39 миграций раннером `run-migrations.mjs`, логины
  `selena_web_login`, `selena_worker_login`, `selena_ingestion_login` созданы раннером и проверены
  подключением); receiver (`selena_ingestion_login`, порт 8083); projection worker
  (`selena_worker_login`, `GROWTH_ENGINE_STAGE1_ENABLED=true`, `SELENA_GROWTH_SOURCE_ENVIRONMENT=local`);
  web (`vite dev`, порт 3000, `DEPLOYMENT_MODE=local`, `SELENA_WEB_DATABASE_URL` под `selena_web_login`).
- Локальный TLS-фронт `https://localhost:8443 → http://127.0.0.1:8083` с самоподписанным
  сертификатом (Aether отказывается от `http://` адреса приёмника; `SSL_CERT_FILE` указывал на этот
  сертификат только у локального процесса Aether). Код не менялся.

Секреты прогона — одноразовые, сгенерированы на месте, в репозитории не лежат (`.env` игнорируется).

## Последовательность и результаты

| Шаг | Результат |
|---|---|
| Владелец регистрируется через `POST /api/auth/sign-up/email` | пользователь создан, local-режим создал организацию `default`, членство `admin` (= `owner` в контексте Control Room) |
| Бренд `selena` | **засеян строкой** в `public.brands` (онбординг ходит наружу); помечен «synthetic GE-4» |
| Политика контента `selena-brand-pack/v1` | **засеяна под сессией владельца через `selena_web_login` и `set_request_context`, под RLS**. Ни UI, ни миграция политику не создают — открытый вопрос O18 |
| Aether: admin (`raw_app_meta_data.role=admin`), проект `business_key=selena`, второй проект `business_key=kora` | созданы через API |
| Editor пытается запустить `growth-fixture` | **HTTP 403** |
| Фаза A: fixture-задача **до** подтверждения источника | задача → `pending_approval`; outbox: `task.result.ready` v1 + `content.draft_ready` ARTICLE v1 + SOCIAL_ADAPTATION v1, все `sent`, `attempts=1`; receiver `recorded` ×3; worker **отложил** оба материала: `projection_error=NO_BINDING`, `attempts=1`, `final=false`; `content_versions=0` |
| Фаза B: владелец подтверждает источник в браузере (`#sources`, форма «Confirm a source») | строка binding `project=f997d5e9… selena local confirmed_by=<owner>`; audit `growth.binding_confirmed`; после наступления срока следующей попытки (в одноразовой базе срок сдвинут суперпользователем вместо ожидания 60 с) оба отложенных события спроецированы: **2 `content_items` (ARTICLE, SOCIAL_ADAPTATION), 2 `content_versions` v1, общий `brief_ref` = id задачи, `disclosure.synthetic=true`, `source.kind=SYNTHETIC_FIXTURE`, `needs_verification=true`, `qa_failed=false`, `policy_version=selena-brand-pack/v1`** |
| Фаза C: повторная доставка (все строки outbox возвращены в `pending`) | Aether: `sent`, `attempts=2`; receiver: 3× `duplicate`; `aether_events=3`, `content_items=2`, `content_versions=2` — **без изменений** |
| Вторая fixture-задача того же проекта | свой `brief_ref` → ещё 2 карточки (ожидаемо): `content_items=4`, `content_versions=4`, `distinct brief_refs=2`; повтор тех же файлов внутри задачи новых версий не даёт (проверено pytest) |
| Фаза D: неверная подпись | **401** `{"error":"rejected","reason":"signature"}` |
| Метка времени −20 мин | **401** `{"reason":"timestamp"}` |
| Тот же агрегат и версия, другое содержимое (подписано) | **409** `{"reason":"conflict"}` |
| Задача в проекте `kora` (вне allow-list) | `pending_approval`, **0 строк outbox** |
| Подписанное событие с `business_key=kora` для привязанного проекта | receiver **202 recorded**; worker: `BUSINESS_KEY_MISMATCH`, `final=true`, версия не создана |
| Фаза E: владелец отзывает binding (`revoke_growth_binding`), приходит новая версия материала | receiver 202; worker: **отложено `NO_BINDING`**, `content_versions` не изменилось (4) |
| Счётчики Aether | `agent_runs`: 3 × `growth-fixture done tokens_in=0 tokens_out=0 cost=0`; суммарная стоимость `0.000000`; ключей модели в окружении процесса: 0 |
| Счётчики selena-OS | `approvals=0`, `release_intents=0`, `release_manifests=0`, `publication_attempts=0`, `content_items=4`, `content_versions=4`, `aether_events=8`; audit: `content.draft_received ×4`, `growth.binding_confirmed ×1`, `growth.binding_revoked ×1` |
| Receiver log | `recorded=8`, `duplicate=3`, `conflict=1` |
| Браузер, `/app/selena/control-room#inbox`, роль `owner` | 4 строки Review queue; у каждой: вид материала (Article / Social adaptation), источник **`Aether · SYNTHETIC_FIXTURE`**, бейджи **Synthetic** и **Needs verification**, `v1`, решение `Pending`. Кнопка Approve не нажималась; approvals = 0 |

Скриншоты `inbox.png`, `sources.png` и полный `run.log` переданы владельцу файлами в сессии
(в репозиторий двоичные файлы не коммитились).

## Тесты и проверки (финальные SHA)

| Команда | Где | Результат |
|---|---|---|
| `ruff check app tests scripts` | Aether `backend/` | чисто |
| `pytest -q` | Aether `backend/` (локальный PG) | **396 passed** (в т.ч. `test_growth_draft_fixture.py`, `test_bridge_contract_v11.py`, `test_migration_ledger.py`) |
| `pnpm exec vitest run` | selena-OS `packages/lib` | **762 passed** (58 файлов) |
| `pnpm exec vitest run` | selena-OS `apps/worker` | 29 passed без БД; интеграционный `selena-aether-projection-worker.test.ts` **9 passed** на одноразовой базе `selena_vitest_growth` под логинами runtime-ролей |
| `scripts/run-pgtap.sh selena_pgtap_ge4` | selena-OS | **17 наборов, 225 ok, 0 not ok** (`0038` 21, `0039` 31) |
| `tsc --noEmit` | `packages/lib`, `apps/worker`, `apps/web` | 0 ошибок |
| `biome check` по изменённым файлам | selena-OS | чисто |
| Повторный `run-migrations.mjs` на `selena_ge4` | selena-OS | no-op («migrations applied successfully», новых логинов нет) |

Независимое review контракта 1.1 — три прохода, третий **APPROVED** (0 BLOCKER, 0 MAJOR,
3 MINOR — закрыты комментариями в схеме и правкой TZ). Финальное независимое review кода среза
на SHA `afab98f` / `0874517` — см. итоговый отчёт.

## Что изменено сверх первоначального плана (и почему)

- **GD-05, отложенная проекция.** На прогоне выяснилось: события, пришедшие до подтверждения
  источника или до появления политики бренда, фиксировались окончательным отказом, а Aether не
  повторяет неизменённый материал → черновик терялся навсегда. Теперь `NO_BINDING` и
  `NO_CONTENT_POLICY` откладывают событие (причина, счётчик, срок; удвоение от 30 с до 1 ч), а
  после подтверждения оно проецируется само. Окончательные отказы (`BUSINESS_KEY_MISMATCH`,
  `NOT_A_MATERIAL`, `PROJECTION_FAILED`) неизменны. Покрыто pgTAP и интеграционным тестом.
- **Inbox/Sources UI.** Строка версии показывает происхождение и синтетичность; раздел Sources
  (виден только при `GROWTH_ENGINE_STAGE1_ENABLED=true`) даёт владельцу подтвердить/отозвать
  источник через те же SQL-функции, которыми пользуется worker.

## Границы и NOT_VERIFIED

- Staging/production, DNS, auth-провайдеры, живые секреты, Railway — **не трогались и не
  проверялись**. Проверка, что push ветки `growth/ge1-4-local-slice` не запускает деплой, сделана по
  файлам workflow: в selena-OS `build/e2e/license/mode-compat` запускаются только на `main`/PR,
  `daily-blog-draft` и `test-providers` — по расписанию с default-ветки и вручную; в Aether `ci.yml`
  запускается на любой push (ruff, pytest, сборка frontend — бесплатные GitHub Actions, без деплоя).
  Привязка Railway-сервисов к веткам живьём **NOT_VERIFIED** (не читалась и не менялась).
- Ожидание backoff отложенных событий в реальном времени не проверялось: в одноразовой базе срок
  сдвигался суперпользователем; логика срока покрыта pgTAP.
- `stale` (меньшая версия после большей) на живом проводе не воспроизводилась (нужна доставка
  версии 2 раньше версии 1); покрыто receiver-тестами и pgTAP `0035`/`0039`.
- Настоящий агент по навыку `selena-growth-draft` (с LLM) не запускался — это GE-6, вне среза.
- Web dev-сервер печатал предупреждения гидратации React в консоль браузера; на поведение прогона
  не влияли, происхождение не исследовалось.

## Открытые вопросы, добавленные срезом

- **O18.** Кто и как создаёт `selena_registry.content_policies` бренда. Сегодня — только прямой
  INSERT под сессией владельца; без политики материалы откладываются с `NO_CONTENT_POLICY`.
