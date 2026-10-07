import { describe, expect, it } from "vitest";
import { generateComplaintsForScenario, DEFAULT_MODEL_DOCUMENTATION } from "../lib/scenarios";

describe("generateComplaintsForScenario", () => {
  it("is deterministic across repeated calls", () => {
    const a = generateComplaintsForScenario("fair-system", DEFAULT_MODEL_DOCUMENTATION);
    const b = generateComplaintsForScenario("fair-system", DEFAULT_MODEL_DOCUMENTATION);
    expect(a).toEqual(b);
  });

  it("generates approximately 5000 records", () => {
    const records = generateComplaintsForScenario("fair-system", DEFAULT_MODEL_DOCUMENTATION);
    expect(records.length).toBeGreaterThanOrEqual(4900);
    expect(records.length).toBeLessThanOrEqual(5100);
  });

  it("gives Bengali fewer than 30 complaints in the insufficient-data scenario", () => {
    const records = generateComplaintsForScenario("insufficient-data", DEFAULT_MODEL_DOCUMENTATION);
    const bengali = records.filter((r) => r.language === "Bengali");
    expect(bengali.length).toBeLessThan(30);
  });

  it("produces unique complaint ids", () => {
    const records = generateComplaintsForScenario("regional-language-bias", DEFAULT_MODEL_DOCUMENTATION);
    const ids = new Set(records.map((r) => r.complaint_id));
    expect(ids.size).toBe(records.length);
  });
});
