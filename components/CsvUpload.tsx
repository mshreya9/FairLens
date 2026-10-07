"use client";

import { useRef, useState } from "react";
import { parseComplaintCsv } from "@/lib/csv";
import type { ComplaintRecord } from "@/lib/types";

interface Props {
  disabled?: boolean;
  onParsed: (records: ComplaintRecord[], errorAssessmentAvailable: boolean, fileName: string) => void;
  onClear: () => void;
  activeFileName: string | null;
}

export default function CsvUpload({ disabled, onParsed, onClear, activeFileName }: Props) {
  const [errors, setErrors] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const text = await file.text();
    const result = parseComplaintCsv(text);
    setErrors(result.errors);
    setRowCount(result.records.length);
    if (result.records.length > 0) {
      onParsed(result.records, result.errorAssessmentAvailable, file.name);
    }
  }

  return (
    <div className="card-surface rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="mb-1 text-[12.5px] font-semibold text-[var(--color-text-primary)]">
        Optional: Upload Your Own CSV
      </div>
      <p className="mb-3 text-[11.5px] leading-relaxed text-[var(--color-text-muted)]">
        Replaces the selected scenario with your own complaint data. Validated locally in your
        browser, raw rows are analysed here and only aggregated evidence is ever sent to the
        server or the AI model.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          disabled={disabled}
          className="text-[12px] text-[var(--color-text-secondary)] file:mr-3 file:rounded-md file:border file:border-[var(--color-border)] file:bg-[var(--color-bg)] file:px-3 file:py-1.5 file:text-[12px] file:font-medium file:text-[var(--color-text-primary)] hover:file:bg-[var(--color-border)]"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {activeFileName && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onClear();
              setErrors([]);
              setRowCount(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="text-[11.5px] font-medium text-[var(--color-navy)] underline"
          >
            Clear and use scenario data instead
          </button>
        )}
      </div>

      {activeFileName && rowCount !== null && errors.length === 0 && (
        <p className="mt-2 text-[11.5px] text-[var(--color-proceed)]">
          Loaded {rowCount.toLocaleString()} valid rows from &ldquo;{activeFileName}&rdquo;.
        </p>
      )}

      {errors.length > 0 && (
        <div className="mt-2 rounded-md border border-[var(--color-escalate-border)] bg-[var(--color-escalate-bg)] p-2.5 text-[11.5px] text-[var(--color-escalate)]">
          <div className="font-medium">Validation errors:</div>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {errors.slice(0, 8).map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
          {rowCount !== null && rowCount > 0 && (
            <div className="mt-1 text-[var(--color-text-muted)]">
              {rowCount.toLocaleString()} valid rows were still loaded from the rows that passed
              validation.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
