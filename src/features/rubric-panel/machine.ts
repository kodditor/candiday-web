import type { RubricView } from "@/lib/types/rubric.type";

export type PanelPhase =
  | "empty"
  | "generating"
  | "failed"
  | "draft"
  | "approved";

/** Panel is driven primarily by rubric status (failed shows even when role is Draft). */
export function derivePanelPhase(view: RubricView | null | undefined): PanelPhase {
  if (!view) return "empty";
  switch (view.status) {
    case "generating":
      return "generating";
    case "failed":
      return "failed";
    case "draft":
      return "draft";
    case "approved":
      return "approved";
    default:
      return "empty";
  }
}

export function shouldPollRubric(view: RubricView | null | undefined): boolean {
  return view?.status === "generating";
}

export type EditModalState =
  | { open: false }
  | { open: true; dirty: boolean; saving: boolean };

export function canApprove(view: RubricView | null | undefined): boolean {
  if (!view || view.status !== "draft" || !view.validation) return false;
  const v = view.validation;
  return (
    (view.items?.length ?? 0) > 0 &&
    v.weightTotal === 100 &&
    v.errors.length === 0 &&
    v.lintViolations.length === 0
  );
}

export const RUBRIC_POLL_MS = 2_500;