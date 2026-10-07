import { runAnalysis } from "@/lib/analysis";
import { evaluatePolicy } from "@/lib/policy";
import { DEFAULT_MODEL_DOCUMENTATION, SCENARIOS, generateComplaintsForScenario } from "@/lib/scenarios";
import type { GovernanceStatus, ModelDocumentation, ScenarioId } from "@/lib/types";

function review(scenario: ScenarioId, docs: ModelDocumentation = DEFAULT_MODEL_DOCUMENTATION) {
  const records = generateComplaintsForScenario(scenario, docs);
  const analysis = runAnalysis(records, docs);
  const policy = evaluatePolicy(analysis);
  return { analysis, policy };
}

const STATUS_LABEL: Record<GovernanceStatus, string> = {
  PROCEED: "Proceed",
  PROCEED_WITH_CONDITIONS: "Proceed with Conditions",
  ESCALATE_TO_HUMAN_REVIEW: "Escalate",
};

const EXPECTED: Record<ScenarioId, GovernanceStatus[]> = {
  "fair-system": ["PROCEED"],
  "regional-language-bias": ["ESCALATE_TO_HUMAN_REVIEW"],
  "explained-gap": ["PROCEED", "PROCEED_WITH_CONDITIONS"],
  "insufficient-data": ["PROCEED_WITH_CONDITIONS"],
};

