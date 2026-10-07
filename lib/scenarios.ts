import type {
  ComplaintRecord,
  CustomerValueTier,
  Gender,
  Language,
  ModelDocumentation,
  Product,
  Region,
  Religion,
  ScenarioDefinition,
  ScenarioId,
  Severity,
} from "./types";

// ---------------------------------------------------------------------------
// Deterministic PRNG (mulberry32). Same seed -> same dataset, every run.
// This keeps demos and automated tests reproducible.
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(label: string): number {
  let h = 2166136261;
  for (let i = 0; i < label.length; i++) {
    h ^= label.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickWeighted<T>(rng: () => number, items: [T, number][]): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [item, w] of items) {
    r -= w;
    if (r <= 0) return item;
  }
  return items[items.length - 1][0];
}

// ---------------------------------------------------------------------------
// Scenario metadata
// ---------------------------------------------------------------------------
export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: "fair-system",
    name: "Fair System",
    shortDescription:
      "No meaningful fairness disparity between language groups.",
    longDescription:
      "All language groups experience a statistically similar low-priority rate once severity is accounted for. This represents a model operating within the bank's governance policy.",
    expectedResult: "PROCEED",
  },
  {
    id: "regional-language-bias",
    name: "Regional-Language Bias",
    shortDescription:
      "Regional-language complaints are intentionally more likely to receive low priority even at the same severity level.",
    longDescription:
      "Marathi-language complaints are classified as low priority at roughly twice the rate of English complaints, and the gap persists after adjusting for severity mix. This represents a genuine, unexplained disparity.",
    expectedResult: "ESCALATE_TO_HUMAN_REVIEW",
  },
  {
    id: "explained-gap",
    name: "Explained Gap",
    shortDescription:
      "A raw disparity exists but is largely explained by a different severity mix.",
    longDescription:
      "Tamil-language complaints skew toward Standard severity, which is naturally more likely to be marked low priority. After severity adjustment, most of the raw gap disappears.",
    expectedResult: "PROCEED_OR_CONDITIONS",
  },
  {
    id: "insufficient-data",
    name: "Insufficient Data",
    shortDescription:
      "One language group has fewer than 30 complaints, so no definitive conclusion can be drawn for it.",
    longDescription:
      "Bengali-language complaints are rare in this sample (under the 30-complaint minimum). Its observed rate may look different purely by chance, so the system flags insufficient evidence rather than a finding.",
    expectedResult: "PROCEED_WITH_CONDITIONS",
  },
];

