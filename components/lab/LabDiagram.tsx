/**
 * Diagrams for Lab entries, drawn as inline SVG rather than shipped as images.
 *
 * A picture of a workflow is useless to the machines this site is about: text
 * inside a PNG is not read by search engines or answer engines, and alt text
 * can only carry a summary. Drawn this way, every label is real text.
 */
import type { LabDiagramId } from "@/lib/lab/content";

const ink = "#161413";
const muted = "#5b5046";
const line = "#e6ddd1";
const copper = "#8f5c34";
const green = "#2e7d4f";
const neutralFill = "#f2ece2";
const strongFill = "#ece4d8";
const strongStroke = "#d8cbb8";
const pillFill = "#f8efdb";
const pillStroke = "#e2c99a";

type BoxProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  lines?: string[];
  variant?: "neutral" | "strong" | "copper" | "green" | "outline";
};

function Box({ x, y, width, height, title, lines = [], variant = "neutral" }: BoxProps) {
  const filled = variant === "copper" || variant === "green";
  const fill =
    variant === "copper" ? copper : variant === "green" ? green : variant === "strong" ? strongFill : variant === "outline" ? "#fffdf8" : neutralFill;
  const stroke = variant === "strong" ? strongStroke : variant === "outline" ? green : filled ? fill : line;
  const titleColor = filled ? "#fffdf8" : ink;
  const lineColor = filled ? "#f4e7dc" : muted;
  const centerX = x + width / 2;
  const titleY = lines.length === 0 ? y + height / 2 + 6 : y + 26;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={8} fill={fill} stroke={stroke} strokeWidth={variant === "outline" ? 2 : 1} />
      <text x={centerX} y={titleY} textAnchor="middle" fontSize={17} fontWeight={700} fill={titleColor}>
        {title}
      </text>
      {lines.map((text, index) => (
        <text key={text} x={centerX} y={titleY + 22 + index * 19} textAnchor="middle" fontSize={14} fill={lineColor}>
          {text}
        </text>
      ))}
    </g>
  );
}

function Pill({ x, y, width, label }: { x: number; y: number; width: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={44} rx={22} fill={pillFill} stroke={pillStroke} />
      <text x={x + width / 2} y={y + 28} textAnchor="middle" fontSize={16} fontWeight={700} fill={copper}>
        {label}
      </text>
    </g>
  );
}

function Caption({ x, y, text, anchor = "middle" }: { x: number; y: number; text: string; anchor?: "middle" | "start" }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={14} fontWeight={700} fill={muted} letterSpacing={0.4}>
      {text}
    </text>
  );
}

function Note({ x, y, width, lines, tone = "neutral" }: { x: number; y: number; width: number; lines: string[]; tone?: "neutral" | "cool" }) {
  const height = 22 + lines.length * 22;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={6} fill={tone === "cool" ? "#eef2f1" : neutralFill} />
      {lines.map((text, index) => (
        <text key={text} x={x + width / 2} y={y + 28 + index * 22} textAnchor="middle" fontSize={15} fill={ink}>
          {text}
        </text>
      ))}
    </g>
  );
}

function Arrow({ d, color = muted }: { d: string; color?: string }) {
  return <path d={d} fill="none" stroke={color} strokeWidth={1.6} markerEnd={`url(#lab-arrow-${color === copper ? "copper" : "muted"})`} />;
}

function ArrowDefs() {
  return (
    <defs>
      {[
        ["muted", muted],
        ["copper", copper],
      ].map(([id, color]) => (
        <marker key={id} id={`lab-arrow-${id}`} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      ))}
    </defs>
  );
}

