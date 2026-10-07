import type { AnalysisResult } from "@/lib/types";

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function ratio(n: number): string {
  return `${n.toFixed(2)}x`;
}

interface Props {
  analysis: AnalysisResult;
  threshold: number;
}

function AttributeRow({
  label,
  benchmarkAnalysis,
  threshold,
}: {
  label: string;
  benchmarkAnalysis: AnalysisResult["byGender"];
  threshold: number;
}) {
  const worst = benchmarkAnalysis.groups
    .filter((g) => g.group !== benchmarkAnalysis.benchmarkGroup && g.sufficientSample)
    .sort((a, b) => b.rateRatio - a.rateRatio)[0];

  const breach = worst ? worst.rateRatio > threshold : false;

  return (
    <div
      className={`rounded-md border px-3 py-2.5 ${
        breach
          ? "border-[var(--color-escalate-border)] bg-[var(--color-escalate-bg)]"
          : "border-[var(--color-proceed-border)] bg-[var(--color-proceed-bg)]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12.5px] font-medium text-[var(--color-text-primary)]">{label}</span>
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
            breach
              ? "bg-[var(--color-escalate)] text-white"
              : "bg-[var(--color-proceed)] text-white"
          }`}
        >
          {breach ? "DISPARITY DETECTED" : "NO DISPARITY"}
        </span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-[var(--color-text-secondary)]">
        {benchmarkAnalysis.groups.map((g) => (
          <span key={g.group}>
            {g.group}: {pct(g.lowPriorityRate)}
            {g.group !== benchmarkAnalysis.benchmarkGroup && g.sufficientSample
              ? ` (${ratio(g.rateRatio)})`
              : g.group === benchmarkAnalysis.benchmarkGroup
              ? " (benchmark)"
              : " (small sample)"}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function GuardrailPanel({ analysis, threshold }: Props) {
  const anyBreach = [analysis.byGender, analysis.byReligion].some((ba) =>
    ba.groups.some((g) => g.group !== ba.benchmarkGroup && g.sufficientSample && g.rateRatio > threshold)
  );

  return (
    <div className="card-surface rounded-lg border-2 border-[var(--color-navy)]/20 bg-[var(--color-navy)]/[0.03] p-4">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="text-[12.5px] font-semibold text-[var(--color-text-primary)]">
          Non-Discrimination Guardrail Monitoring
        </div>
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
            anyBreach
              ? "bg-[var(--color-escalate)] text-white"
              : "bg-[var(--color-proceed)] text-white"
          }`}
        >
          {anyBreach ? "GUARDRAIL BREACH" : "GUARDRAILS CLEAR"}
        </span>
      </div>
      <p className="mb-3 text-[11.5px] leading-relaxed text-[var(--color-text-muted)]">
        Gender and religion are protected attributes. They are never used as model inputs, and
        this check runs on every review regardless of scenario to confirm outcomes stay balanced
        across them. Any disparity here is treated as a guardrail breach and forces escalation,
        not a condition to monitor.
      </p>
      <div className="space-y-2">
        <AttributeRow label="Gender" benchmarkAnalysis={analysis.byGender} threshold={threshold} />
        <AttributeRow label="Religion" benchmarkAnalysis={analysis.byReligion} threshold={threshold} />
      </div>
    </div>
  );
}
