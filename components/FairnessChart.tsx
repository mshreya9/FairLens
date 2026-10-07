"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalysisResult } from "@/lib/types";

interface Props {
  analysis: AnalysisResult;
  threshold: number;
}

export default function FairnessChart({ analysis, threshold }: Props) {
  const severityByGroup = new Map(analysis.severityAdjusted.groups.map((g) => [g.group, g]));

  const data = analysis.byLanguage.groups.map((g) => {
    const sev = severityByGroup.get(g.group);
    return {
      group: g.group,
      "Raw rate (%)": Number((g.lowPriorityRate * 100).toFixed(1)),
      "Severity-adjusted rate (%)": sev ? Number((sev.adjustedRate * 100).toFixed(1)) : 0,
    };
  });

  const benchmarkRatePct = analysis.byLanguage.benchmarkRate * 100;
  const thresholdLine = benchmarkRatePct * threshold;

  return (
    <div className="card-surface rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="mb-3">
        <div className="text-[12.5px] font-semibold text-[var(--color-text-primary)]">
          Low-Priority Rate by Language: Raw vs Severity-Adjusted
        </div>
        <div className="text-[11px] text-[var(--color-text-muted)]">
          Dashed line marks the {threshold}x internal threshold over the benchmark rate (
          {analysis.byLanguage.benchmarkGroup}).
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e1e4ea" vertical={false} />
          <XAxis dataKey="group" tick={{ fontSize: 11, fill: "#4b5565" }} axisLine={{ stroke: "#c7cbd4" }} />
          <YAxis tick={{ fontSize: 11, fill: "#4b5565" }} axisLine={{ stroke: "#c7cbd4" }} unit="%" />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "#c7cbd4" }}
            formatter={(value) => `${value}%`}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine
            y={thresholdLine}
            stroke="#991b1b"
            strokeDasharray="4 4"
            label={{ value: "threshold", fontSize: 10, fill: "#991b1b", position: "right" }}
          />
          <Bar dataKey="Raw rate (%)" fill="#1f3a63" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Severity-adjusted rate (%)" fill="#7c93b8" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
