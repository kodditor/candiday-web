/** Keep in sync with core/src/modules/rubrics/rubric-api.schemas.ts */
import type { RubricItem } from "@/lib/rubric/schema";
import type { RubricOrigin, RubricStatus } from "@/lib/rubric/status";

export type DraftValidation = {
  weightTotal: number;
  errors: { itemId?: string; field?: string; message: string }[];
  lintViolations: { itemId: string; reason: string }[];
};

export type RubricView = {
  id: string;
  roleId: string;
  version: number;
  status: RubricStatus;
  origin: RubricOrigin;
  revision: number;
  items: RubricItem[] | null;
  generationError: string | null;
  createdAt: string;
  hasUserEdits: boolean;
  roleChangedSinceGeneration: boolean;
  validation: DraftValidation | null;
};

export type RubricStatusDto = {
  status: RubricStatus;
  revision: number;
};