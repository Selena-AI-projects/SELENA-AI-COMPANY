# Матрица приёмки A01–A14 — Content OS Slice 1 + Growth Engine на staging

Критерии — из `SELENA_FINAL_AUTONOMOUS_EXECUTION_TZ_V1_20260906`. Для каждого
указано, чем закрыт: **live** — на настоящем staging (`selena-os-staging`,
`https://staging-cabinet.selenasystems.com`), **sample** — тестами и локальным
прогоном GE-4 на одноразовой базе. ТЗ требует различать одно от другого.

Финальные SHA: `selena-OS` `integration/content-os-growth-ge5` — см. EXECUTION_STATE;
Aether `growth/ge1-4-local-slice` @ `18289d46`. Синтетический бренд —
`growth-check-org`, синтетический проект Aether — `3b8c9d1e-5a2f-4c7b-8e6d-9f0a1b2c3d4e`.

Обновлено: 2026-09-07 03:10 UTC.

| ID | Критерий | Статус | Доказательство |
|---|---|---|---|
| A01 | Slice 1 сохранён: профиль, версии, owner-решения на итоговом web; меню и маршруты на месте | **live** + sample | Интеграция трёх конфликтов по смыслу (EXECUTION_STATE «Интеграция»), `0037` применена (журнал 41). Web на staging из интеграционного релиза: разведка `7e2afdee`/`0994a01f` показывает ссылки `…/control-room/profile`, `#content`, `#review`, `#releases`, `#publications`, `#performance`, `#incidents`, `#audit`, `#sources`; в Review — кнопки «Create review version», «Approve». 764 теста на интеграционном SHA |
| A02 | Бесплатный вход: новый бренд и политика через штатные UI/API; анализ и платные calls не запускались | **live** | Прогон `54c921f0` @ `26d6f9d3`: бренд через форму онбординга `/app/growth-check-org`, политика `staging-check-1` через карточку «Content policy», источник через «Confirm a source»; аудит `content.policy_set`=1, `growth.binding_confirmed`=1. `createBrandFn` — проверка URL и INSERT, без `analyze-brand` и провайдеров (код). Aether: `growth-fixture done tokens_in=0 tokens_out=0 cost=0` в каждом прогоне |
| A03 | Один run → два связанных материала, не дубль и не третья служебная карточка | **live** | Проверка `0994a01f`: brief `0aa70000-…` → ровно два материала `ARTICLE` и `SOCIAL_ADAPTATION`, версия 1 у каждого; `task.result.ready` того же run — не карточка (проекция берёт только `content.draft_ready`). Inbox владельца: 2 строки |
| A04 | Идемпотентность: повтор event/worker не добавляет версии; отдельное новое содержимое — правильная следующая версия | **live** (повтор) + sample (следующая версия) | Aether-runner @ `18289d46` (деплой 03:05 UTC): те же три конверта отправлены второй раз, `attempts=2`, receiver принял все (`202`). Проверка после: событий 14 = 5 старых + 3 run × 3, материалов 6 = 3 brief × 2, версий > 1 — 0, т.е. повтор не добавил ни строки. Отдельный run с новым brief даёт новые карточки, не новые версии (7dd95c46, ad230b7e). Следующая версия того же материала: pgTAP `0035`/`0039`, receiver-тесты, GE-4 фаза E |
| A05 | Конфликт: та же идентичность/версия с иным содержимым отвергается; без бесконечных retry и порчи старого | sample | GE-4: подписанный конверт с тем же агрегатом/версией и другим содержимым → **409** `conflict`, старая версия нетронута; Aether по `409` сразу в dead-letter (GD-06). pgTAP `0035` (SE409), receiver-тесты. На staging не воспроизводилось: fixture детерминирована, конфликт потребовал бы намеренно испорченного конверта |
| A06 | Подпись и источник: неверный/истёкший credential, source mismatch, чужой проект и среда отвергаются; v1 совместим | **live** (чужой проект, v1) + sample (остальное) | Staging: проект вне allow-list тестового credential → три **401** (EXECUTION_STATE «Тестовый контур»); `task.result.ready` v1 принимается и хранится (шесть строк `pending`, проекция их не трогает). GE-4: неверная подпись **401** `signature`, метка −20 мин **401** `timestamp`, `business_key=kora` для привязанного проекта → `BUSINESS_KEY_MISMATCH final`. 22 receiver-теста, включая credential без allow-list = отказ старта |
| A07 | Tenant boundary: member/viewer/worker не подтверждают owner-объекты; чужой бренд и parent-change не обходят RLS | sample + **live** (изоляция) | `content-policy-lifecycle.integration.test.ts` — 5 тестов под настоящим RLS через `selena_web_runtime`; pgTAP `0038` (21) — только owner-сессия подтверждает binding, triggers на принадлежность бренда организации (GD-06); worker получает binding только SECURITY DEFINER-функцией (GD-03). Staging: материалы из внешних источников под любым другим брендом — **0**; синтетический владелец не член `default` |
| A08 | Binding lifecycle: нет binding → безопасное ожидание; отзыв и перепривязка не переносят старое событие другой организации | **live** (ожидание) + sample (отзыв/перепривязка) | Staging: события `content.draft_ready` пришли до подтверждения источника (02:xx), лежали без потери, спроецированы после подтверждения (02:56) с `attempts 0`. GE-4 фаза E: отзыв → новая версия отложена `NO_BINDING`; pgTAP `0038`/`0039` |
| A09 | Backoff/restart: хотя бы один реальный интервал backoff и перезапуск worker без ручной правки next-attempt; событие не теряется | см. раздел ниже | Проверяется на staging через отзыв политики (`NO_CONTENT_POLICY`) — результат в разделе «Жизненный цикл политики» |
| A10 | QA и выпуск: FAIL/UNKNOWN видимы и запрещают approve/release; live dispatch физически выключен | **live** (видимость, нули) + sample (запреты) | Inbox: каждая строка «Needs verification», «Pending», «Synthetic». `approvals`, `release_intents`, `release_manifests`, `publication_attempts`, `workflow_dispatches` = 0 (проверка `effects`). `queueReleaseIntentFn` проверяет disclosure (GD-06); тесты Content OS |
| A11 | Флаги: серверы и UI закрыты при OFF; выключение прекращает обработку без потери данных | **live** | `projection` без `GROWTH_ENGINE_STAGE1_ENABLED` завершался сразу (деплой `daba033a`), события ждали; с флагом — спроецировал. `confirm/revokeGrowthBindingFn` закрыты флагом на сервере (GD-06), карточка «Confirm a source» показывается только при флаге (код) |
| A12 | Миграции: фактический upgrade-путь, hashes/objects, no-op, конкурентный запуск | **live** + sample | Staging: журнал 38 → 41 вручную по SHA, хеши записей = файлам, 16 проверок объектов инспектора `yes`, повтор — no-op (репетиция на копии фактического состояния). Раннер отказывает при тихом пропуске (GD-08). Инспектор показывает чужие сессии и DDL-блокировки перед запуском; автодеплой `migrate` снят на время работ. Резервные копии `963c2c4b`, `4c8891a1`; восстановление логического архива проверено (GD-09) |
| A13 | Runtime и сборка: штатные роли, итоговые образы, auth/deep links; не тест под postgres вместо приложения | **live** | Каждый сервис — своя стадия `docker/Dockerfile` (`web`, `receiver`, `projection`, `migrate`), свой рантайм-логин; путь владельца — настоящий браузер против `https://staging-cabinet.selenasystems.com`, вход `/api/auth/sign-in/email`, deep links `#sources`/`#inbox`/`#review` |
| A14 | Внешние эффекты: прикладные модели, платные источники, approvals, release, публикации = 0 | **live** | Aether: три прогона, `tokens_in=0 tokens_out=0 cost=0`. selena-OS: `approvals=0`, `release_intents=0`, `release_manifests=0`, `publication_attempts=0`, `workflow_dispatches=0`; Review — 0 строк. Production Aether/AI Visibility, DNS, домены не трогались |

## Жизненный цикл политики на staging (A09, O18)

Заполняется по факту прогона: отзыв `staging-check-1` через интерфейс → новые события
откладываются `NO_CONTENT_POLICY` с реальным backoff → перезапуск `projection` →
новая версия политики `staging-check-2` через интерфейс → отложенные события
проецируются под новой политикой без потери.

## Честные ограничения

- Синтетический аккаунт заведён строкой в базе (GD-11): staging принимает ровно одну
  регистрацию, и она занята владельцем. Вход и весь сценарий — штатные.
- Конфликт (A05) и следующая версия того же материала (A04, вторая часть) на staging
  не воспроизводились: fixture детерминирована и всегда даёт версию 1.
- После переезда репозиториев `web`, `receiver`, `migrate` привязаны к
  `parkourcafe/selena-OS`; работают, но пересборка требует перепривязки на
  `Selena-AI-projects/selena-OS`.
