import { mergeLabItems, readLabFiles } from "@/lib/lab/files";

export type LabLocale = "en" | "ru";
export type LabSectionId = "research" | "guides" | "experiments" | "articles" | "courses";

export type LabSource = {
  title: string;
  href: string;
  publisher: string;
};

export type LabTable = {
  caption: string;
  headers: string[];
  rows: string[][];
};

/** A verbatim excerpt from a file, shown so the reader can check it themselves. */
export type LabCode = {
  caption: string;
  content: string;
};

/**
 * Body that must keep its written order — a sentence after a list, or a
 * sub-heading between paragraphs — which the fixed slots of a block cannot.
 */
export type LabFlowItem =
  | { paragraph: string }
  | { points: string[] }
  | { steps: string[] }
  /** `tag` carries the evidence status the claim was approved with (EXTRACTED, INTERPRETED). */
  | { subheading: string; tag?: string }
  | { cite: LabSource };

export type LabContentBlock = {
  heading: string;
  paragraphs: string[];
  /** Rendered straight after `paragraphs`, in order. */
  flow?: LabFlowItem[];
  points?: string[];
  /** Ordered where the order is the point — reproduction steps, not a list of facts. */
  steps?: string[];
  table?: LabTable;
  code?: LabCode;
  figure?: LabFigure;
};

export type LabDiagramId = "two-agent-review-before-after" | "two-agent-review-cycle";

/** Drawn inline as SVG, so the labels stay real text. */
export type LabFigure = {
  diagram: LabDiagramId;
  alt: string;
  caption: string;
};

export type LabRelatedLink = {
  title: string;
  href: string;
};

export type LabItem = {
  section: Extract<LabSectionId, "guides" | "articles" | "experiments">;
  slug: string;
  title: string;
  summary: string;
  label: string;
  readingTime: string;
  publishedAt: string;
  updatedAt: string;
  /** Opening paragraphs that sit above the first numbered section. */
  intro?: string[];
  /** Search title when it differs from the headline; the site name is appended. */
  metaTitle?: string;
  blocks: LabContentBlock[];
  /** The article's own closing ask, shown before its sources. */
  cta?: {
    paragraphs: string[];
    primary: LabRelatedLink;
    secondary?: LabRelatedLink;
  };
  sources: LabSource[];
  related?: LabRelatedLink[];
  /** 1200x630 card for link previews; rendered from scripts/og/. */
  socialImage?: { url: string; alt: string };
};

type LabSection = {
  id: LabSectionId;
  title: string;
  description: string;
  emptyState?: string;
};

type LabLocaleContent = {
  eyebrow: string;
  title: string;
  intro: string;
  supportingLine: string;
  browseLabel: string;
  featuredLabel: string;
  sectionEyebrow: string;
  backLabel: string;
  sourcesLabel: string;
  citeLabel: string;
  relatedLabel: string;
  updatedLabel: string;
  checkCta: { title: string; text: string; label: string; href: string };
  systemsCta: { title: string; text: string; label: string; href: string };
  coursesBoundary: string;
  sections: LabSection[];
  items: LabItem[];
};

const officialSources = {
  openAiSearch: {
    title: "Publishers and developers FAQ",
    href: "https://help.openai.com/en/articles/12627856-publishers-and-developers-faq",
    publisher: "OpenAI",
  },
  googleCrawling: {
    title: "Google crawling and indexing documentation",
    href: "https://developers.google.com/search/docs/crawling-indexing",
    publisher: "Google Search Central",
  },
  googleCanonical: {
    title: "How to specify a canonical URL",
    href: "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls",
    publisher: "Google Search Central",
  },
  googleStructuredData: {
    title: "General structured data guidelines",
    href: "https://developers.google.com/search/docs/appearance/structured-data/sd-policies",
    publisher: "Google Search Central",
  },
  schemaOrg: {
    title: "Schema.org documentation",
    href: "https://schema.org/docs/documents.html",
    publisher: "Schema.org",
  },
  googleAiFeatures: {
    title: "AI features and your website",
    href: "https://developers.google.com/search/docs/appearance/ai-features",
    publisher: "Google Search Central",
  },
  tannenbaumPromptToRecommendation: {
    title: "From Prompt to Recommendation",
    href: "https://arxiv.org/abs/2609.23162",
    publisher: "Benjamin Tannenbaum",
  },
} satisfies Record<string, LabSource>;

