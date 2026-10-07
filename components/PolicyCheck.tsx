import type { ModelInputCheckItem, PolicyEvaluation } from "@/lib/types";

function statusBadge(item: ModelInputCheckItem) {
  if (item.violation) {
    return "bg-[var(--color-escalate-bg)] text-[var(--color-escalate)] border-[var(--color-escalate-border)]";
  }
  if (!item.documentedAsInput) {
    return "bg-[var(--color-bg)] text-[var(--color-text-muted)] border-[var(--color-border-strong)]";
  }
  if (item.approvalStatus === "ALLOWED") {
    return "bg-[var(--color-proceed-bg)] text-[var(--color-proceed)] border-[var(--color-proceed-border)]";
  }
  return "bg-[var(--color-conditions-bg)] text-[var(--color-conditions)] border-[var(--color-conditions-border)]";
}

function statusLabel(item: ModelInputCheckItem) {
  if (item.violation) return "VIOLATION";
  if (!item.documentedAsInput && item.approvalStatus !== "ALLOWED") return "NOT IN USE";
  return item.approvalStatus;
}

interface Props {
  checks: ModelInputCheckItem[];
  policy: PolicyEvaluation;
}

export default function PolicyCheck({ checks, policy }: Props) {
  return (
    <div className="card-surface rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="mb-3 text-[12.5px] font-semibold text-[var(--color-text-primary)]">
        Model Input Policy Check
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {checks.map((c) => (
          <div
            key={c.variable}
            className="flex items-start justify-between gap-2 rounded-md border border-[var(--color-border)] px-3 py-2"
          >
            <div>
              <div className="text-[12.5px] font-medium text-[var(--color-text-primary)]">
                {c.variable}
              </div>
              <div className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">{c.note}</div>
            </div>
            <span
              className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-semibold ${statusBadge(c)}`}
            >
              {statusLabel(c)}
            </span>
          </div>
        ))}
      </div>

      {(policy.triggeredRules.length > 0 || policy.conditions.length > 0) && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {policy.triggeredRules.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Triggered Rules
              </div>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-[12px] text-[var(--color-text-secondary)]">
                {policy.triggeredRules.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          {policy.conditions.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Conditions
              </div>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-[12px] text-[var(--color-text-secondary)]">
                {policy.conditions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
