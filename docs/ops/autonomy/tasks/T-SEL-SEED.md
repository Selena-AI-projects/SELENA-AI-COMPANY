# T-SEL-SEED · план посевов Selena Systems (ТЗ п.7, запуск 4b)

- **task_id:** T-SEL-SEED (подзадачи T-SEL-SEED-a площадки, T-SEL-SEED-b план)
- **repo / base:** `Selena-AI-projects/SELENA-AI-COMPANY`, `main @ 2fab794`
- **ветка:** `claude/six-projects-selena-seeding` · **PR:** draft в `main` (ссылка — в отчёте запуска)
- **дата:** 2026-09-28
- **статус:** T-SEL-SEED-a — **DONE_CODE** (документ, 10 кандидатов, правила частично «неизвестно»); T-SEL-SEED-b — **READY_FOR_PLACEMENT** (тексты и очередь готовы для владельца; ничего не опубликовано)

## Изменённые файлы (только документы)

- `docs/ops/autonomy/seeding/SELENA_SEEDING_PLATFORMS_2026-09-28.md` — 10 площадок + собственный канал + отложенные; чек-лист владельцу
- `docs/ops/autonomy/seeding/SELENA_SEEDING_2026-09-28.md` — границы обещаний, измерение, UTM-конвенция (факт + предложение), 3 текста RU/EN, критерий на 14 дней, очередь 29.09–12.10, чек-лист
- `docs/ops/autonomy/tasks/T-SEL-SEED.md` — этот журнал

## Проверки (что реально сделано)

| Проверка | Результат |
|---|---|
| Ветка создана от `2fab794`; удалённой ветки не было (`git fetch` → `couldn't find remote ref`) | ok |
| Прочитаны `lib/visibility/sales.ts`, `lib/commercial-facts.ts`, `lib/visibility/routes.ts`, `content.ru.ts`/`content.en.ts` (grep по ценам и «ранний доступ») | ok |
| `selena-ai-visibility @ release/selena-visibility-mvp` склонирован в scratchpad (`git clone --depth 1`, HEAD `84944e5`); прочитаны `recovery/launch/PROMISES.md`, `docs/selena-visibility/OFFER_LADDER.md`. `add_repo` не вызывался | ok |
| Поиск UTM-конвенции: `grep utm_` по репозиторию → `lib/school/ai-code-cross-review.ts:44-49`, `components/analytics/PublicEventTracker.tsx:27`, `tests/unit/schoolArticle.test.ts:81-93`, `docs/20-seo-top5-system.md:59`. Отдельного документа нет → в плане помечено «предложение» | ok |
| Аналитика: `lib/diagnostics/analytics.ts` → Vercel `track()`; D-031 в `docs/visibility/SELENA_VISIBILITY_DECISION_LOG.md` — Web Analytics Plus включён 22.09, доставка `needs_verification` | ok, зафиксировано в плане |
| Исследование площадок: 11 запросов WebSearch; 9 попыток WebFetch → все `EGRESS_BLOCKED` | частично |
| Код, тесты, сборка | не менялись, не запускались (диф — только `.md`) |

## Evidence

- Обещания и запреты: `sales.ts:30-33, 39-40, 54, 62, 84, 91, 165, 171-173, 267, 310, 412, 421, 473, 487`; PROMISES.md P1–P45, R1–R3.
- Площадки: ссылки-источники в таблице `SELENA_SEEDING_PLATFORMS_2026-09-28.md`, все с датой 2026-09-28 и статусом «кандидат — не связывались, согласия нет».
- Ни одной регистрации, письма, сообщения, заявки или публикации не сделано.

## Blockers

- **BLOCKED_EXTERNAL** — сетевая политика: `balihotelsassociation.com`, `balirca.id`, `t.me`, `travelline.ru`, `baliforum.ru`, `rabotarestoran.ru`, `startupgrind.com`, `meetup.com`, `nowbali.co.id` не открываются; правила площадок подтверждены только по сниппетам. Чек-лист владельцу на 5 минут — в документе площадок.
- **BLOCKED_EXTERNAL** — доставка UTM/событий в Vercel Web Analytics не проверяема из среды (дашборд и `*.selenasystems.com` недоступны). Пункт 1 чек-листа плана.
- **BLOCKED_DECISION** — платное членство BRCA (≈IDR 300K/мес по сниппету); платный пост в `@restodays`; согласованный пост на БалиФоруме; принадлежность `t.me/bali_ai_horeca`.
- **BLOCKED_DECISION** — использовать ли в публичных текстах «гарантию выполнения/измеримости» из OFFER_LADDER.md: на сайте её нет, в текстах не использована.

## next_step

1. Владелец проходит чек-лист §7 плана (5 минут) и принимает три решения.
2. Первый пост — 29.09 в собственном канале (если подтверждён), текст A · RU.
3. Отдельной задачей (код, не этот запуск): поправить R1/R2 на `/ru/visibility` (`content.ru.ts:28-32, 649`) до первой волны.
4. 12.10 — снять метрики по `utm_source` и записать результат сюда, включая нули.
