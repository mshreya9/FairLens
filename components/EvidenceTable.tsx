import type { AnalysisResult } from "@/lib/types";

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function ratio(n: number): string {
  return `${n.toFixed(2)}x`;
}

interface Props {
  analysis: AnalysisResult;
}

export default function EvidenceTable({ analysis }: Props) {
  const severityByGroup = new Map(analysis.severityAdjusted.groups.map((g) => [g.group, g]));
  const resolutionByGroup = new Map(analysis.resolutionByLanguage.map((r) => [r.group, r]));
  const errorByGroup = new Map(analysis.errorIndicatorsByLanguage.map((e) => [e.group, e]));

  return (
    <div className="card-surface overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      <table className="w-full min-w-[820px] text-left text-[12.5px]">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)] text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">
            <th className="px-3 py-2 font-medium">Language</th>
            <th className="px-3 py-2 font-medium">n</th>
            <th className="px-3 py-2 font-medium">Low-Priority Rate</th>
            <th className="px-3 py-2 font-medium">Raw Ratio</th>
            <th className="px-3 py-2 font-medium">Severity-Adjusted Rate</th>
            <th className="px-3 py-2 font-medium">Adjusted Ratio</th>
            <th className="px-3 py-2 font-medium">SLA Compliance</th>
            <th className="px-3 py-2 font-medium">Reopen Rate*</th>
            <th className="px-3 py-2 font-medium">Sample</th>
          </tr>
        </thead>
        <tbody>
          {analysis.byLanguage.groups.map((g) => {
            const sev = severityByGroup.get(g.group);
            const res = resolutionByGroup.get(g.group);
            const err = errorByGroup.get(g.group);
            const isBenchmark = g.group === analysis.byLanguage.benchmarkGroup;
            return (
              <tr key={g.group} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-3 py-2 font-medium text-[var(--color-text-primary)]">
                  {g.group}
                  {isBenchmark && (
                    <span className="ml-1.5 rounded bg-[var(--color-bg)] px-1.5 py-0.5 text-[10px] font-normal text-[var(--color-text-muted)]">
                      benchmark
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-[var(--color-text-secondary)]">{g.n.toLocaleString()}</td>
                <td className="px-3 py-2 text-[var(--color-text-secondary)]">{pct(g.lowPriorityRate)}</td>
                <td className="px-3 py-2 text-[var(--color-text-secondary)]">
                  {isBenchmark ? "N/A" : ratio(g.rateRatio)}
                </td>
                <td className="px-3 py-2 text-[var(--color-text-secondary)]">
                  {sev ? pct(sev.adjustedRate) : "N/A"}
                </td>
                <td className="px-3 py-2 text-[var(--color-text-secondary)]">
                  {sev && !isBenchmark ? ratio(sev.adjustedRatio) : "N/A"}
                </td>
                <td className="px-3 py-2 text-[var(--color-text-secondary)]">
                  {res ? `${res.slaCompliancePct.toFixed(1)}%` : "N/A"}
                </td>
                <td className="px-3 py-2 text-[var(--color-text-secondary)]">
                  {analysis.errorAssessmentAvailable
                    ? err && err.reopenRateAfterLowPriority !== null
                      ? pct(err.reopenRateAfterLowPriority)
                      : "n/a"
                    : "unavailable"}
                </td>
                <td className="px-3 py-2">
                  {g.sufficientSample ? (
                    <span className="text-[var(--color-proceed)]">sufficient</span>
                  ) : (
                    <span className="font-medium text-[var(--color-escalate)]">
                      insufficient (n&lt;30)
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="border-t border-[var(--color-border)] px-3 py-2 text-[11px] text-[var(--color-text-muted)]">
        * Reopen rate is a potential misclassification indicator, not verified ground truth.
      </div>
    </div>
  );
}
