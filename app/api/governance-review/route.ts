import { NextResponse } from "next/server";
import { runAnalysis } from "@/lib/analysis";
import { buildFallbackReport } from "@/lib/fallback-report";
import { generateGovernanceNarrative } from "@/lib/governance-agent";
import { evaluatePolicy } from "@/lib/policy";
import { generateComplaintsForScenario } from "@/lib/scenarios";
import type { GovernanceReviewResponse } from "@/lib/types";
import { governanceReviewRequestSchema } from "@/lib/validation";

// Scenario requests are tiny; CSV-derived aggregated-evidence requests carry
// a full (but still aggregated, never-raw-row) analysis object.
const MAX_BODY_BYTES = 200_000;

export async function POST(request: Request) {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request payload too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = governanceReviewRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { modelDocumentation } = parsed.data;

  try {
    let analysis: GovernanceReviewResponse["analysis"];
    let policy: GovernanceReviewResponse["policy"];

    if ("scenario" in parsed.data) {
      // 1. Deterministic synthetic data. Never sent raw to the LLM.
      const records = generateComplaintsForScenario(parsed.data.scenario, modelDocumentation);
      // 2. Deterministic statistical analysis.
      analysis = runAnalysis(records, modelDocumentation);
      // 3. Deterministic policy evaluation.
      policy = evaluatePolicy(analysis);
    } else {
      // CSV upload path: analysis + policy were already computed
      // client-side from the uploaded rows (lib/analysis.ts / lib/policy.ts
      // are pure functions usable in the browser). Only this aggregated
      // evidence, never raw rows, reaches the server.
      analysis = parsed.data.analysis as unknown as GovernanceReviewResponse["analysis"];
      policy = parsed.data.policy as unknown as GovernanceReviewResponse["policy"];
    }

    // 4. AI governance narrative. Aggregated evidence only, never raw rows.
    const { report: llmReport, narrativeAvailable, narrativeError } = await generateGovernanceNarrative(
      analysis,
      policy,
      modelDocumentation
    );

    // If the AI narrative is unavailable, fall back to a deterministic,
    // template-derived report so the UI always has a complete structure to
    // render. narrativeAvailable tells the UI this was NOT AI-authored.
    const report = llmReport ?? buildFallbackReport(analysis, policy);

    const response: GovernanceReviewResponse = {
      analysis,
      policy,
      report,
      narrativeAvailable,
      narrativeError,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("governance-review route failed", err);
    return NextResponse.json(
      { error: "Governance review could not be completed." },
      { status: 500 }
    );
  }
}
