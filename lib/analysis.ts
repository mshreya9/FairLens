// Deterministic statistical analysis engine.
//
// Design rule: the LLM must never be responsible for statistical calculations.
// Everything in this file is plain TypeScript arithmetic, reproducible,
// auditable, and testable in isolation of any AI call.

import type {
  AnalysisResult,
  BenchmarkAnalysis,
  ComplaintRecord,
  ErrorIndicator,
  GroupRate,
  ModelDocumentation,
  ModelInputCheckItem,
  ProxyAssociation,
  RawDisparity,
  ResolutionStats,
  SampleSizeFlag,
  Severity,
  SeverityAdjustedAnalysis,
  SeverityAdjustedGroup,
} from "./types";

export const MIN_SAMPLE_SIZE = 30;
export const FAIRNESS_THRESHOLD_RATIO = 1.25;

const SLA_DAYS: Record<Severity, number> = {
  Critical: 1,
  High: 5,
  Standard: 15,
};

const SEVERITIES: Severity[] = ["Critical", "High", "Standard"];

function groupByField<K extends keyof ComplaintRecord>(
  records: ComplaintRecord[],
  field: K
): Map<ComplaintRecord[K], ComplaintRecord[]> {
  const map = new Map<ComplaintRecord[K], ComplaintRecord[]>();
  for (const r of records) {
    const key = r[field];
    const bucket = map.get(key);
    if (bucket) bucket.push(r);
    else map.set(key, [r]);
  }
  return map;
}

function lowPriorityRate(records: ComplaintRecord[]): { n: number; lowCount: number; rate: number } {
  const n = records.length;
  const lowCount = records.filter((r) => r.ai_priority === "Low").length;
  return { n, lowCount, rate: n > 0 ? lowCount / n : 0 };
}

/**
 * Builds a benchmark analysis for one categorical field (e.g. language).
 * The reference/benchmark group is the largest group meeting the minimum
 * sample size. This mirrors how the bank's analysts compare minority
 * groups against the majority group rather than an abstract grand mean.
 */
export function buildBenchmarkAnalysis<K extends keyof ComplaintRecord>(
  records: ComplaintRecord[],
  field: K,
  minSample: number = MIN_SAMPLE_SIZE
): BenchmarkAnalysis {
  const grouped = groupByField(records, field);
  const groupStats = Array.from(grouped.entries()).map(([key, recs]) => {
    const { n, lowCount, rate } = lowPriorityRate(recs);
    return { group: String(key), n, lowCount, rate };
  });

  const eligible = groupStats.filter((g) => g.n >= minSample);
  const benchmark =
    eligible.length > 0
      ? eligible.reduce((a, b) => (b.n > a.n ? b : a))
      : groupStats.reduce((a, b) => (b.n > a.n ? b : a));

  const groups: GroupRate[] = groupStats.map((g) => ({
    group: g.group,
    n: g.n,
    lowPriorityCount: g.lowCount,
    lowPriorityRate: g.rate,
    rateRatio: benchmark.rate > 0 ? g.rate / benchmark.rate : 0,
    sufficientSample: g.n >= minSample,
  }));

  const sufficientGroups = groups.filter((g) => g.sufficientSample);
  const highestRate =
    sufficientGroups.length > 0
      ? Math.max(...sufficientGroups.map((g) => g.lowPriorityRate))
      : null;
  const lowestRate =
    sufficientGroups.length > 0
      ? Math.min(...sufficientGroups.map((g) => g.lowPriorityRate))
      : null;
  const highestLowestRatio =
    highestRate !== null && lowestRate !== null && lowestRate > 0
      ? highestRate / lowestRate
      : null;

  return {
    benchmarkGroup: benchmark.group,
    benchmarkRate: benchmark.rate,
    groups,
    highestRate,
    lowestRate,
    highestLowestRatio,
  };
}

