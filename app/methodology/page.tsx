const STEPS = [
  { title: "Validate inputs", detail: "Check scenario/CSV data against the required schema before any analysis runs." },
  { title: "Measure outcome differences", detail: "Compute each language group's low-priority rate against a benchmark group." },
  { title: "Check resolution/SLA outcomes", detail: "Compare mean/p90 resolution time and SLA compliance by group." },
  { title: "Check error evidence", detail: "If available, compute the reopened-after-low-priority rate as a potential misclassification indicator." },
  { title: "Adjust for severity", detail: "Stratify by severity and reweight using the dataset's common severity distribution to separate explained from unexplained gaps." },
  { title: "Check potential proxies", detail: "Compute Cramér's V between customer value tier and language/region/gender/religion to flag, not prove, possible proxy relationships." },
  { title: "Check model input policy", detail: "Compare documented model inputs against the bank's approved/conditional/prohibited variable list." },
  {
    title: "Run guardrail monitoring",
    detail:
      "Check outcome parity across gender and religion, the protected attributes, even though the model never uses them. Any disparity here escalates immediately.",
  },
  { title: "Apply governance thresholds", detail: "Run the deterministic policy engine against the 1.25x fairness threshold and 30-complaint minimum sample size." },
  { title: "Identify limitations", detail: "Surface missing data, small samples, and anything the evidence cannot prove." },
  { title: "Recommend human action", detail: "State who must decide, what they must decide, and why the agent cannot decide it for them." },
];

export default function MethodologyPage() {
  return (
    <div className="max-w-[900px] space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">Methodology</h1>
        <p className="mt-1 text-[12.5px] text-[var(--color-text-muted)]">
          How the agent assesses fairness in the AI complaint-prioritisation model.
        </p>
      </div>

      <div className="card-surface rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <ol className="space-y-0">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-navy)] text-[11px] font-semibold text-white">
                  {i + 1}
                </span>
                {i < STEPS.length - 1 && <span className="mt-1 h-full w-px flex-1 bg-[var(--color-border)]" />}
              </div>
              <div className="pb-5">
                <div className="text-[13.5px] font-medium text-[var(--color-text-primary)]">{step.title}</div>
                <div className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--color-text-secondary)]">
                  {step.detail}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-lg border-2 border-[var(--color-navy)]/20 bg-[var(--color-navy)]/[0.03] p-4">
        <p className="text-[13px] leading-relaxed text-[var(--color-text-primary)]">
          <strong>The statistical analysis is deterministic.</strong> Every number in this
          application, rates, ratios, severity adjustments, SLA compliance, Cramér&apos;s V, is
          computed by plain TypeScript code, not by the AI model. The AI is used only to interpret
          that evidence and produce the governance report&apos;s narrative sections. It never
          recalculates a statistic and never overrides the deterministic policy recommendation.
        </p>
      </div>

      <div className="card-surface rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="mb-2 text-[12.5px] font-semibold text-[var(--color-text-primary)]">
          What this agent is, and is not
        </div>
        <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          This is not &ldquo;AI detects discrimination.&rdquo; It is an AI governance agent that
          helps a bank decide whether its complaint-prioritisation AI is safe to continue
          operating, using deterministic evidence, approved policy, and an AI-generated
          explanation, with the final decision always resting with the Complaints Head.
        </p>
      </div>
    </div>
  );
}
