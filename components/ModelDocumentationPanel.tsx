"use client";

import type { ModelDocumentation } from "@/lib/types";

interface Props {
  value: ModelDocumentation;
  onChange: (next: ModelDocumentation) => void;
  disabled?: boolean;
}

function Toggle({
  label,
  description,
  checked,
  onToggle,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-start justify-between gap-3 rounded-md border border-[var(--color-border)] px-3 py-2.5">
      <div>
        <div className="text-[12.5px] font-medium text-[var(--color-text-primary)]">{label}</div>
        <div className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">{description}</div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-navy)]"
      />
    </label>
  );
}

export default function ModelDocumentationPanel({ value, onChange, disabled }: Props) {
  return (
    <div className="card-surface rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="mb-1 text-[12.5px] font-semibold text-[var(--color-text-primary)]">
        Model Documentation
      </div>
      <p className="mb-3 text-[11.5px] text-[var(--color-text-muted)]">
        Documented inputs to the AI prioritisation model. Severity, product and vulnerability
        flag are always-approved core inputs. Use the toggles below to demonstrate policy
        violations.
      </p>
      <div className="space-y-2">
        <Toggle
          label="Language used as model input"
          description="Prohibited under bank policy. Toggling this on will trigger a policy violation."
          checked={value.usesLanguageAsInput}
          disabled={disabled}
          onToggle={() => onChange({ ...value, usesLanguageAsInput: !value.usesLanguageAsInput })}
        />
        <Toggle
          label="Region used as model input"
          description="Prohibited under bank policy. Toggling this on will trigger a policy violation."
          checked={value.usesRegionAsInput}
          disabled={disabled}
          onToggle={() => onChange({ ...value, usesRegionAsInput: !value.usesRegionAsInput })}
        />
        <Toggle
          label="Gender used as model input"
          description="Prohibited under bank policy. A protected attribute guardrail, toggling this on will trigger a policy violation."
          checked={value.usesGenderAsInput}
          disabled={disabled}
          onToggle={() => onChange({ ...value, usesGenderAsInput: !value.usesGenderAsInput })}
        />
        <Toggle
          label="Religion used as model input"
          description="Prohibited under bank policy. A protected attribute guardrail, toggling this on will trigger a policy violation."
          checked={value.usesReligionAsInput}
          disabled={disabled}
          onToggle={() => onChange({ ...value, usesReligionAsInput: !value.usesReligionAsInput })}
        />
        <Toggle
          label="Customer value tier used as model input"
          description="Conditionally allowed, requires approved documentation."
          checked={value.usesCustomerValueAsInput}
          disabled={disabled}
          onToggle={() =>
            onChange({ ...value, usesCustomerValueAsInput: !value.usesCustomerValueAsInput })
          }
        />
        {value.usesCustomerValueAsInput && (
          <Toggle
            label="Customer value tier usage is documented and approved"
            description="Uncheck to simulate a conditional variable lacking approval documentation."
            checked={value.customerValueDocumented}
            disabled={disabled}
            onToggle={() =>
              onChange({ ...value, customerValueDocumented: !value.customerValueDocumented })
            }
          />
        )}
        <Toggle
          label="Include error ground truth"
          description="Whether reopened-after-low-priority data is available for this review."
          checked={value.includeErrorGroundTruth}
          disabled={disabled}
          onToggle={() =>
            onChange({ ...value, includeErrorGroundTruth: !value.includeErrorGroundTruth })
          }
        />
      </div>
    </div>
  );
}