const handWrittenContent: Record<LabLocale, LabLocaleContent> = {
  en: {
    eyebrow: "Selena Lab",
    title: "Research, practical guides, experiments and articles for building with AI.",
    intro:
      "Selena Lab is the research and education layer of Selena Systems. We publish methods, evidence boundaries and practical work that support AI Visibility and our custom AI Systems practice.",
    supportingLine: "Research → useful content → trust → better decisions.",
    browseLabel: "Browse the Lab",
    featuredLabel: "Start here",
    sectionEyebrow: "Selena Lab library",
    backLabel: "Back to Selena Lab",
    sourcesLabel: "Primary references",
    citeLabel: "Source",
    relatedLabel: "Related reading",
    updatedLabel: "Updated",
    checkCta: {
      title: "Check the public readiness of your website",
      text: "Run the free evidence-based audit. It uses public website data only and does not query AI-answer systems; a short explanation may be written by an OpenAI model.",
      label: "Run Public Readiness",
      href: "/check",
    },
    systemsCta: {
      title: "Need a system, not only a diagnosis?",
      text: "Selena Systems maps the workflow, chooses the safe automation boundary and builds the operating layer with your team.",
      label: "Discuss an AI system",
      href: "/en/contact",
    },
    coursesBoundary:
      "No course is currently offered for sale. Public introductory lessons will stay in Selena Lab; paid enrolment will open only with a published syllabus, access period, price and refund terms. The future learning workspace will live at app.selenasystems.com/app/learn.",
    sections: [
      {
        id: "research",
        title: "Research",
        description: "Versioned studies, datasets and benchmarks with disclosed methodology, provenance and practical implications, with sources and limits.",
        emptyState: "The research register is being prepared. No dataset or benchmark is presented as published yet.",
      },
      {
        id: "guides",
        title: "Guides",
        description: "Concrete, evidence-safe ways to improve websites, workflows and AI systems with clear next steps, sources and limits included.",
      },
      {
        id: "experiments",
        title: "Experiments",
        description: "Reproducible tests of methods and tools, including what failed, what remains unknown and why it matters, with sources and limits.",
        emptyState: "Experiment notes will appear only after the setup, inputs and observed outcome can be reproduced.",
      },
      {
        id: "articles",
        title: "Articles",
        description: "Clear explanations of AI visibility, evidence and practical AI implementation for business teams, with sources and limits.",
      },
      {
        id: "courses",
        title: "Courses",
        description: "Free foundations and, later, separately purchased practical courses with one Selena account and published access terms.",
      },
    ],
    items: [
      {
        section: "articles",
        slug: "what-is-ai-visibility",
        title: "What is AI Visibility?",
        summary:
          "A practical definition of AI visibility, how it differs from website readiness, and which claims require a real measurement cycle.",
        label: "Foundation",
        readingTime: "6 min",
        publishedAt: "2026-08-16",
        updatedAt: "2026-08-16",
        blocks: [
          {
            heading: "A useful definition",
            paragraphs: [
              "AI Visibility is the observed presence and treatment of a brand in answers produced by defined AI systems for a defined set of scenarios. It is not a permanent property of a company and it is not one universal score.",
              "A defensible result names the system or surface, exact model where applicable, language, region, prompt family, repeat count, date and whether web search was available. Without that configuration, a percentage is difficult to interpret or reproduce.",
            ],
          },
          {
            heading: "Readiness and visibility answer different questions",
            paragraphs: [
              "Public Readiness asks whether machines can reach, parse and reuse information on a website. It can inspect HTTP access, robots rules, canonical URLs, structured data, entity clarity, content structure, contact consistency and block-level citability heuristics.",
              "Real AI Visibility asks what selected AI systems actually answered. That requires a separate measurement cycle and an Evidence Ledger. Improving readiness may make a site clearer, but it does not prove that ChatGPT, Gemini or Perplexity mentioned or recommended the brand.",
            ],
            points: [
              "Readiness evidence comes from the website and deterministic rules.",
              "Visibility evidence comes from dated AI answers collected under a Configuration Lock.",
              "The two can be compared side by side, but should never be merged into an opaque composite score.",
            ],
          },
          {
            heading: "Visitor View and API View are not interchangeable",
            paragraphs: [
              "A consumer-facing answer surface with search available is a different channel from a direct API response produced by a fixed model with web search off. Selena reports Visitor View and API View separately, then calculates divergence only between results that are genuinely comparable.",
              "This prevents a common mistake: presenting one API model response as everything a product or company 'knows'. It is only one response under one configuration.",
            ],
          },
          {
            heading: "What a sound measurement should preserve",
            paragraphs: [
              "The evidence needs both the answer and its context: prompt, system, model or surface, search status, language, region, repeat index, timestamps, citations and validation state. Cardinality must be planned before a run so missing or extra answers are visible rather than silently averaged away.",
              "The result is decision support. It can show where a brand appears, which competitors appear instead, which sources are cited and what should be investigated next. It cannot guarantee future rankings or recommendations.",
            ],
          },
        ],
        sources: [officialSources.openAiSearch],
      },
      {
        section: "guides",
        slug: "prepare-site-for-ai-systems",
        title: "How to prepare a website for AI systems",
        summary:
          "A safe checklist for access, indexability, entity clarity, structured data, answer-first content and verification, with evidence-led next steps.",
        label: "Practical guide",
        readingTime: "9 min",
        publishedAt: "2026-08-16",
        updatedAt: "2026-08-16",
        blocks: [
          {
            heading: "1. Make key pages reachable without a human session",
            paragraphs: [
              "Start with ordinary web access. Important public pages should return a successful HTTP response without login, CAPTCHA or a browser-only challenge. Review robots.txt and the CDN or WAF separately: an allowed robots rule does not help if infrastructure still returns 403.",
              "Crawler controls are not one switch. For example, OpenAI documents OAI-SearchBot for search discovery separately from GPTBot controls. Decide deliberately which public paths each named crawler may request, and keep private paths protected.",
            ],
          },
          {
            heading: "2. Establish one clear URL for each important page",
            paragraphs: [
              "Use stable HTTPS URLs, a self-referential canonical where appropriate and a sitemap containing the canonical pages you want discovered. Keep redirects, canonical declarations and sitemap URLs consistent.",
              "Do not use robots.txt as a substitute for noindex or authentication. Crawling, indexing and access control solve different problems.",
            ],
          },
          {
            heading: "3. State the business entity in visible content",
            paragraphs: [
              "The page should say who the business is, what it offers, for whom, where it operates and how a customer takes the next step. Keep the public name, location, contact paths and core offer consistent across the homepage, contact page and relevant service pages.",
              "Add truthful structured data that represents the visible page. JSON-LD can make entities and relationships more explicit, but valid markup does not guarantee a rich result, recommendation or ranking.",
            ],
          },
          {
            heading: "4. Write blocks that can stand on their own",
            paragraphs: [
              "Use descriptive headings followed by a direct answer. Add concrete scope, conditions, location, prices or dates when they are verified and relevant. A machine should not need decorative layout or three previous sections to understand the claim.",
              "Treat citability checks as versioned heuristics, not proven ranking factors. They help identify ambiguous blocks; only later measurements can show whether observed visibility changed.",
            ],
          },
          {
            heading: "5. Verify the exact fix",
            paragraphs: [
              "Record the URL, observed fragment and rule before editing. Preview the proposed change, publish it through the site's normal owner-controlled workflow, then run a new readiness check. Preserve the old result as the baseline.",
              "A readiness increase means the site meets more of the disclosed technical and content criteria. It does not by itself mean AI systems now mention the brand more often. That conclusion requires a separate measurement cycle with the same Configuration Lock.",
            ],
            points: [
              "Check up to five key pages rather than only the homepage.",
              "Keep llms.txt diagnostic-only; Selena gives it zero scoring weight.",
              "Do not expose private accounts or add paid provider calls to a free readiness check.",
            ],
          },
        ],
        sources: [
          officialSources.openAiSearch,
          officialSources.googleCrawling,
          officialSources.googleCanonical,
          officialSources.googleStructuredData,
          officialSources.schemaOrg,
        ],
      },
      {
        section: "guides",
        slug: "read-ai-visibility-report-evidence",
        title: "How to read an AI Visibility Report and verify the evidence",
        summary:
          "A field guide to Configuration Lock, denominators, citations, provenance and invalid runs, with practical checks for trustworthy recommendations.",
        label: "Evidence guide",
        readingTime: "8 min",
        publishedAt: "2026-08-16",
        updatedAt: "2026-08-16",
        blocks: [
          {
            heading: "Begin with the Configuration Lock",
            paragraphs: [
              "Before reading a headline metric, confirm what was measured: channel, system, exact API model or visitor surface, web-search status, language, region, prompt families, language scenarios, repeats and date. These fields define the result.",
              "If a later cycle changes those inputs, it is a new baseline version. A before/after chart is meaningful only when the relevant method stays fixed and the changed variables are disclosed.",
            ],
          },
          {
            heading: "Check the denominator, not only the percentage",
            paragraphs: [
              "A mention rate of 40% means different things at 2 of 5 answers and 80 of 200 answers. Look for planned answers, valid answers, technical invalids, retries and missing rows. One unexpected extra row should stop the cycle rather than disappear inside an average.",
              "Retries should belong to one specific technical invalid. Re-running a whole prompt family or system can create hidden fan-out and bias the sample.",
            ],
          },
          {
            heading: "Trace every claim back to evidence",
            paragraphs: [
              "For an AI-answer finding, open the prompt, raw answer snapshot, system, model or surface, timestamp, citation URLs and validation state. For a website-readiness finding, open the page URL, text or HTML fragment, selector, rule ID and rule version.",
              "A citation URL proves that the answer referenced that URL in the captured run. It does not automatically prove that every sentence in the answer is correct or that the cited page supports the exact claim. That needs semantic citation review.",
            ],
          },
          {
            heading: "Separate observation, interpretation and action",
            paragraphs: [
              "Observation states what the captured evidence contains. Interpretation explains why it may matter. Recommendation proposes a change. A strong report keeps those layers visible instead of presenting an inferred cause as a measured fact.",
              "Automated recommendations should be labelled as automated. An Expert Verified status requires an actual QC record covering semantic mentions, citations, factual errors and the approved priority actions.",
            ],
          },
          {
            heading: "Use the report as a controlled loop",
            paragraphs: [
              "Choose the highest-priority evidence-backed fix, preview it, implement it through an owner-controlled process and verify the exact page. Keep readiness before/after separate from AI visibility before/after.",
              "When the change is ready for a real re-measurement, use the same Configuration Lock. Report the observed delta with its denominator and date, then monitor only while the baseline remains comparable.",
            ],
          },
        ],
        sources: [officialSources.googleStructuredData],
      },
      {
        section: "experiments",
        slug: "two-agent-code-review",
        title: "Reviewing AI-written code: what two agents got wrong",
        summary:
          "Reviewing AI-written code with two independent agents: both explained the failing check confidently, both were wrong, and the workflow file settled it.",
        label: "Experiment",
        readingTime: "6 min",
        publishedAt: "2026-08-29",
        updatedAt: "2026-08-29",
        blocks: [
          {
            heading: "What we were testing",
            paragraphs: [
              "Reviewing AI-written code is the part of the workflow that decides whether the rest of it is worth anything. This note records one test of a two-agent review setup, including the part that failed: two agents produced confident, plausible and wrong explanations of the same problem before anyone opened the file that settled it.",
              "Experiment notes in this Lab are published only when the setup, the inputs and the observed outcome can be reproduced. This one can. It is a single observation rather than a study: n = 1.",
              "The hypothesis was that if two independent agents read the same source instead of reading each other's summaries, review quality improves and the owner stops acting as a message bus between chats.",
            ],
            figure: {
              diagram: "two-agent-review-before-after",
              alt: "Two-panel diagram. Before: the owner sits between ChatGPT Work, Codex and Claude Code, copying reports from one chat to another by hand. After: all three read the same GitHub repository directly, and the owner only decides what is irreversible.",
              caption: "Before and after. Reports used to travel between tools by hand; now the task, the code and the machine checks live in GitHub and each tool reads them itself.",
            },
          },
          {
            heading: "Setup",
            paragraphs: [
              "Claude Code runs from a workflow file using the published GitHub Action, and is triggered by writing @claude in a comment on a pull request or an issue. It is not fully automatic, but from that point on it reads the pull request, the diff and the CI results itself rather than receiving a pasted summary.",
              "The repository is a fork. It inherited the upstream project's workflows, including a Contributor License Agreement check.",
            ],
            table: {
              caption: "The four components and what each one was responsible for.",
              headers: ["Component", "Role", "Auth"],
              rows: [
                ["Project workspace", "Holds documents, data and the specification", "Subscription"],
                ["Codex", "Writes code and migrations; reviews its own diff", "Subscription"],
                ["Claude Code", "Independent audit and security review, running as a GitHub Action", "Subscription OAuth token, no API key"],
                ["GitHub", "Shared source: task, code, diff, machine checks", "—"],
              ],
            },
            figure: {
              diagram: "two-agent-review-cycle",
              alt: "Flow of a single task: the owner states the intent, the project holds documents and data, Codex and Claude Cowork review the plan independently, an approved specification is produced, Codex writes code in a branch, then GitHub CI, Codex and Claude Code review the same commit; errors loop back with a concrete fix; the owner only merges, spends and publishes.",
              caption: "The review happens twice: first the plan, before a line of code exists, then the code itself — with both reviewers looking at the same commit.",
            },
          },
          {
            heading: "Inputs",
            paragraphs: [
              "The whole experiment ran against four artifacts, each of which is still in place and can be inspected again.",
            ],
            points: [
              "One pull request, open since 26 August 2026.",
              "One consistently failing status check: Verify CLA signature.",
              "The repository's commit history.",
              "The CLA workflow file and the contributors file it reads.",
            ],
          },
          {
            heading: "Two confident explanations, both wrong",
            paragraphs: [
              "The first agent reported that the red check was cosmetic, that it always fails for agent-authored commits, and that it could be merged past. Plausible: a previous pull request had indeed been merged with the same red mark.",
              "Asked to verify that, the second agent examined the commit history, observed that owner commits and agent commits carried different author addresses, and concluded that the check compares the commit author against the CLA signatory — fixable with one line of git configuration. Also plausible. Also wrong.",
              "Neither agent had opened the workflow file. Both were reasoning about what a check of that name would probably do.",
            ],
          },
          {
            heading: "What the file actually said",
            paragraphs: [
              "The check does not read commit authors at all. It takes the GitHub login of the pull request author and looks for it in the contributors file.",
              "That file is the signature registry of the upstream project the repository was forked from. It lists ten logins belonging to that project's contributors. The current repository owner's login is not among them, and adding it would mean signing another company's legal agreement.",
              "So the check will stay red permanently. It is not fixed by a signature. It is fixed by correcting the inherited workflow — whose own header comment states that repository owners and collaborators are exempt, while its script exempts only bot accounts.",
            ],
            code: {
              caption: "The line that settled it, from the CLA workflow.",
              content: "AUTHOR: ${{ github.event.pull_request.user.login }}",
            },
          },
          {
            heading: "Result",
            paragraphs: [
              "The hypothesis held in a narrow sense and failed in a broader one.",
              "It held in that the process which produced the correct answer was reading the source. It failed as a claim about agents: adding a second agent did not produce the correct answer. Two agents produced two confident wrong answers, and the correct one came from opening the file.",
              "The practical rule we took from this is not \"use two agents\". It is that an explanation is not evidence, however fluent it sounds, and that both reviewers must be pointed at the same artifact — the same commit, the same file — or their agreement means nothing.",
            ],
          },
          {
            heading: "Limits",
            paragraphs: [
              "This is one incident, and it should be read as one.",
            ],
            points: [
              "n = 1. It shows that this failure mode exists, not how often it occurs.",
              "Not a controlled comparison. The two agents received different prompts and had different access. Nothing here compares model quality.",
              "Not evidence that agents are unreliable in general. It is evidence that reasoning about a file without reading it is unreliable — which is equally true of people.",
              "The always-red check is a contributing cause. A status that is permanently red stops being read. That failure is organisational, not technical.",
            ],
          },
          {
            heading: "What remains unknown",
            paragraphs: [
              "Two questions this experiment raises and does not answer.",
            ],
            points: [
              "Whether a second agent adds accuracy when both are explicitly required to cite the source lines they relied on. Not tested here.",
              "How often plausible-but-unsourced explanations survive a two-agent review when nobody opens the underlying file.",
            ],
          },
          {
            heading: "How to reproduce",
            paragraphs: [
              "Any repository forked from a project that carries its own CLA workflow will reproduce this.",
            ],
            steps: [
              "Fork a repository that carries its own CLA workflow.",
              "Open a pull request from an account not listed in the upstream contributors file.",
              "Ask an agent why the check fails, without giving it the workflow file.",
              "Ask a second agent to verify the first, again without the file.",
              "Read the workflow directory yourself and compare all three answers.",
            ],
          },
        ],
        sources: [
          {
            title: "claude-code-action",
            href: "https://github.com/anthropics/claude-code-action",
            publisher: "Anthropic",
          },
          {
            title: "Elmo Contributor License Agreement",
            href: "https://github.com/elmohq/elmo/blob/main/CLA.md",
            publisher: "Blue Whale Software",
          },
        ],
        socialImage: {
          url: "/media/lab/two-agent-review-en.png",
          alt: "Before and after: the owner as a bus between three chats, then GitHub as the shared source all three read themselves.",
        },
        related: [
          { title: "What is AI Visibility?", href: "/lab/articles/what-is-ai-visibility" },
          { title: "Verify the evidence behind an AI Visibility report", href: "/lab/guides/read-ai-visibility-report-evidence" },
          { title: "Prepare a website for AI systems", href: "/lab/guides/prepare-site-for-ai-systems" },
        ],
      },
      {
        section: "articles",
        slug: "restaurant-on-google-not-in-ai-recommendations",
        title: "Your Restaurant Is on Google. Why Doesn’t AI Recommend It?",
        metaTitle: "Why AI Does Not Recommend Your Restaurant",
        summary:
          "Your restaurant appears on Google but not in AI recommendations. Test guest scenarios, sources, competitors and the path to booking before changing the site.",
        label: "Practical diagnosis",
        readingTime: "8 min",
        publishedAt: "2026-09-29",
        updatedAt: "2026-09-29",
        intro: [
          "Your restaurant is easy to find by name on Google. It has a website, a map listing and good reviews. But when a guest asks an AI assistant, “Where can I have a quiet dinner near the city centre?”, the restaurant does not appear.",
          "The owner sees one symptom: we are not being recommended. But the failure can happen at several different stages. A crawler may be unable to access the site. The relevant information may exist only inside a menu image. The AI system may find the page but not use it in the answer. Or the restaurant may be named, but the guest cannot confirm opening hours or move on to a booking.",
          "The useful question is not “How do we increase an AI Visibility Score?” It is: “At which stage does the restaurant disappear from the guest’s decision path?”",
        ],
        blocks: [
          {
            heading: "Being found by name is not the same as being recommended",
            paragraphs: [
              "A branded search tests whether a system can identify a specific name. A guest scenario tests something else: whether the system considers the restaurant suitable for a location, budget, cuisine, occasion, dietary constraint and time.",
              "“Avli Bali” and “a Greek restaurant in Ubud for dinner with a group of eight” are not equivalent prompts. In the first, the name is supplied. In the second, the system has to select the restaurant from alternatives and explain why it fits.",
              "For diagnosis, separate the path into four stages:",
            ],
            flow: [
              {
                points: [
                  "Access: Can the system obtain the public information?",
                  "Match: Is there a page that answers this guest’s specific need?",
                  "Inclusion: Is the restaurant included in the answer, and which sources are shown?",
                  "Action: Can the guest verify the facts and continue to a booking, call or route?",
                ],
              },
              { paragraph: "If these stages are collapsed into one score, the owner cannot see what needs to be fixed." },
            ],
          },
          {
            heading: "What the sources actually establish",
            paragraphs: [],
            flow: [
              { subheading: "Google does not require special “AI markup”", tag: "EXTRACTED" },
              { paragraph: "Google’s official documentation says that AI Overviews and AI Mode do not require additional technical requirements or special schema markup. The usual Search foundations still apply: a page must be crawlable and eligible for indexing, important information should be available as text, and structured data should match the visible content." },
              { paragraph: "Google also states that meeting technical requirements does not guarantee crawling, indexing or serving. A technically sound site therefore creates a necessary foundation; it does not prove that the restaurant will be recommended." },
              { cite: officialSources.googleAiFeatures },
              { subheading: "There is a measurable stage between the page and the recommendation", tag: "EXTRACTED" },
              { paragraph: "Benjamin Tannenbaum’s 19 September 2026 preprint analysed 34,960 unbranded prompt-engine observations across 2,854 monitored prompts in GPT and Gemini. When neither the target brand nor its own domain appeared in the observable retrieval path, target mention rates were 2.8% for GPT and 3.8% for Gemini. With an own-domain citation but no branded fan-out, the rates were 49.0% and 58.4%." },
              { paragraph: "The paper is explicitly observational, not causal. It is not a restaurant study, it uses a commercial Aiso sample, and it is a preprint. Visible citations also do not reveal the whole internal retrieval process. The study therefore does not justify a claim such as “add a text menu and AI will recommend the restaurant.”" },
              { cite: officialSources.tannenbaumPromptToRecommendation },
              { subheading: "Find the failure stage before choosing the fix", tag: "INTERPRETED" },
              { paragraph: "Together, these sources support a practical diagnostic model: website readiness, source exposure, restaurant inclusion and the guest’s ability to act are different outcomes." },
              { paragraph: "If the AI system cannot obtain the relevant information, improve access or content. If the information is available but competitors are consistently selected, compare the actual answers and cited pages. If the restaurant is already present but the facts or booking path are wrong, the problem is accuracy and action — not simply “ranking”." },
            ],
          },
          {
            heading: "A self-check: 30 answers instead of one vague question",
            paragraphs: [
              "You do not need hundreds of prompts for an initial diagnostic. Choose five genuinely different guest situations, test them in two consumer AI platforms that matter to your audience, and repeat each prompt three times. That gives 30 observations.",
              "Example scenarios:",
            ],
            flow: [
              {
                steps: [
                  "Where can two people have a quiet dinner in [district]?",
                  "Which restaurant in [city] is suitable for someone with vegetarian or gluten-free requirements?",
                  "Where can I book a table for eight after 8 p.m.?",
                  "Which restaurant near [landmark] is open late today?",
                  "Where can I try [specific dish] at a mid-range price?",
                ],
              },
              { paragraph: "Replace the city, district, cuisine and constraints with the restaurant’s real audience. Do not use five rewrites of “best restaurant”; that tests one need five times." },
              { paragraph: "For every answer, record:" },
              {
                points: [
                  "whether the restaurant is named, and its position if the answer is ordered;",
                  "which competitors are recommended instead;",
                  "which links or sources are shown;",
                  "whether a guest can confirm the menu, price, opening hours and next action.",
                ],
              },
              { paragraph: "Keep the language, city, country of access, platform mode and prompt wording unchanged. If a platform does not expose location controls or sources, record that as a limitation rather than turning it into a zero." },
            ],
          },
          {
            heading: "What Selena Systems can diagnose today",
            paragraphs: [
              "Selena Systems currently keeps readiness checks and AI-answer checks separate. They answer different questions and should not be presented as one measurement.",
            ],
            flow: [
              { subheading: "1. Public and project-level website readiness" },
              { paragraph: "The public Public Readiness check inspects up to five public pages and public discovery resources. It looks at observable website evidence such as HTTP access, robots rules, canonical URLs, indexability, structured data, business clarity and the path to a customer action. It does not call paid AI-answer providers and does not claim that ChatGPT, Gemini or another platform recommends the restaurant." },
              { paragraph: "An authenticated staging module also stores a dated project snapshot and a remediation plan for observable site signals. Access to that module depends on the project and account state. This article does not claim a completed client run." },
              { subheading: "2. A limited domain signal from two AI systems" },
              { paragraph: "A separate staging module performs a one-time check of one normalised domain in ChatGPT and Gemini for an eligible verified account. Its current client-facing output is limited to whether the domain was mentioned and a citation count for each system. It does not expose the full answer or source URLs and is not a competitor audit." },
              { paragraph: "For a full restaurant diagnostic, Selena still needs an agreed set of guest scenarios, stored answers, competitors, sources and a comparable retest. Public materials describe those measurement products as early access; recurring delivery should not be assumed until it is explicitly activated." },
            ],
          },
          {
            heading: "Fix one observed gap",
            paragraphs: [
              "After the self-check, choose one documented failure rather than trying to “improve everything”.",
            ],
            flow: [
              {
                points: [
                  "A page is inaccessible or not indexable. Fix the specific robots, CDN, canonical or indexability problem.",
                  "The AI cannot verify a dish, price or dietary condition. Add current information as visible text on an official page. A menu image can remain, but it should not be the only source of the fact.",
                  "The website, map listing and booking service disagree. Establish the correct version and synchronise hours, address, menu, contact details or booking rules.",
                  "Competitors appear and the restaurant does not. Review the pages actually cited in those answers. A difference is a hypothesis to test, not proof of why the competitor won.",
                  "The restaurant is named but the next action fails. Fix the button, form, phone number, messenger link or route. Visibility without a working action is not a completed booking path.",
                ],
              },
              { paragraph: "Every action should have an owner, a deadline, a link to the original observation and a predefined retest." },
            ],
          },
          {
            heading: "Retest the same thing under the same conditions",
            paragraphs: [
              "After the change, repeat the same five prompts in the same two interfaces, in the same language and country of access, with the same number of repeats. Do not overwrite the original answers; the new run should point back to the baseline.",
              "Compare these metrics separately:",
            ],
            flow: [
              {
                points: [
                  "Mention Rate: the restaurant is named in how many valid answers?",
                  "Owned Citation Rate: the official domain appears in how many valid answers?",
                  "Fact Accuracy: how many verifiable claims match a current official source?",
                  "Action Completeness: is there a correct path to book, call or get directions?",
                  "Competitor Set: which venues appear instead for each guest scenario?",
                ],
              },
              { paragraph: "If mentions increase, the defensible wording is: “After the change, we observed an increase from X of Y to A of B in a comparable retest.” Do not automatically say that the change caused the increase; the platform, index and competitors may also have changed." },
              { paragraph: "If nothing changes, the test is still useful. It rules out one hypothesis and prevents further spending on a change that did not solve the observed problem." },
            ],
          },
          {
            heading: "The practical conclusion",
            paragraphs: [
              "A restaurant can be visible on Google and absent from AI recommendations without contradiction. A search by name confirms that the brand exists. An unbranded recommendation tests whether the venue fits a specific guest situation and whether the system can find evidence it considers useful at that moment.",
              "The working model is simple:",
              "problem → evidence → self-check → diagnosis → one action → comparable retest",
              "This gives the owner something more useful than an abstract score: a clear view of where the restaurant loses the guest, and which change is worth testing first.",
            ],
          },
        ],
        cta: {
          paragraphs: [
            "Start with Selena Systems’ free Public Readiness check. If the technical foundation is sound but the restaurant is absent from important guest scenarios, request early access to an AI Visibility diagnostic with fixed prompts, preserved sources, named competitors and a comparable retest plan.",
            "Starting the conversation defines the scope. It does not automatically start a paid measurement or payment.",
          ],
          primary: { title: "Run Public Readiness", href: "/check" },
          secondary: { title: "Explore AI Visibility", href: "/visibility" },
        },
        sources: [officialSources.googleAiFeatures, officialSources.tannenbaumPromptToRecommendation],
        related: [
          { title: "Run the free Public Readiness check", href: "/check" },
          { title: "AI Visibility for hotels, villas and restaurants", href: "/visibility" },
          { title: "Methodology for AI Visibility", href: "/methodology" },
          { title: "How to prepare a website for AI systems", href: "/lab/guides/prepare-site-for-ai-systems" },
        ],
      },
    ],
  },
  ru: {
    eyebrow: "Selena Lab",
    title: "Исследования, инструменты и практический опыт создания AI-систем.",
    intro:
      "Selena Lab объединяет исследовательскую лабораторию и блог Selena Systems. Здесь публикуются методы, эксперименты, инструменты, проверяемые кейсы и практический опыт работы с AI Visibility и AI Systems.",
    supportingLine: "Исследования → полезный контент → доверие → лучшие решения.",
    browseLabel: "Разделы Selena Lab",
    featuredLabel: "С чего начать",
    sectionEyebrow: "Библиотека Selena Lab",
    backLabel: "Вернуться в Selena Lab",
    sourcesLabel: "Первичные источники",
    citeLabel: "Источник",
    relatedLabel: "Смежное",
    updatedLabel: "Обновлено",
    checkCta: {
      title: "Проверьте публичную готовность сайта",
      text: "Запустите бесплатный аудит, основанный на доказательствах. Он использует только публичные данные сайта и не опрашивает AI-системы ответов; короткое пояснение может написать модель OpenAI.",
      label: "Запустить проверку готовности",
      href: "/ru/check",
    },
    systemsCta: {
      title: "Нужна система, а не только диагностика?",
      text: "Selena Systems разбирает процесс, определяет безопасную границу автоматизации и строит рабочий контур вместе с вашей командой.",
      label: "Обсудить AI-систему",
      href: "/contact",
    },
    coursesBoundary:
      "Сейчас ни один курс не выставлен на продажу. Бесплатные вводные материалы останутся в Selena Lab; платная запись откроется только с опубликованной программой, сроком доступа, ценой и условиями возврата. Будущий учебный кабинет будет находиться на app.selenasystems.com/app/learn.",
    sections: [
      {
        id: "research",
        title: "Исследования",
        description: "Версионированные исследования, наборы данных и бенчмарки с раскрытой методологией, происхождением данных и практическими выводами. Здесь важны источники и границы вывода.",
        emptyState: "Реестр исследований готовится. Пока ни один набор данных или бенчмарк не обозначен как опубликованный.",
      },
      {
        id: "guides",
        title: "Руководства",
        description: "Конкретные и опирающиеся на доказательства способы улучшать сайты, процессы и AI-системы с понятными следующими шагами. Здесь важны источники и границы вывода.",
      },
      {
        id: "experiments",
        title: "Эксперименты",
        description: "Воспроизводимые тесты методов и инструментов — включая неудачи, неизвестные результаты и их практический смысл. Здесь важны источники и границы вывода.",
        emptyState: "Эксперимент появится здесь только вместе с воспроизводимыми настройками, входными данными и наблюдаемым результатом.",
      },
      {
        id: "articles",
        title: "Статьи",
        description: "Понятные объяснения AI Visibility, доказательств и практического внедрения AI для команд и владельцев бизнеса. Здесь важны источники и границы вывода.",
      },
      {
        id: "courses",
        title: "Курсы",
        description: "Бесплатная база и, позднее, отдельные платные практические курсы с единым аккаунтом Selena и ясными условиями доступа и программой.",
      },
    ],
    items: [
      {
        section: "articles",
        slug: "what-is-ai-visibility",
        title: "Что такое AI Visibility",
        summary:
          "Практическое определение AI-видимости, её отличие от готовности сайта, реального измерения и границ интерпретации. Здесь разобраны доказательства и методика.",
        label: "База",
        readingTime: "6 минут",
        publishedAt: "2026-08-16",
        updatedAt: "2026-08-16",
        blocks: [
          {
            heading: "Рабочее определение",
            paragraphs: [
              "AI Visibility — это наблюдаемое присутствие бренда и то, как его описывают выбранные AI-системы в ответах на зафиксированный набор сценариев. Это не постоянное свойство компании и не один универсальный балл.",
              "Проверяемый результат указывает канал, систему или поверхность, точную API-модель, если она используется, язык, регион, семейство запросов, число повторов, дату и статус веб-поиска. Без этой конфигурации процент трудно интерпретировать и воспроизвести.",
            ],
          },
          {
            heading: "Готовность и видимость отвечают на разные вопросы",
            paragraphs: [
              "Проверка публичной готовности сайта показывает, могут ли машины получить, разобрать и повторно использовать информацию сайта. Сюда относятся HTTP-доступ, robots.txt, canonical, структурированные данные, ясность сущности, структура контента, согласованность контактов и эвристики цитируемости на уровне блоков.",
              "Реальный замер AI Visibility проверяет, что выбранные AI-системы действительно ответили. Для этого нужен отдельный цикл замера и журнал доказательств. Улучшение готовности делает сайт понятнее, но не доказывает, что ChatGPT, Gemini или Perplexity начали чаще упоминать или рекомендовать бренд.",
            ],
            points: [
              "Доказательства готовности приходят с сайта и из детерминированных правил.",
              "Доказательства видимости приходят из датированных AI-ответов с фиксацией конфигурации.",
              "Метрики можно сравнивать рядом, но нельзя смешивать в непрозрачный сводный балл.",
            ],
          },
          {
            heading: "«Как видит посетитель» и «через API» — не один канал",
            paragraphs: [
              "Пользовательская AI-поверхность с доступным поиском отличается от прямого API-ответа фиксированной модели с выключенным веб-поиском. Selena показывает результаты «как видит посетитель» и «через API» отдельно, а расхождение считает только между действительно сопоставимыми результатами.",
              "Так мы не выдаём один API-ответ за всё, что модель якобы «знает». Это лишь один ответ при одной конфигурации.",
            ],
          },
          {
            heading: "Что должно сохраняться в корректном измерении",
            paragraphs: [
              "В журнале доказательств остаются ответ и его контекст: запрос, система, модель или поверхность, статус поиска, язык, регион, номер повтора, отметки времени, цитирования и статус валидации. Ожидаемое число ответов планируется до запуска, чтобы пропущенные или лишние ответы не исчезали внутри среднего значения.",
              "Результат помогает принимать решения: показывает, где бренд появляется, кого называют вместо него, какие источники цитируют и что исследовать дальше. Он не гарантирует будущие позиции или рекомендации.",
            ],
          },
        ],
        sources: [officialSources.openAiSearch],
      },
      {
        section: "guides",
        slug: "prepare-site-for-ai-systems",
        title: "Как подготовить сайт для AI-систем",
        summary:
          "Безопасный чек-лист: доступ, индексируемость, ясность сущности, структурированные данные, контент с прямым ответом в начале и проверка результата — с проверяемыми шагами.",
        label: "Практическое руководство",
        readingTime: "9 минут",
        publishedAt: "2026-08-16",
        updatedAt: "2026-08-16",
        blocks: [
          {
            heading: "1. Сделайте ключевые страницы доступными без пользовательской сессии",
            paragraphs: [
              "Начните с обычного веб-доступа. Важные публичные страницы должны возвращать успешный HTTP-ответ без логина, CAPTCHA или проверки, которую проходит только браузер. Проверьте robots.txt и CDN/WAF отдельно: разрешение в robots.txt не поможет, если инфраструктура всё равно возвращает 403.",
              "Управление доступом краулеров — не один переключатель. Например, OpenAI отдельно документирует OAI-SearchBot для обнаружения в поиске и настройки для GPTBot. Осознанно решите, какие публичные пути доступны каждому названному краулеру, а приватные пути оставьте защищёнными.",
            ],
          },
          {
            heading: "2. Зафиксируйте один понятный URL для каждой важной страницы",
            paragraphs: [
              "Используйте стабильные HTTPS URL, самоссылающийся canonical там, где он уместен, и sitemap с каноническими страницами, которые должны находить поисковые системы. Редиректы, canonical и sitemap не должны противоречить друг другу.",
              "Не используйте robots.txt вместо noindex или авторизации. Обход, индексация и контроль доступа решают разные задачи.",
            ],
          },
          {
            heading: "3. Опишите бизнес-сущность в видимом контенте",
            paragraphs: [
              "Страница должна прямо отвечать: кто вы, что предлагаете, для кого, где работаете и какое действие сделать дальше. Согласуйте публичное имя, локацию, контакты и основной оффер на главной, контактной и страницах услуг.",
              "Добавьте правдивые структурированные данные, соответствующие видимому содержанию страницы. JSON-LD может яснее описать сущности и связи, но валидная разметка не гарантирует расширенный результат в поиске, рекомендацию или позицию.",
            ],
          },
          {
            heading: "4. Пишите блоки, понятные без окружающего дизайна",
            paragraphs: [
              "После описательного заголовка дайте прямой ответ. Добавляйте конкретный объём услуги, условия, локацию, цены или даты, только когда они подтверждены и уместны. Машине не должно требоваться декоративное расположение и три предыдущих раздела, чтобы понять утверждение.",
              "Проверки цитируемости — версионированные эвристики, а не доказанные факторы ранжирования. Они находят неоднозначные блоки; только последующие замеры могут показать изменение наблюдаемой AI-видимости.",
            ],
          },
          {
            heading: "5. Перепроверьте конкретное исправление",
            paragraphs: [
              "До изменения сохраните URL, наблюдаемый фрагмент и правило. Посмотрите предпросмотр, опубликуйте правку через обычный контролируемый владельцем процесс сайта, затем запустите новую проверку готовности. Старый результат остаётся исходным замером.",
              "Рост готовности означает, что сайт лучше соответствует раскрытым техническим и контентным критериям. Он не означает автоматически, что AI-системы чаще упоминают бренд. Для такого вывода нужен отдельный цикл замера с той же фиксацией конфигурации.",
            ],
            points: [
              "Проверяйте до пяти ключевых страниц, а не только главную.",
              "Сохраняйте llms.txt диагностическим сигналом с нулевым весом.",
              "Не подключайте приватные аккаунты и платные обращения к провайдерам к бесплатной проверке готовности.",
            ],
          },
        ],
        sources: [
          officialSources.openAiSearch,
          officialSources.googleCrawling,
          officialSources.googleCanonical,
          officialSources.googleStructuredData,
          officialSources.schemaOrg,
        ],
      },
      {
        section: "guides",
        slug: "read-ai-visibility-report-evidence",
        title: "Как читать отчёт AI Visibility и проверять доказательства",
        summary:
          "Практика чтения фиксации конфигурации, знаменателей, цитирований, происхождения данных и невалидных запусков для проверяемых рекомендаций и решений.",
        label: "Руководство по доказательствам",
        readingTime: "8 минут",
        publishedAt: "2026-08-16",
        updatedAt: "2026-08-16",
        blocks: [
          {
            heading: "Начните с фиксации конфигурации",
            paragraphs: [
              "До главной метрики проверьте, что измерялось: канал, система, точная API-модель или пользовательская поверхность, статус веб-поиска, язык, регион, семейства запросов, языковые сценарии, повторы и дата. Эти поля определяют результат.",
              "Если в следующем цикле входные параметры изменились, это новая версия исходного замера. Сравнение «до/после» имеет смысл только при сохранении релевантной методики и раскрытии изменённых переменных.",
            ],
          },
          {
            heading: "Проверяйте знаменатель, а не только процент",
            paragraphs: [
              "Доля упоминаний 40% означает разное при 2 из 5 и при 80 из 200 ответов. Смотрите запланированные и валидные ответы, технически невалидные ответы, повторные попытки и отсутствующие строки. Одна неожиданная лишняя строка должна остановить цикл, а не раствориться в среднем.",
              "Повторная попытка относится только к одному конкретному технически невалидному ответу. Повтор всего семейства запросов или системы скрыто размножает запросы и может исказить выборку.",
            ],
          },
          {
            heading: "Сводите каждое утверждение к доказательству",
            paragraphs: [
              "Для находки по AI-ответу откройте запрос, снимок исходного ответа, систему, модель или поверхность, отметку времени, URL цитирований и статус валидации. Для находки по готовности сайта — URL страницы, текстовый или HTML-фрагмент, селектор, идентификатор и версию правила.",
              "URL цитирования доказывает, что ответ сослался на этот URL в сохранённом запуске. Это не доказывает автоматически корректность каждой фразы или поддержку конкретного утверждения источником — для этого нужна смысловая проверка цитирований.",
            ],
          },
          {
            heading: "Разделяйте наблюдение, интерпретацию и действие",
            paragraphs: [
              "Наблюдение описывает сохранённое доказательство. Интерпретация объясняет возможное значение. Рекомендация предлагает изменение. Сильный отчёт показывает эти слои отдельно и не выдаёт предполагаемую причину за измеренный факт.",
              "Автоматические рекомендации должны быть так и обозначены. Статус «Проверено экспертом» требует реальной записи о проверке качества: смысловые упоминания, цитирования, фактические ошибки и утверждённые приоритетные действия.",
            ],
          },
          {
            heading: "Используйте отчёт как контролируемый цикл",
            paragraphs: [
              "Выберите самое приоритетное исправление, подкреплённое доказательствами, посмотрите предпросмотр, внедрите его через процесс под контролем владельца и перепроверьте именно эту страницу. Готовность «до/после» хранится отдельно от AI-видимости «до/после».",
              "Для реального повторного замера сохраните ту же фиксацию конфигурации. Покажите наблюдаемое изменение со знаменателем и датой, а мониторинг продолжайте, только пока исходный замер остаётся сопоставимым.",
            ],
          },
        ],
        sources: [officialSources.googleStructuredData],
      },
      {
        section: "experiments",
        slug: "two-agent-code-review",
        title: "Проверка кода, написанного ИИ: как два агента ошиблись",
        summary:
          "Проверку кода вели два независимых агента. Оба уверенно объяснили красную проверку — и оба ошиблись. Вопрос закрыл сам файл сценария GitHub Actions.",
        label: "Опыт",
        readingTime: "6 мин",
        publishedAt: "2026-08-29",
        updatedAt: "2026-08-29",
        blocks: [
          {
            heading: "Что проверяли",
            paragraphs: [
              "Проверка кода, написанного ИИ, — то место, от которого зависит, стоит ли чего-нибудь весь остальной процесс. Ниже запись одного опыта с двумя независимыми проверяющими, включая ту часть, что не сработала: два агента подряд выдали уверенные, правдоподобные и неверные объяснения одной и той же проблемы — до того, как кто-то открыл файл, который закрыл вопрос.",
              "Записи опытов публикуются здесь только тогда, когда установку, входные данные и наблюдаемый результат можно воспроизвести. Этот — можно. Это одно наблюдение, а не исследование: n = 1.",
              "Гипотеза была такая: если два независимых агента читают один и тот же источник, а не пересказы друг друга, качество проверки растёт, а владелец перестаёт быть шиной между чатами.",
            ],
            figure: {
              diagram: "two-agent-review-before-after",
              alt: "Схема из двух частей. Было: владелец стоит между ChatGPT Work, Codex и Claude Code и вручную переносит отчёты из одного чата в другой. Стало: все трое читают один и тот же репозиторий GitHub напрямую, а владелец решает только то, что необратимо.",
              caption: "До и после. Раньше отчёты между инструментами переносил человек; теперь задача, код и машинные проверки лежат в GitHub, и каждый инструмент читает их сам.",
            },
          },
          {
            heading: "Установка",
            paragraphs: [
              "Claude Code запускается из файла сценария через опубликованный GitHub Action и срабатывает от упоминания @claude в комментарии к пул-реквесту или задаче. То есть вызывается вручную, но дальше читает сам пул-реквест, дифф и результаты CI, а не присланный пересказ.",
              "Репозиторий — форк. Вместе с ним достались чужие сценарии GitHub Actions, включая проверку подписи соглашения участника (CLA).",
            ],
            table: {
              caption: "Четыре компонента и зона ответственности каждого.",
              headers: ["Компонент", "Роль", "Оплата"],
              rows: [
                ["Рабочее пространство проекта", "Документы, данные, ТЗ", "Подписка"],
                ["Codex", "Пишет код и миграции, проверяет собственный дифф", "Подписка"],
                ["Claude Code", "Независимый аудит и проверка безопасности, запускается как GitHub Action", "OAuth-токен подписки, без API-ключа"],
                ["GitHub", "Общий источник: задача, код, дифф, машинные проверки", "—"],
              ],
            },
            figure: {
              diagram: "two-agent-review-cycle",
              alt: "Путь одной задачи: владелец формулирует замысел, проект хранит документы и данные, Codex и Claude Cowork независимо проверяют замысел, появляется утверждённое ТЗ, Codex пишет код в отдельной ветке, затем GitHub CI, Codex и Claude Code проверяют один и тот же коммит; ошибки возвращаются с конкретной правкой; владелец только мержит, тратит и публикует.",
              caption: "Проверка происходит дважды: сначала замысел, до первой строки кода, потом сам код — и оба проверяющих смотрят один и тот же коммит.",
            },
          },
          {
            heading: "Входные данные",
            paragraphs: [
              "Весь опыт шёл на четырёх артефактах — все они на месте, и каждый можно открыть заново.",
            ],
            points: [
              "Один пул-реквест, открыт с 26 августа 2026.",
              "Одна стабильно падающая проверка: «Verify CLA signature».",
              "История коммитов репозитория.",
              "Файл сценария с проверкой CLA и файл со списком подписантов, который он читает.",
            ],
          },
          {
            heading: "Два уверенных объяснения, оба неверные",
            paragraphs: [
              "Первый агент сообщил: красная отметка косметическая, у агентских коммитов она падает всегда, можно мержить мимо. Правдоподобно — предыдущий пул-реквест действительно был влит с той же красной отметкой.",
              "На перепроверку второй агент посмотрел историю коммитов, увидел, что коммиты владельца и коммиты агентов идут с разных адресов, и заключил: проверка сверяет автора коммита с подписантом соглашения, лечится одной строкой в настройках git. Тоже правдоподобно. Тоже неверно.",
              "Ни один из них не открыл файл сценария. Оба рассуждали о том, что проверка с таким названием, вероятно, делает.",
            ],
          },
          {
            heading: "Что сказал сам файл",
            paragraphs: [
              "Проверка не читает авторов коммитов вообще. Она берёт GitHub-логин автора пул-реквеста и ищет его в файле подписантов.",
              "Этот файл — реестр подписей проекта, от которого форкнут репозиторий. В нём десять логинов участников того проекта. Логина текущего владельца там нет, а вписать его означало бы подписать юридическое соглашение чужой компании.",
              "Значит, проверка останется красной навсегда. Она чинится не подписью, а правкой унаследованного сценария — в шапке которого написано, что владелец репозитория и коллабораторы освобождены от проверки, тогда как скрипт освобождает только ботов.",
            ],
            code: {
              caption: "Строка, которая закрыла вопрос, — из сценария проверки CLA.",
              content: "AUTHOR: ${{ github.event.pull_request.user.login }}",
            },
          },
          {
            heading: "Результат",
            paragraphs: [
              "Гипотеза подтвердилась в узком смысле и провалилась в широком.",
              "Подтвердилась в том, что верный ответ дало чтение источника. Провалилась как утверждение об агентах: второй агент верного ответа не дал. Два агента выдали два уверенных неверных ответа, а верный появился, когда открыли файл.",
              "Практическое правило отсюда не «используйте двух агентов». Оно такое: объяснение — не доказательство, каким бы гладким оно ни было, и оба проверяющих должны смотреть в один и тот же артефакт — тот же коммит, тот же файл, — иначе их согласие ничего не значит.",
            ],
          },
          {
            heading: "Границы",
            paragraphs: [
              "Это один случай, и читать его нужно как один случай.",
            ],
            points: [
              "n = 1. Он показывает, что такой отказ возможен, а не насколько часто он случается.",
              "Это не контролируемое сравнение. Агенты получили разные запросы и разный доступ. Качество моделей здесь не сравнивается.",
              "Это не доказательство ненадёжности агентов вообще. Это доказательство ненадёжности рассуждения о файле без чтения файла — что одинаково верно и для людей.",
              "Вечно красная проверка — сопутствующая причина. Статус, который всегда красный, перестают читать. Этот отказ организационный, а не технический.",
            ],
          },
          {
            heading: "Что осталось неизвестным",
            paragraphs: [
              "Два вопроса, которые этот опыт поднимает и не закрывает.",
            ],
            points: [
              "Добавляет ли второй проверяющий точности, если от обоих требовать ссылки на конкретные строки источника. Здесь это не проверялось.",
              "Как часто правдоподобные объяснения без источника переживают проверку двумя агентами, если никто не открывает исходный файл.",
            ],
          },
          {
            heading: "Как воспроизвести",
            paragraphs: [
              "Это воспроизводится на любом репозитории, форкнутом от проекта с собственной проверкой CLA.",
            ],
            steps: [
              "Форкните репозиторий, в котором есть собственная проверка CLA.",
              "Откройте пул-реквест с аккаунта, которого нет в списке подписантов исходного проекта.",
              "Спросите агента, почему проверка падает, не давая ему файл сценария.",
              "Попросите второго агента перепроверить первого — тоже без файла.",
              "Откройте каталог сценариев (.github/workflows) сами и сравните все три ответа.",
            ],
          },
        ],
        sources: [
          {
            title: "claude-code-action",
            href: "https://github.com/anthropics/claude-code-action",
            publisher: "Anthropic",
          },
          {
            title: "Elmo Contributor License Agreement",
            href: "https://github.com/elmohq/elmo/blob/main/CLA.md",
            publisher: "Blue Whale Software",
          },
        ],
        socialImage: {
          url: "/media/lab/two-agent-review-ru.png",
          alt: "До и после: владелец как шина между тремя чатами, затем GitHub как общий источник, который все трое читают сами.",
        },
        related: [
          { title: "Что такое AI Visibility", href: "/ru/lab/articles/what-is-ai-visibility" },
          { title: "Как проверить доказательства в отчёте AI Visibility", href: "/ru/lab/guides/read-ai-visibility-report-evidence" },
          { title: "Как подготовить сайт к работе ИИ-систем", href: "/ru/lab/guides/prepare-site-for-ai-systems" },
        ],
      },
      {
        section: "articles",
        slug: "restaurant-on-google-not-in-ai-recommendations",
        title: "Ресторан есть в Google, но ИИ его не рекомендует: где теряется видимость",
        metaTitle: "Почему ИИ не рекомендует ваш ресторан",
        summary:
          "Ресторан находится в Google, но не появляется в ответах ИИ? Проверьте запросы гостей, источники, конкурентов и путь к бронированию до правок на сайте.",
        label: "Практическая диагностика",
        readingTime: "8 минут",
        publishedAt: "2026-09-29",
        updatedAt: "2026-09-29",
        intro: [
          "Ресторан легко находится по названию в Google. У него есть сайт, карточка на карте и хорошие отзывы. Но когда гость спрашивает ИИ-ассистента: «Где спокойно поужинать рядом с центром?» — ресторан в ответе не появляется.",
          "Владелец видит один симптом: нас не рекомендуют. Но сбой может произойти на разных этапах. Поисковый робот может не получить доступ к сайту. Нужная информация может быть только на картинке с меню. ИИ может найти страницу, но не использовать её в ответе. Или ресторан назван, но гость не может проверить часы работы или перейти к бронированию.",
          "Поэтому полезный вопрос звучит не «Как поднять балл видимости в ИИ?», а «На каком этапе ресторан выпадает из пути, по которому гость принимает решение?»",
        ],
        blocks: [
          {
            heading: "Найтись по названию — не то же самое, что попасть в рекомендацию",
            paragraphs: [
              "Поиск по названию проверяет, может ли система узнать конкретное имя. Сценарий гостя проверяет другое: считает ли система ресторан подходящим под место, бюджет, кухню, повод, ограничения в питании и время.",
              "Запросы «Avli Bali» и «греческий ресторан в Убуде для ужина компанией из восьми человек» не равнозначны. В первом название уже дано. Во втором система должна сама выбрать ресторан среди альтернатив и объяснить, почему он подходит.",
              "Для диагностики разделите путь на четыре этапа:",
            ],
            flow: [
              {
                points: [
                  "Доступ: может ли система получить публичную информацию?",
                  "Соответствие: есть ли страница, которая отвечает на конкретную потребность гостя?",
                  "Включение: попал ли ресторан в ответ и какие источники показаны?",
                  "Действие: может ли гость проверить факты и перейти к бронированию, звонку или маршруту?",
                ],
              },
              { paragraph: "Если свести эти этапы к одной цифре, владелец не увидит, что именно нужно исправить." },
            ],
          },
          {
            heading: "Что на самом деле подтверждают источники",
            paragraphs: [],
            flow: [
              { subheading: "Google не требует специальной «разметки для ИИ»", tag: "ИЗВЛЕЧЕНО" },
              { paragraph: "В официальной документации Google сказано, что для обзоров от ИИ (AI Overviews) и режима ИИ (AI Mode) не нужны дополнительные технические требования или специальная разметка структурированных данных. Обычные основы поиска Google остаются в силе: страница должна быть доступна для обхода и пригодна для индексации, важная информация должна быть в виде текста, а структурированные данные должны соответствовать видимому содержанию." },
              { paragraph: "Google также предупреждает, что выполнение технических требований не гарантирует обход, индексацию или показ. Технически исправный сайт — необходимая основа, но он не доказывает, что ресторан будут рекомендовать." },
              { cite: officialSources.googleAiFeatures },
              { subheading: "Между страницей и рекомендацией есть измеримый промежуточный этап", tag: "ИЗВЛЕЧЕНО" },
              { paragraph: "В препринте Бенджамина Танненбаума (Benjamin Tannenbaum) от 19 сентября 2026 года проанализированы 34 960 наблюдений по 2 854 отслеживаемым небрендовым запросам в GPT и Gemini. Когда в наблюдаемом пути поиска не было ни самого бренда, ни его домена, бренд упоминался в 2,8% ответов GPT и 3,8% ответов Gemini. Когда появлялась ссылка на собственный домен, но не было поискового подзапроса с названием бренда, доля упоминаний составляла 49,0% и 58,4%." },
              { paragraph: "Автор прямо называет работу наблюдательной, а не причинной. Это не исследование ресторанов, выборка коммерческая (Aiso), и работа пока опубликована как препринт. Видимые ссылки к тому же не раскрывают весь внутренний поиск системы. Поэтому из исследования нельзя вывести «добавьте текстовое меню — и ИИ начнёт рекомендовать ресторан»." },
              { cite: officialSources.tannenbaumPromptToRecommendation },
              { subheading: "Сначала найдите этап потери, потом выбирайте исправление", tag: "ИНТЕРПРЕТИРОВАНО" },
              { paragraph: "Вместе эти источники дают практическую модель диагностики: готовность сайта, появление сайта среди источников, упоминание ресторана и возможность гостя действовать — это разные результаты." },
              { paragraph: "Если ИИ не может получить нужную информацию, улучшайте доступ или содержание. Если информация доступна, но система стабильно выбирает конкурентов, сравнивайте реальные ответы и процитированные страницы. Если ресторан уже появляется, но сведения неверны или бронирование не работает, проблема в точности и в следующем шаге гостя, а не просто в «ранжировании»." },
            ],
          },
          {
            heading: "Самопроверка: 30 ответов вместо одного размытого вопроса",
            paragraphs: [
              "Для первой диагностики не нужны сотни запросов. Возьмите пять действительно разных ситуаций гостя, проверьте их в двух ИИ-сервисах, которыми пользуется ваша аудитория, и повторите каждый запрос три раза. Получится 30 наблюдений.",
              "Примеры сценариев:",
            ],
            flow: [
              {
                steps: [
                  "Где спокойно поужинать вдвоём в районе [район]?",
                  "Какой ресторан в городе [город] подойдёт человеку, которому нужно вегетарианское меню или блюда без глютена?",
                  "Где забронировать стол на восемь человек после 20:00?",
                  "Какой ресторан рядом с [ориентир] открыт сегодня допоздна?",
                  "Где попробовать [блюдо] по средней цене?",
                ],
              },
              { paragraph: "Подставьте город, район, кухню и ограничения реальной аудитории ресторана. Не используйте пять пересказов запроса «лучший ресторан»: так вы пять раз проверите одну и ту же потребность." },
              { paragraph: "Для каждого ответа запишите:" },
              {
                points: [
                  "назван ли ресторан и на каком месте, если в ответе есть порядок;",
                  "кого рекомендуют вместо него;",
                  "какие ссылки или источники показаны;",
                  "может ли гость подтвердить меню, цену, часы работы и следующий шаг.",
                ],
              },
              { paragraph: "Не меняйте язык, город, страну доступа, режим сервиса и формулировку запроса. Если сервис не позволяет задать местоположение или не показывает источники, запишите это как ограничение, а не превращайте в ноль." },
            ],
          },
          {
            heading: "Что Selena Systems может проверить уже сейчас",
            paragraphs: [
              "Сейчас Selena Systems разделяет проверку готовности сайта и проверку ответов ИИ. Они отвечают на разные вопросы, и их нельзя подавать как один замер.",
            ],
            flow: [
              { subheading: "1. Готовность сайта: публичная проверка и проверка в проекте" },
              { paragraph: "Бесплатная публичная проверка готовности смотрит до пяти публичных страниц и открытые ресурсы для поисковых роботов. Она оценивает то, что видно на сайте: ответ сервера, правила robots.txt, канонические адреса, возможность индексации, структурированные данные, понятность описания бизнеса и путь клиента к действию. Она не обращается к платным ИИ-сервисам и не утверждает, что ChatGPT, Gemini или другая система рекомендует ресторан." },
              { paragraph: "Кроме того, в тестовой среде есть модуль, доступный после входа в кабинет. Он сохраняет датированный снимок проекта и план исправлений по наблюдаемым признакам сайта. Доступ к нему зависит от состояния проекта и учётной записи. Эта статья не утверждает, что клиентский прогон уже проведён." },
              { subheading: "2. Ограниченный сигнал о домене из двух ИИ-систем" },
              { paragraph: "Отдельный модуль в тестовой среде один раз проверяет один домен, приведённый к единому виду, в ChatGPT и Gemini. Он доступен подтверждённой учётной записи, если она соответствует условиям. Сейчас клиент видит по каждой системе только два результата: упомянут ли домен и сколько ссылок на источники вернулось. Полный текст ответа и адреса источников не показываются, и это не аудит конкурентов." },
              { paragraph: "Для полной диагностики ресторана Selena всё ещё нужны согласованный набор сценариев гостя, сохранённые ответы, конкуренты, источники и сопоставимый повторный тест. В публичных материалах такие замеры обозначены как ранний доступ; регулярную работу не стоит ожидать, пока её явно не включили." },
            ],
          },
          {
            heading: "Исправьте один выявленный разрыв",
            paragraphs: [
              "После самопроверки выберите один задокументированный сбой, а не пытайтесь «улучшить всё».",
            ],
            flow: [
              {
                points: [
                  "Страница недоступна или не индексируется. Исправьте конкретную проблему: robots.txt, блокировку на стороне сети доставки контента, канонический адрес или индексацию.",
                  "ИИ не может подтвердить блюдо, цену или ограничение в питании. Добавьте актуальную информацию видимым текстом на официальную страницу. Изображение меню можно оставить, но оно не должно быть единственным источником факта.",
                  "Сайт, карточка на карте и сервис бронирования противоречат друг другу. Определите верную версию и синхронизируйте часы работы, адрес, меню, контакты или правила бронирования.",
                  "Конкуренты появляются, а ресторан — нет. Изучите страницы, которые реально процитированы в этих ответах. Разница — это гипотеза для проверки, а не доказательство, почему выиграл конкурент.",
                  "Ресторан назван, но следующий шаг не работает. Исправьте кнопку, форму, телефон, ссылку на мессенджер или маршрут. Видимость без работающего действия — ещё не готовый путь к брони.",
                ],
              },
              { paragraph: "У каждого действия должны быть ответственный, срок, ссылка на исходное наблюдение и заранее определённая повторная проверка." },
            ],
          },
          {
            heading: "Повторный тест: то же самое в тех же условиях",
            paragraphs: [
              "После изменения повторите те же пять запросов в тех же двух сервисах, на том же языке, из той же страны доступа и с тем же числом повторов. Не перезаписывайте исходные ответы: новый прогон должен ссылаться на исходный замер.",
              "Сравнивайте по отдельности:",
            ],
            flow: [
              {
                points: [
                  "Доля упоминаний: в скольких действительных ответах назван ресторан?",
                  "Доля ссылок на официальный сайт: в скольких действительных ответах есть официальный домен?",
                  "Точность фактов: сколько проверяемых утверждений совпадает с актуальным официальным источником?",
                  "Полнота пути к действию: есть ли верный путь к бронированию, звонку или маршруту?",
                  "Набор конкурентов: какие заведения появляются вместо ресторана в каждом сценарии?",
                ],
              },
              { paragraph: "Если упоминаний стало больше, корректная формулировка такая: «После изменения мы наблюдали рост с X из Y до A из B в сопоставимом повторном тесте». Не пишите автоматически, что рост вызвало изменение: за это время могли измениться сама система, её индекс и конкуренты." },
              { paragraph: "Если ничего не изменилось, тест всё равно полезен. Он исключает одну гипотезу и не даёт дальше тратить деньги на правку, которая не решила наблюдаемую проблему." },
            ],
          },
          {
            heading: "Практический вывод",
            paragraphs: [
              "Ресторан может быть виден в Google и отсутствовать в рекомендациях ИИ — противоречия здесь нет. Поиск по названию подтверждает, что бренд существует. Рекомендация без названия проверяет, подходит ли заведение под конкретную ситуацию гостя и находит ли система в этот момент доказательства, которые считает полезными.",
              "Рабочая модель простая:",
              "проблема → факты → самопроверка → диагностика → одно действие → сопоставимый повторный тест",
              "Так владелец получает не абстрактный балл, а ясную картину: где ресторан теряет гостя и какое изменение стоит проверить первым.",
            ],
          },
        ],
        cta: {
          paragraphs: [
            "Начните с бесплатной проверки готовности сайта от Selena Systems. Если техническая основа в порядке, но ресторан не появляется в важных сценариях гостей, запросите диагностику видимости в ответах ИИ в раннем доступе: с фиксированными запросами, сохранёнными источниками, названными конкурентами и планом сопоставимого повторного теста.",
            "Обращение запускает обсуждение объёма работ, а не автоматический платный замер или оплату.",
          ],
          primary: { title: "Запустить проверку готовности", href: "/ru/check" },
          secondary: { title: "Подробнее о диагностике видимости", href: "/ru/visibility" },
        },
        sources: [officialSources.googleAiFeatures, officialSources.tannenbaumPromptToRecommendation],
        related: [
          { title: "Бесплатная проверка готовности сайта", href: "/ru/check" },
          { title: "Диагностика видимости в ответах ИИ", href: "/ru/visibility" },
          { title: "Методология замеров видимости", href: "/ru/methodology" },
          { title: "Как подготовить сайт к работе ИИ-систем", href: "/ru/lab/guides/prepare-site-for-ai-systems" },
        ],
      },
    ],
  },
};

