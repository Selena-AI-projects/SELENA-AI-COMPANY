# GE-5. Preflight staging (только чтение), 2026-09-06

Режим: чтение конфигурации и кода, без изменений staging/production. Значения переменных
не читались; здесь только имена. Сгенерированные Railway-домены и приватные идентификаторы
сервисов в документ не переносятся.

## 1. Что найдено

| # | Факт | Источник | Следствие для GE-5 |
|---|---|---|---|
| F1 | `selena-os-staging`: сервисы `web`, `receiver`, `migrate` собираются автоматически с ветки `claude/new-session-r64y7u` (вершина `05599f9` = база среза, новых коммитов на ветке нет); `worker` без привязки к ветке (деплой явным sha); последний деплой всех трёх — 2026-09-05 01:19 UTC, SUCCESS | Railway `get-service-config`, `list-deployments` | Код среза (`growth/ge1-4-local-slice`) на staging **не развёрнут**. Путь без смены deployment source: деплой явным commit sha (`serviceInstanceDeploy`), как уже делалось для `worker`/`gateway`. Пока r64y7u заморожена, автодеплой её не откатит |
| F2 | Лог `migrate` @ `05599f9`: «migrations applied successfully», логины `web`, `gateway`, `ingestion` созданы; `worker_login` и `scanner_login` **пропущены** (пароль не задан) | Railway `get-logs` | На staging нет `selena_worker_login` — проекции не под чем работать. Нужен `SELENA_WORKER_DB_PASSWORD` у `migrate` (генератор Railway, значение не проходит через чат) |
| F3 | Стадии образа: `web, migrate, worker, scanner, gateway, receiver` — стадии для projection worker не было; `apps/worker/src/index.ts` его не запускает; `worker`-сервис ходит в базу не под `selena_worker_login` | `docker/Dockerfile`, DEPLOYING §5 | **Исправлено кодом** (`d8e92dc`): стадия `projection` + DEPLOYING §6. Нужен новый Railway-сервис с именем `projection` (`serviceCreate` игнорирует `branch` → деплой явным sha) |
| F4 | На staging `web` нет `GROWTH_ENGINE_STAGE1_ENABLED`; у `receiver` только секрет, URL базы и порт | имена переменных | Флаг выключен — как и должно быть до GO |
| F5 | Параллельная ветка `feat/content-os-slice1` (2026-09-06 01:26) несёт миграцию `0037_content_project_profiles` с `when = 1788620325000`; журнал среза давал `0038/0039` синтетические `when` **меньше** этого значения | `_journal.json` обеих веток | **Опасность подтверждена симуляцией**: если `0037` лёг бы на базу раньше, раннер отчитался бы «успешно», а `0038/0039` молча не применил. **Исправлено** (`6a81690`): `when` = 1788620400000 / 1788620460000; симуляция с «чужим» `0037` — обе миграции применяются; свежая база — 39 миграций, повтор no-op. На staging `0037` **ещё не применялась** (последний деплой `migrate` — 05.09) |
| F6 | Aether: проект `OS Selena agent systems`, единственный env `production`, сервисы `OS Selens Agent` и `worker` собираются с `claude/new-session-r64y7u` @ `29d0e38` (= база среза; ветки `main` в репозитории нет, default — `claude/friendly-mccarthy-z6bla5`, предок базы). Переменные `CONTROL_ROOM_BRIDGE_*` заданы (пилот `other_bali`); `AETHER_GROWTH_FIXTURE_ENABLED` **отсутствует** | Railway `get-service-config`, `git ls-remote` | Staging-контура Aether нет (как в ТЗ B.2). Default GE-5 остаётся: fixture-задача с **локального Aether владельца** на ветке `growth/ge1-4-local-slice` @ `5a0cf70`; production Aether не трогается (O16) |
| F7 | REMAINING_BLOCKERS #3 «Перевыпуск секрета моста» — **открыт**; #1, #2, #4 сняты | `docs/execution/REMAINING_BLOCKERS.md` | O9 обязателен до первой доставки: новый секрет первым в списке у `receiver`, старый вторым, затем убрать старый |
| F8 | Состояние staging-базы (список миграций, бренды, `content_policies`, binding'и) прочитать нельзя: доступа к базе из этой сессии нет | — | **NOT_VERIFIED**. Первая команда GE-5 при доступе к базе: `select count(*), max(created_at) from drizzle.__drizzle_migrations` (ожидается 36 и `1787811060000`) |
| F9 | Онбординг бренда на staging `web` ходит к провайдерам (`SCRAPE_TARGETS`, `OLOSTEP_API_KEY` заданы) — это платные вызовы | имена переменных, `analyze-brand` job | Бренд `Selena Systems` создать либо онбордингом (стоимость), либо засеять строкой + `content_policies` под сессией владельца (как в GE-4, O18) — решение владельца |

## 2. Предпосылки, которые может закрыть только владелец

1. **O1.** Согласиться на деплой staging явным sha из `growth/ge1-4-local-slice` (без смены deployment source) **или** решить merge в `main`/r64y7u. Рекомендация: явный sha; merge — после GE-5.
2. **O9.** Сгенерировать новый bridge secret на стороне Railway (`${{secret(32)}}` у `receiver`, первым в comma-list); тот же секрет — в локальный Aether. Значение не должно проходить через сессию.
3. `SELENA_WORKER_DB_PASSWORD` у `migrate` (генератор Railway) → редеплой `migrate` создаст `selena_worker_login`.
4. Новый сервис `projection` (`DATABASE_URL` под `selena_worker_login` ссылкой, `GROWTH_ENGINE_STAGE1_ENABLED=true`, `SELENA_GROWTH_SOURCE_ENVIRONMENT=staging`, `SELENA_STAGING_MVP=true`).
5. `GROWTH_ENGINE_STAGE1_ENABLED=true` у `web` (только staging).
6. Бренд `Selena Systems` в `cabinet.selenasystems.com` и политика контента бренда (F9/O18); затем подтверждение источника в разделе Sources: точный UUID локального Aether-проекта, `business_key=selena`, environment `staging`.
7. **O16.** Подтвердить: producer — локальный Aether владельца (default), не production.

## 3. Порядок GE-5 после GO (для исполнителя)

1. Preflight базы (F8): миграции, бренды, `content_policies`.
2. `migrate` @ `d8e92dc` явным sha (с `SELENA_WORKER_DB_PASSWORD`) → лог: `0038`, `0039` применены, `selena_worker_login` создан и проверен.
3. `receiver` @ `d8e92dc` — до первой отправки: развёрнутый сейчас receiver (`05599f9`) не знает схемы 1.1 и отвечал бы 400 на `content.draft_ready`.
4. `web` @ `d8e92dc` + флаг; владелец видит Sources.
5. `projection` (новый сервис) @ `d8e92dc`; лог: процесс жив, «idle».
6. O9: ротация секрета.
7. Владелец: бренд, политика, подтверждение источника.
8. Локальный Aether владельца (`5a0cf70`, inline-режим, без ключей модели, `AETHER_GROWTH_FIXTURE_ENABLED=true`, `CONTROL_ROOM_BRIDGE_URL` = домен staging-receiver `/v1/bridge/aether`, новый секрет): одна fixture-задача → outbox `sent` ×3 → receiver `recorded` → две карточки в Inbox под ролью owner, скриншот владельца. Approve/release не выполняются.
9. `AETHER_GROWTH_FIXTURE_ENABLED` выключить; отчёт с числами: `bridge_events`, `aether_events`, `content_versions`, `approvals=0`, `publication_attempts=0`.

Откат: флаги `GROWTH_ENGINE_STAGE1_ENABLED` снять (проекция и Sources исчезают, данные остаются); миграции `0038/0039` аддитивны и не откатываются; сервис `projection` удалить.

## 4. Что не проверялось и не делалось

- Никаких изменений в Railway, DNS, секретах, базах — не вносилось. Значения переменных не читались.
- Состояние staging-базы — NOT_VERIFIED (F8).
- Сборка стадии `projection` в Docker локально не выполнялась (Docker в среде нет); стадия повторяет `receiver` один в один, кроме пользователя и команды.
- Production Aether и AI Visibility не затрагиваются GE-5.

## 5. Delta-review исправлений preflight (2026-09-06)

Независимый review `selena-OS 97ce57f → d8e92dc`: **APPROVED**. Симуляция с «чужой» `0037`
воспроизведена независимо (старый журнал — `0038/0039` молча пропущены; новый — применены;
чистая база 39 → 39 при повторе). Объекты `0037` и `0038/0039` не пересекаются. Сборка стадии
`projection` — NOT_VERIFIED (нет Docker), риск низкий: побайтовое сходство со стадией `receiver`.

**Требование к будущему merge с `feat/content-os-slice1` (MINOR-7, не блокирует GE-5):** в
объединённом `_journal.json` записи должны идти строго по возрастанию `when`
(`0037 → 0038 → 0039`); иначе на чистой базе после `0039` мигратор пропустит `0037` без ошибки.
Там же выставить `idx` 38/39 для `0038`/`0039`; следующая миграция любой ветки — `0040`. После
merge — `run-migrations.mjs` дважды на чистой базе, ожидается 40 применённых и no-op.
