"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Validating inputs",
  "Running fairness analysis",
  "Adjusting for severity",
  "Checking resolution outcomes",
  "Checking potential errors",
  "Checking model inputs",
  "Applying policy",
  "Preparing governance report",
];

interface Props {
  active: boolean;
  done: boolean;
}

/**
 * Renders the step checklist. Mount a fresh instance per run via a `key`
 * prop on the parent (e.g. `key={runId}`) so the reveal counter restarts
 * at 0 without needing a reset effect.
 */
export default function ReviewProgress({ active, done }: Props) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!active || done) return;
    // Progressive reveal synced to real work happening server-side, capped
    // one short of the final step so "governance report" only checks off
    // once the response actually arrives.
    const interval = setInterval(() => {
      setRevealed((r) => (r < STEPS.length - 1 ? r + 1 : r));
    }, 260);
    return () => clearInterval(interval);
  }, [active, done]);

  if (!active) return null;

  const checkedCount = done ? STEPS.length : revealed;

  return (
    <div className="card-surface rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <ul className="space-y-2">
        {STEPS.map((step, i) => {
          const checked = i < checkedCount;
          return (
            <li key={step} className="flex items-center gap-2 text-[13px]">
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                  checked
                    ? "border-[var(--color-proceed)] bg-[var(--color-proceed)] text-white"
                    : "border-[var(--color-border-strong)] text-transparent"
                }`}
              >
                ✓
              </span>
              <span className={checked ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"}>
                {step}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
