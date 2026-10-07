"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ResolutionStats } from "@/lib/types";

interface Props {
  resolutionByLanguage: ResolutionStats[];
}

export default function ResolutionChart({ resolutionByLanguage }: Props) {
  const data = resolutionByLanguage.map((r) => ({
    group: r.group,
    "SLA compliance (%)": Number(r.slaCompliancePct.toFixed(1)),
  }));

  return (
    <div className="card-surface rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="mb-3">
        <div className="text-[12.5px] font-semibold text-[var(--color-text-primary)]">
          SLA Compliance by Language
        </div>
        <div className="text-[11px] text-[var(--color-text-muted)]">
          Share of complaints resolved within the internal SLA for their severity level.
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e1e4ea" vertical={false} />
          <XAxis dataKey="group" tick={{ fontSize: 11, fill: "#4b5565" }} axisLine={{ stroke: "#c7cbd4" }} />
          <YAxis tick={{ fontSize: 11, fill: "#4b5565" }} axisLine={{ stroke: "#c7cbd4" }} unit="%" />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "#c7cbd4" }}
            formatter={(value) => `${value}%`}
          />
          <Bar dataKey="SLA compliance (%)" fill="#166534" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
