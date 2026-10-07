// Core domain types for the Complaint Prioritisation Fairness Review Agent.

export type Severity = "Critical" | "High" | "Standard";

export type Product =
  | "Savings Account"
  | "Credit Card"
  | "Personal Loan"
  | "Digital Banking"
  | "Payments";

export type Language = "English" | "Hindi" | "Marathi" | "Tamil" | "Bengali";

export type Region = "North" | "West" | "South" | "East";

export type CustomerValueTier = "Standard" | "Premium" | "High Value";

export type AIPriority = "High" | "Low";

// Protected attributes. These are never permitted as model inputs under any
// circumstance (see lib/policy-data.ts). They are still recorded on every
// synthetic/uploaded complaint so the agent can run passive outcome-parity
// monitoring across them, even though the prioritisation model never sees
// them. This is the guardrail layer: proof of non-discrimination, not a
// variable the model is allowed to use.
export type Gender = "Male" | "Female" | "Other";

export type Religion = "Hindu" | "Muslim" | "Christian" | "Sikh" | "Other";

export interface ComplaintRecord {
  complaint_id: string;
  severity: Severity;
  product: Product;
  language: Language;
  region: Region;
  customer_value_tier: CustomerValueTier;
  gender: Gender;
  religion: Religion;
  prior_complaints: number;
  vulnerability_flag: boolean;
  ai_priority: AIPriority;
  resolution_days: number;
  reopened_after_low_priority: boolean | null;
  escalated: boolean;
  model_input_language: boolean;
  model_input_region: boolean;
  model_input_customer_value: boolean;
  model_input_gender: boolean;
  model_input_religion: boolean;
}

export type ScenarioId =
  | "fair-system"
  | "regional-language-bias"
  | "explained-gap"
  | "insufficient-data";

export interface ScenarioDefinition {
  id: ScenarioId;
  name: string;
  shortDescription: string;
  longDescription: string;
  expectedResult: GovernanceStatus | "PROCEED_OR_CONDITIONS";
}

export interface ModelDocumentation {
  /** Whether language is documented as an actual input to the prioritisation model. */
  usesLanguageAsInput: boolean;
  /** Whether region is documented as an actual input to the prioritisation model. */
  usesRegionAsInput: boolean;
  /** Whether gender is documented as an actual input to the prioritisation model. */
  usesGenderAsInput: boolean;
  /** Whether religion is documented as an actual input to the prioritisation model. */
  usesReligionAsInput: boolean;
  /** Whether customer value tier is documented as an input, and whether that use is approved/documented. */
  usesCustomerValueAsInput: boolean;
  customerValueDocumented: boolean;
  includeErrorGroundTruth: boolean;
}

export interface GroupRate {
  group: string;
  n: number;
  lowPriorityCount: number;
  lowPriorityRate: number;
  rateRatio: number;
  sufficientSample: boolean;
}

export interface BenchmarkAnalysis {
  benchmarkGroup: string;
  benchmarkRate: number;
  groups: GroupRate[];
  highestRate: number | null;
  lowestRate: number | null;
  highestLowestRatio: number | null;
}

export interface RawDisparity {
  group: string;
  comparisonGroup: string;
  percentagePointDifference: number;
  ratio: number;
}

export interface SeverityAdjustedGroup {
  group: string;
  rawRate: number;
  adjustedRate: number;
  rawGap: number;
  adjustedGap: number;
  adjustedRatio: number;
}

export interface SeverityAdjustedAnalysis {
  benchmarkGroup: string;
  severityDistributionUsed: Record<Severity, number>;
  groups: SeverityAdjustedGroup[];
}

export interface ResolutionStats {
  group: string;
  n: number;
  meanResolutionDays: number;
  p90ResolutionDays: number;
  slaCompliancePct: number;
}

export interface ErrorIndicator {
  group: string;
  n: number;
  reopenRateAfterLowPriority: number | null;
}

export interface SampleSizeFlag {
  group: string;
  n: number;
  sufficientSample: boolean;
}

export interface ProxyAssociation {
  variablePair: [string, string];
  cramersV: number;
  interpretation: string;
}

export type VariableApprovalStatus = "ALLOWED" | "CONDITIONAL" | "PROHIBITED";

export interface ModelInputCheckItem {
  variable: string;
  documentedAsInput: boolean;
  approvalStatus: VariableApprovalStatus;
  violation: boolean;
  note: string;
}

export interface AnalysisResult {
  totalComplaints: number;
  byLanguage: BenchmarkAnalysis;
  byRegion: BenchmarkAnalysis;
  byCustomerValue: BenchmarkAnalysis;
  /** Guardrail monitoring: gender is never a model input, checked anyway. */
  byGender: BenchmarkAnalysis;
  /** Guardrail monitoring: religion is never a model input, checked anyway. */
  byReligion: BenchmarkAnalysis;
  rawDisparities: RawDisparity[];
  severityAdjusted: SeverityAdjustedAnalysis;
  resolutionByLanguage: ResolutionStats[];
  errorAssessmentAvailable: boolean;
  errorIndicatorsByLanguage: ErrorIndicator[];
  sampleSizeFlags: SampleSizeFlag[];
  proxyAssociations: ProxyAssociation[];
  modelInputChecks: ModelInputCheckItem[];
}

export type GovernanceStatus =
  | "PROCEED"
  | "PROCEED_WITH_CONDITIONS"
  | "ESCALATE_TO_HUMAN_REVIEW";

export interface PolicyEvaluation {
  status: GovernanceStatus;
  riskFlags: string[];
  triggeredRules: string[];
  conditions: string[];
  humanDecisionRequired: boolean;
  summaryMetrics: {
    worstUnexplainedRatio: number | null;
    threshold: number;
    minSampleSize: number;
  };
}

export interface HumanDecisionNeeded {
  owner: string;
  decision: string;
  reason: string;
}

export interface GovernanceReport {
  recommendation: GovernanceStatus;
  finding: string;
  evidence: string[];
  risk: string;
  recommendationDetail: string;
  gapsAndLimits: string[];
  humanDecisionNeeded: HumanDecisionNeeded;
}

export interface GovernanceReviewRequest {
  scenario: ScenarioId;
  modelDocumentation: ModelDocumentation;
}

export interface GovernanceReviewResponse {
  analysis: AnalysisResult;
  policy: PolicyEvaluation;
  report: GovernanceReport | null;
  narrativeAvailable: boolean;
  narrativeError?: string;
}