export function getScenario(id: ScenarioId): ScenarioDefinition {
  const s = SCENARIOS.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scenario: ${id}`);
  return s;
}

// ---------------------------------------------------------------------------
// Shared reference data
// ---------------------------------------------------------------------------
const PRODUCTS: Product[] = [
  "Savings Account",
  "Credit Card",
  "Personal Loan",
  "Digital Banking",
  "Payments",
];

const REGIONS: Region[] = ["North", "West", "South", "East"];
const VALUE_TIERS: CustomerValueTier[] = ["Standard", "Premium", "High Value"];

const SLA_DAYS: Record<Severity, number> = {
  Critical: 1,
  High: 5,
  Standard: 15,
};

interface SeverityMix {
  Critical: number;
  High: number;
  Standard: number;
}

interface LanguagePlan {
  language: Language;
  n: number;
  severityMix: SeverityMix;
  lowPriorityProbBySeverity: SeverityMix;
  reopenRateIfLowPriority: number;
}

const COMMON_SEVERITY_MIX: SeverityMix = { Critical: 0.15, High: 0.35, Standard: 0.5 };

function buildRecordsForLanguagePlan(
  rng: () => number,
  plan: LanguagePlan,
  idPrefix: string,
  docs: ModelDocumentation
): ComplaintRecord[] {
  const records: ComplaintRecord[] = [];
  const severities: Severity[] = ["Critical", "High", "Standard"];

  // Exact stratified counts per severity, derived from the mix (rounded).
  const severityCounts: Record<Severity, number> = {
    Critical: Math.round(plan.n * plan.severityMix.Critical),
    High: Math.round(plan.n * plan.severityMix.High),
    Standard: 0,
  };
  severityCounts.Standard = plan.n - severityCounts.Critical - severityCounts.High;

  let idCounter = 0;

  for (const severity of severities) {
    const nInStratum = severityCounts[severity];
    const lowProb = plan.lowPriorityProbBySeverity[severity];
    const lowCount = Math.round(nInStratum * lowProb);

    for (let i = 0; i < nInStratum; i++) {
      const isLow = i < lowCount;
      idCounter += 1;
      const complaintId = `${idPrefix}-${plan.language.slice(0, 3).toUpperCase()}-${severity
        .slice(0, 3)
        .toUpperCase()}-${String(idCounter).padStart(5, "0")}`;

      const product = pickWeighted(rng, PRODUCTS.map((p) => [p, 1] as [Product, number]));
      const region = pickWeighted(rng, REGIONS.map((r) => [r, 1] as [Region, number]));
      const valueTier = pickWeighted(
        rng,
        VALUE_TIERS.map((v) => [v, 1] as [CustomerValueTier, number])
      );
      // Gender and religion are protected attributes. They are drawn
      // independently of severity, language and outcome in every scenario,
      // on purpose: the agent must never show a built-in bias pattern for
      // these fields, because the model is never allowed to use them in the
      // first place. Their only role here is to let the guardrail monitor
      // prove, with evidence, that outcomes stay balanced across them.
      const gender = pickWeighted(rng, [
        ["Male", 48],
        ["Female", 48],
        ["Other", 4],
      ] as [Gender, number][]);
      const religion = pickWeighted(rng, [
        ["Hindu", 55],
        ["Muslim", 20],
        ["Christian", 10],
        ["Sikh", 8],
        ["Other", 7],
      ] as [Religion, number][]);
      const priorComplaints = Math.min(6, Math.floor(-Math.log(1 - rng()) * 1.2));
      const vulnerabilityFlag = rng() < 0.08;

      const ai_priority = isLow ? "Low" : "High";

      // Resolution days: correlated with severity SLA and whether the
      // complaint was (mis)classified as low priority.
      const sla = SLA_DAYS[severity];
      let resolutionDays: number;
      if (ai_priority === "High") {
        resolutionDays = Math.max(0, Math.round(sla * (0.3 + rng() * 0.9)));
      } else {
        resolutionDays = Math.max(
          1,
          Math.round(sla * (1.5 + rng() * 2.5))
        );
      }

      let reopened: boolean | null = null;
      if (docs.includeErrorGroundTruth) {
        if (ai_priority === "Low") {
          reopened = rng() < plan.reopenRateIfLowPriority;
        } else {
          reopened = false;
        }
      }

      const escalated = reopened === true ? rng() < 0.7 : rng() < 0.05;

      records.push({
        complaint_id: complaintId,
        severity,
        product,
        language: plan.language,
        region,
        customer_value_tier: valueTier,
        gender,
        religion,
        prior_complaints: priorComplaints,
        vulnerability_flag: vulnerabilityFlag,
        ai_priority,
        resolution_days: resolutionDays,
        reopened_after_low_priority: reopened,
        escalated,
        model_input_language: docs.usesLanguageAsInput,
        model_input_region: docs.usesRegionAsInput,
        model_input_customer_value: docs.usesCustomerValueAsInput,
        model_input_gender: docs.usesGenderAsInput,
        model_input_religion: docs.usesReligionAsInput,
      });
    }
  }

  return records;
}

function shuffle<T>(rng: () => number, arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ---------------------------------------------------------------------------
// Scenario-specific language plans
// ---------------------------------------------------------------------------
function plansForScenario(scenario: ScenarioId): LanguagePlan[] {
  switch (scenario) {
    case "fair-system": {
      const probs: SeverityMix = { Critical: 0.05, High: 0.2, Standard: 0.4 };
      const counts: Record<Language, number> = {
        English: 2000,
        Hindi: 1000,
        Marathi: 750,
        Tamil: 750,
        Bengali: 500,
      };
      return (Object.keys(counts) as Language[]).map((language) => ({
        language,
        n: counts[language],
        severityMix: COMMON_SEVERITY_MIX,
        lowPriorityProbBySeverity: probs,
        reopenRateIfLowPriority: 0.08,
      }));
    }

    case "regional-language-bias": {
      const baselineProbs: SeverityMix = { Critical: 0.02, High: 0.1, Standard: 0.32 };
      const biasedProbs: SeverityMix = { Critical: 0.1, High: 0.3, Standard: 0.7 };
      const counts: Record<Language, number> = {
        English: 2000,
        Hindi: 1000,
        Marathi: 750,
        Tamil: 750,
        Bengali: 500,
      };
      return (Object.keys(counts) as Language[]).map((language) => ({
        language,
        n: counts[language],
        severityMix: COMMON_SEVERITY_MIX,
        lowPriorityProbBySeverity: language === "Marathi" ? biasedProbs : baselineProbs,
        reopenRateIfLowPriority: language === "Marathi" ? 0.2 : 0.08,
      }));
    }

    case "explained-gap": {
      const sharedProbs: SeverityMix = { Critical: 0.05, High: 0.2, Standard: 0.55 };
      const skewedMix: SeverityMix = { Critical: 0.05, High: 0.2, Standard: 0.75 };
      const counts: Record<Language, number> = {
        English: 2000,
        Hindi: 1000,
        Marathi: 750,
        Tamil: 750,
        Bengali: 500,
      };
      return (Object.keys(counts) as Language[]).map((language) => ({
        language,
        n: counts[language],
        severityMix: language === "Tamil" ? skewedMix : COMMON_SEVERITY_MIX,
        lowPriorityProbBySeverity: sharedProbs,
        reopenRateIfLowPriority: 0.08,
      }));
    }

    case "insufficient-data": {
      const probs: SeverityMix = { Critical: 0.05, High: 0.2, Standard: 0.4 };
      const counts: Record<Language, number> = {
        English: 2478,
        Hindi: 1000,
        Marathi: 750,
        Tamil: 750,
        Bengali: 22,
      };
      return (Object.keys(counts) as Language[]).map((language) => ({
        language,
        n: counts[language],
        severityMix: COMMON_SEVERITY_MIX,
        lowPriorityProbBySeverity: probs,
        reopenRateIfLowPriority: 0.08,
      }));
    }

    default: {
      const exhaustive: never = scenario;
      throw new Error(`Unhandled scenario: ${exhaustive}`);
    }
  }
}

export function generateComplaintsForScenario(
  scenario: ScenarioId,
  docs: ModelDocumentation
): ComplaintRecord[] {
  const rng = mulberry32(hashSeed(`complaint-fairness::${scenario}`));
  const plans = plansForScenario(scenario);

  let all: ComplaintRecord[] = [];
  for (const plan of plans) {
    const recs = buildRecordsForLanguagePlan(rng, plan, scenario.slice(0, 3).toUpperCase(), docs);
    all = all.concat(recs);
  }

  return shuffle(rng, all);
}

export const DEFAULT_MODEL_DOCUMENTATION: ModelDocumentation = {
  usesLanguageAsInput: false,
  usesRegionAsInput: false,
  usesGenderAsInput: false,
  usesReligionAsInput: false,
  usesCustomerValueAsInput: true,
  customerValueDocumented: true,
  includeErrorGroundTruth: true,
};
