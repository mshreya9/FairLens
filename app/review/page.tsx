"use client";

import { useState } from "react";
import Link from "next/link";
import CsvUpload from "@/components/CsvUpload";
import EvidenceCard from "@/components/EvidenceCard";
import EvidenceTable from "@/components/EvidenceTable";
import FairnessChart from "@/components/FairnessChart";
import GovernanceDecision from "@/components/GovernanceDecision";
import GuardrailPanel from "@/components/GuardrailPanel";
import HumanDecision from "@/components/HumanDecision";
import Limitations from "@/components/Limitations";
import ModelDocumentationPanel from "@/components/ModelDocumentationPanel";
import PolicyCheck from "@/components/PolicyCheck";
import ResolutionChart from "@/components/ResolutionChart";
import ReviewButton from "@/components/ReviewButton";
import ReviewProgress from "@/components/ReviewProgress";
import ScenarioSelector from "@/components/ScenarioSelector";
import WhyThisDecision from "@/components/WhyThisDecision";
import { runAnalysis } from "@/lib/analysis";
import { evaluatePolicy } from "@/lib/policy";
import { DEFAULT_MODEL_DOCUMENTATION, getScenario } from "@/lib/scenarios";
import type { ComplaintRecord, GovernanceReviewResponse, ModelDocumentation, ScenarioId } from "@/lib/types";

type Stage = "setup" | "running" | "done";

