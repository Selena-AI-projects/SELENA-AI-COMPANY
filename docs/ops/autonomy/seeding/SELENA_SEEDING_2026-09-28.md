# Selena Systems · план посевов, первая волна (T-SEL-SEED-b)

Дата: 2026-09-28. База: `main @ 2fab794`. Волна: 29.09–12.10.2026 (14 дней).
Статус документа: **READY_FOR_PLACEMENT** — тексты готовы к размещению владельцем. Ничего не опубликовано, никому не отправлено.
Список площадок — `SELENA_SEEDING_PLATFORMS_2026-09-28.md` (та же папка).

## 1. Что можно обещать в текстах (границы из кода)

Источники: `lib/visibility/sales.ts`, `lib/commercial-facts.ts` (версия `selena-commercial-facts-2026-09-25-v4`),
`lib/visibility/content.{ru,en}.ts`; инвентарь обещаний `recovery/launch/PROMISES.md` и `docs/selena-visibility/OFFER_LADDER.md`
из `selena-ai-visibility @ release/selena-visibility-mvp (84944e5)`.

| Можно | Источник |
|---|---|
| Бесплатная проверка публичной готовности сайта `/check` · `/ru/check`: без карты и входа, до 5 страниц, результат сразу; проверяет доступ краулеров, robots/sitemap/canonical, schema, ясность сущности, цитируемость, путь к действию; список исправлений и одна бесплатная повторная проверка; не больше 5 запусков в час с одного адреса | PROMISES P1–P6; `commercial-facts.ts` `publicReadiness` (`availability: "free"`) |
| Проверка — **не** замер AI-видимости: она не показывает, кого советует ChatGPT | `sales.ts:310`; PROMISES P7 |
| $399 разово — Verified Discovery & Competitive Audit: 3–5 реальных конкурентов, 60-минутная сессия, план действий за 3 рабочих дня, одна сопоставимая перепроверка в течение 30 дней; запись вручную; полный возврат до начала исследования | `sales.ts:109-141, 183-226`; PROMISES P25–P33 |
| $2,490 / 90 дней — Managed Discovery Growth: заявка, объём согласуется вручную | `sales.ts:143-177`; `commercial-facts.ts` (`manual_approval`) |
| Никаких гарантий позиций, рекомендаций, трафика, бронирований, выручки | `sales.ts:165, 173, 421` |

| Нельзя обещать | Почему |
|---|---|
| $49 Visibility Snapshot и $79 Full Discovery как рабочую подписку | `status: "founding_soon"`, «регулярные замеры ещё не активированы» (`sales.ts:30-33, 39-40`); PROMISES P9–P24 — ранний доступ. В текстах цены $49/$79 не называем |
| Еженедельный отчёт в Telegram, кабинет, история | «после активации доставки» (`sales.ts:54, 62, 171`); PROMISES P16, P37, P41–P42 |
| Онлайн-оплату | «онлайн-оплата выключена» (`sales.ts:473, 487`); PROMISES P40 |
| Google Maps / локальную видимость в подписке | только «где подтверждён автоматический замер» (`sales.ts:84, 91`); ручной Ask Maps — только в аудите |
| Кейсы, цифры клиентов, отзывы | в репозитории их нет: демо помечено «fictional … not client results» (`sales.ts:267`), «Result: not measured» (`sales.ts:412`). CLAUDE.md «Content integrity rules» |
| Гарантию «выполнения» и «измеримости» из OFFER_LADDER.md | На сайте её нет (`sales.ts:165`); OFFER_LADDER — внутренний документ другого репозитория, не публичное обещание. Интерпретация: до согласования с владельцем в посевах не используем |

Известные расхождения RU/EN, которые тексты обходят (не цитируем спорные формулировки): RU-hero обещает Google Maps без оговорки и
«повторный замер, который показывает, сработало ли» (`content.ru.ts:28-32`; PROMISES R1); RU FAQ говорит «заказать замер восьми систем»
(`content.ru.ts:649`; R2). Интерпретация: это стоит поправить до волны, но задача этого запуска — документы, код не трогаем.

## 2. Измеряемое действие и как оно ловится

Действие волны (ТЗ п.7): **запрос аудита или пилота, либо бесплатная проверка `/check`.**

