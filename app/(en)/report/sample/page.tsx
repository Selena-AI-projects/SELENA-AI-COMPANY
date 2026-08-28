import { notFound } from "next/navigation";

/**
 * Retired legacy sample surface. Free users receive the canonical, live
 * Public Readiness result at /check; illustrative AI-answer data must not be
 * reachable as a free report through a feature flag or an old bookmark.
 */
export default function SampleReportPage(): never {
  notFound();
}
