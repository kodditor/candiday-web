/** Keep in sync with core/src/modules/rubric/schema.ts (modal validation subset). */
import { z } from "zod";

export const LEVEL_KEY = /^[a-z][a-z0-9_]{1,39}$/;

export const LevelSchema = z.object({
  key: z.string().regex(LEVEL_KEY, "snake_case, 2-40 chars"),
  description: z.string().min(15).max(300),
  score: z.number().min(0).max(1),
});

const ItemCore = z.object({
  label: z.string().min(3).max(80),
  description: z.string().min(20).max(400),
  requirement: z.enum(["essential", "preferred"]),
  weight: z.number().int().min(1).max(100),
  levels: z.array(LevelSchema).min(3).max(6),
  evidenceGuidance: z.string().max(300).optional(),
  sourceText: z.string().max(300).optional(),
  origin: z.enum(["stated", "suggested"]),
});

const itemRules = (item: z.infer<typeof ItemCore>, ctx: z.RefinementCtx) => {
  const keys = item.levels.map((l) => l.key);
  if (new Set(keys).size !== keys.length) {
    ctx.addIssue({ code: "custom", message: `Duplicate level keys in "${item.label}"` });
  }
  if (!item.levels.some((l) => l.score === 1)) {
    ctx.addIssue({ code: "custom", message: `"${item.label}" needs a level with score 1` });
  }
  if (!item.levels.some((l) => l.score === 0)) {
    ctx.addIssue({ code: "custom", message: `"${item.label}" needs a level with score 0` });
  }
  const ne = item.levels.find((l) => l.key === "not_evidenced");
  if (!ne) {
    ctx.addIssue({
      code: "custom",
      message: `"${item.label}" must include a "not_evidenced" level`,
    });
  } else if (ne.score !== 0) {
    ctx.addIssue({ code: "custom", message: `"not_evidenced" must score 0` });
  }
};

export const LlmItemSchema = ItemCore.superRefine(itemRules);

export const RubricSaveItemInputSchema = ItemCore.extend({
  id: z.string().min(1).optional(),
})
  .strict()
  .superRefine(itemRules);

export const RubricItemSchema = ItemCore.extend({
  id: z.string().min(1),
  position: z.number().int().min(0),
  itemHash: z.string().length(64),
}).superRefine(itemRules);

export const StoredRubricItemsSchema = z
  .array(RubricItemSchema)
  .min(1)
  .max(15)
  .superRefine((items, ctx) => {
    const total = items.reduce((s, i) => s + i.weight, 0);
    if (total !== 100) {
      ctx.addIssue({
        code: "custom",
        message: `Weights sum to ${total}, must be 100`,
      });
    }
  });

export type Level = z.infer<typeof LevelSchema>;
export type LlmItem = z.infer<typeof LlmItemSchema>;
export type RubricSaveItemInput = z.infer<typeof RubricSaveItemInputSchema>;
export type RubricItem = z.infer<typeof RubricItemSchema>;