import type { AnalysisResult, GovernanceStatus, PolicyEvaluation } from "@/lib/types";

interface Props {
  analysis: AnalysisResult;
  policy: PolicyEvaluation;
  status: GovernanceStatus;
}

const STATUS_LABEL: Record<GovernanceStatus, string> = {
  PROCEED: "PROCEED",
  PROCEED_WITH_CONDITIONS: "PROCEED WITH CONDITIONS",
  ESCALATE_TO_HUMAN_REVIEW: "ESCALATE TO HUMAN REVIEW",
};

export default function WhyThisDecision({ analysis, policy, status }: Props) {
  const benchmarkGroup = analysis.byLanguage.benchmarkGroup;
  const worstGroup = analysis.severityAdjusted.groups
    .filter((g) => g.group !== benchmarkGroup)
    .sort((a, b) => b.adjustedRatio - a.adjustedRatio)[0];

  const rawComparison = worstGroup
    ? analysis.byLanguage.groups.find((g) => g.group === worstGroup.group)
    : undefined;
  const benchmarkRate = analysis.byLanguage.benchmarkRate;

  const steps: string[] = [];
  if (worstGroup && rawComparison) {
    steps.push(
      `${worstGroup.group} low-priority rate: ${(rawComparison.lowPriorityRate * 100).toFixed(1)}%`
    );
    steps.push(`${benchmarkGroup} (benchmark) low-priority rate: ${(benchmarkRate * 100).toFixed(1)}%`);
    steps.push(`Observed raw ratio: ${rawComparison.rateRatio.toFixed(2)}x`);
  }
  steps.push(`Internal threshold: ${policy.summaryMetrics.threshold}x`);
  if (worstGroup) {
    steps.push(`Severity-adjusted ratio: ${worstGroup.adjustedRatio.toFixed(2)}x`);
  }
  steps.push(
    `Sample size: ${
      analysis.sampleSizeFlags.every((f) => f.sufficientSample)
        ? "sufficient for all groups"
        : `insufficient for ${analysis.sampleSizeFlags
            .filter((f) => !f.sufficientSample)
            .map((f) => `${f.group} (n=${f.n})`)
            .join(", ")}`
    }`
  );
  steps.push(
    policy.riskFlags.length > 0
      ? `Result: ${policy.riskFlags.length} risk flag(s) triggered`
      : "Result: no material unexplained disparity found"
  );
  steps.push(`Governance status: ${STATUS_LABEL[status]}`);

  return (
    <div className="card-surface rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="mb-2 text-[12.5px] font-semibold text-[var(--color-text-primary)]">
        Why did the system reach this decision?
      </div>
      <ol className="space-y-1.5 text-[12.5px] text-[var(--color-text-secondary)]">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-2">
            <span className="w-4 shrink-0 text-right text-[var(--color-text-muted)]">{i + 1}.</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
