import { describe, expect, it } from "vitest";
import { generateComplaintsForScenario, DEFAULT_MODEL_DOCUMENTATION } from "../lib/scenarios";
import { runAnalysis, FAIRNESS_THRESHOLD_RATIO } from "../lib/analysis";

function groupRate(analysis: ReturnType<typeof runAnalysis>, language: string) {
  return analysis.byLanguage.groups.find((g) => g.group === language);
}

describe("runAnalysis", () => {
  it("fair system: no group exceeds the fairness threshold", () => {
    const records = generateComplaintsForScenario("fair-system", DEFAULT_MODEL_DOCUMENTATION);
    const analysis = runAnalysis(records, DEFAULT_MODEL_DOCUMENTATION);
    for (const g of analysis.severityAdjusted.groups) {
      expect(g.adjustedRatio).toBeLessThan(FAIRNESS_THRESHOLD_RATIO);
    }
  });

  it("regional-language bias: Marathi is roughly 2-2.5x English and stays elevated after adjustment", () => {
    const records = generateComplaintsForScenario("regional-language-bias", DEFAULT_MODEL_DOCUMENTATION);
    const analysis = runAnalysis(records, DEFAULT_MODEL_DOCUMENTATION);

    const english = groupRate(analysis, "English")!;
    const marathi = groupRate(analysis, "Marathi")!;

    expect(english.lowPriorityRate).toBeGreaterThan(0.15);
    expect(english.lowPriorityRate).toBeLessThan(0.25);
    expect(marathi.lowPriorityRate).toBeGreaterThan(0.4);
    expect(marathi.lowPriorityRate).toBeLessThan(0.55);

    const marathiAdjusted = analysis.severityAdjusted.groups.find((g) => g.group === "Marathi")!;
    expect(marathiAdjusted.adjustedRatio).toBeGreaterThan(FAIRNESS_THRESHOLD_RATIO);
  });

  it("explained gap: raw disparity shrinks substantially after severity adjustment", () => {
    const records = generateComplaintsForScenario("explained-gap", DEFAULT_MODEL_DOCUMENTATION);
    const analysis = runAnalysis(records, DEFAULT_MODEL_DOCUMENTATION);

    const tamilRaw = analysis.severityAdjusted.groups.find((g) => g.group === "Tamil")!;
    expect(tamilRaw.rawGap).toBeGreaterThan(0);
    expect(Math.abs(tamilRaw.adjustedGap)).toBeLessThan(Math.abs(tamilRaw.rawGap) * 0.3);
    expect(tamilRaw.adjustedRatio).toBeLessThan(FAIRNESS_THRESHOLD_RATIO);
  });

  it("insufficient data: Bengali is flagged as an insufficient sample", () => {
    const records = generateComplaintsForScenario("insufficient-data", DEFAULT_MODEL_DOCUMENTATION);
    const analysis = runAnalysis(records, DEFAULT_MODEL_DOCUMENTATION);
    const bengaliFlag = analysis.sampleSizeFlags.find((f) => f.group === "Bengali")!;
    expect(bengaliFlag.sufficientSample).toBe(false);
    expect(bengaliFlag.n).toBeLessThan(30);
  });

  it("error assessment is unavailable when ground truth is excluded", () => {
    const docs = { ...DEFAULT_MODEL_DOCUMENTATION, includeErrorGroundTruth: false };
    const records = generateComplaintsForScenario("fair-system", docs);
    const analysis = runAnalysis(records, docs);
    expect(analysis.errorAssessmentAvailable).toBe(false);
    expect(analysis.errorIndicatorsByLanguage).toEqual([]);
  });

  it("flags prohibited variables when documented as model inputs", () => {
    const docs = { ...DEFAULT_MODEL_DOCUMENTATION, usesLanguageAsInput: true };
    const records = generateComplaintsForScenario("fair-system", docs);
    const analysis = runAnalysis(records, docs);
    const languageCheck = analysis.modelInputChecks.find((c) => c.variable === "language")!;
    expect(languageCheck.violation).toBe(true);
  });

  it("gender and religion are always classified as prohibited", () => {
    const records = generateComplaintsForScenario("fair-system", DEFAULT_MODEL_DOCUMENTATION);
    const analysis = runAnalysis(records, DEFAULT_MODEL_DOCUMENTATION);
    const genderCheck = analysis.modelInputChecks.find((c) => c.variable === "gender")!;
    const religionCheck = analysis.modelInputChecks.find((c) => c.variable === "religion")!;
    expect(genderCheck.approvalStatus).toBe("PROHIBITED");
    expect(genderCheck.violation).toBe(false);
    expect(religionCheck.approvalStatus).toBe("PROHIBITED");
    expect(religionCheck.violation).toBe(false);
  });

  it("flags gender/religion as violations when documented as model inputs", () => {
    const docs = { ...DEFAULT_MODEL_DOCUMENTATION, usesGenderAsInput: true, usesReligionAsInput: true };
    const records = generateComplaintsForScenario("fair-system", docs);
    const analysis = runAnalysis(records, docs);
    expect(analysis.modelInputChecks.find((c) => c.variable === "gender")!.violation).toBe(true);
    expect(analysis.modelInputChecks.find((c) => c.variable === "religion")!.violation).toBe(true);
  });
});
