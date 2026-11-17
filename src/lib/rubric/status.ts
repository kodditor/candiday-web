/** Keep in sync with core/src/modules/rubrics/rubric-status.ts */

export const RUBRIC_STATUSES = [
  "generating",
  "draft",
  "approved",
  "failed",
  "superseded",
] as const;

export type RubricStatus = (typeof RUBRIC_STATUSES)[number];

export const RUBRIC_ORIGINS = ["generated", "manual"] as const;

export type RubricOrigin = (typeof RUBRIC_ORIGINS)[number];

export function isRubricStatus(value: string): value is RubricStatus {
  return (RUBRIC_STATUSES as readonly string[]).includes(value);
}