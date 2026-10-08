import { z } from "zod";

export const scenarioIdSchema = z.enum([
  "fair-system",
  "regional-language-bias",
  "explained-gap",
  "insufficient-data",
]);

export const modelDocumentationSchema = z.object({
  usesLanguageAsInput: z.boolean(),
  usesRegionAsInput: z.boolean(),
  usesGenderAsInput: z.boolean(),
  usesReligionAsInput: z.boolean(),
  usesCustomerValueAsInput: z.boolean(),
  customerValueDocumented: z.boolean(),
  includeErrorGroundTruth: z.boolean(),
});

export const governanceStatusSchema = z.enum([
  "PROCEED",
  "PROCEED_WITH_CONDITIONS",
  "ESCALATE_TO_HUMAN_REVIEW",
]);

const scenarioRequestSchema = z.object({
  scenario: scenarioIdSchema,
  modelDocumentation: modelDocumentationSchema,
});

// Loose structural schemas for pre-computed, aggregated evidence coming from
// a CSV upload (computed client-side by lib/analysis.ts / lib/policy.ts,
// never raw rows). `.passthrough()` is used deliberately: the nested shape
// is large and already fully typed in lib/types.ts, so this layer only
// guards against obviously malformed payloads rather than re-deriving the
// entire type tree in Zod.
const aggregatedEvidenceRequestSchema = z.object({
  analysis: z
    .object({
      totalComplaints: z.number(),
      byLanguage: z.object({}).passthrough(),
      byRegion: z.object({}).passthrough(),
      byCustomerValue: z.object({}).passthrough(),
      byGender: z.object({}).passthrough(),
      byReligion: z.object({}).passthrough(),
      rawDisparities: z.array(z.unknown()),
      severityAdjusted: z.object({}).passthrough(),
      resolutionByLanguage: z.array(z.unknown()),
      errorAssessmentAvailable: z.boolean(),
      errorIndicatorsByLanguage: z.array(z.unknown()),
      sampleSizeFlags: z.array(z.unknown()),
      proxyAssociations: z.array(z.unknown()),
      modelInputChecks: z.array(z.unknown()),
    })
    .passthrough(),
  policy: z
    .object({
      status: governanceStatusSchema,
      riskFlags: z.array(z.string()),
      triggeredRules: z.array(z.string()),
      conditions: z.array(z.string()),
      humanDecisionRequired: z.boolean(),
      summaryMetrics: z.object({}).passthrough(),
    })
    .passthrough(),
  modelDocumentation: modelDocumentationSchema,
});

export const governanceReviewRequestSchema = z.union([
  scenarioRequestSchema,
  aggregatedEvidenceRequestSchema,
]);

export type GovernanceReviewRequestInput = z.infer<typeof governanceReviewRequestSchema>;

// ---------------------------------------------------------------------------
// LLM response schema: the structured output the governance agent must
// return. The application validates this before rendering it, per spec
// section 20/21.
// ---------------------------------------------------------------------------
export const governanceReportSchema = z.object({
  recommendation: governanceStatusSchema,
  finding: z.string().min(1),
  evidence: z.array(z.string().min(1)).min(1),
  risk: z.string().min(1),
  recommendationDetail: z.string().min(1),
  gapsAndLimits: z.array(z.string().min(1)).min(1),
  humanDecisionNeeded: z.object({
    owner: z.string().min(1),
    decision: z.string().min(1),
    reason: z.string().min(1),
  }),
});

export type GovernanceReportValidated = z.infer<typeof governanceReportSchema>;

// ---------------------------------------------------------------------------
// Optional CSV upload schema (section 11).
// ---------------------------------------------------------------------------

// z.coerce.boolean() uses JS `Boolean(value)`, which treats ANY non-empty
// string as true, including the string "false" or "0". Since every CSV cell
// arrives as a string, that would silently turn a column full of "FALSE"
// into `true`. This preprocessor reads common CSV boolean spellings
// correctly before handing off to z.boolean().
const csvBoolean = z.preprocess((val) => {
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val !== 0;
  if (typeof val === "string") {
    const normalized = val.trim().toLowerCase();
    if (["true", "1", "yes", "y"].includes(normalized)) return true;
    if (["false", "0", "no", "n"].includes(normalized)) return false;
  }
  return val;
}, z.boolean());

export const csvRowSchema = z.object({
  complaint_id: z.string().min(1),
  severity: z.enum(["Critical", "High", "Standard"]),
  product: z.enum([
    "Savings Account",
    "Credit Card",
    "Personal Loan",
    "Digital Banking",
    "Payments",
  ]),
  language: z.enum(["English", "Hindi", "Marathi", "Tamil", "Bengali"]),
  region: z.enum(["North", "West", "South", "East"]),
  customer_value_tier: z.enum(["Standard", "Premium", "High Value"]),
  gender: z.enum(["Male", "Female", "Other"]),
  religion: z.enum(["Hindu", "Muslim", "Christian", "Sikh", "Other"]),
  prior_complaints: z.coerce.number().int().min(0),
  vulnerability_flag: csvBoolean,
  ai_priority: z.enum(["High", "Low"]),
  resolution_days: z.coerce.number().min(0),
  reopened_after_low_priority: z
    .union([csvBoolean, z.literal(""), z.null(), z.undefined()])
    .optional(),
  escalated: csvBoolean,
  model_input_language: csvBoolean,
  model_input_region: csvBoolean,
  model_input_customer_value: csvBoolean,
  model_input_gender: csvBoolean,
  model_input_religion: csvBoolean,
});

export const REQUIRED_CSV_COLUMNS = [
  "complaint_id",
  "severity",
  "product",
  "language",
  "region",
  "customer_value_tier",
  "gender",
  "religion",
  "prior_complaints",
  "vulnerability_flag",
  "ai_priority",
  "resolution_days",
  "reopened_after_low_priority",
  "escalated",
  "model_input_language",
  "model_input_region",
  "model_input_customer_value",
  "model_input_gender",
  "model_input_religion",
] as const;