export function buildRawDisparities(analysis: BenchmarkAnalysis): RawDisparity[] {
  return analysis.groups
    .filter((g) => g.group !== analysis.benchmarkGroup && g.sufficientSample)
    .map((g) => ({
      group: g.group,
      comparisonGroup: analysis.benchmarkGroup,
      percentagePointDifference: g.lowPriorityRate - analysis.benchmarkRate,
      ratio: analysis.benchmarkRate > 0 ? g.lowPriorityRate / analysis.benchmarkRate : 0,
    }));
}

function overallSeverityDistribution(records: ComplaintRecord[]): Record<Severity, number> {
  const n = records.length;
  const dist = { Critical: 0, High: 0, Standard: 0 } as Record<Severity, number>;
  for (const s of SEVERITIES) {
    dist[s] = n > 0 ? records.filter((r) => r.severity === s).length / n : 0;
  }
  return dist;
}

export function buildSeverityAdjustedAnalysis(
  records: ComplaintRecord[],
  field: "language" = "language"
): SeverityAdjustedAnalysis {
  const commonDist = overallSeverityDistribution(records);
  const grouped = groupByField(records, field);

  const groupAdjustedRate = (recs: ComplaintRecord[]): number => {
    let adjusted = 0;
    for (const s of SEVERITIES) {
      const stratum = recs.filter((r) => r.severity === s);
      const stratumRate = stratum.length > 0 ? lowPriorityRate(stratum).rate : 0;
      adjusted += commonDist[s] * stratumRate;
    }
    return adjusted;
  };

  const benchmarkField = buildBenchmarkAnalysis(records, field);
  const benchmarkGroupKey = benchmarkField.benchmarkGroup;
  const benchmarkRecords = grouped.get(benchmarkGroupKey as never) ?? [];
  const benchmarkAdjustedRate = groupAdjustedRate(benchmarkRecords);

  const groups: SeverityAdjustedGroup[] = Array.from(grouped.entries()).map(([key, recs]) => {
    const rawRate = lowPriorityRate(recs).rate;
    const adjustedRate = groupAdjustedRate(recs);
    return {
      group: String(key),
      rawRate,
      adjustedRate,
      rawGap: rawRate - lowPriorityRate(benchmarkRecords).rate,
      adjustedGap: adjustedRate - benchmarkAdjustedRate,
      adjustedRatio: benchmarkAdjustedRate > 0 ? adjustedRate / benchmarkAdjustedRate : 0,
    };
  });

  return {
    benchmarkGroup: String(benchmarkGroupKey),
    severityDistributionUsed: commonDist,
    groups,
  };
}

export function buildResolutionStats(
  records: ComplaintRecord[],
  field: "language" = "language"
): ResolutionStats[] {
  const grouped = groupByField(records, field);
  const stats: ResolutionStats[] = [];

  for (const [key, recs] of grouped.entries()) {
    const n = recs.length;
    const days = recs.map((r) => r.resolution_days).sort((a, b) => a - b);
    const mean = n > 0 ? days.reduce((s, d) => s + d, 0) / n : 0;
    const p90Index = Math.min(n - 1, Math.ceil(0.9 * n) - 1);
    const p90 = n > 0 ? days[Math.max(0, p90Index)] : 0;
    const withinSla = recs.filter((r) => r.resolution_days <= SLA_DAYS[r.severity]).length;
    const slaCompliancePct = n > 0 ? (withinSla / n) * 100 : 0;

    stats.push({
      group: String(key),
      n,
      meanResolutionDays: mean,
      p90ResolutionDays: p90,
      slaCompliancePct,
    });
  }

  return stats.sort((a, b) => b.n - a.n);
}

