import { lintRubric } from "./lint";
import { LlmItemSchema, StoredRubricItemsSchema, type RubricItem } from "./schema";

export type DraftValidation = {
  weightTotal: number;
  errors: { itemId?: string; field?: string; message: string }[];
  lintViolations: { itemId: string; reason: string }[];
};

export function buildDraftValidation(items: RubricItem[] | null): DraftValidation {
  if (!items?.length) {
    return {
      weightTotal: 0,
      errors: [{ message: "Add at least one criterion." }],
      lintViolations: [],
    };
  }

  const errors: DraftValidation["errors"] = [];
  for (const item of items) {
    const parsed = LlmItemSchema.safeParse(item);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push({
          itemId: item.id,
          field: issue.path.join("."),
          message: issue.message,
        });
      }
    }
  }

  const stored = StoredRubricItemsSchema.safeParse(items);
  if (!stored.success) {
    for (const issue of stored.error.issues) {
      errors.push({
        field: issue.path.join("."),
        message: issue.message,
      });
    }
  }

  const { violations } = lintRubric(items);
  const lintViolations = violations.map((v) => ({
    itemId:
      items.find((i) => i.label === v.label)?.id ?? items[0]?.id ?? "unknown",
    reason: v.reason,
  }));

  const weightTotal = items.reduce((sum, item) => sum + item.weight, 0);

  return { weightTotal, errors, lintViolations };
}