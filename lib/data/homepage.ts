import { commercialFacts } from "@/lib/commercial-facts";

export type ProofProject = {
  name: string;
  url: string;
  category: string;
  text: string;
  /** Which operating-system layers this project exercises — mirrors the Systems section. */
  layers: string[];
  /**
   * Staged art direction for the card: a scene from the project's world
   * (its venue, its objects), never a fake screenshot or fake data. The
   * link on the card is the proof; the frame only sets the mood.
   */
  image: string;
  imageAlt: string;
  /**
   * Honesty rule: only ship a metric when it is real.
   * value — the number or artifact ("−18 h/week of manual work", "3 AI flows in production").
   * basis — period + how it was measured ("Apr–Jun 2026 · from intake logs").
   * Leave null until Selena supplies verified data — the card renders fine without it.
   */
  metric: { value: string; basis: string } | null;
};

export type TrackerStep = {
  title: string;
  text: string;
  status: "done" | "active" | "next";
};

export const homepage = {
  nav: [
    { label: "AI Automation", href: "/ai-systems" },
    { label: "AI Visibility", href: "/visibility" },
    { label: "Pricing", href: "/pricing" },
    { label: "Lab", href: "/lab" },
    { label: "About", href: "/en/about" },
    { label: "Proof", href: "/#proof" },
  ],
  cta: { label: "Book AI Audit", href: "/en/contact" },
  visual: {
    stages: ["Look outward", "Make it useful", "Build inward"],
    layers: ["Research", "Evidence", "Action"],
    layerLabel: "shared layer",
    visibilityLabel: "Outward · AI Visibility",
    visibilityFlow: "Signals → evidence → action",
    visibilityNote: "How AI finds, understands and represents the business.",
    systemsLabel: "Inward · AI Automation",
    systemsFlow: "Workflows → rules → handover",
    systemsNote: "How the team turns manual work into a working system.",
    sharedLayer: "One Selena Systems layer · research supports both",
  },
  hero: {
    eyebrow: "For founders and small teams",
    headline: "When customers ask AI, is your business in the answer?",
    subheadline:
      "ChatGPT, Gemini and Perplexity already tell people where to go and who to buy from. We measure whether your business makes it into those answers — and show what to fix. The entry is free: a check of what AI can read on your website.",
    primaryCta: { label: "Check AI readiness — free", href: "/check" },
    secondaryCta: { label: "Compare free and paid plans", href: "/pricing" },
    primaryNote:
      "The free check is technical: we read the site the way AI agents read it and show what to fix. It is a separate step, not a visibility measurement — measurements start with the paid steps.",
    trustLine:
      "Outward: we measure how AI sees your business. Inward: we put the processes in order.",
    systemsDoor: {
      question: "Looking for order in your processes, not a check?",
      description:
        "That is our second direction — AI Automation: we turn a team's scattered work into clear AI-supported processes. For founders and teams.",
      cta: { label: "Discuss my case", href: "/en/contact" },
    },
    directions: {
      visibility: {
        eyebrow: "AI Visibility · measure outward",
        headline: "See what AI can find, understand and recommend about your business.",
        description:
          "Start with a free Public Readiness check. Then move to real AI measurements, evidence, fixes and monitoring when you need a deeper answer.",
        ladderLabel: "Then — four paid steps",
        ladderGroups: {
          auto: "Automatic measurements · run without you",
          expert: "With an expert · by hand and hands-on",
        },
        outcomesLabel: "What the measurement answers",
        proof: [
          "Public Readiness shows what machines can access and understand",
          "Paid measurements show mentions, citations, sources and competitors",
          "Evidence, fixes and monitoring keep each next step tied to what was observed",
        ],
      },
      systems: {
        eyebrow: "AI Automation · build inward",
        headline: "Turn scattered work into a practical AI operating system.",
        description:
          "We map the workflow, choose the right scenario and build the rules, automations and knowledge layer your team can actually use.",
        proof: [
          "AI Audit — map the opportunity",
          "AI Sprint — build one priority layer",
          "Business OS — connect the operating model",
        ],
      },
    },
    stats: [
      { value: "Free", label: "entry: a website check with instant results" },
      { value: "8 systems", label: "the largest paid measurement" },
      { value: "25 questions", label: "a weekly run on subscription" },
    ],
  },
  productPaths: {
    heading: "Two products. Choose the outcome you need.",
    intro:
      "AI Visibility looks outward at how AI finds and represents your business. AI Automation looks inward at the workflows your team needs to improve or automate.",
    visibility: {
      name: "AI Visibility",
      promise: "Measure and improve how AI sees your business.",
      description:
        "Start with a free Public Readiness check. Paid plans add real AI measurements, evidence, expert review and implementation.",
      items: [
        {
          price: "Free",
          name: "Public Readiness",
          summary: "Check whether machines can access, understand and reuse up to five public pages.",
          systems: ["Your website"],
          includes: [
            "Up to 5 public pages, result on the page",
            "Crawler access, schema and entity checks",
            "Prioritized fixes and one free recheck",
          ],
          cta: { label: "Run the free check", href: "/check" },
        },
        {
          price: commercialFacts.aiVisibility.snapshot.en.replace("/month", "/mo"),
          name: "AI Visibility Snapshot",
          summary: "Measure mentions, positions and citations in the assistants your customers ask.",
          systems: ["ChatGPT", "Gemini", "Perplexity"],
          includes: [
            "Up to 25 questions × 3 systems × a weekly run = 300 answers a month",
            "Mentions, positions, citations, competitors",
            "Dashboard and CSV every month",
          ],
          cta: { label: "Start with the check", href: "/check" },
        },
        {
          price: commercialFacts.aiVisibility.landscape.en.replace("/month", "/mo"),
          name: "AI Visibility Landscape",
          summary: "Compare all eight systems, competitors and the sources behind the answers.",
          systems: ["ChatGPT", "Gemini", "Perplexity", "Claude", "DeepSeek", "Qwen", "Mistral", "Grok"],
          includes: [
            "Up to 25 questions × 8 systems × a weekly run = 800 answers a month",
            "Consumer and API answers reported apart",
            "Evidence Ledger in PDF, XLSX and CSV",
          ],
          cta: { label: "Start with the check", href: "/check" },
        },
        {
          price: commercialFacts.aiVisibility.expertVerified.en.replace(" one-time", ""),
          name: "Expert Verified",
          summary: "A human analyst reviews every mention, citation and factual error.",
          systems: ["ChatGPT", "Gemini", "Perplexity", "Claude", "DeepSeek", "Qwen", "Mistral", "Grok"],
          includes: [
            "20 scenarios × 8 systems × 5 repeats = 800 answers",
            "Analyst QC of mentions and citations",
            "5–10 approved priorities and action plan",
          ],
          cta: { label: "Start with the check", href: "/check" },
        },
        {
          price: commercialFacts.aiVisibility.implementation90Days.en,
          name: "Implementation + 90 days",
          summary: "We fix the gaps, monitor the result and prove the before/after.",
          systems: ["ChatGPT", "Gemini", "Perplexity", "Claude", "DeepSeek", "Qwen", "Mistral", "Grok"],
          includes: [
            "Expert Verified baseline included",
            "A paid Expert Verified ($399) counts toward the program when you upgrade within 30 days",
            "Up to 10 implementation hours",
            "90-day monitoring and a locked-scope remeasure",
          ],
          cta: { label: "Start with the check", href: "/check" },
        },
      ],
      primaryCta: { label: "Check AI readiness — free", href: "/check" },
      secondaryCta: { label: "Explore AI Visibility", href: "/visibility" },
    },
    systems: {
      name: "AI Automation",
      promise: "Design and build practical systems inside your business.",
      description:
        "Use an audit, a focused sprint or a broader Business OS engagement to improve sales, content, knowledge, automation and operations.",
      items: [
        { price: commercialFacts.aiSystems.miniAudit.en, name: "60-minute mini-audit" },
        { price: commercialFacts.aiSystems.audit.en, name: "AI Audit" },
        { price: commercialFacts.aiSystems.sprint.en, name: "AI Sprint · 4 weeks" },
        { price: commercialFacts.aiSystems.businessOs.en.replace(",000", "k"), name: "AI Business OS · 8 weeks" },
      ],
      primaryCta: { label: "Explore AI Automation", href: "/ai-systems" },
      secondaryCta: { label: "Book an AI Audit", href: "/en/contact" },
    },
  },
  problems: {
    eyebrow: "The drag on growth",
    headline: "Revenue is moving, but the system behind it is still manual.",
    intro:
      "The issue is rarely one missing app. It is the daily leakage between leads, messages, documents, content, team memory and follow-up.",
    items: [
      {
        title: "Scattered leads",
        text: "Forms, DMs, WhatsApp, email. Five inboxes — no single next step.",
      },
      {
        title: "Manual customer communication",
        text: "The same answers, typed from scratch, every single day.",
      },
      {
        title: "Slow content production",
        text: "Every post, email and brief waits on one overloaded person.",
      },
      {
        title: "Overloaded team",
        text: "People move information between tools instead of moving the business.",
      },
      {
        title: "Knowledge spread across tools",
        text: "SOPs, offers and scripts live in chats, drives — and someone's head.",
      },
    ],
  },
  solution: {
    eyebrow: "What we build",
    headline: "A business operating layer, not another disconnected AI tool.",
    intro:
      "Each system is designed around the workflows that already create revenue, then AI is added where it reduces friction and keeps human approval in the right places.",
    systems: [
      {
        name: "AI Sales",
        text: "Lead intake, qualification, follow-up prompts, proposal drafts and CRM-ready summaries.",
      },
      {
        name: "AI Operations",
        text: "Internal workflows, admin handoffs, repeatable checklists and decision paths for daily execution.",
      },
      {
        name: "AI Knowledge Base",
        text: "A structured source of truth for policies, SOPs, offers, scripts, documents and team guidance.",
      },
      {
        name: "AI Content",
        text: "Content systems that turn expertise into posts, email, landing copy, briefs and campaign material.",
      },
      {
        name: "AI Automation",
        text: "No-code workflows across forms, CRM, spreadsheets, docs, messaging tools and internal notifications.",
      },
    ],
  },
  sprint: {
    eyebrow: "Main offer",
    headline: "4-Week AI Sprint",
    intro:
      "A focused four-week build for founders who want a working AI operating layer: mapped, designed, built, tested and handed over with clear rules.",
    deliverables: [
      "AI systems audit and workflow map",
      "Priority automation plan",
      "Sales, operations, content or knowledge-base system design",
      "Working no-code automations or AI-assisted workflows",
      "Prompt library and operating rules",
      "Handover documentation for the founder and team",
    ],
  },
  process: [
    {
      day: "Week 1",
      title: "Audit",
      text: "We map current workflows, tools, bottlenecks and the highest-leverage manual work.",
    },
    {
      day: "Week 1",
      title: "System Design",
      text: "We define the AI operating layer, approval rules, data flow and first build scope.",
    },
    {
      day: "Weeks 2-3",
      title: "Build",
      text: "We assemble automations, prompts, knowledge structures, intake flows and working handoffs.",
    },
    {
      day: "Week 4",
      title: "Test",
      text: "We test edge cases, tone, outputs, broken paths and human-review checkpoints.",
    },
    {
      day: "Week 4",
      title: "Handover",
      text: "You receive the workflow, documentation, operating rules and next-step recommendations.",
    },
  ],
  processIntro: {
    eyebrow: "How the sprint works",
    headline: "Four weeks from scattered workflow to working operating layer.",
  },
  tracker: {
    eyebrow: "During the sprint",
    headline: "You watch the build move. Stage by stage, not in a final report.",
    demoLabel: "Demo view — this is what a client sees mid-sprint",
    dayLabel: "Week 2 of 4",
    stageLabel: "Build in progress",
    note: "Every sprint runs with a shared tracker: what is done, what is being built right now and what comes next — visible to you the whole time.",
    steps: [
      {
        title: "Audit",
        text: "Workflow mapped, bottlenecks named.",
        status: "done",
      },
      {
        title: "System design",
        text: "Operating layer and approval rules agreed.",
        status: "done",
      },
      {
        title: "Build",
        text: "Automations, prompts and intake flows being assembled.",
        status: "active",
      },
      {
        title: "Test",
        text: "Edge cases, tone and broken paths.",
        status: "next",
      },
      {
        title: "Handover",
        text: "Documentation and operating rules.",
        status: "next",
      },
    ] as TrackerStep[],
  },
  packagesIntro: {
    eyebrow: "AI Automation services",
    headline: "Choose the right depth for the amount of manual work you want to remove.",
    intro:
      "Custom Selena Systems engagements, separate from AI Visibility subscriptions and scoped around your business workflow.",
    featuredLabel: "Main",
  },
  packages: [
    {
      name: "AI Audit",
      price: commercialFacts.aiSystems.audit.en,
      description: "A focused diagnostic for founders who need clarity before building.",
      included: [
        "We take apart your workflows on a call and in documents: where time and money leak",
        "AI opportunity map: which tasks AI can realistically take over — and which it can't",
        "Priorities: where to start, what to postpone, what not to do at all",
        "Credited in full toward a Sprint or Business OS started within 30 days",
      ],
      featured: false,
    },
    {
      name: "AI Sprint",
      price: commercialFacts.aiSystems.sprint.en,
      description:
        "In 4 weeks we take the one process that hurts most and hand over a working system.",
      included: [
        "Configured automations, prompts and rules — a working version, not a mockup",
        "Step-by-step instructions for your team: who does what, in plain language",
        "Training: we show your people how to run the system",
        "4 weeks: audit and design → build → test → handover",
      ],
      featured: true,
    },
    {
      name: "AI Business OS",
      price: commercialFacts.aiSystems.businessOs.en,
      description:
        "A turnkey implementation: in 8 weeks a connected system across sales, operations, knowledge and automation runs inside your company.",
      included: [
        "You say what has to work — we design it and implement it inside your company",
        "Several connected layers: sales, operations, knowledge, automation",
        "Written instructions for every role: what to do and how, in plain language",
        "We train your team — you are not left alone with documentation",
        "Handover: the system runs, the team is trained, the rules are written down",
      ],
      featured: false,
    },
  ],
  strategyCall: {
    title: "Mini-audit",
    format: "60-min Zoom + memo",
    price: commercialFacts.aiSystems.miniAudit.en,
    lead: "Not ready for the full audit?",
    steps: [
      "You send your questions and process details in advance",
      "The hour on Zoom is pure analysis — not information gathering",
      "After the call — a memo: what I saw and your first moves",
    ],
    note: "Credited in full toward the AI Audit within 30 days",
    ctaLabel: "Book a mini-audit",
  },
  proof: {
    eyebrow: "Proof of operating range",
    headline: "Systems thinking across hospitality, care, service and online operations.",
    founderLine: "Founded and led by Selena Nigmatullaeva — Founder & AI Systems Architect. Every system here is designed and built hands-on, not outsourced.",
    projects: [
      {
        name: "KORA Food Hall",
        url: "https://korafoodhall.com",
        image: "/media/cinematic/projects/kora.webp",
        imageAlt: "Evening inside a food hall: warm pendant lamps over the counters",
        category: "Hospitality operations",
        text: "Menu, vendor, customer communication and local operations workflows shaped into a clearer operating model.",
        layers: ["AI Sales", "AI Operations", "AI Content"],
        metric: {
          value: "3 AI flows in production",
          basis: "tenant outreach · content · daily ops digest — own venue, built hands-on",
        },
      },
      {
        name: "PetID.care",
        url: "https://petid.care",
        image: "/media/cinematic/projects/petid.webp",
        imageAlt: "A cat peeking over a desk with a notebook and a small pet tag",
        category: "Care and service infrastructure",
        text: "Customer, pet profile and support workflows organized around trust, data and repeatable assistance.",
        layers: ["AI Knowledge Base", "AI Operations"],
        // TODO(Selena): metric = { value: "…", basis: "period · how it was measured" }
        metric: null,
      },
      {
        name: "Doki.help",
        url: "https://doki.help",
        image: "/media/cinematic/projects/doki.webp",
        imageAlt: "An open blank document booklet with a brass clip, a fountain pen and a stamp",
        category: "Documents and support",
        text: "Document-heavy processes translated into clearer guidance, intake and customer-facing support paths.",
        layers: ["AI Knowledge Base", "AI Automation"],
        // TODO(Selena): metric = { value: "…", basis: "period · how it was measured" }
        metric: null,
      },
      {
        name: "remhaos.com",
        url: "https://remhaos.com",
        image: "/media/cinematic/projects/remhaos.webp",
        imageAlt: "Interior samples on a designer's desk: fabric, stone and brass",
        category: "Real estate and interiors",
        text: "An AI-assisted presales flow for interior designers: project intake, risk review, pricing context and proposal preparation.",
        layers: ["AI Sales", "AI Automation"],
        // TODO(Selena): metric = { value: "…", basis: "period · how it was measured" }
        metric: null,
      },
      {
        name: "otherbali.com",
        url: "https://otherbali.com",
        image: "/media/cinematic/projects/otherbali.webp",
        imageAlt: "Bali rice terraces at dawn with a volcano rising from the mist",
        category: "Travel media and guides",
        text: "A Bali guide and media platform: places, guides and recommendations organized so visitors and residents find the right answer quickly.",
        layers: ["AI Content", "AI Knowledge Base"],
        // TODO(Selena): metric = { value: "…", basis: "period · how it was measured" }
        metric: null,
      },
      {
        name: "VillaOps",
        url: "https://villaops.selenasystems.com",
        image: "/media/cinematic/projects/villaops.webp",
        imageAlt: "A private Bali villa at dusk, its pool reflecting the lit rooms",
        category: "Villa & hospitality operations",
        text: "An operating system for villa management and guest services — day-to-day operations organized into one clear workflow.",
        layers: ["AI Operations", "AI Automation"],
        // TODO(Selena): metric = { value: "…", basis: "period · how it was measured" }
        metric: null,
      },
    ] as ProofProject[],
  },
  // Cinematic media layer: every asset explains a real part of the product.
  // Images and clips are generated art direction (no fake dashboards, no
  // fake data, nothing readable in frame) — the copy stays the proof.
  cinema: {
    hero: {
      video: "/media/cinematic/hero-loop.mp4",
      poster: "/media/cinematic/hero-poster.webp",
      alt: "A warm beam of light finds one lit storefront in a dark miniature city",
    },
    measurement: {
      eyebrow: "How a measurement works",
      headline: "From a customer's question to a report you can act on.",
      intro:
        "Four steps behind every paid measurement: real questions, live systems, saved answers, a prioritized report.",
      honestyNote:
        "Every number in the report comes with its measurement window — and a note on what it does not prove.",
      controls: { prev: "Previous step", next: "Next step", goTo: "Go to step" },
      slides: [
        {
          title: "A customer asks AI",
          text: "People already ask ChatGPT, Gemini and Perplexity where to go and who to buy from. Your business is either in that answer or it is not.",
          image: "/media/cinematic/slide-ask.webp",
          alt: "A person asks their phone a question at night, the screen glowing warmly",
        },
        {
          title: "We ask the same systems",
          text: "Up to 25 of your customers' real questions go to each system in your plan — the same wording every time, with no manual tuning.",
          image: "/media/cinematic/slide-surfaces.webp",
          video: "/media/cinematic/prisms-loop.mp4",
          alt: "One beam of light passing through three glass prisms, each refracting it differently",
        },
        {
          title: "Answers become evidence",
          text: "Every answer is saved: mentions, positions, citations and competitors, recorded next to the measurement window. Nothing is averaged or guessed.",
          image: "/media/cinematic/slide-evidence.webp",
          alt: "A stack of printed pages under a magnifying loupe in warm lamp light",
        },
        {
          title: "A report with priorities",
          text: "You see what AI finds, what it misses and what to fix first. Fixes and monitoring follow the same evidence.",
          image: "/media/cinematic/slide-report.webp",
          alt: "Hands holding an open printed report at a warm desk",
        },
      ],
    },
    visibilityBand: {
      image: "/media/cinematic/visibility-lens.webp",
      alt: "A lens standing in darkness, its glass filled with one warm circle of light",
      caption:
        "The measurement looks at your business the way AI systems do — from the outside, through what is public.",
    },
    automationBand: {
      video: "/media/cinematic/automation-loop.mp4",
      poster: "/media/cinematic/automation-poster.webp",
      alt: "Tangled dark threads passing through a brass comb and emerging as parallel copper threads",
      caption: "Inward: scattered manual work becomes one working system.",
    },
    problemsBand: {
      image: "/media/cinematic/problems-desk.webp",
      alt: "A desk buried in handwritten notes and loose pages, an old telephone lost among them",
      caption: "This is what it usually looks like from the inside: everything works — on someone's attention.",
    },
    processBand: {
      video: "/media/cinematic/process-loop.mp4",
      poster: "/media/cinematic/process-poster.webp",
      alt: "Hands assembling a small precise brass mechanism at a dark workbench",
      caption: "The sprint is assembly work: one process, built piece by piece until the team can run it.",
    },
    packagesBand: {
      image: "/media/cinematic/packages-cases.webp",
      alt: "Three brass-cornered cases of increasing size in a row on dark stone",
      caption: "Three depths of the same work: audit, one built process, or a connected operating system.",
    },
    ctaBand: {
      image: "/media/cinematic/cta-dawn.webp",
      alt: "A calm ordered desk by a large window at dawn, warm light entering a cool room",
    },
  },
  // Inside the workspace: the product's own screens on sample data,
  // labelled as such on the frame — never a live measurement.
  workspace: {
    eyebrow: "Inside the workspace",
    headline: "One workspace: measurement, evidence, actions.",
    intro:
      "Every report is dated and every number has a source. Below are real screens of the client workspace on sample data, in the order a client sees them.",
    demoLabel: "Sample data · not a measurement",
    frameCaption:
      "The client workspace at app.selenasystems.com. Brands and numbers on these screens are illustrative sample data, not results.",
    tabsLabel: "Workspace screens",
    tabs: [
      {
        id: "overview",
        label: "Overview",
        image: "/media/cinematic/workspace/overview.webp",
        alt: "Workspace overview screen on sample data: visibility and share-of-voice panels with trend charts",
      },
      {
        id: "share",
        label: "Share of voice",
        image: "/media/cinematic/workspace/share.webp",
        alt: "Share-of-voice screen on sample data: a percentage, a trend chart and a leaderboard of brands",
      },
      {
        id: "opportunities",
        label: "Opportunities",
        image: "/media/cinematic/workspace/opportunities.webp",
        alt: "Opportunities screen on sample data: a summary and a list of content to create",
      },
    ],
    cards: [
      {
        kicker: "Measurement",
        title: "What ChatGPT, Gemini and Perplexity answer about you",
        text: "Share of voice, sources, citations. The same list of questions, the same systems, the same date — otherwise there is nothing to compare.",
        image: "/media/cinematic/workspace/share.webp",
        alt: "Fragment of the share-of-voice screen on sample data",
        tone: "copper" as const,
      },
      {
        kicker: "Implementation",
        title: "Processes inside the business that stop being manual",
        text: "Process first, tool second. Requests, client replies, content, knowledge base — with a written handover to the team.",
        image: "/media/cinematic/pages/gears.webp",
        alt: "Brass gears meshing on a dark bench under warm copper light",
        tone: "sage" as const,
      },
    ],
    statement: {
      kicker: "About",
      paragraphs: [
        "Selena Systems is a founder-led practice with two directions. AI Visibility measures what AI systems show about a business. AI Automation builds the processes inside it.",
        "We sell measurement, so we go through it first ourselves: we fix a baseline and publish the result — including the one where there is no result yet.",
        "Every measurement is dated. Nothing is rewritten after the fact: if a conclusion turns out wrong, a new entry appears and the old one stays.",
      ],
    },
    ctaNote: "No phone, registration or card",
  },
  productSwitch: {
    kicker: "Above — product 01 · AI Visibility",
    headline: "Next — product 02: AI Automation",
    text: "AI Visibility measures how AI sees your business from the outside. AI Automation brings order inside: processes, rules and automations your team can actually run.",
  },
  finalCta: {
    eyebrow: "Next step",
    headline: "Start with the manual work that is already costing you time.",
    text:
      "Book an AI Audit. We will map the current workflow, identify the highest-leverage system to build first and show what can realistically be automated.",
  },
  footerNote:
    "Selena Systems builds AI-powered operating systems for growing businesses. Process first, tools second.",
};

export type HomepageContent = typeof homepage;
