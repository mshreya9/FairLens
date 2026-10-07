import { describe, expect, it } from "vitest";
import { generateComplaintsForScenario, DEFAULT_MODEL_DOCUMENTATION } from "../lib/scenarios";
import { runAnalysis } from "../lib/analysis";
import { evaluatePolicy } from "../lib/policy";

function reviewScenario(scenario: Parameters<typeof generateComplaintsForScenario>[0], docs = DEFAULT_MODEL_DOCUMENTATION) {
  const records = generateComplaintsForScenario(scenario, docs);
  const analysis = runAnalysis(records, docs);
  return evaluatePolicy(analysis);
}

describe("evaluatePolicy", () => {
  it("Test 1: fair dataset -> PROCEED", () => {
    expect(reviewScenario("fair-system").status).toBe("PROCEED");
  });

  it("Test 2: biased dataset -> ESCALATE_TO_HUMAN_REVIEW", () => {
    expect(reviewScenario("regional-language-bias").status).toBe("ESCALATE_TO_HUMAN_REVIEW");
  });

  it("Test 3: explained gap -> should not automatically escalate", () => {
    expect(reviewScenario("explained-gap").status).not.toBe("ESCALATE_TO_HUMAN_REVIEW");
  });

  it("Test 4: small sample -> PROCEED_WITH_CONDITIONS", () => {
    expect(reviewScenario("insufficient-data").status).toBe("PROCEED_WITH_CONDITIONS");
  });

  it("Test 5: missing error field does not invent an error rate", () => {
    const docs = { ...DEFAULT_MODEL_DOCUMENTATION, includeErrorGroundTruth: false };
    const records = generateComplaintsForScenario("fair-system", docs);
    const analysis = runAnalysis(records, docs);
    expect(analysis.errorAssessmentAvailable).toBe(false);
    expect(analysis.errorIndicatorsByLanguage.length).toBe(0);
  });

  it("Test 6: prohibited model input -> escalation", () => {
    const docs = { ...DEFAULT_MODEL_DOCUMENTATION, usesLanguageAsInput: true };
    expect(reviewScenario("fair-system", docs).status).toBe("ESCALATE_TO_HUMAN_REVIEW");
  });

  it("Test 7: customer value without approval -> condition or escalation", () => {
    const docs = {
      ...DEFAULT_MODEL_DOCUMENTATION,
      usesCustomerValueAsInput: true,
      customerValueDocumented: false,
    };
    const result = reviewScenario("fair-system", docs);
    expect(["PROCEED_WITH_CONDITIONS", "ESCALATE_TO_HUMAN_REVIEW"]).toContain(result.status);
  });

  it("Test 8: severity adjustment changes a raw disparity into an explained gap", () => {
    const records = generateComplaintsForScenario("explained-gap", DEFAULT_MODEL_DOCUMENTATION);
    const analysis = runAnalysis(records, DEFAULT_MODEL_DOCUMENTATION);
    const tamil = analysis.severityAdjusted.groups.find((g) => g.group === "Tamil")!;
    expect(Math.abs(tamil.rawGap)).toBeGreaterThan(Math.abs(tamil.adjustedGap));
  });

  it("Test 9: gender as a model input -> escalation (guardrail)", () => {
    const docs = { ...DEFAULT_MODEL_DOCUMENTATION, usesGenderAsInput: true };
    expect(reviewScenario("fair-system", docs).status).toBe("ESCALATE_TO_HUMAN_REVIEW");
  });

  it("Test 10: religion as a model input -> escalation (guardrail)", () => {
    const docs = { ...DEFAULT_MODEL_DOCUMENTATION, usesReligionAsInput: true };
    expect(reviewScenario("fair-system", docs).status).toBe("ESCALATE_TO_HUMAN_REVIEW");
  });

  it("Test 11: gender and religion show no disparity even in the biased scenario", () => {
    const records = generateComplaintsForScenario("regional-language-bias", DEFAULT_MODEL_DOCUMENTATION);
    const analysis = runAnalysis(records, DEFAULT_MODEL_DOCUMENTATION);
    for (const g of analysis.byGender.groups) {
      if (g.group === analysis.byGender.benchmarkGroup || !g.sufficientSample) continue;
      expect(g.rateRatio).toBeLessThanOrEqual(1.25);
    }
    for (const g of analysis.byReligion.groups) {
      if (g.group === analysis.byReligion.benchmarkGroup || !g.sufficientSample) continue;
      expect(g.rateRatio).toBeLessThanOrEqual(1.25);
    }
  });
});