| Сигнал | Где виден | Состояние |
|---|---|---|
| Визиты на `/check`, `/ru/check`, `/visibility`, `/ru/visibility` с `utm_campaign=selena_seed_2026_10` | Vercel Web Analytics → фильтр по UTM. Web Analytics Plus включён владельцем 2026-09-22 (`docs/visibility/SELENA_VISIBILITY_DECISION_LOG.md`, D-031) | Доставка событий end-to-end помечена там же `needs_verification` → пункт 1 чек-листа |
| Запуск и завершение проверки (`readiness_start`, `readiness_complete`, `check_started`, `check_submitted`) | `lib/diagnostics/analytics.ts` → Vercel `track()` | То же: транспорт есть, доставка не подтверждена |
| Запрос аудита / раннего доступа / Managed | Форма на `/visibility#audit-order`, `#early-access`, `#managed-application` → `app/api/leads/route.ts`; в письме-уведомлении есть строка `Источник: <sourcePath>` (`route.ts:184`) | UTM в лид не пишется — только путь страницы. Для атрибуции владелец спрашивает «откуда узнали» при ответе |
| Клик в наш Telegram | `telegram_discussion_click` — только на странице статьи школы | Для посева не используется |

Ограничение: `PublicEventTracker.tsx:24-31` читает `utm_*` только на странице статьи `/ru/blog/kak-proveryat-ai-kod`; для остальных
страниц атрибуция опирается на встроенный UTM-отчёт Vercel Web Analytics (интерпретация: Vercel записывает utm-параметры pageview сам;
подтвердить в дашборде — чек-лист, п. 1).

## 3. UTM-конвенция

**Что уже есть в репозитории (факт):** `lib/school/ai-code-cross-review.ts:44-49` —
`utm_source=telegram`, `utm_medium=social`, `utm_campaign=<snake_case>`, `utm_content=<snake_case>`; трекер читает ровно эти четыре
ключа и режет значения до 96 символов (`components/analytics/PublicEventTracker.tsx:27-28`). Тест контракта —
`tests/unit/schoolArticle.test.ts:81-93`. `utm_term` нигде не используется. Отдельного документа конвенции в `docs/` нет
(проверено `grep utm_` по репозиторию: только `docs/20-seo-top5-system.md:59` с тестовым `utm_source=seo_test`).

**Предложение для посевов (расширение, не замена):**

| Параметр | Значение | Правило |
|---|---|---|
| `utm_source` | slug площадки: `bali_ai_horeca`, `frontdesk_ru`, `hoteliers_uz`, `restodays`, `balichat`, `startup_grind_bali`, `meetup_bali_tech`, `brca`, `bha`, `phri_bali` | snake_case, латиница, без точек |
| `utm_medium` | `social` для Telegram (совместимо с текущим кодом); `community` для клубов, ассоциаций и Meetup | два значения, не больше |
| `utm_campaign` | `selena_seed_2026_10` | одна кампания на волну |
| `utm_content` | id текста: `horeca_post`, `club_post`, `association_note` + суффикс языка `_ru` / `_en` | по тексту, не по площадке |

Пример: `https://www.selenasystems.com/ru/check?utm_source=frontdesk_ru&utm_medium=social&utm_campaign=selena_seed_2026_10&utm_content=horeca_post_ru`
Фрагмент якоря ставится после query: `https://www.selenasystems.com/visibility?utm_source=brca&utm_medium=community&utm_campaign=selena_seed_2026_10&utm_content=association_note_en#audit-order`.
Базовый домен — `lib/site.ts:8-10` (`https://www.selenasystems.com`). Маршруты — `lib/visibility/routes.ts:5-20`.

## 4. Тексты (READY_FOR_PLACEMENT)

Правила текстов: без кейсов, цифр клиентов, отзывов и гарантий; не называем $49/$79; «предварительная оценка», а не «результат».
Тон — по CLAUDE.md: спокойно, конкретно, без хайпа. Перед публикацией владелец читает правила площадки (все — «неизвестно» или «по согласованию»).

### Текст A · HoReCa-сообщества и отраслевые каналы (`horeca_post`)

