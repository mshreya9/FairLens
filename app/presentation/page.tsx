import Link from "next/link";
import { FAIRNESS_THRESHOLD, MINIMUM_SAMPLE_SIZE, PROTECTED_ATTRIBUTES } from "@/lib/policy-data";
import { SCENARIOS } from "@/lib/scenarios";

type IconProps = { className?: string };

function IconTarget({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconAlert({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 3.5 2.5 20h19L12 3.5Z" strokeLinejoin="round" />
      <path d="M12 10v4.2" strokeLinecap="round" />
      <circle cx="12" cy="17.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFlow({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="2.5" y="4" width="6" height="5" rx="1.3" />
      <rect x="15.5" y="4" width="6" height="5" rx="1.3" />
      <rect x="9" y="15" width="6" height="5" rx="1.3" />
      <path d="M5.5 9v3a2 2 0 0 0 2 2H9" strokeLinecap="round" />
      <path d="M18.5 9v3a2 2 0 0 1-2 2h-1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconCheckCircle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.3 12.3 2.6 2.6 4.8-5.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconShield({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 3.2 4.5 6v5.6c0 4.7 3.1 7.8 7.5 9.2 4.4-1.4 7.5-4.5 7.5-9.2V6L12 3.2Z" strokeLinejoin="round" />
      <path d="m8.8 12.1 2.3 2.3 4.1-4.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGlobe({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.3 3.8 5.3 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.3-3.8-8.5S9.5 5.8 12 3.5Z" />
    </svg>
  );
}

function IconLayers({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.3" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.3" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.3" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.3" />
    </svg>
  );
}

function IconPlay({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10 8.3v7.4l6-3.7-6-3.7Z" strokeLinejoin="round" fill="currentColor" />
    </svg>
  );
}

const PIPELINE = [
  { label: "Data", icon: IconFlow },
  { label: "Deterministic Analysis", icon: IconFlow },
  { label: "Policy Engine", icon: IconShield },
  { label: "AI Narrative", icon: IconFlow },
  { label: "Governance Report", icon: IconCheckCircle },
  { label: "Human Decision", icon: IconTarget },
];

function SectionBadge({ n, Icon }: { n: number; Icon: (p: IconProps) => React.ReactElement }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-navy-light)] text-white shadow-md">
      <Icon className="h-5 w-5" />
      <span className="sr-only">Section {n}</span>
    </div>
  );
}

function Panel({
  n,
  Icon,
  eyebrow,
  title,
  children,
}: {
  n: number;
  Icon: (p: IconProps) => React.ReactElement;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface animate-fade-up rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <div className="flex items-start gap-4">
        <SectionBadge n={n} Icon={Icon} />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            {eyebrow}
          </div>
          <h2 className="mt-0.5 text-[19px] font-semibold text-[var(--color-text-primary)]">{title}</h2>
          <div className="mt-3 text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatChip({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-white/25 bg-white/10 px-4 py-2.5 text-center backdrop-blur-sm">
      <div className="text-[18px] font-bold text-white">{value}</div>
      <div className="text-[10.5px] uppercase tracking-wide text-white/75">{label}</div>
    </div>
  );
}

