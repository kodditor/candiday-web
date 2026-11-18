/** Keep defaultLevels in sync with core/src/modules/rubric/__tests__/fixtures.ts */
import type { Level, LlmItem, RubricItem } from "@/lib/rubric/schema";

export const MIN_RUBRIC_CRITERIA = 5;
export const MAX_RUBRIC_CRITERIA = 15;

export function defaultLevels(overrides?: Partial<Record<string, string>>): Level[] {
  const desc = (key: string, fallback: string) => overrides?.[key] ?? fallback;
  return [
    {
      key: "meets",
      score: 1,
      description: desc(
        "meets",
        "CV clearly demonstrates the requirement through paid roles or major projects with specific outcomes.",
      ),
    },
    {
      key: "partial",
      score: 0.5,
      description: desc(
        "partial",
        "CV shows related experience in coursework, side projects or fewer than three years in paid roles.",
      ),
    },
    {
      key: "does_not_meet",
      score: 0,
      description: desc(
        "does_not_meet",
        "CV states qualifications or experience that fall clearly below what the role requires.",
      ),
    },
    {
      key: "not_evidenced",
      score: 0,
      description: desc(
        "not_evidenced",
        "CV does not mention or establish this criterion; no inference about ability is made.",
      ),
    },
  ];
}

export type RubricEditorRow = {
  clientKey: string;
  serverId?: string;
  fields: LlmItem;
  isNew: boolean;
};

export function createRubricCriterion(): LlmItem {
  return {
    label: "New criterion",
    description:
      "Describe what evaluators should look for in applications for this role (at least twenty characters).",
    requirement: "preferred",
    weight: 1,
    origin: "suggested",
    levels: defaultLevels(),
  };
}

export function rowsFromStoredItems(items: RubricItem[]): RubricEditorRow[] {
  return items.map((item) => {
    const { id, position: _p, itemHash: _h, ...fields } = item;
    return {
      clientKey: crypto.randomUUID(),
      serverId: id,
      fields: fields as LlmItem,
      isNew: false,
    };
  });
}