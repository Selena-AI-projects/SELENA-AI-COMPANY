import type { VisibilityLocale } from "@/lib/visibility/types";

/**
 * Cinematic media for the inner pages — the same language as the homepage
 * `cinema` block: staged scenes in the site palette, never a screenshot,
 * never fake data, nothing readable in frame. Asset paths are shared by
 * both locales; only alt texts and captions differ. Every loop ships as a
 * .mp4/.webm pair under one basename (see CinemaLoop).
 */
type Frame = { image: string; alt: string; caption?: string };
type Loop = { video: string; poster: string; alt: string; caption?: string };

/** Journal project slugs — kept in step with lib/visibility-log/data.ts. */
export type ProjectFrameSlug =
  | "korafoodhall"
  | "otherbali"
  | "petid"
  | "selenasystems"
  | "doki"
  | "remhaos"
  | "villaops"
  | "bigdragonvillas";

type PageCinema = {
  pricingDirectory: { visibility: Frame; systems: Frame };
  projects: {
    hero: Loop;
    frames: Record<ProjectFrameSlug, Frame>;
  };
  lab: {
    hero: Loop;
    sections: Partial<Record<"research" | "guides" | "experiments" | "articles" | "courses", Frame>>;
    articles: Record<string, Frame>;
  };
  visibility: {
    hero: Loop;
    layers: Frame;
    boundary: Frame;
    readiness: Frame;
    local: Frame;
    path: Frame;
  };
  automation: {
    hero: Loop;
    offers: { miniAudit: Frame; audit: Frame; sprint: Frame; businessOs: Frame };
    flow: Frame;
  };
  pricing: {
    hero: Loop;
  };
  check: {
    hero: Loop;
    boundary: Frame;
  };
};

const paths = {
  visibilityHero: { video: "/media/cinematic/pages/visibility-loop.mp4", poster: "/media/cinematic/pages/visibility-window.webp" },
  layers: "/media/cinematic/pages/layers.webp",
  boundary: "/media/cinematic/pages/boundary.webp",
  readiness: "/media/cinematic/pages/readiness.webp",
  local: "/media/cinematic/pages/local.webp",
  path: "/media/cinematic/pages/path.webp",
  automationHero: { video: "/media/cinematic/pages/gears-loop.mp4", poster: "/media/cinematic/pages/gears.webp" },
  offerMiniAudit: "/media/cinematic/pages/offer-mini-audit.webp",
  offerAudit: "/media/cinematic/pages/offer-audit.webp",
  offerSprint: "/media/cinematic/pages/offer-sprint.webp",
  offerOs: "/media/cinematic/pages/offer-os.webp",
  pricingHero: { video: "/media/cinematic/pages/doors-loop.mp4", poster: "/media/cinematic/pages/doors.webp" },
  checkHero: { video: "/media/cinematic/pages/loupe-loop.mp4", poster: "/media/cinematic/pages/loupe.webp" },
  lens: "/media/cinematic/visibility-lens.webp",
  gears: "/media/cinematic/pages/gears.webp",
  journalHero: { video: "/media/cinematic/pages/journal-loop.mp4", poster: "/media/cinematic/pages/journal.webp" },
  labHero: { video: "/media/cinematic/pages/lab-loop.mp4", poster: "/media/cinematic/pages/lab-bench.webp" },
  labGuides: "/media/cinematic/pages/lab-guides.webp",
  labExperiments: "/media/cinematic/pages/lab-experiments.webp",
  labArticles: "/media/cinematic/pages/lab-articles.webp",
  labBlueprint: "/media/cinematic/pages/lab-blueprint.webp",
  loupe: "/media/cinematic/pages/loupe.webp",
  projects: {
    korafoodhall: "/media/cinematic/projects/kora.webp",
    otherbali: "/media/cinematic/projects/otherbali.webp",
    petid: "/media/cinematic/projects/petid.webp",
    selenasystems: "/media/cinematic/hero-poster.webp",
    doki: "/media/cinematic/projects/doki.webp",
    remhaos: "/media/cinematic/projects/remhaos.webp",
    villaops: "/media/cinematic/projects/villaops.webp",
    bigdragonvillas: "/media/cinematic/projects/bigdragonvillas.webp",
  },
};

