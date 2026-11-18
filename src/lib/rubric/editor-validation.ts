import {
  MAX_RUBRIC_CRITERIA,
  MIN_RUBRIC_CRITERIA,
  type RubricEditorRow,
} from "@/lib/rubric/draft-item";
import { lintRubric } from "@/lib/rubric/lint";
import { LlmItemSchema } from "@/lib/rubric/schema";
import type { DraftValidation } from "@/lib/rubric/validation";

export function buildEditorDraftValidation(rows: RubricEditorRow[]): DraftValidation {
  if (!rows.length) {
    return {
      weightTotal: 0,
      errors: [{ message: "Add at least one criterion." }],
      lintViolations: [],
    };
  }

  const errors: DraftValidation["errors"] = [];
  const items = rows.map((row) => row.fields);

  if (rows.length < MIN_RUBRIC_CRITERIA) {
    errors.push({
      message: `Rubrics need at least ${MIN_RUBRIC_CRITERIA} criteria.`,
    });
  }
  if (rows.length > MAX_RUBRIC_CRITERIA) {
    errors.push({
      message: `Rubrics can have at most ${MAX_RUBRIC_CRITERIA} criteria.`,
    });
  }
  if (!items.some((i) => i.requirement === "essential")) {
    errors.push({ message: "At least one criterion must be essential." });
  }

  const serverIds = rows.map((r) => r.serverId).filter(Boolean) as string[];
  if (new Set(serverIds).size !== serverIds.length) {
    errors.push({ message: "Duplicate persisted criterion ids." });
  }

  const weightTotal = items.reduce((sum, item) => sum + item.weight, 0);
  if (weightTotal !== 100) {
    errors.push({
      message: `Weights sum to ${weightTotal}, must be 100`,
    });
  }

  for (const row of rows) {
    const parsed = LlmItemSchema.safeParse(row.fields);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push({
          itemId: row.serverId ?? row.clientKey,
          field: issue.path.join("."),
          message: issue.message,
        });
      }
    }
  }

  const { violations } = lintRubric(items);
  const lintViolations = violations.map((v) => {
    const row =
      rows.find((r) => r.fields.label === v.label) ??
      rows.find((r) => r.fields.description.includes(v.label));
    return {
      itemId: row?.serverId ?? row?.clientKey ?? rows[0]?.clientKey ?? "unknown",
      reason: v.reason,
    };
  });

  return { weightTotal, errors, lintViolations };
}