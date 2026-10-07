// Deterministic policy decision engine.
//
// Takes the output of lib/analysis.ts and the bank's governance policy and
// produces a structured, deterministic governance status. The LLM layer
// (lib/governance-agent.ts) explains this result. It never recalculates it.

import type { AnalysisResult, GovernanceStatus, PolicyEvaluation } from "./types";
import { FAIRNESS_THRESHOLD_RATIO, MIN_SAMPLE_SIZE } from "./analysis";

const NEAR_THRESHOLD_FLOOR = 1.1;

export function evaluatePolicy(analysis: AnalysisResult): PolicyEvaluation {
  const riskFlags: string[] = [];
  const triggeredRules: string[] = [];
  const conditions: string[] = [];

  let escalate = false;
  let needsConditions = false;

  // --- 1. Prohibited model variables ------------------------------------
  const prohibitedViolations = analysis.modelInputChecks.filter(
    (c) => c.approvalStatus === "PROHIBITED" && c.violation
  );
  if (prohibitedViolations.length > 0) {
    escalate = true;
    for (const v of prohibitedViolations) {
      riskFlags.push(`Prohibited variable in use: ${v.variable}.`);
      triggeredRules.push(`Policy/control violation: "${v.variable}" is a prohibited model input.`);
    }
  }

  // --- 2. Conditional variable lacking documentation ---------------------
  const conditionalViolations = analysis.modelInputChecks.filter(
    (c) => c.approvalStatus === "CONDITIONAL" && c.violation
  );
  if (conditionalViolations.length > 0) {
    needsConditions = true;
    for (const v of conditionalViolations) {
      riskFlags.push(`Conditional variable "${v.variable}" is in use without approved documentation.`);
      triggeredRules.push(`"${v.variable}" requires documented approval before continued use.`);
      conditions.push(`Obtain and file formal approval documentation for use of ${v.variable}.`);
    }
  }

  // --- 3. Severity-adjusted language disparity ---------------------------
  const sampleFlagByGroup = new Map(analysis.sampleSizeFlags.map((f) => [f.group, f]));
  const worstUnexplainedRatios: number[] = [];

  for (const g of analysis.severityAdjusted.groups) {
    if (g.group === analysis.severityAdjusted.benchmarkGroup) continue;
    const sampleFlag = sampleFlagByGroup.get(g.group);
    const sufficientSample = sampleFlag?.sufficientSample ?? false;

    if (!sufficientSample) {
      needsConditions = true;
      conditions.push(
        `Collect more data for "${g.group}" (n=${sampleFlag?.n ?? "unknown"}) before drawing a fairness conclusion; continue monitoring and reassess once the sample is sufficient.`
      );
      triggeredRules.push(
        `Minimum sample size rule: "${g.group}" has fewer than ${MIN_SAMPLE_SIZE} complaints. No definitive fairness conclusion can be made.`
      );
      continue;
    }

    worstUnexplainedRatios.push(g.adjustedRatio);

    if (g.adjustedRatio > FAIRNESS_THRESHOLD_RATIO) {
      escalate = true;
      riskFlags.push(
        `"${g.group}" severity-adjusted low-priority ratio is ${g.adjustedRatio.toFixed(
          2
        )}x versus benchmark "${analysis.severityAdjusted.benchmarkGroup}". Exceeds the ${FAIRNESS_THRESHOLD_RATIO}x internal threshold after adjustment.`
      );
      triggeredRules.push(
        `Fairness threshold rule: unexplained severity-adjusted disparity for "${g.group}" exceeds ${FAIRNESS_THRESHOLD_RATIO}x.`
      );
    } else if (g.adjustedRatio >= NEAR_THRESHOLD_FLOOR) {
      needsConditions = true;
      riskFlags.push(
        `"${g.group}" severity-adjusted ratio (${g.adjustedRatio.toFixed(
          2
        )}x) is close to the ${FAIRNESS_THRESHOLD_RATIO}x internal threshold.`
      );
      triggeredRules.push(`Disparity for "${g.group}" is close to threshold. Monitor.`);
      conditions.push(`Continue monitoring "${g.group}" low-priority rate against the ${FAIRNESS_THRESHOLD_RATIO}x threshold.`);
    }
  }

  // --- 4. Raw disparities in region / customer value (no adjustment available) ---
  // A disparity here is treated as a softer signal: it needs investigation
  // and extended analysis, but is not automatically proof of discrimination.
  for (const dimLabel of ["region", "customer value"] as const) {
    const benchmarkAnalysis = dimLabel === "region" ? analysis.byRegion : analysis.byCustomerValue;
    for (const g of benchmarkAnalysis.groups) {
      if (g.group === benchmarkAnalysis.benchmarkGroup) continue;
      if (!g.sufficientSample) continue;
      if (g.rateRatio > FAIRNESS_THRESHOLD_RATIO) {
        needsConditions = true;
        riskFlags.push(
          `"${g.group}" (${dimLabel}) raw low-priority ratio is ${g.rateRatio.toFixed(
            2
          )}x versus benchmark "${benchmarkAnalysis.benchmarkGroup}". Severity-adjusted analysis is not available for this dimension.`
        );
        triggeredRules.push(
          `Raw disparity detected in ${dimLabel} ("${g.group}"). Cannot confirm as explained or unexplained without severity adjustment for this dimension.`
        );
        conditions.push(`Investigate the ${dimLabel} disparity for "${g.group}" and extend severity-adjusted analysis to this dimension.`);
      }
    }
  }

  // --- 4b. Guardrail monitoring: gender and religion -----------------------
  // Gender and religion are protected attributes the model is never allowed
  // to use (see lib/policy-data.ts). Any outcome disparity found here, even
  // though the model never sees these fields, is treated as a hard
  // guardrail breach and escalated directly, not merely flagged as a
  // condition. This is the non-discrimination guardrail in action: the
  // agent actively checks for it on every review, whether or not it was
  // asked to.
  for (const dimLabel of ["gender", "religion"] as const) {
    const benchmarkAnalysis = dimLabel === "gender" ? analysis.byGender : analysis.byReligion;
    for (const g of benchmarkAnalysis.groups) {
      if (g.group === benchmarkAnalysis.benchmarkGroup) continue;
      if (!g.sufficientSample) continue;
      if (g.rateRatio > FAIRNESS_THRESHOLD_RATIO) {
        escalate = true;
        riskFlags.push(
          `Guardrail breach: "${g.group}" (${dimLabel}) raw low-priority ratio is ${g.rateRatio.toFixed(
            2
          )}x versus benchmark "${benchmarkAnalysis.benchmarkGroup}". ${
            dimLabel.charAt(0).toUpperCase() + dimLabel.slice(1)
          } is a protected attribute and must never show this kind of outcome gap.`
        );
        triggeredRules.push(
          `Non-discrimination guardrail: outcome disparity detected across ${dimLabel} groups, a protected attribute.`
        );
      }
    }
  }

  // --- 5. Missing error ground truth --------------------------------------
  if (!analysis.errorAssessmentAvailable) {
    needsConditions = true;
    conditions.push(
      "Error/misclassification ground truth (reopened_after_low_priority) is unavailable. Collect this evidence before the next review."
    );
    triggeredRules.push("Error fairness cannot be assessed. Ground truth evidence is missing.");
  }

  // --- 6. Overall sample size sanity check --------------------------------
  if (analysis.totalComplaints < MIN_SAMPLE_SIZE) {
    escalate = true;
    riskFlags.push("Total complaint volume is below the minimum sample size for any conclusion.");
    triggeredRules.push("Minimum sample size rule applied to the overall dataset.");
  }

  let status: GovernanceStatus;
  if (escalate) {
    status = "ESCALATE_TO_HUMAN_REVIEW";
  } else if (needsConditions) {
    status = "PROCEED_WITH_CONDITIONS";
  } else {
    status = "PROCEED";
  }

  const worstUnexplainedRatio =
    worstUnexplainedRatios.length > 0 ? Math.max(...worstUnexplainedRatios) : null;

  return {
    status,
    riskFlags,
    triggeredRules,
    conditions,
    humanDecisionRequired: status !== "PROCEED",
    summaryMetrics: {
      worstUnexplainedRatio,
      threshold: FAIRNESS_THRESHOLD_RATIO,
      minSampleSize: MIN_SAMPLE_SIZE,
    },
  };
}