const en: PageCinema = {
  pricingDirectory: {
    visibility: { image: paths.lens, alt: "A lens standing in darkness, its glass filled with one warm circle of light" },
    systems: { image: paths.gears, alt: "A row of polished brass gears meshing on a dark workbench in warm light" },
  },
  projects: {
    hero: {
      ...paths.journalHero,
      alt: "An open leather logbook with blank ruled pages and a brass fountain pen under a warm desk lamp",
    },
    frames: {
      korafoodhall: { image: paths.projects.korafoodhall, alt: "An evening food hall with warm pendant lamps over the counters" },
      otherbali: { image: paths.projects.otherbali, alt: "Rice terraces at dawn with a volcano in the mist" },
      petid: { image: paths.projects.petid, alt: "A cat peeking from behind a desk with a notebook and a pet tag" },
      selenasystems: { image: paths.projects.selenasystems, alt: "A warm beam of light finds one lit storefront in a dark miniature city" },
      doki: { image: paths.projects.doki, alt: "A blank document under a brass clip with a pen and a stamp" },
      remhaos: { image: paths.projects.remhaos, alt: "Fabric and stone samples with a brass ruler and a rolled plan" },
      villaops: { image: paths.projects.villaops, alt: "A villa with a pool at dusk" },
      bigdragonvillas: { image: paths.projects.bigdragonvillas, alt: "A Balinese pavilion among palms at dusk, its warm light reflected in a still pond under a crescent moon" },
    },
  },
  lab: {
    hero: {
      ...paths.labHero,
      alt: "A brass projector lens on an optical bench casting one dusty blue beam onto a tilted square plate",
    },
    sections: {
      guides: { image: paths.labGuides, alt: "A folded sheet with one hand-drawn outline and a brass compass beside a copper lamp" },
      experiments: { image: paths.labExperiments, alt: "Two brass balance scales side by side, each weighing one glass sphere" },
      articles: { image: paths.labArticles, alt: "Two stacks of blank cards on a blue desk, a brass ring on one and a fountain pen on the other" },
    },
    articles: {
      "what-is-ai-visibility": { image: paths.lens, alt: "A lens standing in darkness, its glass filled with one warm circle of light" },
      "prepare-site-for-ai-systems": { image: paths.labBlueprint, alt: "A large unrolled drafting sheet with faint grid lines, held flat by a brass plate and a small brass weight" },
      "read-ai-visibility-report-evidence": { image: paths.loupe, alt: "A brass loupe standing in a beam of light in a dark room" },
      "two-agent-code-review": { image: paths.labExperiments, alt: "Two brass balance scales side by side, each weighing one glass sphere" },
    },
  },
  visibility: {
    hero: {
      ...paths.visibilityHero,
      alt: "A warmly lit shop window seen from across a rainy night street through wet glass",
    },
    layers: {
      image: paths.layers,
      alt: "Four glass panes standing in a row, a copper sphere behind each one",
      caption: "Each layer answers one question. The report keeps them apart on purpose.",
    },
    boundary: {
      image: paths.boundary,
      alt: "A brass ruler between a small brass cube and a glass cube, a hard edge of light splitting the frame",
      caption: "What was measured sits in the light. What was not stays outside the claim.",
    },
    readiness: {
      image: paths.readiness,
      alt: "An open notebook with a hand-drawn column of empty boxes and a fountain pen",
      caption: "Action readiness is a checklist, not a score: what a customer can actually do next.",
    },
    local: {
      image: paths.local,
      alt: "A small corner shop at dusk, its window glowing under an awning, a bicycle leaning outside on wet cobblestones",
      caption: "For local businesses the question is simpler: does AI name you when someone nearby asks?",
    },
    path: {
      image: paths.path,
      alt: "Stepping stones across dark water, each lit by a small brass lantern",
      caption: "One step at a time: free check, measurement, evidence, fixes, monitoring.",
    },
  },
  automation: {
    hero: {
      ...paths.automationHero,
      alt: "A row of polished brass gears meshing on a dark workbench in warm light",
    },
    offers: {
      miniAudit: { image: paths.offerMiniAudit, alt: "A brass loupe resting on a closed dark notebook" },
      audit: { image: paths.offerAudit, alt: "A brass drafting compass on a sheet with a defocused hand-drawn map" },
      sprint: { image: paths.offerSprint, alt: "A brass hourglass with copper sand mid-flow on dark stone" },
      businessOs: { image: paths.offerOs, alt: "Four brass blocks with interlocking joints fitted into one structure" },
    },
    flow: {
      image: paths.automationHero.poster,
      alt: "Brass gears meshing in warm light",
      caption: "One flow, several hands: the automation moves the data, a person signs off the answer.",
    },
  },
  pricing: {
    hero: {
      ...paths.pricingHero,
      alt: "Two tall doorways side by side in a dark corridor, each glowing with warm light",
    },
  },
  check: {
    hero: {
      ...paths.checkHero,
      alt: "A brass loupe gliding over a defocused printed page under a warm desk lamp",
    },
    boundary: {
      image: paths.boundary,
      alt: "A brass ruler between a small brass cube and a glass cube, a hard edge of light splitting the frame",
      caption: "The free check reads your site the way machines do. It does not measure AI answers.",
    },
  },
};

