import {
  APPROVED_VARIABLES,
  AUTHORITY_LIMITS,
  FAIRNESS_THRESHOLD,
  GUARDRAIL_PRINCIPLES,
  INTERNAL_SLA_STANDARDS,
  MINIMUM_SAMPLE_SIZE,
  POLICY_NAME,
  POLICY_VERSION,
  PROHIBITED_VARIABLES,
  PROTECTED_ATTRIBUTES,
  REGULATORY_CONTEXT,
  SLA_DISCLAIMER,
} from "@/lib/policy-data";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details
      id={id}
      open
      className="group card-surface rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <summary className="cursor-pointer text-[13.5px] font-semibold text-[var(--color-text-primary)] marker:content-none">
        <span className="mr-2 inline-block text-[var(--color-text-muted)] transition-transform group-open:rotate-90">
          ›
        </span>
        {title}
      </summary>
      <div className="mt-3 pl-5">{children}</div>
    </details>
  );
}

function InternalTag() {
  return (
    <span className="rounded border border-[var(--color-navy)]/25 bg-[var(--color-navy)]/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-navy)]">
      Fictional Internal Policy
    </span>
  );
}

function RegulatoryTag() {
  return (
    <span className="rounded border border-[var(--color-conditions-border)] bg-[var(--color-conditions-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-conditions)]">
      External Regulatory Context
    </span>
  );
}

export default function PolicyPage() {
  return (
    <div className="max-w-[900px] space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">{POLICY_NAME}</h1>
        <p className="mt-1 text-[12.5px] text-[var(--color-text-muted)]">Current version: {POLICY_VERSION}</p>
      </div>

      <Section id="sla" title="1. Internal SLA Standards">
        <InternalTag />
        <table className="mt-3 w-full max-w-sm text-left text-[13px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">
              <th className="py-1 font-medium">Severity</th>
              <th className="py-1 font-medium">SLA</th>
            </tr>
          </thead>
          <tbody>
            {INTERNAL_SLA_STANDARDS.map((row) => (
              <tr key={row.severity} className="border-t border-[var(--color-border)]">
                <td className="py-1.5 text-[var(--color-text-primary)]">{row.severity}</td>
                <td className="py-1.5 text-[var(--color-text-secondary)]">
                  {row.slaDays} day{row.slaDays > 1 ? "s" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-[12px] leading-relaxed text-[var(--color-text-muted)]">{SLA_DISCLAIMER}</p>
      </Section>

      <Section id="fairness" title="2. Fairness Thresholds">
        <InternalTag />
        <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          {FAIRNESS_THRESHOLD.description}
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-[var(--color-text-muted)]">
          {FAIRNESS_THRESHOLD.disclaimer}
        </p>
      </Section>

      <Section id="sample" title="3. Minimum Sample Size">
        <InternalTag />
        <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          {MINIMUM_SAMPLE_SIZE.description}
        </p>
      </Section>

      <Section id="approved" title="4. Approved Model Variables">
        <InternalTag />
        <ul className="mt-3 space-y-2">
          {APPROVED_VARIABLES.map((v) => (
            <li key={v.variable} className="flex items-start justify-between gap-2 text-[13px]">
              <span className="text-[var(--color-text-primary)]">{v.variable}</span>
              <span className="flex items-center gap-2">
                <span
                  className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${
                    v.status === "ALLOWED"
                      ? "border-[var(--color-proceed-border)] bg-[var(--color-proceed-bg)] text-[var(--color-proceed)]"
                      : "border-[var(--color-conditions-border)] bg-[var(--color-conditions-bg)] text-[var(--color-conditions)]"
                  }`}
                >
                  {v.status}
                </span>
                <span className="text-[11px] text-[var(--color-text-muted)]">{v.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="prohibited" title="5. Prohibited Variables">
        <InternalTag />
        <ul className="mt-3 space-y-2">
          {PROHIBITED_VARIABLES.map((v) => (
            <li key={v.variable} className="flex items-center justify-between gap-2 text-[13px]">
              <span className="text-[var(--color-text-primary)]">{v.variable}</span>
              <span className="rounded border border-[var(--color-escalate-border)] bg-[var(--color-escalate-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-escalate)]">
                {v.status}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="authority" title="6. Authority Limits">
        <InternalTag />
        <p className="mt-3 text-[13px] text-[var(--color-text-secondary)]">The agent cannot:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-[var(--color-text-secondary)]">
          {AUTHORITY_LIMITS.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </Section>

      <Section id="regulatory" title="7. Regulatory Context">
        <RegulatoryTag />
        <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          {REGULATORY_CONTEXT}
        </p>
      </Section>

      <Section id="guardrails" title="8. Non-Discrimination Guardrails">
        <InternalTag />
        <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          The model must never produce a different outcome for a customer because of a protected
          attribute. These attributes are tracked and enforced on every review, whether or not
          they are ever used by the model.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-[13px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">
                <th className="py-1 font-medium">Protected attribute</th>
                <th className="py-1 font-medium">Why it is protected</th>
              </tr>
            </thead>
            <tbody>
              {PROTECTED_ATTRIBUTES.map((p) => (
                <tr key={p.attribute} className="border-t border-[var(--color-border)]">
                  <td className="py-1.5 pr-4 text-[var(--color-text-primary)]">{p.attribute}</td>
                  <td className="py-1.5 text-[var(--color-text-secondary)]">{p.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 space-y-3">
          {GUARDRAIL_PRINCIPLES.map((g) => (
            <div key={g.title} className="rounded-md border border-[var(--color-border)] px-3 py-2.5">
              <div className="text-[12.5px] font-medium text-[var(--color-text-primary)]">{g.title}</div>
              <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
                {g.detail}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
