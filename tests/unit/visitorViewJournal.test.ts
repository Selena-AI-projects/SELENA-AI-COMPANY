import assert from "node:assert/strict";
import test from "node:test";
import {
  type VisitorViewSurfaceResult,
  visitorCoverage,
  visitorMentionRate,
} from "@/lib/visibility-log/data";

const surface = (over: Partial<VisitorViewSurfaceResult> = {}): VisitorViewSurfaceResult => ({
  surface: "ChatGPT",
  answersRequested: 25,
  answersReceived: 25,
  brandMentions: 4,
  ...over,
});

test("a rate is published only when most of the sample came back", () => {
  assert.equal(visitorMentionRate(surface()), 4 / 25);
  // 20 of 25 is the floor, and it holds.
  assert.equal(visitorMentionRate(surface({ answersReceived: 20, brandMentions: 4 })), 4 / 20);
});

test("a rate over a fraction of the sample is withheld, not rounded", () => {
  // Two answers of twenty-five said nothing about the other twenty-three.
  assert.equal(visitorMentionRate(surface({ answersReceived: 2, brandMentions: 0 })), null);
  assert.equal(visitorMentionRate(surface({ answersReceived: 0, brandMentions: 0 })), null);
});

test("coverage is reported even where a rate is not", () => {
  assert.equal(visitorCoverage(surface({ answersReceived: 2 })), 2 / 25);
  assert.equal(visitorCoverage(surface()), 1);
  assert.equal(visitorCoverage(surface({ answersRequested: 0, answersReceived: 0 })), 0);
});
