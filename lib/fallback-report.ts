// Deterministic, template-based governance report used ONLY when the AI
// narrative is unavailable (no API key, API failure, schema mismatch). This
// is NOT a fabricated LLM response. Every sentence is derived directly
// from the already-computed analysis/policy objects so the UI still has a
// complete, consistent governance report to render, per spec section 33/34.

import type { AnalysisResult, GovernanceReport, PolicyEvaluation } from "./types";

function statusLabel(status: PolicyEvaluation["status"]): string {
  switch (status) {
    case "PROCEED":
      return "PROCEED";
    case "PROCEED_WITH_CONDITIONS":
      return "PROCEED WITH CONDITIONS";
    case "ESCALATE_TO_HUMAN_REVIEW":
      return "ESCALATE TO HUMAN REVIEW";
  }
}

export function buildFallbackReport(
  analysis: AnalysisResult,
  policy: PolicyEvaluation
): GovernanceReport {
  const finding =
    policy.riskFlags.length > 0
      ? `Deterministic policy evaluation returned ${statusLabel(policy.status)}. ${
          policy.riskFlags[0]
        }`
      : `Deterministic policy evaluation returned ${statusLabel(
          policy.status
        )}. No material unexplained disparity was detected across ${analysis.totalComplaints.toLocaleString()} reviewed complaints.`;

  const evidence =
    policy.riskFlags.length > 0
      ? policy.riskFlags
      : [
          `Benchmark group "${analysis.byLanguage.benchmarkGroup}" low-priority rate: ${(
            analysis.byLanguage.benchmarkRate * 100
          ).toFixed(1)}%.`,
          `All severity-adjusted ratios remain below the ${policy.summaryMetrics.threshold}x internal threshold.`,
        ];

  const risk =
    policy.status === "ESCALATE_TO_HUMAN_REVIEW"
      ? "An unexplained disparity or policy violation was detected. Continued unmonitored operation could create inconsistent treatment of customers by language/region and expose the bank to governance and reputational risk."
      : policy.status === "PROCEED_WITH_CONDITIONS"
      ? "No confirmed unexplained disparity was found, but open conditions (small samples, missing evidence, or undocumented variable use) mean the model's fairness cannot be fully confirmed yet."
      : "No material fairness risk was identified in this review based on available evidence.";

  const recommendationDetail =
    policy.conditions.length > 0
      ? `Recommended next steps: ${policy.conditions.join(" ")}`
      : policy.status === "ESCALATE_TO_HUMAN_REVIEW"
      ? "Escalate to the Complaints Head for human review before continuing unmonitored operation of the model."
      : "Continue operating the model under routine monitoring; no additional conditions were triggered by this review.";

  const gapsAndLimits = [
    ...(analysis.errorAssessmentAvailable
      ? []
      : ["Error ground truth was unavailable for this review. Error fairness could not be assessed."]),
    ...analysis.sampleSizeFlags
      .filter((f) => !f.sufficientSample)
      .map((f) => `"${f.group}" has an insufficient sample (n=${f.n}) for a definitive conclusion.`),
    "This assessment reflects statistical disparity only and does not constitute a legal finding of discrimination.",
  ];

  return {
    recommendation: policy.status,
    finding,
    evidence,
    risk,
    recommendationDetail,
    gapsAndLimits: gapsAndLimits.length > 0 ? gapsAndLimits : ["No additional gaps identified."],
    humanDecisionNeeded: {
      owner: "Complaints Head / designated AI governance owner",
      decision:
        policy.status === "ESCALATE_TO_HUMAN_REVIEW"
          ? "Whether to pause, restrict, or continue the complaint-prioritisation model given the flagged disparity or policy violation."
          : policy.status === "PROCEED_WITH_CONDITIONS"
          ? "Whether to accept the listed conditions and continue monitoring, or request further evidence before continuing."
          : "Whether to formally note this review and continue routine operation.",
      reason:
        "The agent can surface statistical evidence and apply bank policy mechanically, but it cannot make legal findings, modify the model, or issue final business approval. That authority remains with the Complaints Head.",
    },
  };
}