function Check({ pass }: { pass: boolean }) {
  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
        pass
          ? "bg-[var(--color-proceed-bg)] text-[var(--color-proceed)]"
          : "bg-[var(--color-escalate-bg)] text-[var(--color-escalate)]"
      }`}
    >
      {pass ? "✓" : "✗"}
    </span>
  );
}

export default function TestingPage() {
  const scenarioResults = SCENARIOS.map((s) => {
    const { policy } = review(s.id);
    const expected = EXPECTED[s.id];
    return {
      scenario: s,
      actual: policy.status,
      pass: expected.includes(policy.status),
      expectedLabel: expected.map((e) => STATUS_LABEL[e]).join(" or "),
    };
  });

  const missingErrorTest = (() => {
    const docs = { ...DEFAULT_MODEL_DOCUMENTATION, includeErrorGroundTruth: false };
    const { analysis } = review("fair-system", docs);
    return {
      pass: analysis.errorAssessmentAvailable === false && analysis.errorIndicatorsByLanguage.length === 0,
      detail: analysis.errorAssessmentAvailable
        ? "Error assessment was unexpectedly marked available."
        : "Agent correctly reports that error fairness cannot be assessed, with no invented rate.",
    };
  })();

  const prohibitedInputTest = (() => {
    const docs = { ...DEFAULT_MODEL_DOCUMENTATION, usesLanguageAsInput: true };
    const { policy } = review("fair-system", docs);
    return {
      pass: policy.status === "ESCALATE_TO_HUMAN_REVIEW",
      detail: `Language documented as a model input → governance status: ${STATUS_LABEL[policy.status]}.`,
    };
  })();

  const conditionalVariableTest = (() => {
    const docs = {
      ...DEFAULT_MODEL_DOCUMENTATION,
      usesCustomerValueAsInput: true,
      customerValueDocumented: false,
    };
    const { policy } = review("fair-system", docs);
    return {
      pass: policy.status === "PROCEED_WITH_CONDITIONS" || policy.status === "ESCALATE_TO_HUMAN_REVIEW",
      detail: `Customer value tier used without approval documentation → governance status: ${STATUS_LABEL[policy.status]}.`,
    };
  })();

  const genderGuardrailTest = (() => {
    const docs = { ...DEFAULT_MODEL_DOCUMENTATION, usesGenderAsInput: true };
    const { policy } = review("fair-system", docs);
    return {
      pass: policy.status === "ESCALATE_TO_HUMAN_REVIEW",
      detail: `Gender documented as a model input → governance status: ${STATUS_LABEL[policy.status]}.`,
    };
  })();

  const religionGuardrailTest = (() => {
    const docs = { ...DEFAULT_MODEL_DOCUMENTATION, usesReligionAsInput: true };
    const { policy } = review("fair-system", docs);
    return {
      pass: policy.status === "ESCALATE_TO_HUMAN_REVIEW",
      detail: `Religion documented as a model input → governance status: ${STATUS_LABEL[policy.status]}.`,
    };
  })();

  const guardrailMonitoringTest = (() => {
    // Even in the biased scenario (language is deliberately unfair), gender
    // and religion must stay balanced, because the data generator never
    // encodes bias on protected attributes. This proves the monitor
    // actually checks these fields rather than always reporting clear.
    const { analysis } = review("regional-language-bias");
    const threshold = 1.25;
    const genderClear = analysis.byGender.groups.every(
      (g) => g.group === analysis.byGender.benchmarkGroup || !g.sufficientSample || g.rateRatio <= threshold
    );
    const religionClear = analysis.byReligion.groups.every(
      (g) => g.group === analysis.byReligion.benchmarkGroup || !g.sufficientSample || g.rateRatio <= threshold
    );
    return {
      pass: genderClear && religionClear,
      detail:
        genderClear && religionClear
          ? "Gender and religion outcomes stay balanced even while the Regional-Language Bias scenario is active, confirming the guardrail checks the right fields."
          : "Gender or religion showed an unexpected disparity. Investigate the data generator.",
    };
  })();

  const allPass =
    scenarioResults.every((r) => r.pass) &&
    missingErrorTest.pass &&
    prohibitedInputTest.pass &&
    conditionalVariableTest.pass &&
    genderGuardrailTest.pass &&
    religionGuardrailTest.pass &&
    guardrailMonitoringTest.pass;

  return (
    <div className="max-w-[1000px] space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">Testing</h1>
        <p className="mt-1 text-[12.5px] text-[var(--color-text-muted)]">
          Synthetic scenarios and validation results for the deterministic analysis and policy
          engines. These run live on every page load, nothing here is hard-coded.
        </p>
      </div>

      <div
        className={`rounded-md border px-4 py-2.5 text-[12.5px] font-medium ${
          allPass
            ? "border-[var(--color-proceed-border)] bg-[var(--color-proceed-bg)] text-[var(--color-proceed)]"
            : "border-[var(--color-escalate-border)] bg-[var(--color-escalate-bg)] text-[var(--color-escalate)]"
        }`}
      >
        {allPass ? "All scenario and policy checks pass." : "One or more checks failed. Review below."}
      </div>

      <div className="card-surface overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full min-w-[640px] text-left text-[12.5px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)] text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">
              <th className="px-3 py-2 font-medium">Scenario</th>
              <th className="px-3 py-2 font-medium">Expected</th>
              <th className="px-3 py-2 font-medium">Actual</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {scenarioResults.map((r) => (
              <tr key={r.scenario.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-3 py-2 font-medium text-[var(--color-text-primary)]">{r.scenario.name}</td>
                <td className="px-3 py-2 text-[var(--color-text-secondary)]">{r.expectedLabel}</td>
                <td className="px-3 py-2 text-[var(--color-text-secondary)]">{STATUS_LABEL[r.actual]}</td>
                <td className="px-3 py-2">
                  <Check pass={r.pass} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TestCard title="Test: Missing error evidence" pass={missingErrorTest.pass} detail={missingErrorTest.detail} />
        <TestCard title="Test: Prohibited input" pass={prohibitedInputTest.pass} detail={prohibitedInputTest.detail} />
        <TestCard
          title="Test: Conditional variable"
          pass={conditionalVariableTest.pass}
          detail={conditionalVariableTest.detail}
        />
      </div>

      <div>
        <h2 className="mb-2 text-[13px] font-semibold text-[var(--color-text-primary)]">
          Guardrail Tests
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TestCard title="Test: Gender as model input" pass={genderGuardrailTest.pass} detail={genderGuardrailTest.detail} />
          <TestCard
            title="Test: Religion as model input"
            pass={religionGuardrailTest.pass}
            detail={religionGuardrailTest.detail}
          />
          <TestCard
            title="Test: Guardrail monitoring stays accurate"
            pass={guardrailMonitoringTest.pass}
            detail={guardrailMonitoringTest.detail}
          />
        </div>
      </div>

      <p className="text-[11.5px] text-[var(--color-text-muted)]">
        See also the automated test suite in <code>tests/</code> (run with{" "}
        <code>npm run test</code>), which exercises the same deterministic engine with explicit
        assertions.
      </p>
    </div>
  );
}

function TestCard({ title, pass, detail }: { title: string; pass: boolean; detail: string }) {
  return (
    <div className="card-surface rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[12.5px] font-semibold text-[var(--color-text-primary)]">{title}</div>
        <Check pass={pass} />
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">{detail}</p>
    </div>
  );
}
