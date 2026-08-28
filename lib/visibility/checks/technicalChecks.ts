import {
  comparisonSignals,
  declaresSameAs,
  extractHtmlSignals,
  hasAboutLink,
  hasContactPath,
  hasOrgLikeJsonLd,
  findServicePageLink,
  namesAnAuthor,
  publishesADate,
  type HtmlSignals,
} from "./htmlSignals";

export type CheckState = "pass" | "warn" | "fail" | "not_measured";

export interface CheckResult {
  ruleId: string;
  dimension: "access" | "identity" | "offer" | "conversion";
  state: CheckState;
  evidence: Record<string, unknown>;
}

export interface PageFetchForChecks {
  requestedUrl: string;
  finalUrl: string;
  statusCode: number;
  headers: Record<string, string>;
  html: string | null;
  fetchError?: string;
}

export interface DiscoveryContext {
  sitemapFound: boolean;
}

/**
 * Deterministic technical checks (SSOT §8.2). Every result is `pass`,
 * `warn`, `fail` or `not_measured` — never a silently-invented number.
 * `not_measured` is used whenever the evidence needed genuinely isn't
 * available (fetch failed, no HTML), so scoring can exclude it from the
 * denominator instead of counting it as a failure (SSOT §8.3).
 */
export function runTechnicalChecks(page: PageFetchForChecks, discovery: DiscoveryContext): CheckResult[] {
  const results: CheckResult[] = [];

  results.push({
    ruleId: "access.fetchable",
    dimension: "access",
    state: page.fetchError ? "fail" : page.statusCode >= 200 && page.statusCode < 400 ? "pass" : "fail",
    evidence: { statusCode: page.statusCode, fetchError: page.fetchError ?? null, finalUrl: page.finalUrl },
  });

  if (!page.html) {
    const notMeasured: CheckResult["ruleId"][] = [
      "access.noindex",
      "access.canonical",
      "access.viewport",
      "identity.jsonld_valid",
      "identity.jsonld_entity_present",
      "identity.brand_name_consistent",
      "identity.author_named",
      "identity.dated",
      "identity.same_as",
      "offer.comparison_readable",
      "offer.title_present",
      "offer.single_h1",
      "conversion.contact_path_present",
    ];
    for (const ruleId of notMeasured) {
      results.push({
        ruleId,
        dimension: ruleId.split(".")[0] as CheckResult["dimension"],
        state: "not_measured",
        evidence: { reason: "no_html_available" },
      });
    }
    results.push({
      ruleId: "access.sitemap_discovered",
      dimension: "access",
      state: discovery.sitemapFound ? "pass" : "warn",
      evidence: { sitemapFound: discovery.sitemapFound },
    });
    results.push({
      ruleId: "offer.service_page_discovered",
      dimension: "offer",
      state: "not_measured",
      evidence: { reason: "no_html_available" },
    });
    results.push({
      ruleId: "conversion.about_page_discovered",
      dimension: "conversion",
      state: "not_measured",
      evidence: { reason: "no_html_available" },
    });
    const cacheControlWithoutHtml = page.headers["cache-control"] ?? null;
    results.push({
      ruleId: "access.cacheable",
      dimension: "access",
      state: cacheControlWithoutHtml
        ? /no-store/i.test(cacheControlWithoutHtml)
          ? "warn"
          : "pass"
        : "not_measured",
      evidence: { cacheControl: cacheControlWithoutHtml },
    });
    return results;
  }

  const signals = extractHtmlSignals(page.html);

  const xRobotsTag = page.headers["x-robots-tag"] ?? null;
  const metaRobotsBlocksIndex = signals.metaRobots ? /noindex/i.test(signals.metaRobots) : false;
  const headerBlocksIndex = xRobotsTag ? /noindex/i.test(xRobotsTag) : false;
  results.push({
    ruleId: "access.noindex",
    dimension: "access",
    state: metaRobotsBlocksIndex || headerBlocksIndex ? "fail" : "pass",
    evidence: { metaRobots: signals.metaRobots, xRobotsTag },
  });

  results.push({
    ruleId: "access.canonical",
    dimension: "access",
    state: signals.canonicalUrl ? "pass" : "warn",
    evidence: { canonicalUrl: signals.canonicalUrl },
  });

  results.push({
    ruleId: "access.viewport",
    dimension: "access",
    state: signals.hasViewportMeta ? "pass" : "warn",
    evidence: { hasViewportMeta: signals.hasViewportMeta },
  });

  results.push({
    ruleId: "access.sitemap_discovered",
    dimension: "access",
    state: discovery.sitemapFound ? "pass" : "warn",
    evidence: { sitemapFound: discovery.sitemapFound },
  });

  const hasJsonLd = signals.jsonLdBlocks.length > 0 || signals.jsonLdParseErrors > 0;
  results.push({
    ruleId: "identity.jsonld_valid",
    dimension: "identity",
    state: !hasJsonLd ? "warn" : signals.jsonLdParseErrors > 0 ? "fail" : "pass",
    evidence: { blocksFound: signals.jsonLdBlocks.length, parseErrors: signals.jsonLdParseErrors },
  });

  const orgLikePresent = hasOrgLikeJsonLd(signals);
  results.push({
    ruleId: "identity.jsonld_entity_present",
    dimension: "identity",
    state: orgLikePresent ? "pass" : "warn",
    evidence: { orgLikeEntityPresent: orgLikePresent },
  });

  results.push({
    ruleId: "identity.brand_name_consistent",
    dimension: "identity",
    state: signals.title ? "pass" : "not_measured",
    evidence: { title: signals.title },
  });

  results.push({
    ruleId: "offer.title_present",
    dimension: "offer",
    state: signals.title && signals.title.length > 0 ? "pass" : "fail",
    evidence: { title: signals.title },
  });

  results.push({
    ruleId: "offer.single_h1",
    dimension: "offer",
    state: signals.h1Count === 1 ? "pass" : signals.h1Count === 0 ? "fail" : "warn",
    evidence: { h1Count: signals.h1Count, h1Text: signals.h1Text },
  });

  const servicePageLink = findServicePageLink(signals);
  results.push({
    ruleId: "offer.service_page_discovered",
    dimension: "offer",
    state: servicePageLink ? "pass" : "warn",
    evidence: { servicePageLink },
  });

  results.push({
    ruleId: "conversion.contact_path_present",
    dimension: "conversion",
    state: hasContactPath(signals) ? "pass" : "fail",
    evidence: { hasContactPath: hasContactPath(signals) },
  });

  results.push({
    ruleId: "conversion.about_page_discovered",
    dimension: "conversion",
    state: hasAboutLink(signals) ? "pass" : "warn",
    evidence: { hasAboutLink: hasAboutLink(signals) },
  });

  const authorNamed = namesAnAuthor(signals);
  results.push({
    ruleId: "identity.author_named",
    dimension: "identity",
    state: authorNamed ? "pass" : "warn",
    evidence: { authorNamed },
  });

  const dated = publishesADate(signals);
  results.push({
    ruleId: "identity.dated",
    dimension: "identity",
    state: dated ? "pass" : "warn",
    evidence: { dated },
  });

  const sameAs = declaresSameAs(signals);
  results.push({
    ruleId: "identity.same_as",
    dimension: "identity",
    // Only meaningful where the page describes an entity at all: a page with
    // no organization node is not withholding its profiles, it has none to
    // withhold.
    state: !orgLikePresent ? "not_measured" : sameAs.length > 0 ? "pass" : "warn",
    evidence: { sameAs, entityPresent: orgLikePresent },
  });

  const comparison = comparisonSignals(page.html, signals);
  results.push({
    ruleId: "offer.comparison_readable",
    dimension: "offer",
    state: !comparison.looksLikeComparison
      ? "not_measured"
      : comparison.hasTable
        ? "pass"
        : "warn",
    evidence: comparison,
  });

  const cacheControl = page.headers["cache-control"] ?? null;
  const uncacheable = cacheControl ? /no-store/i.test(cacheControl) : false;
  results.push({
    ruleId: "access.cacheable",
    dimension: "access",
    state: uncacheable ? "warn" : "pass",
    evidence: { cacheControl },
  });

  return results;
}

export type { HtmlSignals };