export function buildErrorIndicators(
  records: ComplaintRecord[],
  field: "language" = "language"
): ErrorIndicator[] {
  const grouped = groupByField(records, field);
  const indicators: ErrorIndicator[] = [];

  for (const [key, recs] of grouped.entries()) {
    const lowRecs = recs.filter((r) => r.ai_priority === "Low");
    const withGroundTruth = lowRecs.filter((r) => r.reopened_after_low_priority !== null);
    const reopenCount = withGroundTruth.filter((r) => r.reopened_after_low_priority === true).length;
    indicators.push({
      group: String(key),
      n: recs.length,
      reopenRateAfterLowPriority:
        withGroundTruth.length > 0 ? reopenCount / withGroundTruth.length : null,
    });
  }

  return indicators.sort((a, b) => b.n - a.n);
}

export function buildSampleSizeFlags(
  records: ComplaintRecord[],
  field: "language" = "language",
  minSample: number = MIN_SAMPLE_SIZE
): SampleSizeFlag[] {
  const grouped = groupByField(records, field);
  return Array.from(grouped.entries()).map(([key, recs]) => ({
    group: String(key),
    n: recs.length,
    sufficientSample: recs.length >= minSample,
  }));
}

/** Cramér's V for two categorical fields. Returns 0 when undefined. */
export function cramersV<K1 extends keyof ComplaintRecord, K2 extends keyof ComplaintRecord>(
  records: ComplaintRecord[],
  fieldA: K1,
  fieldB: K2
): number {
  const n = records.length;
  if (n === 0) return 0;

  const aValues = Array.from(new Set(records.map((r) => r[fieldA])));
  const bValues = Array.from(new Set(records.map((r) => r[fieldB])));
  if (aValues.length < 2 || bValues.length < 2) return 0;

  const table: number[][] = aValues.map(() => bValues.map(() => 0));
  for (const r of records) {
    const i = aValues.indexOf(r[fieldA]);
    const j = bValues.indexOf(r[fieldB]);
    table[i][j] += 1;
  }

  const rowTotals = table.map((row) => row.reduce((s, v) => s + v, 0));
  const colTotals = bValues.map((_, j) => table.reduce((s, row) => s + row[j], 0));

  let chi2 = 0;
  for (let i = 0; i < aValues.length; i++) {
    for (let j = 0; j < bValues.length; j++) {
      const expected = (rowTotals[i] * colTotals[j]) / n;
      if (expected > 0) {
        chi2 += Math.pow(table[i][j] - expected, 2) / expected;
      }
    }
  }

  const minDim = Math.min(aValues.length - 1, bValues.length - 1);
  if (minDim <= 0) return 0;
  return Math.sqrt(chi2 / (n * minDim));
}

function interpretCramersV(v: number): string {
  if (v < 0.1) return "Negligible association. No meaningful proxy relationship detected.";
  if (v < 0.3) return "Weak association. Unlikely to materially explain outcome differences on its own.";
  if (v < 0.5)
    return "Moderate association. Worth monitoring as a potential proxy relationship, though association alone does not establish discrimination.";
  return "Strong association. Flag for closer review as a potential proxy relationship. This is not proof of discrimination and requires human investigation.";
}

export function buildProxyAssociations(records: ComplaintRecord[]): ProxyAssociation[] {
  const pairs: [keyof ComplaintRecord, keyof ComplaintRecord][] = [
    ["customer_value_tier", "language"],
    ["customer_value_tier", "region"],
    ["customer_value_tier", "gender"],
    ["customer_value_tier", "religion"],
  ];

  return pairs.map(([a, b]) => {
    const v = cramersV(records, a, b);
    return {
      variablePair: [String(a), String(b)],
      cramersV: v,
      interpretation: interpretCramersV(v),
    };
  });
}

