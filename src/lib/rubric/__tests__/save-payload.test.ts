import { describe, expect, it } from "vitest";
import { createRubricCriterion, type RubricEditorRow } from "@/lib/rubric/draft-item";
import { mapEditorRowsToSavePayload } from "@/lib/rubric/save-payload";
import type { LlmItem } from "@/lib/rubric/schema";

const baseFields: LlmItem = {
  label: "Python engineering",
  description:
    "Ability to design and ship production Python services aligned with backend responsibilities in the JD.",
  requirement: "essential",
  weight: 20,
  origin: "stated",
  sourceText: "Python",
  levels: createRubricCriterion().levels,
};

describe("mapEditorRowsToSavePayload", () => {
  it("includes id only for persisted rows", () => {
    const rows: RubricEditorRow[] = [
      {
        clientKey: "local-1",
        serverId: "server-a",
        fields: baseFields,
        isNew: false,
      },
      {
        clientKey: "local-2",
        fields: createRubricCriterion(),
        isNew: true,
      },
    ];
    const payload = mapEditorRowsToSavePayload(rows);
    expect(payload[0]?.id).toBe("server-a");
    expect(payload[1]).not.toHaveProperty("id");
    expect(payload[1]).not.toHaveProperty("itemHash");
  });
});