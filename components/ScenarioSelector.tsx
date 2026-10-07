"use client";

import { SCENARIOS } from "@/lib/scenarios";
import type { ScenarioId } from "@/lib/types";

interface Props {
  value: ScenarioId;
  onChange: (id: ScenarioId) => void;
  disabled?: boolean;
}

export default function ScenarioSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {SCENARIOS.map((s) => {
        const active = s.id === value;
        return (
          <button
            key={s.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(s.id)}
            className={`card-surface rounded-lg border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
              active
                ? "border-[var(--color-navy)] bg-[var(--color-navy)]/[0.04] ring-1 ring-[var(--color-navy)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] hover:-translate-y-0.5 hover:border-[var(--color-border-strong)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">
                {s.name}
              </span>
              {active && (
                <span className="rounded-full bg-[var(--color-navy)] px-2 py-0.5 text-[10px] font-semibold text-white">
                  Selected
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
              {s.shortDescription}
            </p>
          </button>
        );
      })}
    </div>
  );
}