function TaskCycleDiagram() {
  return (
    <svg viewBox="0 0 800 1180" width="100%" role="img" aria-hidden="true" focusable="false">
      <ArrowDefs />

      <Box x={180} y={0} width={440} height={62} title="Владелец: замысел" lines={["что решаем · чего нельзя нарушать"]} variant="copper" />
      <Arrow d="M 400 62 L 400 90" />

      <Box
        x={130}
        y={92}
        width={540}
        height={86}
        title="Проект: все документы и данные"
        lines={["ChatGPT Work и Claude Cowork — держу оба", "сами документы живут в репозитории · оба читают оттуда"]}
        variant="strong"
      />
      <Arrow d="M 400 178 L 400 206" />

      <Caption x={400} y={228} text="ПРОВЕРКА ЗАМЫСЛА — оба независимо" />

      <Box x={80} y={244} width={300} height={66} title="Codex" lines={["реализуемо ли в нашем коде"]} />
      <Box x={410} y={244} width={310} height={80} title="Claude Cowork" lines={["слепые зоны, риски, обещания", "в рабочем пространстве, кода ещё нет"]} />

      <Arrow d="M 230 310 L 330 352" />
      <Arrow d="M 565 324 L 470 352" />

      <Pill x={230} y={356} width={340} label="противоречия или пробелы?" />

      {/* The rework loop: a contradiction sends the task back to the documents. */}
      <Arrow d="M 230 378 C 96 378, 52 360, 52 250 C 52 150, 92 135, 130 135" color={copper} />
      <text x={16} y={258} fontSize={15} fontWeight={700} fill={copper}>
        да
      </text>

      <Arrow d="M 400 400 L 400 430" color={green} />
      <text x={414} y={422} fontSize={15} fill={green}>
        нет
      </text>

      <Box x={200} y={432} width={400} height={56} title="Утверждённое ТЗ" variant="outline" />
      <Arrow d="M 400 488 L 400 516" />

      <Box x={175} y={518} width={450} height={70} title="Codex · код в отдельной ветке" lines={["миграции, тесты, затем пул-реквест"]} />
      <Arrow d="M 400 588 L 400 612" />

      <Caption x={400} y={634} text="ПРОВЕРКА КОДА — на одном и том же коммите" />

      <Box x={92} y={650} width={200} height={70} title="GitHub CI" lines={["тесты, сборка, ключи"]} variant="green" />
      <Box x={318} y={650} width={206} height={66} title="Codex" lines={["свой же дифф"]} />
      <Box x={552} y={650} width={228} height={84} title="Claude Code" lines={["в GitHub Actions, по @claude", "аудит и безопасность"]} />

      <Arrow d="M 192 722 L 320 764" />
      <Arrow d="M 421 718 L 400 762" />
      <Arrow d="M 666 736 L 480 764" />

      <Pill x={215} y={768} width={370} label="ошибка или красная проверка?" />

      {/* The same loop again, one level down: a red check returns to the branch. */}
      <Arrow d="M 215 790 C 96 790, 52 770, 52 662 C 52 574, 100 553, 175 553" color={copper} />
      <text x={16} y={668} fontSize={15} fontWeight={700} fill={copper}>
        да
      </text>

      <Arrow d="M 400 812 L 400 842" color={green} />
      <text x={414} y={834} fontSize={15} fill={green}>
        нет
      </text>

      <Box
        x={130}
        y={844}
        width={540}
        height={70}
        title="Владелец: мержить · тратить · публиковать"
        lines={["только необратимое · один раз на готовый пакет"]}
        variant="copper"
      />

      <g>
        <rect x={20} y={946} width={760} height={96} rx={8} fill={neutralFill} stroke={copper} strokeWidth={1.5} strokeDasharray="7 6" />
        <text x={400} y={978} textAnchor="middle" fontSize={16} fontWeight={700} fill={ink}>
          ДОЛГОВРЕМЕННАЯ ПАМЯТЬ — под всем циклом
        </text>
        <text x={400} y={1002} textAnchor="middle" fontSize={14} fill={muted}>
          факты обо мне и о том, как я работаю · Central Memory, Obsidian
        </text>
        <text x={400} y={1024} textAnchor="middle" fontSize={14} fill={muted}>
          не шаг процесса: она есть всегда, до первого слова
        </text>
      </g>

      <Note x={40} y={1064} width={720} lines={["Возврат всегда с конкретной правкой, а не «посмотри ещё раз»."]} tone="cool" />
      <Note
        x={40}
        y={1122}
        width={720}
        lines={["Всё обратимое машина делает сама. Внутри круга меня нет —", "я стою в начале, где замысел, и в конце, где откатить уже нельзя."]}
      />
    </svg>
  );
}

