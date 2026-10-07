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
  vulnerability_flag: z.coerce.boolean(),
  ai_priority: z.enum(["High", "Low"]),
  resolution_days: z.coerce.number().min(0),
  reopened_after_low_priority: z
    .union([z.coerce.boolean(), z.literal(""), z.null(), z.undefined()])
    .optional(),
  escalated: z.coerce.boolean(),
  model_input_language: z.coerce.boolean(),
  model_input_region: z.coerce.boolean(),
  model_input_customer_value: z.coerce.boolean(),
  model_input_gender: z.coerce.boolean(),
  model_input_religion: z.coerce.boolean(),
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