const ru: PageCinema = {
  pricingDirectory: {
    visibility: { image: paths.lens, alt: "Линза в темноте, в стекле которой стоит один тёплый круг света" },
    systems: { image: paths.gears, alt: "Ряд полированных латунных шестерёнок сцеплен на тёмном верстаке в тёплом свете" },
  },
  projects: {
    hero: {
      ...paths.journalHero,
      alt: "Раскрытый кожаный журнал с пустыми линованными страницами и латунная перьевая ручка под тёплой лампой",
    },
    frames: {
      korafoodhall: { image: paths.projects.korafoodhall, alt: "Вечерний фуд-холл с тёплыми подвесными лампами над прилавками" },
      otherbali: { image: paths.projects.otherbali, alt: "Рисовые террасы на рассвете, вулкан в тумане" },
      petid: { image: paths.projects.petid, alt: "Кот выглядывает из-за стола с блокнотом и жетоном" },
      selenasystems: { image: paths.projects.selenasystems, alt: "Тёплый луч света находит одну освещённую витрину в тёмном миниатюрном городе" },
      doki: { image: paths.projects.doki, alt: "Чистый документ под латунным зажимом, рядом ручка и печать" },
      remhaos: { image: paths.projects.remhaos, alt: "Образцы ткани и камня, латунная линейка и рулон плана" },
      villaops: { image: paths.projects.villaops, alt: "Вилла с бассейном в сумерках" },
      bigdragonvillas: { image: paths.projects.bigdragonvillas, alt: "Балийский павильон среди пальм в сумерках, тёплый свет отражается в неподвижном пруду под молодой луной" },
    },
  },
  lab: {
    hero: {
      ...paths.labHero,
      alt: "Латунный объектив на оптической скамье бросает один пыльный синий луч на наклонённую квадратную пластину",
    },
    sections: {
      guides: { image: paths.labGuides, alt: "Сложенный лист с одним нарисованным от руки контуром и латунный компас рядом с медной лампой" },
      experiments: { image: paths.labExperiments, alt: "Двое латунных весов рядом, на каждых — по одному стеклянному шару" },
      articles: { image: paths.labArticles, alt: "Две стопки чистых карточек на синем столе: на одной латунное кольцо, на другой перьевая ручка" },
    },
    articles: {
      "what-is-ai-visibility": { image: paths.lens, alt: "Линза в темноте, в стекле которой стоит один тёплый круг света" },
      "prepare-site-for-ai-systems": { image: paths.labBlueprint, alt: "Большой развёрнутый чертёжный лист с едва заметной сеткой, прижатый латунной пластиной и маленьким латунным грузиком" },
      "read-ai-visibility-report-evidence": { image: paths.loupe, alt: "Латунная лупа стоит в луче света в тёмной комнате" },
      "two-agent-code-review": { image: paths.labExperiments, alt: "Двое латунных весов рядом, на каждых — по одному стеклянному шару" },
    },
  },
  visibility: {
    hero: {
      ...paths.visibilityHero,
      alt: "Тёплая витрина через мокрое стекло: ночная улица под дождём",
    },
    layers: {
      image: paths.layers,
      alt: "Четыре стеклянные пластины в ряд, за каждой — медный шар",
      caption: "Каждый слой отвечает на свой вопрос. В отчёте они намеренно не смешиваются.",
    },
    boundary: {
      image: paths.boundary,
      alt: "Латунная линейка между латунным и стеклянным кубиками, резкая граница света делит кадр",
      caption: "Что измерено — в свете. Что не измерено — остаётся за границей утверждения.",
    },
    readiness: {
      image: paths.readiness,
      alt: "Раскрытый блокнот с нарисованным столбиком пустых квадратов и перьевой ручкой",
      caption: "Готовность к действию — чек-лист, а не оценка: что клиент реально может сделать дальше.",
    },
    local: {
      image: paths.local,
      alt: "Маленькая угловая лавка в сумерках: светится витрина под навесом, у стены велосипед, мокрая брусчатка",
      caption: "Для локального бизнеса вопрос проще: называет ли AI вас, когда спрашивают рядом?",
    },
    path: {
      image: paths.path,
      alt: "Камни через тёмную воду, каждый освещён маленьким латунным фонарём",
      caption: "Шаг за шагом: бесплатная проверка, замер, evidence, исправления, мониторинг.",
    },
  },
  automation: {
    hero: {
      ...paths.automationHero,
      alt: "Ряд полированных латунных шестерёнок сцеплен на тёмном верстаке в тёплом свете",
    },
    offers: {
      miniAudit: { image: paths.offerMiniAudit, alt: "Латунная лупа на закрытом тёмном блокноте" },
      audit: { image: paths.offerAudit, alt: "Латунный циркуль на листе с размытой нарисованной картой" },
      sprint: { image: paths.offerSprint, alt: "Латунные песочные часы с медным песком на тёмном камне" },
      businessOs: { image: paths.offerOs, alt: "Четыре латунных блока с замками собраны в одну конструкцию" },
    },
    flow: {
      image: paths.automationHero.poster,
      alt: "Латунные шестерёнки сцеплены в тёплом свете",
      caption: "Одна связка, несколько рук: автоматизация переносит данные, человек утверждает ответ.",
    },
  },
  pricing: {
    hero: {
      ...paths.pricingHero,
      alt: "Две высокие двери рядом в тёмном коридоре, из каждой льётся тёплый свет",
    },
  },
  check: {
    hero: {
      ...paths.checkHero,
      alt: "Латунная лупа скользит по размытой напечатанной странице под тёплой лампой",
    },
    boundary: {
      image: paths.boundary,
      alt: "Латунная линейка между латунным и стеклянным кубиками, резкая граница света делит кадр",
      caption: "Бесплатная проверка читает сайт так, как читают машины. Ответы AI она не измеряет.",
    },
  },
};

export function pageCinema(locale: VisibilityLocale): PageCinema {
  return locale === "ru" ? ru : en;
}
