// Fictional bank policy content, shown verbatim on the Policy page and
// referenced by the deterministic policy engine in lib/policy.ts.

export const POLICY_NAME = "Complaint AI Fairness & Governance Policy";
export const POLICY_VERSION = "v4";

export const INTERNAL_SLA_STANDARDS = [
  { severity: "Critical", slaDays: 1 },
  { severity: "High", slaDays: 5 },
  { severity: "Standard", slaDays: 15 },
] as const;

export const SLA_DISCLAIMER =
  "These are fictional internal bank turnaround standards created for this project. They are not RBI requirements.";

export const REGULATORY_CONTEXT =
  "RBI's Integrated Ombudsman framework provides an external escalation route where a regulated entity has not responded within 30 days, subject to the applicable scheme and conditions. This is external regulatory context, separate from the bank's internal SLA standards above.";

export const FAIRNESS_THRESHOLD = {
  ratio: 1.25,
  description:
    "Flag a group when its low-priority rate is more than 1.25x the benchmark/reference rate.",
  disclaimer:
    "The 1.25x threshold is a fictional internal governance control created for this project and is not an RBI requirement.",
};

export const MINIMUM_SAMPLE_SIZE = {
  n: 30,
  description:
    "Do not make a definitive fairness conclusion for groups with fewer than 30 complaints.",
};

export const APPROVED_VARIABLES = [
  { variable: "severity", status: "ALLOWED" as const, note: "Core, approved input." },
  { variable: "product", status: "ALLOWED" as const, note: "Core, approved input." },
  { variable: "vulnerability flag", status: "ALLOWED" as const, note: "Core, approved input." },
  {
    variable: "customer value tier",
    status: "CONDITIONAL" as const,
    note: "Allowed only when documented and formally approved.",
  },
];

export const PROHIBITED_VARIABLES = [
  { variable: "language", status: "PROHIBITED" as const },
  { variable: "region", status: "PROHIBITED" as const },
  { variable: "gender", status: "PROHIBITED" as const },
  { variable: "religion", status: "PROHIBITED" as const },
];

export const AUTHORITY_LIMITS = [
  "Make legal discrimination findings.",
  "Modify the AI model.",
  "Approve the model permanently.",
  "Decide compensation.",
  "Override the Complaints Head.",
];

// ---------------------------------------------------------------------------
// Non-discrimination guardrails. These are the hard rules the agent enforces
// on every review, regardless of scenario or uploaded data. They exist so a
// protected characteristic can never, directly or through a proxy, change a
// customer's treatment under this model.
// ---------------------------------------------------------------------------
export const PROTECTED_ATTRIBUTES = [
  {
    attribute: "Language",
    coveredBy: "model_input_language",
    reason:
      "A customer's complaint language must never change how quickly their complaint is handled.",
  },
  {
    attribute: "Region (place of residence)",
    coveredBy: "model_input_region",
    reason: "A customer's location must never change how quickly their complaint is handled.",
  },
  {
    attribute: "Gender",
    coveredBy: "model_input_gender",
    reason: "A customer's gender must never change how quickly their complaint is handled.",
  },
  {
    attribute: "Religion",
    coveredBy: "model_input_religion",
    reason: "A customer's religion must never change how quickly their complaint is handled.",
  },
] as const;

export const GUARDRAIL_PRINCIPLES = [
  {
    title: "Protected attributes are never model inputs",
    detail:
      "Language, region, gender and religion are permanently classified PROHIBITED. The model input policy check fails the review the moment any of them is documented as an input to the prioritisation model, with no exception and no approval path.",
  },
  {
    title: "Outcomes are monitored even when the attribute is not an input",
    detail:
      "Every review checks the low-priority rate across gender and religion groups, whether or not the model uses those fields. A disparity here would mean a proxy variable is producing the same unfair effect indirectly, so it is escalated immediately rather than logged as a condition to watch.",
  },
  {
    title: "Vulnerability protection is not the same as profiling",
    detail:
      "The vulnerability flag is an approved input because it exists to get vulnerable customers faster, more careful handling, not to deprioritise them. Approved use of a sensitive signal to protect a customer is treated differently from a prohibited input that could disadvantage one.",
  },
  {
    title: "The reasoning layer cannot be talked into bias",
    detail:
      "The AI governance narrative is instructed to never justify, excuse or reason toward a discriminatory outcome, even if a prompt or an uploaded data column tries to lead it there. It can only explain evidence that was computed deterministically before it ever saw the request.",
  },
  {
    title: "A breach always reaches a human",
    detail:
      "Any confirmed guardrail breach, prohibited input in use or outcome disparity on a protected attribute, forces ESCALATE TO HUMAN REVIEW. The agent cannot downgrade this to a softer recommendation under any combination of other evidence.",
  },
] as const;

export const POLICY_SECTIONS = [
  {
    id: "sla",
    title: "1. Internal SLA Standards",
    summary: "Fictional internal turnaround targets by complaint severity.",
  },
  {
    id: "fairness",
    title: "2. Fairness Thresholds",
    summary: "The internal governance trigger used to flag potential disparities.",
  },
  {
    id: "sample",
    title: "3. Minimum Sample Size",
    summary: "The minimum evidence required before drawing a fairness conclusion.",
  },
  {
    id: "approved",
    title: "4. Approved Model Variables",
    summary: "Variables the prioritisation model is permitted to use.",
  },
  {
    id: "prohibited",
    title: "5. Prohibited Variables",
    summary: "Variables the prioritisation model must never use.",
  },
  {
    id: "authority",
    title: "6. Authority Limits",
    summary: "What this agent is not authorised to decide.",
  },
  {
    id: "regulatory",
    title: "7. Regulatory Context",
    summary: "External regulatory context, kept separate from internal policy.",
  },
  {
    id: "guardrails",
    title: "8. Non-Discrimination Guardrails",
    summary: "The hard rules that keep protected attributes out of this model, enforced and monitored.",
  },
] as const;
