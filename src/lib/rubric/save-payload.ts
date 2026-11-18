import type { RubricEditorRow } from "@/lib/rubric/draft-item";
import type { RubricSaveItemInput } from "@/lib/rubric/schema";

export function mapEditorRowsToSavePayload(rows: RubricEditorRow[]): RubricSaveItemInput[] {
  return rows.map((row) => {
    if (row.serverId) {
      return { ...row.fields, id: row.serverId };
    }
    return { ...row.fields };
  });
}