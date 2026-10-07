function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-navy)] text-[11px] font-semibold text-white">
        {n}
      </span>
      <div className="pb-4">
        <div className="text-[13.5px] font-medium text-[var(--color-text-primary)]">{title}</div>
        <div className="mt-1 text-[12.5px] leading-relaxed text-[var(--color-text-secondary)]">
          {children}
        </div>
      </div>
    </li>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-md border border-[var(--color-border)] px-3 py-2.5">
      <summary className="cursor-pointer text-[12.5px] font-medium text-[var(--color-text-primary)] marker:content-none">
        <span className="mr-2 inline-block text-[var(--color-text-muted)] transition-transform group-open:rotate-90">
          ›
        </span>
        {q}
      </summary>
      <div className="mt-2 pl-5 text-[12.5px] leading-relaxed text-[var(--color-text-secondary)]">
        {children}
      </div>
    </details>
  );
}

export default function GuidePage() {
  return (
    <div className="max-w-[900px] space-y-8">
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">
          Guide: How to Use This Tool
        </h1>
        <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-[var(--color-text-muted)]">
          A short training module for anyone new to the Complaint AI Fairness Review tool. Read
          this once and you will be able to run a full governance review, read every result, and
          explain what it means to someone else.
        </p>
      </div>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-[var(--color-text-primary)]">
          What this tool is for
        </h2>
        <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          A bank uses an AI model to decide which customer complaints get handled first. This
          tool does not touch that model and does not rank complaints itself. It audits the
          model&apos;s past decisions and answers one question for the Complaints Head: is it
          still safe to keep using this model, or does a person need to step in? Every answer
          comes with the evidence behind it, in plain numbers, not just an opinion.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-[var(--color-text-primary)]">
          Finding your way around
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-md border border-[var(--color-border)] px-3 py-2.5">
            <div className="text-[12.5px] font-medium text-[var(--color-text-primary)]">Review</div>
            <p className="mt-0.5 text-[12px] text-[var(--color-text-secondary)]">
              The working page. Pick a scenario or upload data, run the review, read the result.
            </p>
          </div>
          <div className="rounded-md border border-[var(--color-border)] px-3 py-2.5">
            <div className="text-[12.5px] font-medium text-[var(--color-text-primary)]">
              Presentation
            </div>
            <p className="mt-0.5 text-[12px] text-[var(--color-text-secondary)]">
              A one-page summary built for showing the project to someone who has never seen it.
            </p>
          </div>
          <div className="rounded-md border border-[var(--color-border)] px-3 py-2.5">
            <div className="text-[12.5px] font-medium text-[var(--color-text-primary)]">Guide</div>
            <p className="mt-0.5 text-[12px] text-[var(--color-text-secondary)]">
              This page. How to use the tool, step by step.
            </p>
          </div>
          <div className="rounded-md border border-[var(--color-border)] px-3 py-2.5">
            <div className="text-[12.5px] font-medium text-[var(--color-text-primary)]">Policy</div>
            <p className="mt-0.5 text-[12px] text-[var(--color-text-secondary)]">
              The bank&apos;s fictional fairness policy: thresholds, approved variables, and the
              non-discrimination guardrails.
            </p>
          </div>
          <div className="rounded-md border border-[var(--color-border)] px-3 py-2.5">
            <div className="text-[12.5px] font-medium text-[var(--color-text-primary)]">
              Methodology
            </div>
            <p className="mt-0.5 text-[12px] text-[var(--color-text-secondary)]">
              The ten-step method the agent follows on every review, and why the statistics are
              computed in code rather than by the AI model.
            </p>
          </div>
          <div className="rounded-md border border-[var(--color-border)] px-3 py-2.5">
            <div className="text-[12.5px] font-medium text-[var(--color-text-primary)]">Testing</div>
            <p className="mt-0.5 text-[12px] text-[var(--color-text-secondary)]">
              Live, automatic proof that all four scenarios and every guardrail produce the
              correct result, recomputed on every page load.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[14px] font-semibold text-[var(--color-text-primary)]">
          Running your first review
        </h2>
        <ol className="space-y-0">
          <Step n={1} title="Open Review">
            It is the default page, or use the link in the sidebar.
          </Step>
          <Step n={2} title="Choose what to review">
            Pick one of the four scenario cards (Fair System is a good first choice), or skip
            this and upload your own CSV further down the page instead.
          </Step>
          <Step n={3} title="Check the Model Documentation panel">
            These toggles describe what the bank says its AI model actually uses as input. Leave
            them at their defaults for a normal run, or switch one on to see what a policy
            violation looks like (see the demo script below).
          </Step>
          <Step n={4} title="Click Run Governance Review">
            You will see a short checklist while the review runs. It usually takes a few seconds.
          </Step>
          <Step n={5} title="Read the result from the top down">
            The large coloured banner is the final recommendation. Everything below it is the
            evidence that produced it, in the same order the method works through it.
          </Step>
        </ol>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-[var(--color-text-primary)]">
          Reading the result
        </h2>
        <div className="space-y-2">
          <div className="rounded-md border border-[var(--color-border)] px-3 py-2.5">
            <div className="text-[12.5px] font-medium text-[var(--color-text-primary)]">
              The governance decision banner
            </div>
            <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
              Green PROCEED, amber PROCEED WITH CONDITIONS, or red ESCALATE TO HUMAN REVIEW. The
              sentence underneath is the one-line reason.
            </p>
          </div>
          <div className="rounded-md border border-[var(--color-border)] px-3 py-2.5">
            <div className="text-[12.5px] font-medium text-[var(--color-text-primary)]">
              Evidence Summary cards
            </div>
            <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
              The headline numbers: how many complaints were reviewed, which group is the
              benchmark everyone else is compared against, the worst observed ratio, the bank&apos;s
              1.25x threshold, and the worst ratio after adjusting for complaint severity.
            </p>
          </div>
          <div className="rounded-md border border-[var(--color-border)] px-3 py-2.5">
            <div className="text-[12.5px] font-medium text-[var(--color-text-primary)]">
              The language table and charts
            </div>
            <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
              Every language group side by side: raw rate, raw ratio, severity-adjusted rate and
              ratio, SLA compliance, and the reopen-rate indicator. The charts show the same raw
              versus adjusted comparison visually, plus SLA compliance by group.
            </p>
          </div>
          <div className="rounded-md border border-[var(--color-border)] px-3 py-2.5">
            <div className="text-[12.5px] font-medium text-[var(--color-text-primary)]">
              Why did the system reach this decision?
            </div>
            <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
              A numbered trail from the raw numbers to the final status. This is the section to
              point at if someone asks &ldquo;how did it decide that&rdquo; during a demo.
            </p>
          </div>
          <div className="rounded-md border border-[var(--color-border)] px-3 py-2.5">
            <div className="text-[12.5px] font-medium text-[var(--color-text-primary)]">
              Non-Discrimination Guardrail Monitoring
            </div>
            <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
              A separate check across gender and religion, the attributes the model is never
              allowed to use at all. If this ever turns red, treat it as more serious than a
              normal disparity finding, it means a protected group is being treated differently
              even though the model should not know anything about that group.
            </p>
          </div>
          <div className="rounded-md border border-[var(--color-border)] px-3 py-2.5">
            <div className="text-[12.5px] font-medium text-[var(--color-text-primary)]">
              Model Input Policy Check
            </div>
            <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
              Confirms which variables the model is documented to use, and whether any of them
              breaks the bank&apos;s rules.
            </p>
          </div>
          <div className="rounded-md border border-[var(--color-border)] px-3 py-2.5">
            <div className="text-[12.5px] font-medium text-[var(--color-text-primary)]">
              Evidence, Risk, Recommendation, Gaps and Limits, Human Decision Needed
            </div>
            <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
              The written governance report. If an AI key is configured this is written by the AI
              model from the evidence above. If not, you will see a notice saying so, and a
              reliable, rule-based version of the same report is shown instead so the page never
              shows nothing.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-[var(--color-text-primary)]">
          Try all four scenarios
        </h2>
        <p className="mb-3 text-[12.5px] text-[var(--color-text-secondary)]">
          This is also the fastest way to understand the tool: run each one in turn and compare
          the results.
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-md border border-[var(--color-border)] px-3 py-2.5">
            <div className="text-[12.5px] font-medium text-[var(--color-text-primary)]">
              Fair System, expect PROCEED
            </div>
            <p className="mt-0.5 text-[12px] text-[var(--color-text-secondary)]">
              Every language group behaves the same way. Nothing to escalate.
            </p>
          </div>
          <div className="rounded-md border border-[var(--color-border)] px-3 py-2.5">
            <div className="text-[12.5px] font-medium text-[var(--color-text-primary)]">
              Regional-Language Bias, expect ESCALATE
            </div>
            <p className="mt-0.5 text-[12px] text-[var(--color-text-secondary)]">
              Marathi complaints are marked low priority far more often than English, and the gap
              survives severity adjustment. A real, unexplained disparity.
            </p>
          </div>
          <div className="rounded-md border border-[var(--color-border)] px-3 py-2.5">
            <div className="text-[12.5px] font-medium text-[var(--color-text-primary)]">
              Explained Gap, expect PROCEED or PROCEED WITH CONDITIONS
            </div>
            <p className="mt-0.5 text-[12px] text-[var(--color-text-secondary)]">
              A raw gap exists, but it mostly disappears once you account for the fact that one
              group simply has more lower-severity complaints. Point out the raw-versus-adjusted
              chart here.
            </p>
          </div>
          <div className="rounded-md border border-[var(--color-border)] px-3 py-2.5">
            <div className="text-[12.5px] font-medium text-[var(--color-text-primary)]">
              Insufficient Data, expect PROCEED WITH CONDITIONS
            </div>
            <p className="mt-0.5 text-[12px] text-[var(--color-text-secondary)]">
              One language group has fewer than 30 complaints. Its observed rate might look odd,
              but the system refuses to draw a conclusion from too little evidence.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-[var(--color-text-primary)]">
          Demonstrate the guardrails
        </h2>
        <p className="text-[12.5px] leading-relaxed text-[var(--color-text-secondary)]">
          On any scenario, switch on &ldquo;Language used as model input&rdquo;, &ldquo;Region
          used as model input&rdquo;, &ldquo;Gender used as model input&rdquo;, or &ldquo;Religion
          used as model input&rdquo; in Step 2 of the Review page, then run the review again. Each
          one is a protected attribute, so each one alone forces ESCALATE TO HUMAN REVIEW, and the
          Model Input Policy Check section will show exactly which rule it broke. Switch it back
          off afterward to return to a normal run.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-[var(--color-text-primary)]">
          Using your own data
        </h2>
        <p className="text-[12.5px] leading-relaxed text-[var(--color-text-secondary)]">
          On the Review page, under &ldquo;Optional: Upload Your Own CSV&rdquo;, choose a file.
          It replaces the selected scenario. The required columns and allowed values are listed
          in <code>data/README.md</code> in the project folder. The file is checked in your
          browser first, and only the computed evidence, never your raw rows, is sent onward.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[14px] font-semibold text-[var(--color-text-primary)]">
          Frequently asked questions
        </h2>
        <div className="space-y-2">
          <Faq q="Why does it say the AI narrative is unavailable?">
            This tool does not require an AI key to work. Without one, every number and the final
            recommendation are still fully computed, you just get a plain, rule-based written
            report instead of one phrased by the AI model. Add an <code>OPENAI_API_KEY</code> in
            the project&apos;s environment variables to turn the AI narrative on.
          </Faq>
          <Faq q="Can the recommendation ever be wrong because the AI made a mistake?">
            No. The recommendation (PROCEED, PROCEED WITH CONDITIONS, or ESCALATE) is always
            decided by plain code before the AI model is ever called. The AI only explains that
            decision in words. If its explanation does not match the computed decision, the
            application overrides it automatically.
          </Faq>
          <Faq q="What counts as a small sample?">
            Fewer than 30 complaints for a given group. Below that, the tool will not draw a
            fairness conclusion for that group, no matter how extreme its numbers look.
          </Faq>
          <Faq q="Is any of this real customer data?">
            No. Every scenario uses synthetic data generated by a fixed formula, so the same
            scenario always produces the same numbers. Nothing here is a real complaint or a real
            customer.
          </Faq>
          <Faq q="What is the difference between the Policy Check and the Guardrail panel?">
            The Policy Check confirms whether the model is documented to use a variable it should
            not. The Guardrail panel checks the actual outcomes for gender and religion, even
            though the model never uses them, to catch the case where bias slips in indirectly.
          </Faq>
        </div>
      </section>
    </div>
  );
}
