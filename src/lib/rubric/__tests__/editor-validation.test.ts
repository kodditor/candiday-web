import { describe, expect, it } from "vitest";
import { createRubricCriterion, type RubricEditorRow } from "@/lib/rubric/draft-item";
import { buildEditorDraftValidation } from "@/lib/rubric/editor-validation";

function row(partial: Partial<RubricEditorRow["fields"]>, overrides?: Partial<RubricEditorRow>): RubricEditorRow {
  return {
    clientKey: crypto.randomUUID(),
    fields: { ...createRubricCriterion(), ...partial },
    isNew: false,
    ...overrides,
  };
}

describe("buildEditorDraftValidation", () => {
  it("requires at least five criteria", () => {
    const rows = Array.from({ length: 4 }, () => row({ requirement: "essential", weight: 25 }));
    const result = buildEditorDraftValidation(rows);
    expect(result.errors.some((e) => /at least 5/i.test(e.message))).toBe(true);
  });

  it("requires at least one essential criterion", () => {
    const rows = Array.from({ length: 5 }, () => row({ requirement: "preferred", weight: 20 }));
    const result = buildEditorDraftValidation(rows);
    expect(result.errors.some((e) => /essential/i.test(e.message))).toBe(true);
  });
});