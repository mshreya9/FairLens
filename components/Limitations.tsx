const LIMITATIONS = [
  "This is a governance decision-support prototype using synthetic data.",
  "The 1.25x fairness threshold is a fictional internal bank control created for this project.",
  "Statistical disparity does not by itself establish discrimination.",
  "Reopened/escalated complaints are a proxy for potential misclassification, not verified ground truth.",
  "The agent cannot make legal findings.",
  "Intersectional groups may not be adequately assessed.",
  "Results depend on the quality and completeness of the supplied data.",
];

interface Props {
  extra?: string[];
}

export default function Limitations({ extra = [] }: Props) {
  const items = [...LIMITATIONS, ...extra];
  return (
    <div className="card-surface rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="mb-2 text-[12.5px] font-semibold text-[var(--color-text-primary)]">
        Gaps and Limits
      </div>
      <ul className="list-disc space-y-1 pl-4 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
