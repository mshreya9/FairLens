// Governance agent. The AI reasoning layer.
//
// This module NEVER computes statistics. It receives the deterministic
// analysis + policy evaluation already computed by lib/analysis.ts and
// lib/policy.ts, and asks the LLM only to interpret, explain, and
// contextualise that evidence. The deterministic policy.status is the
// source of truth for the recommendation; the LLM is instructed to echo it.

import OpenAI from "openai";
import type { AnalysisResult, GovernanceReport, ModelDocumentation, PolicyEvaluation } from "./types";
import { governanceReportSchema } from "./validation";
import { GOVERNANCE_SYSTEM_PROMPT, buildGovernanceUserPrompt } from "./prompts";

const GOVERNANCE_REPORT_JSON_SCHEMA = {
  name: "governance_report",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      recommendation: {
        type: "string",
        enum: ["PROCEED", "PROCEED_WITH_CONDITIONS", "ESCALATE_TO_HUMAN_REVIEW"],
      },
      finding: { type: "string" },
      evidence: { type: "array", items: { type: "string" } },
      risk: { type: "string" },
      recommendationDetail: { type: "string" },
      gapsAndLimits: { type: "array", items: { type: "string" } },
      humanDecisionNeeded: {
        type: "object",
        additionalProperties: false,
        properties: {
          owner: { type: "string" },
          decision: { type: "string" },
          reason: { type: "string" },
        },
        required: ["owner", "decision", "reason"],
      },
    },
    required: [
      "recommendation",
      "finding",
      "evidence",
      "risk",
      "recommendationDetail",
      "gapsAndLimits",
      "humanDecisionNeeded",
    ],
  },
} as const;

export interface GovernanceNarrativeResult {
  report: GovernanceReport | null;
  narrativeAvailable: boolean;
  narrativeError?: string;
}

export async function generateGovernanceNarrative(
  analysis: AnalysisResult,
  policy: PolicyEvaluation,
  docs: ModelDocumentation
): Promise<GovernanceNarrativeResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      report: null,
      narrativeAvailable: false,
      narrativeError:
        "AI governance narrative unavailable. Deterministic policy assessment is shown below.",
    };
  }

  try {
    const client = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: GOVERNANCE_SYSTEM_PROMPT },
        { role: "user", content: buildGovernanceUserPrompt(analysis, policy, docs) },
      ],
      response_format: { type: "json_schema", json_schema: GOVERNANCE_REPORT_JSON_SCHEMA },
      temperature: 0.2,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return {
        report: null,
        narrativeAvailable: false,
        narrativeError: "The AI governance narrative returned an empty response.",
      };
    }

    const parsed = governanceReportSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return {
        report: null,
        narrativeAvailable: false,
        narrativeError: "The AI governance narrative failed schema validation and was discarded.",
      };
    }

    if (parsed.data.recommendation !== policy.status) {
      // The deterministic policy engine is the source of truth. If the model
      // drifted from the computed status, correct it rather than trusting
      // the LLM's own judgement.
      parsed.data.recommendation = policy.status;
    }

    return { report: parsed.data, narrativeAvailable: true };
  } catch {
    return {
      report: null,
      narrativeAvailable: false,
      narrativeError:
        "AI governance narrative unavailable. Deterministic policy assessment is shown below.",
    };
  }
}
