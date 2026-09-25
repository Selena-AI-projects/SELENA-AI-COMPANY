import Link from "next/link";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { CrossReviewWorkflow } from "@/components/school/CrossReviewWorkflow";
import { ResponsiveArticleFigure } from "@/components/school/ResponsiveArticleFigure";
import { TelegramDiscussionLink } from "@/components/school/TelegramDiscussionLink";
import { aiCodeCrossReviewArticle } from "@/lib/school/ai-code-cross-review";
import { communityLinks } from "@/lib/site";

const roles = [
  {
    name: "Владелец",
    description:
      "Определяет задачу, цели, ограничения и то, что нельзя нарушать. Принимает решения о деньгах, доступах, публикации, слиянии веток и изменениях рабочей версии.",
  },
  {
    name: "ChatGPT",
    description:
      "Помогает собрать контекст, документы и требования в понятное техническое задание. ChatGPT не заменяет репозиторий и не определяет, какой коммит проверяется.",
  },
  {
    name: "Codex",
    description:
      "Работает с репозиторием: реализует задачу в отдельной ветке, добавляет тесты и готовит точный дифф к независимой проверке.",
  },
  {
    name: "GitHub",
    description:
      "Хранит код, коммиты, пул-реквесты и результаты автоматических проверок. Это общий источник истины для всех участников процесса.",
  },
  {
    name: "Claude Code",
    description:
      "Получает то же ТЗ и точную версию кода. Проводит независимый аудит в режиме только для чтения, не изменяя исходный репозиторий и не опираясь заранее на выводы Codex.",
  },
  {
    name: "Автоматические тесты",
    description:
      "Проверяют только заложенные сценарии: типы, сборку, тесты и другие обязательные машинные проверки проекта. Зелёные проверки не гарантируют отсутствие всех ошибок.",
  },
] as const;

const ownerGates = [
  "платные вызовы и увеличение бюджета",
  "добавление новых учётных данных и ключей доступа",
  "миграция общей базы данных тестовой или рабочей среды",
  "слияние в ветку release или main",
  "выкладка в рабочую среду",
  "публичная публикация",
  "запуск платежей, регулярных списаний и фоновых задач по расписанию",
  "изменение продуктовых границ",
] as const;

const reviewRecord = [
  "проверяемое ТЗ",
  "репозиторий и ветка",
  "точный хеш коммита (SHA)",
  "границы независимой проверки",
  "результаты тестов и CI",
  "найденные замечания",
  "статус проверки: текущая или устаревшая",
] as const;

