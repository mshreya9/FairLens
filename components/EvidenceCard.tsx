interface Props {
  label: string;
  value: string;
  sublabel?: string;
  tone?: "neutral" | "warning" | "danger" | "good";
}

const TONE_CLASSES: Record<NonNullable<Props["tone"]>, string> = {
  neutral: "text-[var(--color-text-primary)]",
  good: "text-[var(--color-proceed)]",
  warning: "text-[var(--color-conditions)]",
  danger: "text-[var(--color-escalate)]",
};

const TONE_BAR: Record<NonNullable<Props["tone"]>, string> = {
  neutral: "bg-[var(--color-border-strong)]",
  good: "bg-[var(--color-proceed)]",
  warning: "bg-[var(--color-conditions)]",
  danger: "bg-[var(--color-escalate)]",
};

export default function EvidenceCard({ label, value, sublabel, tone = "neutral" }: Props) {
  return (
    <div className="card-surface animate-fade-up overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className={`h-1 w-full ${TONE_BAR[tone]}`} />
      <div className="px-4 py-3">
        <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
          {label}
        </div>
        <div className={`mt-1 text-[22px] font-semibold leading-tight ${TONE_CLASSES[tone]}`}>
          {value}
        </div>
        {sublabel && (
          <div className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">{sublabel}</div>
        )}
      </div>
    </div>
  );
}
