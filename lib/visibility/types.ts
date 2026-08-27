export type VisibilityLocale = "en" | "ru";
export type SiteProfile = "all_checks" | "content_site" | "api_application" | "commerce";

export type MetricDefinition = {
  name: string;
  definition: string;
};

export type MeasurementBoundaryContent = {
  heading: string;
  whatWeMeasure: string[];
  whatWeDontMeasure: string[];
};

/**
 * Intake for the free check. Deliberately short: the visitor gets a real
 * result on this page. The URL is the only required input; profile and
 * primary action merely improve applicability and remediation quality.
 */
export type CheckFormCopy = {
  title: string;
  intro: string;
  formTitle: string;
  formIntro: string;
  fields: {
    website: string;
    websiteHint: string;
    siteProfile: string;
    siteProfileHint: string;
    primaryAction: string;
    primaryActionHint: string;
  };
  profileOptions: Record<SiteProfile, string>;
  /** Option labels keyed by the PrimaryAction union members. */
  primaryActionOptions: Record<string, string>;
  /** What the visitor gets, stated before they submit. */
  whatYouGet: { heading: string; items: string[] };
  submitLabel: string;
  submittingLabel: string;
  errors: {
    website: string;
  };
  networkError: string;
};

/** Copy for the live result rendered on the page right after the check runs. */
export type LiveReportCopy = {
  running: { heading: string; steps: string[] };
  heading: string;
  overallScoreLabel: string;
  profileLabel: string;
  readinessDisclaimer: string;
  checkedLabel: string;
  checkedAtLabel: string;
  pagesLabel: string;
  remainingLabel: string;
  componentsHeading: string;
  componentsIntro: string;
  diagnosticOnlyLabel: string;
  coverageLabel: string;
  crawlerHeading: string;
  crawlerIntro: string;
  crawlerColumns: { crawler: string; userAgent: string; status: string; evidence: string };
  crawlerStatusLabels: { allowed: string; blocked: string; unknown: string };
  standardsHeading: string;
  standardsIntro: string;
  standardsColumns: { check: string; status: string; target: string };
  standardStatusLabels: { passed: string; warning: string; failed: string; not_applicable: string; unknown: string };
  categorySummary: { applicable: string; passed: string; warning: string; failed: string; notApplicable: string };
  explanationLabel: string;
  verificationLabel: string;
  platformLabel: string;
  instructionsHeading: string;
  instructionsIntro: string;
  /** Client-friendly standalone HTML downloads: full audit and fixes-only. */
  downloadReportLabel: string;
  downloadFixesLabel: string;
  downloadHint: string;
  copyAllLabel: string;
  downloadMarkdownLabel: string;
  copyAgentPromptLabel: string;
  blocksHeading: string;
  blocksIntro: string;
  blockTypeLabels: Record<string, string>;
  shownLabel: string;
  providerCallsLabel: string;
  goodHeading: string;
  goodIntro: string;
  goodEmpty: string;
  problemsHeading: string;
  problemsIntro: string;
  problemsEmpty: string;
  fixHeading: string;
  fixIntro: string;
  howToFixLabel: string;
  doesNotProveLabel: string;
  evidenceLabel: string;
  ruleLabel: string;
  generatedFixLabel: string;
  beforeLabel: string;
  proposedLabel: string;
  previewOnlyLabel: string;
  copyFixLabel: string;
  nextHeading: string;
  nextIntro: string;
  layersHeading: string;
  layersIntro: string;
  layerTitles: Record<string, string>;
  layerQuestions: Record<string, string>;
  scoreSuffix: string;
  notMeasuredLabel: string;
  layerPassedLabel: string;
  layerProblemsLabel: string;
  severityLabels: { critical: string; important: string; later: string };
  unreachable: { heading: string; body: string };
  errors: { rateLimited: string; generic: string };
  restartLabel: string;
  verifyHeading: string;
  verifyIntro: string;
  verifyLabel: string;
  verifyingLabel: string;
  comparisonLabel: string;
  baselineLabel: string;
  verifiedLabel: string;
  deltaLabel: string;
  comparisonBoundary: string;
  /**
   * Unscored Local AI Readiness section. The disclaimer is mandatory copy:
   * readiness never claims presence in Ask Maps or any local AI surface.
   * The CTA renders only when the report says localAiCtaEnabled.
   */
  localAi: {
    heading: string;
    intro: string;
    disclaimer: string;
    ctaLabel: string;
    ctaHref: string;
  };
  /** The free-methodology tiles: what the check did and did not do. */
  freeMethod: {
    checksLabel: string;
    pagesLabel: string;
    aiAnswersLabel: string;
    priceLabel: string;
  };
  /** Paid-report sections named honestly as locked, never previewed with fake data. */
  lockedItems: { title: string; body: string }[];
  cta: {
    heading: string;
    body: string;
    primary: { label: string; href: string };
    secondary: { label: string; href: string };
  };
};