export function AiCodeCrossReviewArticle() {
  const article = aiCodeCrossReviewArticle;

  return (
    <article>
      <PageHero
        eyebrow="Блог · Личный опыт"
        title={article.title}
        intro={article.subtitle}
      >
        <p className="max-w-3xl border-l-2 border-copper pl-5 text-[1.05rem] leading-8 text-ink/80">
          Этот процесс нужен владельцам бизнеса и начинающим AI-разработчикам, которые не могут профессионально проверить каждую строку кода. Codex реализует задачу, Claude Code независимо проверяет тот же коммит, GitHub фиксирует версию, а человек сохраняет контроль над необратимыми решениями.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
          <span>{article.author} · {article.authorRole}</span>
          <span>Опубликовано <time dateTime={article.publishedAt}>30 августа 2026</time></span>
          <span>Обновлено <time dateTime={article.updatedAt}>30 августа 2026</time></span>
        </div>
      </PageHero>

      <div className="bg-surface py-4">
        <Container size="narrow">
          <nav aria-label="Хлебные крошки" className="text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/ru" className="inline-flex min-h-11 items-center text-link underline decoration-link/45 underline-offset-4">Главная</Link></li>
              <li aria-hidden>→</li>
              <li><Link href="/ru/blog" className="inline-flex min-h-11 items-center text-link underline decoration-link/45 underline-offset-4">Блог</Link></li>
              <li aria-hidden>→</li>
              <li aria-current="page">{article.title}</li>
            </ol>
          </nav>
        </Container>
      </div>

      <section className="bg-surface pb-16 pt-10 sm:pb-24">
        <Container size="narrow">
          <div className="space-y-5 text-[1.04rem] leading-8 text-ink/78">
            <p>
              Недавно я встречалась за кофе с участниками нашего AI-чата. Пока рассказывала, как работаю, поняла довольно смешную вещь: я использую ChatGPT, Codex и Claude Code, но часть работы между ними всё ещё переносила вручную.
            </p>
            <p>
              Отдельно хранила контекст проекта, копировала задания из одного чата в другой и сама пыталась следить, какую версию кода кто проверял. После этого разговора я решила первым делом убрать именно эту ручную часть и собрать единый процесс.
            </p>
          </div>

          <ResponsiveArticleFigure
            baseName="codex-claude-cross-review-workflow-ru"
            alt="Сравнение ручного переноса заданий между AI-системами и процесса с GitHub как единым источником истины."
            title="Перекрёстная проверка AI-кода: GitHub как единый источник истины"
            caption="Было: владелец вручную переносит отчёты между ChatGPT, Codex и Claude Code. Стало: все системы читают одну зафиксированную версию в GitHub."
            width={1200}
            height={630}
          />
        </Container>
      </section>

      <section className="bg-ivory py-16 sm:py-24" aria-labelledby="who-needs-cross-review">
        <Container size="narrow">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-deep">Для кого и зачем</p>
          <h2 id="who-needs-cross-review" className="mt-4 font-serif text-3xl font-semibold text-ink sm:text-4xl">
            Перекрёстная проверка нужна, когда вы отвечаете за результат, но не можете проверить весь код сами
          </h2>
          <div className="mt-6 space-y-5 text-[1.04rem] leading-8 text-ink/78">
            <p>
              Если человек много лет работает в своей сфере и с помощью ИИ автоматизирует собственную экспертизу, чтобы убрать рутину, — это одна ситуация. У меня другая: я создаю сайты и приложения, но сама не разработчик и не могу профессионально проверить каждую строку кода.
            </p>
            <p>
              Поэтому проверка AI-кода для меня — не вопрос недоверия к ИИ. Это способ не зависеть от ответа одной системы: один агент выполняет задачу, второй независимо проверяет тот же результат, а автоматические тесты подтверждают только заранее определённые сценарии.
            </p>
            <p>
              Усиленный контроль особенно нужен перед изменениями в базе данных, миграциях, авторизации, правах доступа, персональных данных, платежах, безопасности, публикации, тестовой и рабочей среде.
            </p>
          </div>
          <p className="mt-7 border-l-2 border-copper pl-5 font-medium leading-7 text-ink">
            Короткий вывод: две проверки снижают риск зависимости от одного ответа, но не дают абсолютной гарантии.
          </p>
        </Container>
      </section>

      <section className="bg-surface py-16 sm:py-24" aria-labelledby="system-roles">
        <Container size="wide">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-deep">Роли систем</p>
          <h2 id="system-roles" className="mt-4 max-w-4xl font-serif text-3xl font-semibold text-ink sm:text-4xl">
            ChatGPT собирает требования, Codex реализует, GitHub фиксирует, Claude Code проверяет
          </h2>
          <dl className="mt-10 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <div key={role.name} className="bg-surface p-6 sm:p-7">
                <dt className="font-serif text-2xl font-semibold text-ink">{role.name}</dt>
                <dd className="mt-3 leading-7 text-muted">{role.description}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="bg-ivory py-16 sm:py-24" aria-labelledby="one-task-workflow">
        <Container size="narrow">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-deep">Одна задача</p>
          <h2 id="one-task-workflow" className="mt-4 font-serif text-3xl font-semibold text-ink sm:text-4xl">
            Как контролировать AI-разработку от ТЗ до решения владельца
          </h2>
          <p className="mt-6 text-[1.04rem] leading-8 text-ink/78">
            Последовательность важна: независимая проверка кода Claude Code относится к конкретному коммиту, а не к «последней версии где-то в чате».
          </p>
          <ol className="mt-8 list-decimal space-y-4 pl-6 text-[1.04rem] leading-8 marker:font-semibold marker:text-copper-deep">
            {article.workflowSteps.map((step, index) => (
              <li key={step} id={`workflow-step-${index + 1}`} className="scroll-mt-24 pl-1 text-ink/78">{step}</li>
            ))}
          </ol>

          <ResponsiveArticleFigure
            baseName="ai-code-review-task-cycle-ru"
            alt="Цикл задачи: постановка ТЗ, реализация в Codex, GitHub CI, независимая проверка в Claude Code и решение владельца."
            title="Цикл проверки AI-кода: Codex, GitHub, Claude Code и решение владельца"
            caption="Цикл задачи с возвратом замечаний к Codex, остановкой по статусу BLOCKED_PLAN_LIMIT и решением владельца перед слиянием или публикацией."
            width={1080}
            height={1350}
          />

          <CrossReviewWorkflow />
          <p className="mt-7 border-l-2 border-copper pl-5 font-medium leading-7 text-ink">
            Короткий вывод: у каждой проверки есть точная версия, а любой новый коммит делает предыдущую проверку устаревшей.
          </p>
        </Container>
      </section>

      <section className="bg-surface py-16 sm:py-24" aria-labelledby="github-source-of-truth">
        <Container size="narrow">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-deep">Единый источник истины</p>
          <h2 id="github-source-of-truth" className="mt-4 font-serif text-3xl font-semibold text-ink sm:text-4xl">
            Почему GitHub связывает Codex и независимую проверку Claude Code
          </h2>
          <div className="mt-6 space-y-5 text-[1.04rem] leading-8 text-ink/78">
            <p>
              Codex и Claude Code должны проверять одну и ту же зафиксированную версию. GitHub убирает ситуацию, когда один чат анализирует старый код, второй уже работает с новым, а владелец переносит между ними устаревшие комментарии.
            </p>
            <p>В записи каждой проверки должны быть понятны:</p>
          </div>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {reviewRecord.map((item) => (
              <li key={item} className="rounded-lg border border-line bg-ivory px-4 py-4 leading-7 text-ink/78">{item}</li>
            ))}
          </ul>
          <p className="mt-7 border-l-2 border-copper pl-5 font-medium leading-7 text-ink">
            Короткий вывод: совпадение мнений не является доказательством; доказательство начинается с одного и того же коммита, диффа и результатов проверок.
          </p>
        </Container>
      </section>

      <section className="bg-ivory py-16 sm:py-24" aria-labelledby="owner-gates">
        <Container size="narrow">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-deep">Где остаётся человек</p>
          <h2 id="owner-gates" className="mt-4 font-serif text-3xl font-semibold text-ink sm:text-4xl">
            ИИ может выполнять обратимые действия, но необратимые решения остаются у владельца
          </h2>
          <p className="mt-6 text-[1.04rem] leading-8 text-ink/78">
            Обязательное решение владельца требуется перед следующими действиями:
          </p>
          <ul className="mt-7 space-y-3 border-l-2 border-copper pl-6 text-[1.04rem] leading-7 text-ink/78">
            {ownerGates.map((gate) => <li key={gate}>{gate}</li>)}
          </ul>
        </Container>
      </section>

      <section className="bg-surface py-16 sm:py-24" aria-labelledby="workflow-limits">
        <Container size="narrow">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-deep">Ограничения</p>
          <h2 id="workflow-limits" className="mt-4 font-serif text-3xl font-semibold text-ink sm:text-4xl">
            Перекрёстная проверка снижает риск, но не гарантирует отсутствие ошибок
          </h2>
          <div className="mt-6 space-y-5 text-[1.04rem] leading-8 text-ink/78">
            <p>
              Этот процесс не означает работу без остановки 24/7. Компьютер может уснуть, интернет — пропасть, CI — остановиться, а лимит Claude Max — временно закончиться. Поэтому корректная формулировка звучит так: автономный процесс с сохранением состояния, повторным продолжением и остановкой там, где нужно решение владельца.
            </p>
            <p>
              Нельзя обещать «полностью автономную разработку без человека», гарантированное отсутствие ошибок, подтверждение работоспособности всего кода одними тестами или автоматическое исправление кода Claude Code. Независимая проверка тоже может ошибиться.
            </p>
          </div>
          <p className="mt-7 border-l-2 border-copper pl-5 font-medium leading-7 text-ink">
            Короткий вывод: цель процесса — сделать риск и ответственность видимыми, а не объявить AI безошибочным.
          </p>
        </Container>
      </section>

      <section className="bg-ivory py-16 sm:py-24" aria-labelledby="related-selena-materials">
        <Container size="narrow">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-deep">Продолжить изучение</p>
          <h2 id="related-selena-materials" className="mt-4 font-serif text-3xl font-semibold text-ink sm:text-4xl">
            Связанные материалы Selena Systems
          </h2>
          <ul className="mt-8 space-y-4">
            {[
              ["Практический опыт: как два AI-агента ошиблись при проверке кода", "/ru/lab/experiments/two-agent-code-review"],
              ["Как подготовить сайт для AI-систем", "/ru/lab/guides/prepare-site-for-ai-systems"],
              ["Как читать отчёт AI Visibility и проверять доказательства", "/ru/lab/guides/read-ai-visibility-report-evidence"],
              ["Бесплатная проверка публичной готовности сайта", "/ru/check"],
              ["AI Automation для владельцев бизнеса", "/ru#ai-systems"],
            ].map(([title, href]) => (
              <li key={href}>
                <Link href={href} className="inline-flex min-h-11 items-center text-link underline decoration-link/45 underline-offset-4 hover:decoration-link-deep">
                  {title} <span className="ml-2" aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-surface py-12" aria-label="Темы материала">
        <Container size="narrow">
          <ul className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <li key={tag} className="rounded-full border border-line bg-ivory px-4 py-2 text-sm text-ink/75">{tag}</li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-charcoal py-16 text-ivory sm:py-20" aria-labelledby="article-discussion">
        <Container size="narrow">
          <h2 id="article-discussion" className="font-serif text-3xl font-semibold text-ivory sm:text-4xl">
            Как вы проверяете код, написанный ИИ?
          </h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-ivory/72">
            Я продолжаю проверять этот процесс на собственных проектах и дорабатывать границы между автоматической работой и решениями владельца. Расскажите, что вы проверяете сами, что передаёте второй системе и где оставляете обязательное решение за человеком.
          </p>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-ivory/72">
            В Telegram-канале Bali AI HoReCa будет особенно интересно AI-энтузиастам, рестораторам, владельцам бизнеса и IT-специалистам — всем, кто внедряет AI в реальные процессы и хочет обсуждать практику с людьми из разных сфер. Участники сообщества также проводят регулярные офлайн-встречи на Бали — раз в две недели.
          </p>
          <div className="mt-8">
            <TelegramDiscussionLink href={communityLinks.baliAiHorecaTelegram} />
          </div>
        </Container>
      </section>
    </article>
  );
}