export function buildModelInputChecks(docs: ModelDocumentation): ModelInputCheckItem[] {
  return [
    {
      variable: "severity",
      documentedAsInput: true,
      approvalStatus: "ALLOWED",
      violation: false,
      note: "Severity is an approved, documented input to the prioritisation model.",
    },
    {
      variable: "product",
      documentedAsInput: true,
      approvalStatus: "ALLOWED",
      violation: false,
      note: "Product is an approved, documented input to the prioritisation model.",
    },
    {
      variable: "vulnerability_flag",
      documentedAsInput: true,
      approvalStatus: "ALLOWED",
      violation: false,
      note: "Vulnerability flag is an approved, documented input to the prioritisation model.",
    },
    {
      variable: "customer_value_tier",
      documentedAsInput: docs.usesCustomerValueAsInput,
      approvalStatus: "CONDITIONAL",
      violation: docs.usesCustomerValueAsInput && !docs.customerValueDocumented,
      note: docs.usesCustomerValueAsInput
        ? docs.customerValueDocumented
          ? "Customer value tier is used as a model input and has approved documentation on file."
          : "Customer value tier is used as a model input WITHOUT approved documentation. This is a policy/control violation."
        : "Customer value tier is not currently used as a model input.",
    },
    {
      variable: "language",
      documentedAsInput: docs.usesLanguageAsInput,
      approvalStatus: "PROHIBITED",
      violation: docs.usesLanguageAsInput,
      note: docs.usesLanguageAsInput
        ? "Language is documented as a model input. Language is a prohibited variable under bank policy. This is a policy/control violation."
        : "Language is not used as a model input.",
    },
    {
      variable: "region",
      documentedAsInput: docs.usesRegionAsInput,
      approvalStatus: "PROHIBITED",
      violation: docs.usesRegionAsInput,
      note: docs.usesRegionAsInput
        ? "Region is documented as a model input. Region is a prohibited variable under bank policy. This is a policy/control violation."
        : "Region is not used as a model input.",
    },
    {
      variable: "gender",
      documentedAsInput: docs.usesGenderAsInput,
      approvalStatus: "PROHIBITED",
      violation: docs.usesGenderAsInput,
      note: docs.usesGenderAsInput
        ? "Gender is documented as a model input. Gender is a prohibited variable under bank policy. This is a policy/control violation."
        : "Gender is not used as a model input.",
    },
    {
      variable: "religion",
      documentedAsInput: docs.usesReligionAsInput,
      approvalStatus: "PROHIBITED",
      violation: docs.usesReligionAsInput,
      note: docs.usesReligionAsInput
        ? "Religion is documented as a model input. Religion is a prohibited variable under bank policy. This is a policy/control violation."
        : "Religion is not used as a model input.",
    },
  ];
}

export function runAnalysis(
  records: ComplaintRecord[],
  docs: ModelDocumentation
): AnalysisResult {
  const byLanguage = buildBenchmarkAnalysis(records, "language");
  const byRegion = buildBenchmarkAnalysis(records, "region");
  const byCustomerValue = buildBenchmarkAnalysis(records, "customer_value_tier");
  const byGender = buildBenchmarkAnalysis(records, "gender");
  const byReligion = buildBenchmarkAnalysis(records, "religion");

  const rawDisparities = buildRawDisparities(byLanguage);
  const severityAdjusted = buildSeverityAdjustedAnalysis(records, "language");
  const resolutionByLanguage = buildResolutionStats(records, "language");

  const errorAssessmentAvailable = docs.includeErrorGroundTruth;
  const errorIndicatorsByLanguage = errorAssessmentAvailable
    ? buildErrorIndicators(records, "language")
    : [];

  const sampleSizeFlags = buildSampleSizeFlags(records, "language");
  const proxyAssociations = buildProxyAssociations(records);
  const modelInputChecks = buildModelInputChecks(docs);

  return {
    totalComplaints: records.length,
    byLanguage,
    byRegion,
    byCustomerValue,
    byGender,
    byReligion,
    rawDisparities,
    severityAdjusted,
    resolutionByLanguage,
    errorAssessmentAvailable,
    errorIndicatorsByLanguage,
    sampleSizeFlags,
    proxyAssociations,
    modelInputChecks,
  };
}