function BeforeAfterDiagram() {
  const tools: [string, string][] = [
    ["ChatGPT Work", "контекст, файлы, ТЗ"],
    ["Codex", "код и миграции"],
    ["Claude Code", "аудит и безопасность"],
  ];
  const columnX = [30, 290, 550];

  return (
    <svg viewBox="0 0 800 1020" width="100%" role="img" aria-hidden="true" focusable="false">
      <ArrowDefs />

      <text x={30} y={34} fontSize={26} fontWeight={700} fill={copper}>
        БЫЛО
      </text>
      <text x={150} y={33} fontSize={16} fill={muted}>
        я — шина между чатами
      </text>

      {tools.map(([title, sub], index) => (
        <Box key={`before-${title}`} x={columnX[index]} y={60} width={220} height={70} title={title} lines={[sub]} />
      ))}

      <Arrow d="M 380 210 L 150 140" />
      <Arrow d="M 400 208 L 400 140" />
      <Arrow d="M 420 210 L 650 140" />

      <circle cx={400} cy={250} r={44} fill={copper} />
      <text x={400} y={258} textAnchor="middle" fontSize={22} fontWeight={700} fill="#fffdf8">
        Я
      </text>

      <text x={400} y={330} textAnchor="middle" fontSize={16} fill={copper}>
        копирую отчёты из чата в чат руками
      </text>

      <Note
        x={30}
        y={356}
        width={740}
        lines={["К третьему кругу уже не помнишь, какую версию кто смотрел", "и чей комментарий устарел."]}
      />

      <line x1={30} y1={470} x2={770} y2={470} stroke={line} strokeWidth={1} />

      <text x={30} y={520} fontSize={26} fontWeight={700} fill={green}>
        СТАЛО
      </text>
      <text x={160} y={519} fontSize={16} fill={muted}>
        общий источник правды
      </text>

      {tools.map(([title, sub], index) => (
        <g key={`after-${title}`}>
          <Box x={columnX[index]} y={548} width={220} height={70} title={title} lines={[sub]} />
          <text x={columnX[index] + 110} y={638} textAnchor="middle" fontSize={13} fill={muted}>
            читает сам
          </text>
        </g>
      ))}

      <Arrow d="M 330 700 L 150 652" color={green} />
      <Arrow d="M 400 700 L 400 652" color={green} />
      <Arrow d="M 470 700 L 650 652" color={green} />

      <Box
        x={230}
        y={704}
        width={340}
        height={84}
        title="GitHub"
        lines={["задача · код · разбор", "машинные проверки"]}
        variant="green"
      />

      <Box
        x={170}
        y={818}
        width={460}
        height={66}
        title="Я — мержить · тратить · публиковать"
        lines={["только необратимое · один раз на готовый пакет"]}
        variant="outline"
      />

      <text x={400} y={922} textAnchor="middle" fontSize={16} fill={green}>
        Codex и Claude Code проверяют один и тот же коммит. Я не пересказываю.
      </text>

      <g>
        <rect x={30} y={946} width={740} height={44} rx={6} fill={neutralFill} />
        <text x={400} y={974} textAnchor="middle" fontSize={14} fill={muted}>
          Рабочее пространство — ChatGPT Project или Claude Cowork: роль одна, вендор неважен
        </text>
      </g>
    </svg>
  );
}

const diagrams: Record<LabDiagramId, () => React.JSX.Element> = {
  "two-agent-review-before-after": BeforeAfterDiagram,
  "two-agent-review-cycle": TaskCycleDiagram,
};

export function LabDiagram({ id, alt, caption }: { id: LabDiagramId; alt: string; caption: string }) {
  const Drawing = diagrams[id];
  return (
    <figure className="mt-8">
      <div className="overflow-x-auto rounded-lg border border-line bg-surface p-4 sm:p-6">
        <div className="min-w-[30rem]">
          <Drawing />
        </div>
      </div>
      {/* The drawing is aria-hidden: one description belongs to the figure, not to
          every label inside it. */}
      <figcaption className="mt-3 text-sm text-muted">
        <span className="sr-only">{alt} </span>
        {caption}
      </figcaption>
    </figure>
  );
}