// Entries written as files under data/lab join the hand-written ones here, so
// every list, route and sitemap entry sees one set.
const labItems = mergeLabItems(
  { en: handWrittenContent.en.items, ru: handWrittenContent.ru.items },
  readLabFiles(),
);

export const labContent: Record<LabLocale, LabLocaleContent> = {
  en: { ...handWrittenContent.en, items: labItems.en },
  ru: { ...handWrittenContent.ru, items: labItems.ru },
};

export const labSectionIds: LabSectionId[] = ["research", "guides", "experiments", "articles", "courses"];

export function labPath(locale: LabLocale, section?: LabSectionId, slug?: string) {
  const prefix = locale === "ru" ? "/ru/lab" : "/lab";
  return [prefix, section, slug].filter(Boolean).join("/");
}

export function labLanguages(section?: LabSectionId, slug?: string) {
  // An entry written in one language has no alternate to point at: a hreflang
  // to a Russian URL that 404s is worse than none.
  if (section && slug && !(getLabItem("en", section, slug) && getLabItem("ru", section, slug))) return undefined;
  return {
    "x-default": labPath("en", section, slug),
    en: labPath("en", section, slug),
    ru: labPath("ru", section, slug),
  };
}

export function getLabSection(locale: LabLocale, section: string) {
  return labContent[locale].sections.find((item) => item.id === section) ?? null;
}

export function getLabItems(locale: LabLocale, section?: string) {
  return section ? labContent[locale].items.filter((item) => item.section === section) : labContent[locale].items;
}

export function getLabItem(locale: LabLocale, section: string, slug: string) {
  return labContent[locale].items.find((item) => item.section === section && item.slug === slug) ?? null;
}