Площадки: `t.me/bali_ai_horeca` (свой канал), Frontdesk.ru, hoteliers.uz, restodays (если решено платить), PHRI Bali.

**RU** (`utm_content=horeca_post_ru`, лендинг `/ru/check`)

> Гость всё чаще спрашивает не Google, а ChatGPT или Gemini: «где поужинать вдвоём в Чангу», «спа для пары в Убуде», «семейная вилла рядом с пляжем». Первый вопрос для отеля или ресторана простой: может ли AI вообще прочитать и понять ваш сайт?
>
> Мы сделали бесплатную проверку, которая отвечает именно на это. Она смотрит до 5 публичных страниц и показывает, открыт ли сайт для краулеров, есть ли sitemap и canonical, понятно ли из страниц, что вы за бизнес и где вы, и есть ли на них следующий шаг для гостя. В конце — список исправлений и одна бесплатная повторная проверка. Без карты, без регистрации, результат сразу.
>
> Важно: это проверка готовности сайта, а не замер того, кого советует ChatGPT. Кого именно AI называет вместо вас — отдельная работа с аналитиком, о ней расскажем, если будет интерес.
>
> Проверить свой сайт: https://www.selenasystems.com/ru/check?utm_source={SLUG}&utm_medium=social&utm_campaign=selena_seed_2026_10&utm_content=horeca_post_ru
>
> Если хочется разобрать свой случай глубже — напишите, обсудим.

**EN** (`utm_content=horeca_post_en`, лендинг `/check`)

> Guests increasingly ask ChatGPT or Gemini instead of Google: "romantic dinner in Canggu", "couples spa in Ubud", "family villa near the beach". Before any of that matters, one plain question: can an AI system actually read and understand your website?
>
> We built a free check that answers exactly this. It reads up to 5 public pages and shows whether crawlers can access the site, whether sitemap and canonical signals are in place, whether the pages make clear what the business is and where it is, and whether a guest can take the next step. You get a list of fixes and one free recheck. No card, no sign-up, results right away.
>
> To be clear: this is a website readiness check, not a measurement of who ChatGPT recommends. Finding out which competitors AI names instead of you is separate, analyst-led work; happy to explain if useful.
>
> Check your site: https://www.selenasystems.com/check?utm_source={SLUG}&utm_medium=social&utm_campaign=selena_seed_2026_10&utm_content=horeca_post_en
>
> If you'd like to go through your own case in more depth, reply here and we'll talk.

### Текст B · клубы предпринимателей и Meetup (`club_post`)

Площадки: Startup Grind Bali (как тема для fireside chat, не пост), Bali Start-ups and Tech Community, Bali Entrepreneur Growth Circle, БалиФорум (по согласованию).

**RU** (`utm_content=club_post_ru`, лендинг `/ru/check`)

> Вопрос к тем, у кого отель, вилла, ресторан или спа: вы проверяли, что видит AI, когда открывает ваш сайт?
>
> Мы в Selena Systems занимаемся AI-видимостью для гостеприимства и начали с самого простого шага — бесплатной технической проверки сайта: доступ краулеров, sitemap, структурированные данные, ясно ли из страниц, что за бизнес и где он. Занимает пару минут, без регистрации, на выходе список исправлений.
>
> Цифр «у клиентов выросло на X%» у нас нет и в этом посте не будет: продукт молодой, а гарантировать позиции в ответах AI не может никто. Есть честная проверка и, для тех, кому нужно глубже, разбор с аналитиком: какие 3–5 конкурентов AI называет вместо вас и почему.
>
> Проверка: https://www.selenasystems.com/ru/check?utm_source={SLUG}&utm_medium=community&utm_campaign=selena_seed_2026_10&utm_content=club_post_ru
>
> Буду рада обратной связи по самой проверке — что непонятно, чего не хватает.

**EN** (`utm_content=club_post_en`, лендинг `/check`)

