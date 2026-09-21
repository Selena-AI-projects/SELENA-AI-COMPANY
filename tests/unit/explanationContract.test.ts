import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildExplanationResponseSchema,
  validateExplanationOutput,
} from "@/lib/visibility/explanation/contract";

/**
 * The explanation layer's boundary is enforced twice: the JSON schema given
 * to the model, and this independent, code-side re-check of the parsed
 * result. These tests cover the second layer — the one the model cannot
 * talk its way around by producing schema-valid-but-wrong JSON.
 */

test("the response schema has no field for score, severity, headline or verdict", () => {
  const schema = buildExplanationResponseSchema(["a", "b"]);
  const serialized = JSON.stringify(schema);
  for (const forbidden of ["score", "severity", "headline", "verdict", "ranking", "priority"]) {
    assert.ok(!serialized.toLowerCase().includes(forbidden), `schema must not mention "${forbidden}"`);
  }
  // The only place the model can put a value is inside findingExplanations.
  assert.deepEqual(Object.keys((schema as { properties: object }).properties), ["findingExplanations"]);
});

test("findingId is constrained to exactly the confirmed ids passed in", () => {
  const schema = buildExplanationResponseSchema(["finding-1", "finding-2"]);
  assert.deepEqual(
    [...schema.properties.findingExplanations.items.properties.findingId.enum],
    ["finding-1", "finding-2"],
  );
});

test("validateExplanationOutput drops any entry naming an id outside the confirmed set", () => {
  const confirmedIds = ["real-1", "real-2"];
  const result = validateExplanationOutput(
    {
      findingExplanations: [
        { findingId: "real-1", explanation: "Because your booking link is generic, not direct." },
        { findingId: "invented-finding-that-was-never-sent", explanation: "This should never appear." },
      ],
    },
    confirmedIds,
  );
  assert.ok(result);
  assert.equal(result!.findingExplanations.length, 1);
  assert.equal(result!.findingExplanations[0]!.findingId, "real-1");
});

test("validateExplanationOutput drops an empty or whitespace-only explanation", () => {
  const result = validateExplanationOutput(
    { findingExplanations: [{ findingId: "real-1", explanation: "   " }] },
    ["real-1"],
  );
  assert.equal(result!.findingExplanations.length, 0);
});

test("validateExplanationOutput rejects a malformed top-level shape instead of throwing", () => {
  assert.equal(validateExplanationOutput(null, ["a"]), null);
  assert.equal(validateExplanationOutput("not an object", ["a"]), null);
  assert.equal(validateExplanationOutput({ findingExplanations: "not an array" }, ["a"]), null);
  // `findingExplanations` missing entirely is malformed, not merely empty.
  assert.equal(validateExplanationOutput({}, ["a"]), null);
  // An explicit, well-formed empty array is a legitimate "nothing to add" result.
  assert.equal(validateExplanationOutput({ findingExplanations: [] }, ["a"])?.findingExplanations.length, 0);
});