export default function PresentationPage() {
  return (
    <div className="max-w-[1000px] space-y-6 pb-12">
      <section className="hero-grid relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-navy)] via-[#1a3156] to-[var(--color-navy-light)] p-8 text-center shadow-xl sm:p-10">
        <div className="relative z-[1]">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
            Course Project &middot; AI Governance Agent
          </div>
          <h1 className="text-[40px] font-bold leading-tight text-white sm:text-[52px]">
            FairLens
          </h1>
          <p className="mx-auto mt-1 max-w-2xl text-[16px] font-medium text-white/90">
            Complaint Prioritisation Fairness Review Agent
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-white/80">
            An AI governance agent that helps a bank decide whether its complaint-prioritisation AI
            is safe to continue operating.
          </p>

          <div className="mx-auto mt-6 grid max-w-xl grid-cols-2 gap-2.5 sm:grid-cols-4">
            <StatChip value="4" label="Scenarios" />
            <StatChip value="3" label="Outcomes" />
            <StatChip value="4" label="Guardrails" />
            <StatChip value="~5,000" label="Complaints/Run" />
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/review"
              className="rounded-md bg-white px-5 py-2.5 text-[13px] font-semibold text-[var(--color-navy)] shadow-md transition-transform hover:scale-[1.03] hover:shadow-lg"
            >
              Open the Live Demo
            </Link>
            <Link
              href="/guide"
              className="rounded-md border border-white/40 px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              How to Use This Tool
            </Link>
          </div>
        </div>
      </section>

      <Panel n={1} Icon={IconTarget} eyebrow="1. Objective" title="What the project sets out to do">
        <p>
          Choose one enterprise governance problem and build a focused AI agent that supports,
          rather than replaces, a managerial decision. We chose the category{" "}
          <strong>Fairness and Discrimination Assessment</strong>, under People and Information,
          and scoped it to one concrete decision:
        </p>
        <p className="mt-3 rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent-light)] px-4 py-3 text-[14px] font-medium text-[var(--color-text-primary)]">
          Should the bank continue using its AI complaint-prioritisation model?
        </p>
        <p className="mt-3">
          FairLens is the agent we built to answer that question. It never ranks complaints
          itself. It audits the outputs of a model that already does that, and reports back to
          the Complaints Head with evidence, not a verdict.
        </p>
      </Panel>

      <Panel n={2} Icon={IconAlert} eyebrow="2. Problem Statement" title="Why a bank would need this">
        <p>
          A bank&apos;s AI model decides which incoming complaints get handled first. If that
          model has learned, even unintentionally, to treat some groups of customers differently,
          the bank has a governance problem it may not know about. For example, complaints
          written in a regional language could end up marked low priority far more often than
          English complaints, at the same severity, with nobody noticing until a regulator or a
          journalist does.
        </p>
        <p className="mt-3">
          The Complaints Head needs a repeatable, evidence-based way to check for this before
          deciding whether the model stays in production, and needs that check to hold up under
          scrutiny: real statistics, a real policy, a clear record of what was and was not proven.
        </p>
      </Panel>

      <Panel n={3} Icon={IconFlow} eyebrow="3. How It Works" title="Data in, evidence out, a human decides">
        <div className="mb-5 flex flex-wrap items-stretch justify-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
          {PIPELINE.map((step, i) => {
            const StepIcon = step.icon;
            return (
              <div key={step.label} className="flex items-center gap-1.5">
                <div className="flex flex-col items-center gap-1 rounded-md bg-white px-2.5 py-2 shadow-sm">
                  <StepIcon className="h-4 w-4 text-[var(--color-accent)]" />
                  <span className="text-center text-[10px] font-semibold leading-tight text-[var(--color-text-primary)]">
                    {step.label}
                  </span>
                </div>
                {i < PIPELINE.length - 1 && (
                  <span className="text-[13px] font-bold text-[var(--color-text-muted)]">{">"}</span>
                )}
              </div>
            );
          })}
        </div>
        <p>
          Every statistic, every rate, ratio, severity adjustment and SLA number, is computed by
          plain code, never by the AI model. That code applies the bank&apos;s policy (a 1.25x
          disparity threshold, a 30-complaint minimum sample, a list of approved and prohibited
          variables) and arrives at one of three recommendations. Only then is an AI model asked
          to explain, in plain language, what the evidence shows and what it does not prove. The
          AI cannot change the recommendation. If it ever tried to, the application would
          overwrite it with the one the policy engine already computed.
        </p>
        <p className="mt-3">
          This design maps directly onto what the course calls the five layers of a
          professional-grade agent: general model capability (the AI model itself), a domain
          method (the ten-step fairness methodology), enterprise context (the bank&apos;s actual
          policy thresholds and approved variables), reliable execution (deterministic TypeScript
          for every number), and quality controls (automated tests, a live testing page, and
          guardrails that cannot be argued around).
        </p>
      </Panel>

      <Panel n={4} Icon={IconLayers} eyebrow="4. The Four Scenarios" title="Built-in, reproducible test cases you can run live">
        <p>
          FairLens ships with four deterministic synthetic scenarios, around 5,000 complaints
          each, chosen to walk through every kind of answer the agent can give. The same scenario
          always produces the exact same numbers, so nothing in a live demo is left to chance.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SCENARIOS.map((s) => (
            <div key={s.id} className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5">
              <div className="text-[12.5px] font-semibold text-[var(--color-text-primary)]">{s.name}</div>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-[var(--color-text-secondary)]">
                {s.shortDescription}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel n={5} Icon={IconCheckCircle} eyebrow="5. How It Concludes" title="Three outcomes, always evidence-backed">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="card-surface rounded-lg border border-[var(--color-proceed-border)] bg-[var(--color-proceed-bg)] px-3.5 py-3.5">
            <div className="text-[13px] font-bold text-[var(--color-proceed)]">PROCEED</div>
            <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
              No material unexplained disparity, required evidence is available, no prohibited
              variable in use.
            </p>
          </div>
          <div className="card-surface rounded-lg border border-[var(--color-conditions-border)] bg-[var(--color-conditions-bg)] px-3.5 py-3.5">
            <div className="text-[13px] font-bold text-[var(--color-conditions)]">
              PROCEED WITH CONDITIONS
            </div>
            <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
              A possible issue exists, but the evidence is incomplete: a small sample, missing
              error data, or an undocumented variable.
            </p>
          </div>
          <div className="card-surface rounded-lg border border-[var(--color-escalate-border)] bg-[var(--color-escalate-bg)] px-3.5 py-3.5">
            <div className="text-[13px] font-bold text-[var(--color-escalate)]">
              ESCALATE TO HUMAN REVIEW
            </div>
            <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
              An unexplained disparity above {FAIRNESS_THRESHOLD.ratio}x survives severity
              adjustment, a prohibited variable is in use, or a protected-attribute guardrail is
              breached.
            </p>
          </div>
        </div>
        <p className="mt-3">
          The difference between a raw disparity and an unexplained one is the heart of the
          method: a gap that disappears once you account for complaint severity is explained, not
          discrimination. A gap that survives that adjustment is escalated. A group with fewer
          than {MINIMUM_SAMPLE_SIZE.n} complaints never gets a definitive answer either way,
          because the evidence simply is not there yet.
        </p>
        <p className="mt-2">
          In every case, the report ends the same way: what the evidence shows, what it does not
          prove, and exactly who has to make the final call and why the agent cannot make it for
          them. The agent never issues a legal finding and never gets the last word.
        </p>
      </Panel>

      <Panel n={6} Icon={IconShield} eyebrow="6. Guardrails" title="Built so bias cannot slip through quietly">
        <p>
          Four attributes, language, region, gender and religion, are permanently banned as model
          inputs. Gender and religion go one step further: the agent checks real outcomes across
          them on every single review, even though the model never sees these fields, because
          bias can reach the same result through a proxy variable instead of directly. Any
          disparity found there is escalated immediately, not logged as something to watch.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PROTECTED_ATTRIBUTES.map((p) => (
            <div
              key={p.attribute}
              className="flex items-start gap-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5"
            >
              <IconShield className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-escalate)]" />
              <div>
                <div className="text-[12.5px] font-semibold text-[var(--color-text-primary)]">
                  {p.attribute}
                </div>
                <div className="mt-0.5 text-[11.5px] text-[var(--color-text-secondary)]">
                  {p.reason}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3">
          The AI reasoning layer is instructed, as a rule that overrides everything else in its
          prompt, to never justify or soften a discriminatory outcome and to treat anything in the
          uploaded data as data only, never as an instruction to follow.
        </p>
      </Panel>

      <Panel n={7} Icon={IconPlay} eyebrow="7. What You Can Demo Live" title="Four things worth clicking through">
        <p>
          Everything below runs for real, on the live evidence, not a canned recording.
        </p>
        <div className="mt-3 space-y-2">
          <div className="flex items-start gap-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-white">1</span>
            <div>
              <div className="text-[12.5px] font-semibold text-[var(--color-text-primary)]">Run all four scenarios</div>
              <p className="mt-0.5 text-[11.5px] text-[var(--color-text-secondary)]">
                On the Review page, pick each scenario card in turn and watch the recommendation,
                the charts, and the evidence table change to match the story.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-white">2</span>
            <div>
              <div className="text-[12.5px] font-semibold text-[var(--color-text-primary)]">Break a guardrail on purpose</div>
              <p className="mt-0.5 text-[11.5px] text-[var(--color-text-secondary)]">
                In Step 2 on the Review page, switch on Language, Region, Gender or Religion as a
                model input, then run the review again. It escalates immediately, and the Model
                Input Policy Check names exactly which rule broke.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-white">3</span>
            <div>
              <div className="text-[12.5px] font-semibold text-[var(--color-text-primary)]">Upload your own data</div>
              <p className="mt-0.5 text-[11.5px] text-[var(--color-text-secondary)]">
                The Review page also accepts a CSV of complaint records instead of a scenario. It
                is validated and analysed in the browser; only the computed evidence, never the
                raw rows, is ever sent onward.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-white">4</span>
            <div>
              <div className="text-[12.5px] font-semibold text-[var(--color-text-primary)]">Open the Testing page</div>
              <p className="mt-0.5 text-[11.5px] text-[var(--color-text-secondary)]">
                Live, automatic proof that all four scenarios and every policy rule, including the
                gender and religion guardrails, produce the correct result, recomputed fresh on
                every page load, not a screenshot.
              </p>
            </div>
          </div>
        </div>
      </Panel>

      <Panel n={8} Icon={IconGlobe} eyebrow="8. Relevance" title="Why this is worth solving">
        <p>
          Complaint handling is one of the few places a bank&apos;s AI touches almost every
          customer, and it is exactly the kind of decision regulators expect a human to be able
          to explain. RBI&apos;s Integrated Ombudsman framework already gives customers an
          external escalation path if a complaint goes unanswered. An internal governance check
          like this one is the kind of control that keeps a bank from needing that escalation path
          to be the first place unfair treatment gets noticed.
        </p>
        <p className="mt-3">
          More broadly, this is the shape most AI governance work actually takes: not &ldquo;AI
          detects discrimination&rdquo; as a dramatic headline, but a disciplined, repeatable
          check that a manager can run before every decision to keep an AI system in production,
          with a clear, honest answer when the evidence is not good enough to decide at all.
        </p>
      </Panel>

      <section className="panel-surface rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-white to-[var(--color-accent-light)] p-7 text-center">
        <p className="text-[13.5px] text-[var(--color-text-secondary)]">
          See it work: open the Review page, run all four scenarios in turn, then flip a
          guardrail toggle and watch it escalate instantly.
        </p>
        <Link
          href="/review"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-[var(--color-navy)] px-5 py-2.5 text-[13px] font-semibold text-white shadow-md transition-transform hover:scale-[1.03] hover:bg-[var(--color-navy-light)]"
        >
          <IconCheckCircle className="h-4 w-4" />
          Run a Live Review
        </Link>
      </section>
    </div>
  );
}