export type ProductPathStep = {
  title: string;
  description: string;
};

/** The four measurement layers (Codex Execution TZ V1.2, decision 11). */
export type MeasurementLayersContent = {
  eyebrow: string;
  headline: string;
  intro: string;
  layers: { id: string; title: string; question: string; description: string }[];
};

/** Human-ready / Machine-readable / Agent-executable definitions (decisions 12–13). */
export type ActionReadinessContent = {
  eyebrow: string;
  headline: string;
  intro: string;
  states: { id: string; label: string; definition: string; example: string; doesNotProve: string }[];
  caveat: string;
};

export type LocalBusinessModeContent = {
  eyebrow: string;
  headline: string;
  intro: string;
  mayInclude: string[];
  boundary: string;
};

export type NotClaimedContent = {
  heading: string;
  items: string[];
};

export type PricingPlanStatus = "beta" | "founding_soon" | "active";

export type PricingPlan = {
  name: string;
  price: string;
  statusLabel: string;
  status: PricingPlanStatus;
  description: string;
  systemsLabel: string;
  volumeLabel: string;
  progressionLabel: string;
  features: string[];
  featured?: boolean;
  href?: string;
  ctaLabel?: string;
};

export type PricingTrackContent = {
  title: string;
  intro: string;
  plans: PricingPlan[];
};

export type SampleReportContent = {
  badge: string;
  domain: string;
  brand: string;
  market: string;
  language: string;
  checkedLabel: string;
  checkedDate: string;
  methodologyLabel: string;
  promptSetLabel: string;
  sampleLabel: string;
  metrics: { label: string; value: string }[];
  disclaimer: string;
};

export type VisibilityFaqItem = { q: string; a: string };

export type VisibilityContent = {
  locale: VisibilityLocale;
  nav: {
    label: string;
  };
  homeTeaser: {
    eyebrow: string;
    headline: string;
    intro: string;
    formNote: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  hero: {
    eyebrow: string;
    title: string;
    intro: string;
  };
  metrics: MetricDefinition[];
  measurementBoundary: MeasurementBoundaryContent;
  /** Free Public Readiness boundary. Kept separate from paid AI measurement copy. */
  freeMeasurementBoundary: MeasurementBoundaryContent;
  measurementLayers: MeasurementLayersContent;
  actionReadiness: ActionReadinessContent;
  localBusinessMode: LocalBusinessModeContent;
  notClaimed: NotClaimedContent;
  productPath: {
    eyebrow: string;
    headline: string;
    intro: string;
    steps: ProductPathStep[];
  };
  methodology: {
    eyebrow: string;
    title: string;
    intro: string;
    evidenceKinds: { name: string; description: string }[];
    versioning: string;
    privacyBoundary: string;
    supported: string[];
    notYetSupported: string[];
  };
  checkForm: CheckFormCopy;
  liveReport: LiveReportCopy;
  pricing: {
    eyebrow: string;
    title: string;
    intro: string;
    freePlan: {
      name: string;
      price: string;
      /** Column eyebrow so the free entry reads as part of the same ladder. */
      trackLabel: string;
      statusLabel: string;
      description: string;
      boundary: string;
      /** Comparison-row values so Free renders in the same grid as paid plans. */
      systemsLabel: string;
      volumeLabel: string;
      progressionLabel: string;
      features: string[];
      href: string;
      ctaLabel: string;
    };
    paidPlans: {
      heading: string;
      intro: string;
      comparisonLabels: {
        offer: string;
        status: string;
        bestFor: string;
        systems: string;
        scope: string;
        difference: string;
        included: string;
      };
    };
    directory: {
      heading: string;
      intro: string;
      visibility: {
        title: string;
        count: string;
        description: string;
        href: string;
        ctaLabel: string;
      };
      systems: {
        title: string;
        count: string;
        description: string;
        href: string;
        ctaLabel: string;
      };
    };
    portal: { label: string; href: string; note: string };
    disclosure: string;
    tracks: PricingTrackContent[];
  };
  faq: VisibilityFaqItem[];
  cta: {
    primary: { label: string; href: string };
    secondary: { label: string; href: string };
    /** Says where the full line-by-line plan comparison lives, since this page states prices once. */
    compareNote: string;
  };
};
