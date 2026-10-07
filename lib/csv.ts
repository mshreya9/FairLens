// CSV upload support (optional, spec section 11). Parsing happens in the
// browser with PapaParse; rows are validated with Zod before use. Raw CSV
// rows are only ever sent to our own API route for deterministic analysis,
// never to the LLM.

import Papa from "papaparse";
import type { ComplaintRecord } from "./types";
import { csvRowSchema, REQUIRED_CSV_COLUMNS } from "./validation";

export interface CsvParseResult {
  records: ComplaintRecord[];
  errors: string[];
  errorAssessmentAvailable: boolean;
}

export function parseComplaintCsv(file: string): CsvParseResult {
  const parsed = Papa.parse<Record<string, string>>(file, {
    header: true,
    skipEmptyLines: true,
  });

  const errors: string[] = [];

  if (parsed.errors.length > 0) {
    for (const e of parsed.errors.slice(0, 5)) {
      errors.push(`Row ${e.row ?? "?"}: ${e.message}`);
    }
  }

  const headerRow = parsed.meta.fields ?? [];
  const missingColumns = REQUIRED_CSV_COLUMNS.filter(
    (c) => c !== "reopened_after_low_priority" && !headerRow.includes(c)
  );
  if (missingColumns.length > 0) {
    errors.push(`Missing required column(s): ${missingColumns.join(", ")}`);
    return { records: [], errors, errorAssessmentAvailable: false };
  }

  const hasErrorColumn = headerRow.includes("reopened_after_low_priority");
  const records: ComplaintRecord[] = [];

  parsed.data.forEach((row, idx) => {
    const result = csvRowSchema.safeParse(row);
    if (!result.success) {
      if (errors.length < 20) {
        errors.push(`Row ${idx + 2}: ${result.error.issues[0]?.message ?? "invalid row"}`);
      }
      return;
    }

    const r = result.data;
    const reopenedRaw = r.reopened_after_low_priority;
    const reopened =
      reopenedRaw === "" || reopenedRaw === null || reopenedRaw === undefined
        ? null
        : Boolean(reopenedRaw);

    records.push({
      complaint_id: r.complaint_id,
      severity: r.severity,
      product: r.product,
      language: r.language,
      region: r.region,
      customer_value_tier: r.customer_value_tier,
      gender: r.gender,
      religion: r.religion,
      prior_complaints: r.prior_complaints,
      vulnerability_flag: r.vulnerability_flag,
      ai_priority: r.ai_priority,
      resolution_days: r.resolution_days,
      reopened_after_low_priority: hasErrorColumn ? reopened : null,
      escalated: r.escalated,
      model_input_language: r.model_input_language,
      model_input_region: r.model_input_region,
      model_input_customer_value: r.model_input_customer_value,
      model_input_gender: r.model_input_gender,
      model_input_religion: r.model_input_religion,
    });
  });

  return { records, errors, errorAssessmentAvailable: hasErrorColumn };
}
