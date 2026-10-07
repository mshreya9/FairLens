import type { GovernanceStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  GovernanceStatus,
  { label: string; text: string; bg: string; border: string }
> = {
  PROCEED: {
    label: "PROCEED",
    text: "var(--color-proceed)",
    bg: "var(--color-proceed-bg)",
    border: "var(--color-proceed-border)",
  },
  PROCEED_WITH_CONDITIONS: {
    label: "PROCEED WITH CONDITIONS",
    text: "var(--color-conditions)",
    bg: "var(--color-conditions-bg)",
    border: "var(--color-conditions-border)",
  },
  ESCALATE_TO_HUMAN_REVIEW: {
    label: "ESCALATE TO HUMAN REVIEW",
    text: "var(--color-escalate)",
    bg: "var(--color-escalate-bg)",
    border: "var(--color-escalate-border)",
  },
};

function StatusIcon({ status, color }: { status: GovernanceStatus; color: string }) {
  if (status === "PROCEED") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className="h-7 w-7">
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12.3 2.6 2.6L16.3 9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === "PROCEED_WITH_CONDITIONS") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className="h-7 w-7">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5.2" strokeLinecap="round" />
        <circle cx="12" cy="16.3" r="0.9" fill={color} stroke="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className="h-7 w-7">
      <path d="M12 3.2 2.3 20.2h19.4L12 3.2Z" strokeLinejoin="round" />
      <path d="M12 9.8v4.4" strokeLinecap="round" />
      <circle cx="12" cy="17.1" r="0.9" fill={color} stroke="none" />
    </svg>
  );
}

interface Props {
  status: GovernanceStatus;
  finding: string;
}

export default function GovernanceDecision({ status, finding }: Props) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div
      className="panel-surface animate-fade-up rounded-xl border-2 px-6 py-6"
      style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
          style={{ boxShadow: `0 0 0 3px ${cfg.bg}` }}
        >
          <StatusIcon status={status} color={cfg.text} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Governance Recommendation
          </div>
          <div className="status-pill mt-0.5 text-[26px] leading-tight" style={{ color: cfg.text }}>
            {cfg.label}
          </div>
          <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-[var(--color-text-primary)]">
            {finding}
          </p>
        </div>
      </div>
    </div>
  );
}
