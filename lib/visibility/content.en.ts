import type { VisibilityContent } from "./types";
import { commercialFacts } from "@/lib/commercial-facts";
import { selenaAppRoutes, visibilityRoutes } from "./routes";

/**
 * English Visibility copy (SSOT §18, §29.5). Guardrails: no guaranteed
 * rankings, no "AI thinks about you" framing, no revenue-loss claims,
 * no overclaiming llms.txt or schema. Every measured thing states its
 * sample size and what it does not prove.
 */
export const visibilityContentEn: VisibilityContent = {
  locale: "en",
  nav: { label: "Visibility" },
  homeTeaser: {
    eyebrow: "New: AI Visibility",
    headline:
      "See how search and AI systems can find, understand and represent your business — and whether a customer or agent can complete the next action.",
    intro:
      "A free, evidence-based Public Readiness check of your public pages, crawler access, site structure, entity clarity and whether your primary action can be understood. No paid AI-answer providers are called.",
    formNote: "Free. Takes a few minutes. No credit card, no login.",
    primaryCta: { label: "Run Free Visibility Check", href: visibilityRoutes.en.check },
    secondaryCta: { label: "See AI Visibility plans", href: visibilityRoutes.en.pricing },
  },
  hero: {
    eyebrow: "AI Visibility by Selena Systems",
    title: "AI visibility you can verify.",
    intro:
      "Start with a live public website check. Paid plans add a dated, disclosed measurement across up to eight AI systems, an Evidence Ledger and a grounded action plan — with Visitor View and API View always reported separately.",
  },
  metrics: [
    {
      name: "Public Readiness",
      definition:
        "A deterministic 0-100 score built from access/indexability signals, machine-readable identity, offer and page clarity, and conversion path — every dimension shows what was actually measured.",
    },
    {
      name: "Entity Clarity",
      definition:
        "How consistently your brand, offer, audience, geography and proof are described across your homepage, metadata and structured data.",
    },
    {
      name: "Paid AI measurement",
      definition:
        "What an approved paid measurement cycle observed in its locked prompt set and named systems — reported with the exact denominator, date and channel, never as a universal visibility score.",
    },
    {
      name: "Paid citation evidence",
      definition:
        "Which owned pages were cited in the same approved paid measurement cycle, with the source URL, system and run context preserved.",
    },
    {
      name: "Conversion Path",
      definition:
        "Whether a visitor (human or machine-readable signal) can find a clear next step: contact, booking or a direct answer to a commercial question.",
    },
  ],
  measurementBoundary: {
    heading: "Evidence first.",
    whatWeMeasure: [
      "Publicly available pages",
      "Technical accessibility and indexability signals",
      "Structured identity and service clarity",
      "A locked, dated paid AI measurement cycle, when an approved order exists",
      "Public links and citations returned by named providers during that paid cycle",
    ],
    whatWeDontMeasure: [
      "Every possible prompt",
      "Every user location or personal context",
      "Private analytics",
      "CRM conversions",
      "Revenue impact",
      "Guaranteed future recommendations",
      "Causality between one website change and one AI answer",
    ],
  },
  freeMeasurementBoundary: {
    heading: "What the free Public Readiness check covers",
    whatWeMeasure: [
      "Up to five publicly available pages",
      "Crawler access, robots.txt, sitemap, canonical and indexability signals",
      "Schema, entity clarity, page structure and content readiness",
      "Website citability heuristics and business-information consistency",
      "Human and machine-readable paths to the primary action",
      "llms.txt as a zero-weight diagnostic only",
    ],
    whatWeDontMeasure: [
      "Whether ChatGPT, Gemini, Perplexity or an API model mentions or recommends the brand",
      "AI-answer citations, competitors or source intelligence",
      "Private analytics, connected accounts or CRM conversions",
      "Future rankings, recommendations or revenue impact",
    ],
  },
  measurementLayers: {
    eyebrow: "What is measured",
    headline: "Four separate layers, reported separately.",
    intro:
      "Each layer answers a different question and is reported on its own evidence. They are never collapsed into one universal score — a business can be perfectly discoverable and still be impossible to act on.",
    layers: [
      {
        id: "discoverability",
        title: "Discoverability",
        question: "Can public search and AI systems access and find the business?",
        description:
          "Reachability, crawler access, sitemap, canonical and indexability signals — read from public pages only.",
      },
      {
        id: "understanding",
        title: "Understanding",
        question: "Can they understand who the business is, what it offers, for whom and where?",
        description:
          "Brand consistency, service clarity, market and location clarity, structured-data evidence and direct-answer coverage.",
      },
      {
        id: "recommendation_evidence",
        title: "Recommendation Evidence",
        question: "Is the brand mentioned or cited in an approved, disclosed paid measurement cycle?",
        description:
          "Reported as ratios — mentioned in X of Y valid answers, cited in X of Y — with the prompt set, environments, channel and date disclosed.",
      },
      {
        id: "action_readiness",
        title: "Action Readiness",
        question: "Can a customer, or an agent acting for them, complete the next action?",
        description:
          "Measured as three independent states: human-ready, machine-readable and agent-executable.",
      },
    ],
  },
  actionReadiness: {
    eyebrow: "Action Readiness",
    headline: "Three independent states, not one checkbox.",
    intro:
      "Most sites are built for a human with a mouse. Increasingly, the visitor is an assistant acting on someone's behalf. These are different capabilities and we measure them separately.",
    states: [
      {
        id: "human_ready",
        label: "Human-ready",
        definition: "A person can find and complete the intended action unaided.",
        example: "A visible, reachable booking button that works on mobile.",
        doesNotProve: "Does not prove a machine can parse the action, or that an agent could execute it.",
      },
      {
        id: "machine_readable",
        label: "Machine-readable",
        definition: "The action and its parameters are exposed in structured, parseable form.",
        example: "Structured action markup that names the required inputs.",
        doesNotProve: "Markup being present does not prove the action can actually be completed programmatically.",
      },
      {
        id: "agent_executable",
        label: "Agent-executable",
        definition:
          "An autonomous agent can complete the action end to end and receive a confirmation it can verify.",
        example: "A documented endpoint plus a machine-verifiable confirmation.",
        doesNotProve: "This is the strictest state and is the one most often assumed without evidence.",
      },
    ],
    caveat:
      "A visible button, a WhatsApp link or a block of JSON-LD is not, by itself, proof of agent execution. We report what each state actually demonstrates and nothing beyond it.",
  },
  localBusinessMode: {
    eyebrow: "Local Business Mode",
    headline: "A profile of the same engine, not a separate scanner.",
    intro:
      "When the business model is local or hospitality, the same four layers are applied with location-aware expectations. It is a configuration, not a different product.",
    mayInclude: [
      "Website evidence, as in every other mode",
      "Location and service-area clarity",
      "Opening hours as published on the site",
      "Contact, booking and ordering paths",
      "Later, and only with verified provider capability: Google Business Profile and Maps facts",
    ],
    boundary:
      "No Google Business Profile or Maps integration exists in this version. Nothing in a report is sourced from those services today, and none is implied.",
  },
  notClaimed: {
    heading: "What this product does not claim",
    items: [
      "It does not claim to know what any AI system \"thinks\" about a business.",
      "It does not guarantee rankings, citations or recommendations.",
      "It does not estimate lost revenue — that needs your analytics, conversion data and an explicit model.",
      "It does not treat llms.txt as a ranking factor; its weight is zero.",
      "It does not present a generic model API response as a consumer ChatGPT or Search result.",
      "It does not claim complete AI visibility — every sample is limited, dated and disclosed.",
    ],
  },
  productPath: {
    eyebrow: "From check to change",
    headline: "One traceable path from public evidence to a concrete action plan.",
    intro:
      "Selena Systems does not sell a mystery score. Every paid cycle locks the questions, systems, repeats and budget before any provider call begins.",
    steps: [
      {
        title: "Run the free website check",
        description: "Get a live read of public accessibility, entity clarity and action readiness without connecting a private account.",
      },
      {
        title: "Lock the measurement scope",
        description: "Confirm the brand, market, languages, scenarios, competitors, systems, repeats and maximum provider spend.",
      },
      {
        title: "Measure Visitor View and API View",
        description: "ChatGPT, Gemini and Perplexity stay separate from Claude, DeepSeek, Qwen, Mistral and Grok so unlike channels are never blended.",
      },
      {
        title: "Work from evidence",
        description: "The client workspace keeps the Evidence Ledger, findings, recommendations and verification plan together for the next cycle.",
      },
    ],
  },
  methodology: {
    eyebrow: "Methodology",
    title: "What we measured, when, and what it does not prove.",
    intro:
      "Every result in an AI Visibility report carries its evidence: what was checked, when it was checked, the sample size behind it, and the limits of what it can honestly claim.",
    evidenceKinds: [
      { name: "Observed", description: "Directly fetched from a public page: HTML, headers, structured data." },
      { name: "Provider", description: "Returned by a named AI-tracking or performance provider, with the provider and date recorded." },
      { name: "User-supplied", description: "Entered by you: brand name, target market, category, optional competitor." },
      { name: "Derived", description: "Calculated from other evidence, always referencing the source evidence IDs." },
      { name: "Generated explanation", description: "A plain-language summary of evidence — never the sole basis for a finding." },
      { name: "Unavailable", description: "Not measured. Shown as \"not measured,\" never treated as zero or as a failing score." },
    ],
    versioning:
      "Every report records a methodology version, check version, prompt-set version and scoring version. If the methodology changes, older reports are not silently recalculated with new rules.",
    privacyBoundary:
      "The check only reads publicly available pages. It does not log in, does not read private dashboards, and does not collect data from forms on the site being checked.",
    supported: [
      "Live public page crawl (up to 5 pages)",
      "Indexability and structured-data checks",
      "PageSpeed performance evidence (when available)",
      "A locked eight-system measurement contract in the authenticated client workspace",
      "Evidence Ledger and grounded Recommendation Engine outputs",
    ],
    notYetSupported: [
      "Public self-service checkout and production provider execution",
      "Connected Google Search Console, Google Business Profile or Instagram analytics",
      "Google Places (excluded from the MVP)",
      "Automatic recurring cycles before production activation",
    ],
  },
  checkForm: {
    title: "Check whether machines can access and understand your site",
    intro:
      "Enter a public website address. The complete evidence-based result and fixes appear here without a phone number, login, card or paid AI-provider call.",
    formTitle: "Run your free readiness check",
    formIntro:
      "The URL is the only required field. Profile and customer action are optional context that make applicability and fixes more precise.",
    fields: {
      website: "Your website address",
      websiteHint: "We fetch public pages only — up to five key URLs plus public discovery files and headers.",
      siteProfile: "Site profile (optional)",
      siteProfileHint: "Used only to mark irrelevant protocol and commerce checks Not applicable.",
      primaryAction: "Primary customer action (optional)",
      primaryActionHint: "Choose one if you want Action Readiness evaluated against a specific task.",
    },
    profileOptions: {
      all_checks: "All checks",
      content_site: "Content site",
      api_application: "API / application",
      commerce: "Commerce",
    },
    primaryActionOptions: {
      call: "Call",
      whatsapp: "Message on WhatsApp",
      book: "Book",
      order: "Order",
      request_quote: "Request a quote",
      schedule_demo: "Schedule a demo",
      apply: "Apply",
      visit: "Visit in person",
      other: "Other",
    },
    whatYouGet: {
      heading: "What you get, on this page, in under a minute",
      items: [
        "What your site already does well for machine readers",
        "What blocks them, ordered by how much it costs you",
        "The one thing to fix first, and exactly how to fix it",
        "What the free check cannot see — stated, not hidden",
      ],
    },
    submitLabel: "Check my site",
    submittingLabel: "Checking your site...",
    errors: {
      website: "Enter your website address.",
    },
    networkError: "The check could not be started. Try again in a minute.",
  },
  liveReport: {
    running: {
      heading: "Reading your site the way a machine does",
      steps: [
        "Fetching the homepage",
        "Looking for a service page, an about page and a sitemap",
        "Reading titles, headings and structured data",
        "Checking whether your primary action can be found and understood",
      ],
    },
    heading: "Website Public Readiness",
    overallScoreLabel: "Agent Readiness score",
    profileLabel: "Applied profile",
    readinessDisclaimer:
      "This is technical and content readiness, not observed AI visibility and not a ChatGPT recommendation.",
    checkedLabel: "Checked",
    checkedAtLabel: "Run at",
    pagesLabel: "Pages read",
    remainingLabel: "Free checks left this hour",
    componentsHeading: "Readiness by component",
    componentsIntro:
      "The total uses the versioned weights shown by the methodology. llms.txt is diagnostic only and has zero weight.",
    diagnosticOnlyLabel: "Diagnostic only · weight 0",
    coverageLabel: "Evidence coverage",
    crawlerHeading: "AI crawler access matrix",
    crawlerIntro:
      "Each named user agent is evaluated against the robots.txt rule that applies to the site root. Allowed means technically permitted, not observed crawling.",
    crawlerColumns: { crawler: "Crawler", userAgent: "User-agent", status: "Status", evidence: "Evidence" },
    crawlerStatusLabels: { allowed: "Allowed", blocked: "Blocked", unknown: "Unknown" },
    standardsHeading: "Cloudflare-parity checks + Selena depth",
    standardsIntro:
      "Every applicable check shows its target, public evidence, limitation, concrete fix and verification step. Not applicable never lowers the score; AP2 and llms.txt are diagnostic only.",
    standardsColumns: { check: "Check", status: "Status", target: "Checked target" },
    standardStatusLabels: { passed: "Passed", warning: "Warning", failed: "Failed", not_applicable: "Not applicable", unknown: "Unknown" },
    categorySummary: { applicable: "applicable", passed: "passed", warning: "warnings", failed: "failed", notApplicable: "not applicable" },
    explanationLabel: "Why it matters",
    verificationLabel: "How to verify",
    platformLabel: "Implementation path",
    instructionsHeading: "Download your audit",
    instructionsIntro:
      "The complete audit and every fix stay free. Download the full report for yourself, or just the fix plan to hand to your developer.",
    downloadReportLabel: "Download the full audit (with fixes)",
    downloadFixesLabel: "Download the fix plan only",
    downloadHint:
      "Both download as a styled page that opens on any device. To get a PDF, open the file and print it (Cmd/Ctrl+P → Save as PDF).",
    copyAllLabel: "Copy all fix instructions",
    downloadMarkdownLabel: "Download .md report",
    copyAgentPromptLabel: "Copy coding-agent prompt",
    blocksHeading: "Block-level citability readiness",
    blocksIntro:
      "These versioned heuristics test whether a visible block can stand alone as a clear answer. They are not proven ranking factors.",
    blockTypeLabels: {
      hero: "Hero",
      about: "About",
      services: "Services / product",
      pricing: "Pricing",
      location_contact: "Location / contact",
      faq: "FAQ",
      evidence: "Evidence / proof",
      other: "Other block",
    },
    shownLabel: "Weakest blocks shown",
    providerCallsLabel: "Paid provider calls",
    goodHeading: "What already works",
    goodIntro: "Machine readers found these on your site. Keep them.",
    goodEmpty:
      "Nothing in this layer passed. That is unusual and normally means the page could not be read properly rather than that every single signal is missing.",
    problemsHeading: "What gets in the way",
    problemsIntro:
      "Ordered by cost to you, not by how easy they are to fix. Critical items change whether you can be found and understood at all.",
    problemsEmpty: "No blocking issues were found in what the free check can see.",
    fixHeading: "Fix this first",
    fixIntro: "One thing, chosen because it blocks the most downstream.",
    howToFixLabel: "How to fix it",
    doesNotProveLabel: "What fixing it does not prove",
    evidenceLabel: "Evidence",
    ruleLabel: "Rule",
    generatedFixLabel: "Generate Fix preview",
    beforeLabel: "Observed evidence",
    proposedLabel: "Proposed change",
    previewOnlyLabel: "Preview only — nothing is applied to your website.",
    copyFixLabel: "Copy proposed fix",
    nextHeading: "Then these",
    nextIntro: "The next items in order, with the concrete change for each.",
    layersHeading: "Public Readiness evidence",
    layersIntro:
      "Only website readiness is measured in this free result. Observed AI visibility belongs to a separate paid measurement cycle.",
    layerTitles: {
      discoverability: "Discoverability",
      understanding: "Understanding",
      action_readiness: "Action readiness",
    },
    layerQuestions: {
      discoverability: "Can a machine reach and read your pages at all?",
      understanding: "Once read, is it clear who you are and what you sell?",
      action_readiness: "Can the customer — and a machine — complete your primary action?",
    },
    scoreSuffix: "/ 100",
    notMeasuredLabel: "Not measured",
    layerPassedLabel: "working",
    layerProblemsLabel: "to fix",
    severityLabels: {
      critical: "Critical",
      important: "Important",
      later: "Later",
    },
    unreachable: {
      heading: "Your site could not be reached",
      body:
        "Nothing was measured, so nothing is being reported. This usually means the address is wrong, the server refused the request, or bot protection blocked a well-behaved crawler — the last one is itself worth knowing, because AI crawlers hit the same wall.",
    },
    errors: {
      rateLimited:
        "The free check is limited to five runs per hour from one address. Try again later, or get in touch and we will run it with you.",
      generic:
        "The check failed on our side, not yours. Nothing about your site is implied by this — try again in a minute.",
    },
    restartLabel: "Check another site",
    verifyHeading: "Verify after you make a change",
    verifyIntro:
      "Run one free recheck of the same URL. It creates a new result and compares Public Readiness only; the baseline is not overwritten.",
    verifyLabel: "Verify this URL",
    verifyingLabel: "Verifying…",
    comparisonLabel: "Readiness before / after",
    baselineLabel: "Baseline",
    verifiedLabel: "Verified",
    deltaLabel: "Change",
    comparisonBoundary:
      "This compares Public Readiness only. It does not compare mentions, citations, recommendation frequency or any other observed AI Visibility metric.",
    localAi: {
      heading: "Local AI readiness",
      intro:
        "A zero-weight diagnostic group: how clearly your public pages state the business name, category, location, contact facts and opening hours. It reads the same crawled pages as the rest of this report — no Google or Maps service is called, and Unknown simply means the pages did not carry enough evidence to decide.",
      disclaimer:
        "Readiness shows how clearly your public pages describe the business and its location. It does not prove the brand already appears in local AI surfaces such as Ask Maps.",
      ctaLabel: "Check factual local AI visibility",
      ctaHref: visibilityRoutes.en.contact,
    },
    freeMethod: {
      checksLabel: "checks performed",
      pagesLabel: "pages read",
      aiAnswersLabel: "AI answers — that is the paid measurement",
      priceLabel: "and no card required",
    },
    lockedItems: [
      {
        title: "How AI systems see you",
        body: "whether ChatGPT, Gemini and Perplexity name you — known only after a measurement.",
      },
      {
        title: "Who occupies the answers",
        body: "share of voice: you against your competitors, by name.",
      },
      {
        title: "Where you are absent and competitors are not",
        body: "which questions show them, and which sources the answer cites.",
      },
      {
        title: "Where AI takes its data from",
        body: "sources and the citation gap (cited without you).",
      },
      {
        title: "Measurement-backed recommendations",
        body: "what to do, tied to specific numbers.",
      },
    ],
    cta: {
      heading: "Want to measure the AI-answer layer?",
      body:
        "The free check reads your public pages. Whether AI answers actually name or cite you needs an approved provider cycle and a dated prompt set. The paid plans add that evidence without mixing Visitor View and API View.",
      primary: { label: "Compare free and paid plans", href: visibilityRoutes.en.pricing },
      secondary: { label: "Discuss this result", href: visibilityRoutes.en.contact },
    },
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Choose how much of the AI landscape you need to see.",
    intro:
      "The catalog is fixed for the current release. Online checkout stays closed until production acceptance; you can request early access now or sign in if your workspace is already active.",
    freePlan: {
      name: "Website Public Readiness",
      price: commercialFacts.aiVisibility.publicReadiness.en,
      trackLabel: "Free entry",
      statusLabel: "Available now · no sign-up",
      description:
        "See whether machines can reach, understand and reuse your website before paying for AI-answer measurements.",
      boundary:
        "Technical and content readiness only — not observed AI visibility. 0 paid AI provider calls.",
      systemsLabel: "Your website only — no AI systems measured",
      volumeLabel: "Up to 5 public pages, result on the page in about a minute",
      progressionLabel: "The starting point every paid plan builds on.",
      features: [
        "Up to 5 key public pages with URL-level evidence",
        "Crawler access, robots.txt, sitemap, indexability and canonical checks",
        "Schema, entity clarity, page and block citability",
        "Prioritized findings, fix previews and one free verification recheck",
      ],
      href: visibilityRoutes.en.check,
      ctaLabel: "Run the free check",
    },
    paidPlans: {
      heading: "One free entry and four paid options, compared line by line",
      intro:
        "Start free, then compare exactly what each paid step adds. Snapshot and Landscape are automated monthly measurements; Expert Verified and Implementation add human review and execution without mixing their scope with the subscriptions.",
      scrollHint: "The table scrolls sideways — the row names stay in place.",
      comparisonLabels: {
        offer: "Offer",
        bestFor: "Best for",
        systems: "Systems",
        scope: "Measurement scope",
        difference: "What changes",
        included: "Key deliverables",
      },
    },
    directory: {
      heading: "One company. Two different things you can buy.",
      intro:
        "AI Visibility measures your external AI visibility. AI Automation diagnoses and builds the workflows inside your business. The free readiness check belongs only to AI Visibility.",
      visibility: {
        title: "AI Visibility",
        count: "1 free check + 4 paid options",
        description:
          "Choose this path to learn whether AI can access, mention or cite your business, then improve and remeasure the result.",
        href: "#plans",
        ctaLabel: "Compare Visibility options",
      },
      systems: {
        title: "AI Automation",
        count: "4 custom service formats",
        description:
          "Choose this path when you need Selena to diagnose, design or build sales, content, knowledge, automation or operations workflows.",
        href: "#packages",
        ctaLabel: "See AI Automation services",
      },
    },
    portal: {
      label: "Open client workspace",
      href: selenaAppRoutes.login,
      note: "For existing pilot and early-access clients.",
    },
    disclosure:
      "Prices are in USD. No AI measurement starts before an approved order and fixed provider cap. AI Visibility services are operated by Selena Systems LLC (Wyoming, USA). Live online payments are currently off.",
    tracks: [
      {
        title: "Automated visibility",
        intro: "Evidence, competitors and recommendations without analyst review.",
        plans: [
          {
            name: "AI Visibility Snapshot",
            price: commercialFacts.aiVisibility.snapshot.en,
            status: "founding_soon",
            statusLabel: "Early access · checkout not open",
            description:
              "For a local business that needs to know what potential customers see in consumer AI surfaces.",
            systemsLabel: "ChatGPT · Gemini · Perplexity",
            volumeLabel: "Up to 25 questions × 3 systems × a weekly run = 300 answers a month",
            progressionLabel: "Entry measurement · Visitor View only",
            features: [
              "1 site, brand and city or district",
              "1 language and 1 repeat",
              "Mentions, positions, citations and competitors",
              "Public website scan, dashboard and CSV",
              "Automated recommendations — not expert verified",
            ],
            href: visibilityRoutes.en.check,
            ctaLabel: "Start with the free check — instant result",
          },
          {
            name: "AI Visibility Landscape",
            price: commercialFacts.aiVisibility.landscape.en,
            status: "founding_soon",
            statusLabel: "Most complete automated view",
            description:
              "For teams that need all eight systems and a clear comparison between Visitor View and API View.",
            systemsLabel: "ChatGPT · Gemini · Perplexity + Claude · DeepSeek · Qwen · Mistral · Grok",
            volumeLabel: "Up to 25 questions × 8 systems × a weekly run = 800 answers a month",
            progressionLabel:
              "Everything in Snapshot, plus five API View systems, divergence and expanded source evidence.",
            features: [
              "Up to 2 languages within 25 questions",
              "Visitor/API divergence reported separately",
              "Expanded competitor and source map",
              "Evidence Ledger with data export (formats confirmed at delivery)",
              "Automated recommendations — not expert verified",
            ],
            featured: true,
            href: visibilityRoutes.en.check,
            ctaLabel: "Start with the free check — instant result",
          },
        ],
      },
      {
        title: "Human-verified action",
        intro: "When the decision needs semantic, citation and factual review by an analyst.",
        plans: [
          {
            name: "Expert Verified",
            price: commercialFacts.aiVisibility.expertVerified.en,
            status: "founding_soon",
            statusLabel: "Analyst-reviewed delivery",
            description: "A rigorous baseline with five repeats and manual quality control before the result is approved.",
            systemsLabel: "All 8: ChatGPT · Gemini · Perplexity · Claude · DeepSeek · Qwen · Mistral · Grok",
            volumeLabel: "25 questions × 2 languages × 8 systems × 5 repeats = 2000 answers",
            progressionLabel:
              "A deeper fixed baseline: five repeats per scenario, plus semantic, citation and factual QC by an analyst.",
            features: [
              "Up to 25 questions in 2 languages; deep review of the top 10 priorities",
              "Semantic, citation and factual-error QC",
              "Evidence Ledger and full Action Plan",
              "5–10 analyst-approved priorities",
              "2–3 hours of human review",
            ],
            href: visibilityRoutes.en.contact,
            ctaLabel: "Request Expert Verified",
          },
          {
            name: "Implementation + 90 days",
            price: commercialFacts.aiVisibility.implementation90Days.en,
            status: "active",
            statusLabel: "Applications open · manual approval",
            description: "A measured implementation program for teams that want to fix the gaps and prove the before/after result.",
            systemsLabel: "All 8: ChatGPT · Gemini · Perplexity · Claude · DeepSeek · Qwen · Mistral · Grok + optional connected analytics",
            volumeLabel: "Custom scope locked before work begins",
            progressionLabel:
              "Starts with an Expert Verified baseline, then adds implementation, monitoring and remeasurement.",
            features: [
              "Expert Verified baseline and personal Action Plan",
              "Up to 10 implementation hours",
              "90-day monitoring and verification",
              "Same Configuration Lock remeasurement",
              "Second recommendation iteration and final presentation",
            "Delivery guarantee: the full plan scope is done on time — or your money back / free completion",
              "Measurability guarantee: before and after are captured with the same configuration — the dynamics show honestly",
              "What we do not promise: a specific position in AI answers — nobody controls that",
              "A paid Expert Verified ($399) counts toward the program when you upgrade within 30 days",
            ],
            href: visibilityRoutes.en.contact,
            ctaLabel: "Discuss the 90-day scope",
          },
        ],
      },
    ],
  },
  faq: [
    {
      q: "Is this the same as \"what ChatGPT thinks about my business\"?",
      a: "No. We do not ask a chatbot for its opinion. Paid measurement tracks a locked, dated set of specific prompts through named, supported environments and reports exact counts — mentioned in X of Y valid answers — not a vibe.",
    },
    {
      q: "Will this guarantee AI recommends us?",
      a: "No tool can guarantee that. The free check finds verifiable technical, entity and content-readiness gaps. Real AI mentions and citations are measured only in a separate paid cycle with a locked prompt set and named systems.",
    },
    {
      q: "Does having schema/structured data mean AI will quote us correctly?",
      a: "No. Structured data is machine-readable corroboration, not proof of future citation. We report it as present-and-valid or missing, nothing more.",
    },
    {
      q: "Is llms.txt required?",
      a: "No. It is an emerging, unproven convention. Its score weight in our methodology is zero, and we do not recommend it as a priority fix.",
    },
    {
      q: "What happens after I submit the free check?",
      a: "The check reads public pages from the website you submit and returns website-readiness findings on the page. It does not call paid AI providers. To save a project or order an eight-system measurement, request early access or sign in to the client workspace.",
    },
  ],
  cta: {
    primary: { label: "Run a Free Visibility Check", href: visibilityRoutes.en.check },
    secondary: { label: "See plans", href: visibilityRoutes.en.pricing },
    compareNote:
      "Prices are at the top of this page. The line-by-line comparison of all five options, alongside the AI Automation services, lives on the pricing page.",
  },
};