export default function ReviewPage() {
  const [scenario, setScenario] = useState<ScenarioId>("fair-system");
  const [docs, setDocs] = useState<ModelDocumentation>(DEFAULT_MODEL_DOCUMENTATION);
  const [stage, setStage] = useState<Stage>("setup");
  const [progressDone, setProgressDone] = useState(false);
  const [runId, setRunId] = useState(0);
  const [result, setResult] = useState<GovernanceReviewResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [csvRecords, setCsvRecords] = useState<ComplaintRecord[] | null>(null);
  const [csvErrorAssessmentAvailable, setCsvErrorAssessmentAvailable] = useState(true);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);

  async function runReview() {
    setStage("running");
    setProgressDone(false);
    setRunId((id) => id + 1);
    setErrorMsg(null);

    try {
      let requestBody: Record<string, unknown>;

      if (csvRecords) {
        const effectiveDocs: ModelDocumentation = {
          ...docs,
          includeErrorGroundTruth: docs.includeErrorGroundTruth && csvErrorAssessmentAvailable,
        };
        const analysis = runAnalysis(csvRecords, effectiveDocs);
        const policy = evaluatePolicy(analysis);
        requestBody = { analysis, policy, modelDocumentation: effectiveDocs };
      } else {
        requestBody = { scenario, modelDocumentation: docs };
      }

      const res = await fetch("/api/governance-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.error ?? "Governance review failed.");
        setStage("setup");
        return;
      }

      setResult(json as GovernanceReviewResponse);
      setProgressDone(true);
      await new Promise((r) => setTimeout(r, 450));
      setStage("done");
    } catch {
      setErrorMsg("Network error. Could not reach the governance review service.");
      setStage("setup");
    }
  }

  const activeScenario = getScenario(scenario);

  return (
    <div className="max-w-[1100px] space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--color-text-primary)]">
          Complaint AI Fairness Review
        </h1>
        <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
          Governance decision support for AI complaint prioritisation
        </p>
        <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-[var(--color-text-muted)]">
          Review whether the bank&apos;s AI complaint-prioritisation model is safe to continue
          operating based on approved policy and available evidence.
        </p>
      </div>

      {stage === "setup" && !result && (
        <div className="card-surface flex items-center justify-between gap-3 rounded-lg border border-[var(--color-navy)]/20 bg-gradient-to-r from-[var(--color-navy)]/[0.05] to-[var(--color-accent-light)] px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-navy)] text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path d="M12 2.5a6.5 6.5 0 0 0-3.8 11.8c.6.4 1 1.1 1 1.9v.3h5.6v-.3c0-.8.4-1.5 1-1.9A6.5 6.5 0 0 0 12 2.5Z" strokeLinejoin="round" />
                <path d="M9.5 19.5h5M10.2 22h3.6" strokeLinecap="round" />
              </svg>
            </span>
            <p className="text-[12.5px] text-[var(--color-text-primary)]">
              New to this tool? The guide walks through exactly what to click and what each result
              means, step by step.
            </p>
          </div>
          <Link
            href="/guide"
            className="shrink-0 rounded-md border border-[var(--color-navy)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-navy)] transition-colors hover:bg-[var(--color-navy)] hover:text-white"
          >
            Open the Guide
          </Link>
        </div>
      )}

      <WorkflowStrip />

      <section className="card-surface space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div>
          <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)]">
            Step 1. Choose what to review
          </h2>
          <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">
            {csvRecords ? "Using uploaded CSV data instead of a synthetic scenario." : activeScenario.longDescription}
          </p>
        </div>
        <ScenarioSelector
          value={scenario}
          onChange={setScenario}
          disabled={stage === "running" || !!csvRecords}
        />

        <CsvUpload
          disabled={stage === "running"}
          activeFileName={csvFileName}
          onParsed={(records, errorAssessmentAvailable, fileName) => {
            setCsvRecords(records);
            setCsvErrorAssessmentAvailable(errorAssessmentAvailable);
            setCsvFileName(fileName);
          }}
          onClear={() => {
            setCsvRecords(null);
            setCsvFileName(null);
          }}
        />

        <div>
          <h2 className="mb-2 text-[13px] font-semibold text-[var(--color-text-primary)]">
            Step 2. Confirm what the model is documented to use
          </h2>
          <ModelDocumentationPanel value={docs} onChange={setDocs} disabled={stage === "running"} />
        </div>

        <div>
          <h2 className="mb-2 text-[13px] font-semibold text-[var(--color-text-primary)]">
            Step 3. Run the review
          </h2>
          <div className="flex items-center gap-3">
            <ReviewButton onClick={runReview} loading={stage === "running"} />
            {errorMsg && <span className="text-[12px] text-[var(--color-escalate)]">{errorMsg}</span>}
          </div>
        </div>
      </section>

      {stage === "running" && <ReviewProgress key={runId} active done={progressDone} />}

      {stage === "done" && result && (
        <div className="space-y-6">
          {!result.narrativeAvailable && (
            <div className="rounded-md border border-[var(--color-conditions-border)] bg-[var(--color-conditions-bg)] px-4 py-2.5 text-[12.5px] text-[var(--color-conditions)]">
              {result.narrativeError ??
                "AI governance narrative unavailable. Deterministic policy assessment is shown below."}
            </div>
          )}

          <GovernanceDecision
            status={result.policy.status}
            finding={result.report?.finding ?? ""}
          />

          <div>
            <h2 className="mb-2 text-[13px] font-semibold text-[var(--color-text-primary)]">
              Evidence Summary
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <EvidenceCard label="Sample Size" value={result.analysis.totalComplaints.toLocaleString()} sublabel="total complaints" />
              <EvidenceCard
                label="Benchmark Group"
                value={result.analysis.byLanguage.benchmarkGroup}
                sublabel={`${(result.analysis.byLanguage.benchmarkRate * 100).toFixed(1)}% low-priority`}
              />
              <EvidenceCard
                label="Observed Ratio"
                value={
                  result.analysis.byLanguage.highestLowestRatio
                    ? `${result.analysis.byLanguage.highestLowestRatio.toFixed(2)}x`
                    : "n/a"
                }
                sublabel="highest / lowest group"
                tone={
                  result.analysis.byLanguage.highestLowestRatio &&
                  result.analysis.byLanguage.highestLowestRatio > result.policy.summaryMetrics.threshold
                    ? "danger"
                    : "neutral"
                }
              />
              <EvidenceCard
                label="Internal Threshold"
                value={`${result.policy.summaryMetrics.threshold}x`}
                sublabel="fictional internal control"
              />
              <EvidenceCard
                label="Worst Adjusted Ratio"
                value={
                  result.policy.summaryMetrics.worstUnexplainedRatio !== null
                    ? `${result.policy.summaryMetrics.worstUnexplainedRatio.toFixed(2)}x`
                    : "n/a"
                }
                sublabel="severity-adjusted"
                tone={
                  result.policy.summaryMetrics.worstUnexplainedRatio !== null &&
                  result.policy.summaryMetrics.worstUnexplainedRatio > result.policy.summaryMetrics.threshold
                    ? "danger"
                    : "good"
                }
              />
            </div>
          </div>

          <EvidenceTable analysis={result.analysis} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <FairnessChart analysis={result.analysis} threshold={result.policy.summaryMetrics.threshold} />
            <ResolutionChart resolutionByLanguage={result.analysis.resolutionByLanguage} />
          </div>

          <WhyThisDecision analysis={result.analysis} policy={result.policy} status={result.policy.status} />

          <GuardrailPanel analysis={result.analysis} threshold={result.policy.summaryMetrics.threshold} />

          <PolicyCheck checks={result.analysis.modelInputChecks} policy={result.policy} />

          {result.report && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <ReportBlock title="Evidence" items={result.report.evidence} />
                <ReportBlock title="Risk" text={result.report.risk} />
                <ReportBlock title="Recommendation" text={result.report.recommendationDetail} />
              </div>
              <div className="space-y-4">
                <Limitations extra={result.report.gapsAndLimits} />
                <HumanDecision humanDecisionNeeded={result.report.humanDecisionNeeded} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WorkflowStrip() {
  const steps = ["DATA", "ANALYSIS", "POLICY CHECK", "GOVERNANCE REVIEW", "MANAGERIAL DECISION"];
  return (
    <div className="card-surface flex flex-wrap items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[11px] font-medium text-[var(--color-text-secondary)]">
      {steps.map((s, i) => (
        <span key={s} className="flex items-center gap-1.5">
          <span className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-accent)] text-[9px] font-bold text-white">
              {i + 1}
            </span>
            {s}
          </span>
          {i < steps.length - 1 && <span className="text-[var(--color-text-muted)]">→</span>}
        </span>
      ))}
    </div>
  );
}

function ReportBlock({ title, text, items }: { title: string; text?: string; items?: string[] }) {
  return (
    <div className="card-surface rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="mb-2 text-[12.5px] font-semibold text-[var(--color-text-primary)]">{title}</div>
      {text && <p className="text-[12.5px] leading-relaxed text-[var(--color-text-secondary)]">{text}</p>}
      {items && (
        <ul className="list-disc space-y-1 pl-4 text-[12.5px] leading-relaxed text-[var(--color-text-secondary)]">
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