> A question for anyone running a hotel, villa, restaurant or spa: have you checked what an AI system sees when it opens your website?
>
> At Selena Systems we work on AI visibility for hospitality, and we started with the simplest step: a free technical readiness check of a website — crawler access, sitemap, structured data, whether the pages make clear what the business is and where it is. It takes a couple of minutes, no sign-up, and ends with a list of fixes.
>
> No "clients grew X%" numbers here, because we don't have them yet: the product is young, and nobody can guarantee positions in AI answers. What we do have is an honest check and, for those who need to go deeper, an analyst-led review of which 3–5 competitors AI names instead of you and why.
>
> The check: https://www.selenasystems.com/check?utm_source={SLUG}&utm_medium=community&utm_campaign=selena_seed_2026_10&utm_content=club_post_en
>
> Feedback on the check itself is very welcome — what's unclear, what's missing.

### Текст C · записка для ассоциаций (`association_note`)

Площадки: BRCA, BHA (если партнёрство возможно), hoteliers.uz. Это не пост, а короткое деловое письмо от владельца в официальный канал организации.
Отправляет только владелец, только после решения по членству/партнёрству.

**EN** (`utm_content=association_note_en`, лендинг `/check` + `/visibility#audit-order`)

> Subject: Free website AI-readiness check for [Association] members
>
> Hello [Association] team,
>
> I'm Selena Nigmatullaeva, founder of Selena Systems. We measure how hotels, villas, restaurants and spas appear in AI assistants (ChatGPT, Gemini, Perplexity) and what to change on the website and public sources.
>
> I'd like to offer your members a free, no-registration website readiness check: https://www.selenasystems.com/check?utm_source={SLUG}&utm_medium=community&utm_campaign=selena_seed_2026_10&utm_content=association_note_en
> It reads up to 5 public pages and returns a list of concrete fixes. It does not measure AI recommendations; that is a separate, analyst-led audit (https://www.selenasystems.com/visibility?utm_source={SLUG}&utm_medium=community&utm_campaign=selena_seed_2026_10&utm_content=association_note_en#audit-order), which I'd be glad to walk through with a few members as a pilot.
>
> We are a new product: I won't quote client results, because we don't have verified ones yet. What I can offer is a short online session for members on what AI systems actually read on a hospitality website.
>
> Please let me know your rules for member communications and partnerships; I'll follow them.
>
> Best regards, Selena Nigmatullaeva · Selena Systems LLC · [official contact from the site]

**RU** (`utm_content=association_note_ru`, лендинг `/ru/check` + `/ru/visibility#audit-order`)

> Тема: бесплатная проверка AI-готовности сайта для членов [Ассоциации]
>
> Здравствуйте!
>
> Меня зовут Селена Нигматуллаева, я основатель Selena Systems. Мы измеряем, как отели, виллы, рестораны и спа выглядят в AI-ассистентах (ChatGPT, Gemini, Perplexity) и что менять на сайте и в публичных источниках.
>
> Хочу предложить членам [Ассоциации] бесплатную проверку сайта без регистрации: https://www.selenasystems.com/ru/check?utm_source={SLUG}&utm_medium=community&utm_campaign=selena_seed_2026_10&utm_content=association_note_ru
> Она читает до 5 публичных страниц и выдаёт список конкретных исправлений. Кого именно советует AI, она не измеряет — это отдельный аудит с аналитиком (https://www.selenasystems.com/ru/visibility?utm_source={SLUG}&utm_medium=community&utm_campaign=selena_seed_2026_10&utm_content=association_note_ru#audit-order), который я готова провести с несколькими членами как пилот.
>
> Продукт новый: результаты клиентов не привожу, потому что подтверждённых пока нет. Могу предложить короткую онлайн-сессию для членов о том, что AI-системы на самом деле читают на сайте отеля или ресторана.
>
> Подскажите, пожалуйста, ваши правила для рассылок членам и партнёрств — буду им следовать.
>
> С уважением, Селена Нигматуллаева · Selena Systems LLC · [официальный контакт с сайта]

Имя и роль основателя — из `lib/school/ai-code-cross-review.ts:11-12`; в письме контакт подставляет владелец из `lib/site.ts` (`contact`).

## 5. Критерий результата за 14 дней (29.09–12.10)

Предложение (порог назначен, а не измерен; базовой линии нет):

| Уровень | Критерий | Как считать |
|---|---|---|
| Минимум | ≥ 1 запрос аудита или пилота, который владелец может связать с волной (ответ «откуда узнали» или `Источник` в письме лида + совпадение по времени с размещением) | письма из `app/api/leads/route.ts` + ответы |
| Рабочий | ≥ 10 визитов на `/check`+`/ru/check` с `utm_campaign=selena_seed_2026_10` и ≥ 3 завершённых проверки за 14 дней | Vercel Web Analytics: UTM-фильтр; события `readiness_complete` / `check_submitted` |
| Диагностический | по каждой площадке — visits / completed checks / inquiries, чтобы вторая волна оставила только то, что дало отклик | тот же фильтр по `utm_source` |

Ноль — тоже результат: он фиксируется в журнале с датой, площадкой и текстом.
Никакие из этих чисел не публикуются как «результаты клиентов».

## 6. Очередь 29.09–12.10

Все действия ниже выполняет владелец. Помощник ничего не отправляет. «Решение» = пункт BLOCKED_DECISION.

| Дата | Площадка | Действие | Текст | Условие |
|---|---|---|---|---|
| Пн 29.09 | — | Чек-лист §7: UTM в Vercel, свой канал, три решения | — | — |
| Пн 29.09 | `t.me/bali_ai_horeca` | Пост в собственном канале | A · RU (+EN, если аудитория смешанная) | канал подтверждён как свой |
| Вт 30.09 | Frontdesk.ru | Написать авторам канала через официального бота: спросить условия публикации, приложить текст | A · RU | ответ авторов; при платном размещении — решение |
| Ср 01.10 | hoteliers.uz | Записка в официальный канал ассоциации | C · RU | — |
| Чт 02.10 | Startup Grind Bali | Заявка спикера на fireside chat (тема: «что AI читает на сайте отеля»); не пост | B · EN как основа заявки | формат площадки — беседа, не питч |
| Пт 03.10 | BRCA | Решение о членстве (платное). Если да — регистрация и записка | C · EN | **решение** |
| Пн 06.10 | Bali Start-ups and Tech Community | Вступить, прочитать правила группы, при разрешении — пост | B · EN | правила группы |
| Вт 07.10 | Bali Entrepreneur Growth Circle | То же; приоритет низкий | B · EN | правила группы |
| Ср 08.10 | БалиФорум | Только по согласованию с маркетингом форума | B · RU | **решение** (возможна оплата) |
| Чт 09.10 | restodays | Только платное размещение через администратора | A · RU | **решение** |
| Чт 09.10 | BHA | Если PT/PMA обязательно — пропустить; иначе записка | C · EN | подтверждение правила партнёрства |
| Пт 10.10 | PHRI Bali | Найти официальный сайт отделения; при наличии контактов — записка | C · EN | источник слабый |
| Пн 12.10 | — | Снятие метрик §5 по площадкам; запись в журнал; отбор для второй волны | — | — |

## 7. Чек-лист владельцу на 5 минут (до первого поста)

1. Vercel → проект `selena-ai-company` → Web Analytics: открыть `https://www.selenasystems.com/check?utm_source=test&utm_medium=social&utm_campaign=selena_seed_2026_10&utm_content=test` и через несколько минут проверить, что визит виден с этими UTM. Если нет — атрибуция волны ломается, сообщить.
2. Подтвердить, что `t.me/bali_ai_horeca` — наш канал (в поиске о нём ничего нет).
3. Три решения: платное членство BRCA; платный пост в restodays; согласованный пост на БалиФоруме. Любое «нет» просто убирает строку из очереди.
4. Открыть 7 ссылок из чек-листа в `SELENA_SEEDING_PLATFORMS_2026-09-28.md` — среда их не открыла.
5. Прочитать тексты A/B/C и заменить `{SLUG}` на slug площадки из §3 перед каждой публикацией.

## 8. Что не сделано и почему

- Страницы площадок не открыты (сетевая политика) — правила подтверждены только там, где их процитировал поисковый сниппет. BLOCKED_EXTERNAL.
- Доставка событий в Vercel Web Analytics не проверена из среды (`*.selenasystems.com` и дашборд Vercel недоступны). BLOCKED_EXTERNAL.
- Расхождения RU/EN на `/ru/visibility` (R1, R2 из PROMISES.md) не исправлены — задача этого запуска только документы.
- Число участников `t.me/bali_ai_horeca` и его принадлежность не подтверждены.
