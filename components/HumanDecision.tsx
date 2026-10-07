import type { HumanDecisionNeeded } from "@/lib/types";

interface Props {
  humanDecisionNeeded: HumanDecisionNeeded;
}

export default function HumanDecision({ humanDecisionNeeded }: Props) {
  return (
    <div className="card-surface rounded-lg border-2 border-[var(--color-navy)]/20 bg-[var(--color-navy)]/[0.03] p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-navy)]">
        Human Decision Needed
      </div>
      <dl className="mt-2 space-y-2 text-[13px]">
        <div>
          <dt className="font-medium text-[var(--color-text-primary)]">Who decides</dt>
          <dd className="text-[var(--color-text-secondary)]">{humanDecisionNeeded.owner}</dd>
        </div>
        <div>
          <dt className="font-medium text-[var(--color-text-primary)]">What they decide</dt>
          <dd className="text-[var(--color-text-secondary)]">{humanDecisionNeeded.decision}</dd>
        </div>
        <div>
          <dt className="font-medium text-[var(--color-text-primary)]">Why the AI cannot decide it</dt>
          <dd className="text-[var(--color-text-secondary)]">{humanDecisionNeeded.reason}</dd>
        </div>
      </dl>
      <p className="mt-3 border-t border-[var(--color-navy)]/15 pt-3 text-[11.5px] leading-relaxed text-[var(--color-text-muted)]">
        AI assessment: evidence informs this recommendation. Final deployment decision remains
        with the Complaints Head / designated governance owner. This recommendation is not a
        final legal or business approval.
      </p>
    </div>
  );
}
