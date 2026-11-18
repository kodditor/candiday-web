import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MAX_RUBRIC_CRITERIA,
  MIN_RUBRIC_CRITERIA,
  createRubricCriterion,
  rowsFromStoredItems,
  type RubricEditorRow,
} from "@/lib/rubric/draft-item";
import { buildEditorDraftValidation } from "@/lib/rubric/editor-validation";
import type { RubricItem, RubricSaveItemInput } from "@/lib/rubric/schema";
import { mapEditorRowsToSavePayload } from "@/lib/rubric/save-payload";
import { rebalanceWeights } from "@/lib/rubric/weights";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckIcon, PlusIcon } from "@phosphor-icons/react";
import { Bookmark } from "lucide-react";

type RubricEditModalProps = {
  open: boolean;
  items: RubricItem[];
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (items: RubricSaveItemInput[]) => Promise<void>;
};

function saveStatusMessage(
  dirty: boolean,
  saving: boolean,
  validation: ReturnType<typeof buildEditorDraftValidation>,
  criteriaCount: number,
): string | null {
  if (saving) return "Saving changes…";
  if (!dirty) return "Change a field to enable save.";
  if (criteriaCount < MIN_RUBRIC_CRITERIA) {
    return `Keep at least ${MIN_RUBRIC_CRITERIA} criteria (currently ${criteriaCount}).`;
  }
  if (criteriaCount > MAX_RUBRIC_CRITERIA) {
    return `Remove criteria to stay at or below ${MAX_RUBRIC_CRITERIA}.`;
  }
  if (validation.weightTotal !== 100) {
    return `Weights total ${validation.weightTotal}% — adjust or use auto-balance so they sum to 100%.`;
  }
  if (validation.errors.length > 0) return "Fix the highlighted issues above to save.";
  if (validation.lintViolations.length > 0) {
    return "Resolve fairness warnings before saving.";
  }
  return "Ready to save — approve the rubric on the role page when you are done.";
}

export function RubricEditModal({
  open,
  items,
  saving,
  onOpenChange,
  onSave,
}: RubricEditModalProps) {
  const [draft, setDraft] = useState<RubricEditorRow[]>(() => rowsFromStoredItems(items));
  const [dirty, setDirty] = useState(false);
  const [removeKey, setRemoveKey] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(rowsFromStoredItems(items));
      setDirty(false);
      setRemoveKey(null);
    }
  }, [open, items]);

  const validation = useMemo(() => buildEditorDraftValidation(draft), [draft]);

  const updateRow = useCallback((clientKey: string, patch: Partial<RubricEditorRow["fields"]>) => {
    setDraft((prev) =>
      prev.map((row) =>
        row.clientKey === clientKey ? { ...row, fields: { ...row.fields, ...patch } } : row,
      ),
    );
    setDirty(true);
  }, []);

  const handleAutoBalance = () => {
    setDraft((prev) =>
      prev.map((row, index) => ({
        ...row,
        fields: rebalanceWeights(
          prev.map((r) => r.fields),
          100,
        )[index]!,
      })),
    );
    setDirty(true);
  };

  const handleAddCriterion = () => {
    if (draft.length >= MAX_RUBRIC_CRITERIA) return;
    setDraft((prev) => [
      ...prev,
      {
        clientKey: crypto.randomUUID(),
        fields: createRubricCriterion(),
        isNew: true,
      },
    ]);
    setDirty(true);
  };

  const confirmRemove = () => {
    if (!removeKey || draft.length <= MIN_RUBRIC_CRITERIA) return;
    setDraft((prev) => prev.filter((row) => row.clientKey !== removeKey));
    setRemoveKey(null);
    setDirty(true);
  };

  const handleSave = async () => {
    if (validation.errors.length || validation.lintViolations.length) return;
    await onSave(mapEditorRowsToSavePayload(draft));
    setDirty(false);
  };

  const canSave =
    dirty &&
    !saving &&
    draft.length >= MIN_RUBRIC_CRITERIA &&
    draft.length <= MAX_RUBRIC_CRITERIA &&
    validation.weightTotal === 100 &&
    validation.errors.length === 0 &&
    validation.lintViolations.length === 0;

  const statusMessage = saveStatusMessage(dirty, saving, validation, draft.length);
  const weightsBalanced = validation.weightTotal === 100;
  const removeTarget = removeKey ? draft.find((r) => r.clientKey === removeKey) : null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[min(92vh,56rem)] w-[calc(100%-1.5rem)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
          <DialogHeader className="shrink-0 space-y-2 border-b border-hairline px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
              <div className="space-y-2">
                <DialogTitle className="text-lg">Edit rubric</DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-text-muted">
                  Update how candidates are scored on this role. Each criterion needs a clear label
                  and description.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div
            className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-hairline bg-muted/20 px-6 py-3"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm text-ink">
              <span className="font-medium">Criteria:</span>{" "}
              <span className="tabular-nums">{draft.length}</span>
              <span className="text-text-muted">
                {" "}
                ({MIN_RUBRIC_CRITERIA}–{MAX_RUBRIC_CRITERIA} required)
              </span>
            </p>
            <p className="text-sm text-ink">
              <span className="font-medium">Weight total:</span>{" "}
              <span
                className={cn(
                  "font-semibold tabular-nums",
                  weightsBalanced ? "text-emerald-700" : "text-amber-800",
                )}
              >
                {validation.weightTotal}%
              </span>
              <span className="text-text-muted"> / 100%</span>
            </p>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {draft.map((row, index) => (
              <div
                key={row.clientKey}
                className="space-y-4 rounded-lg border border-hairline bg-paper/40 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink">Criterion {index + 1}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={row.fields.requirement}
                      onValueChange={(value: "essential" | "preferred") =>
                        updateRow(row.clientKey, { requirement: value })
                      }
                    >
                      <SelectTrigger className="h-8 w-[9.5rem] bg-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="essential">Essential</SelectItem>
                        <SelectItem value="preferred">Preferred</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={draft.length <= MIN_RUBRIC_CRITERIA}
                      onClick={() => setRemoveKey(row.clientKey)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                {row.isNew ? (
                  <p className="text-xs text-text-muted">
                    Uses default scoring levels. Edit the label and description for this role.
                  </p>
                ) : null}
                <div className="space-y-1.5">
                  <label
                    className="text-xs font-medium text-text-muted"
                    htmlFor={`label-${row.clientKey}`}
                  >
                    Label
                  </label>
                  <p className="text-xs text-text-muted">Short name shown in screening (3–80 characters).</p>
                  <Input
                    id={`label-${row.clientKey}`}
                    className="h-10"
                    value={row.fields.label}
                    onChange={(e) => updateRow(row.clientKey, { label: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    className="text-xs font-medium text-text-muted"
                    htmlFor={`description-${row.clientKey}`}
                  >
                    Description
                  </label>
                  <p className="text-xs text-text-muted">
                    What evaluators look for in applications (at least 20 characters).
                  </p>
                  <textarea
                    id={`description-${row.clientKey}`}
                    className="flex min-h-[140px] w-full rounded-md border border-input bg-white px-3 py-2.5 text-sm leading-relaxed"
                    value={row.fields.description}
                    onChange={(e) => updateRow(row.clientKey, { description: e.target.value })}
                    rows={2} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    className="text-xs font-medium text-text-muted"
                    htmlFor={`weight-${row.clientKey}`}
                  >
                    Weight %
                  </label>
                  <p className="text-xs text-text-muted">
                    Share of the overall score for this criterion (1–100).
                  </p>
                  <Input
                    id={`weight-${row.clientKey}`}
                    type="number"
                    min={1}
                    max={100}
                    value={row.fields.weight}
                    onChange={(e) =>
                      updateRow(row.clientKey, {
                        weight: Number.parseInt(e.target.value, 10) || 1,
                      })
                    }
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-end"> 
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={draft.length >= MAX_RUBRIC_CRITERIA}
                onClick={handleAddCriterion}
              >
                <div className="flex items-center gap-2">
                  <PlusIcon size={16} />
                  Add New Criterion
                </div>
              </Button>
            </div>

            {validation.errors.length > 0 ? (
              <div
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
                role="alert"
              >
                <p className="font-medium">Fix these to save</p>
                <ul className="mt-1 list-disc pl-5">
                  {validation.errors.map((e, i) => (
                    <li key={`${e.itemId ?? "x"}-${i}`}>{e.message}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {validation.lintViolations.length > 0 ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                <p className="font-medium">Fairness review</p>
                <p className="mt-0.5 text-xs text-amber-900/90">
                  Wording may touch protected characteristics. Rephrase so criteria stay job-related.
                </p>
                <ul className="mt-2 list-disc pl-5">
                  {validation.lintViolations.map((v) => (
                    <li key={`${v.itemId}-${v.reason}`}>{v.reason}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-hairline bg-muted/10 px-6 py-3">
            <p className="text-sm text-text-muted" role="status">
              {statusMessage}
            </p>
          </div>

          <DialogFooter className="mx-0 mb-0 shrink-0 gap-2 rounded-b-xl border-t border-hairline bg-white px-6 py-4 sm:justify-between">
            <div className="flex flex-col gap-1 sm:items-start">
              <Button type="button" variant="outline" onClick={handleAutoBalance}>
                Auto-balance weights
              </Button>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="button" 
                disabled={!canSave} 
                onClick={() => void handleSave()}
                loading={saving}
              >
                <div className="flex items-center gap-2">
                  <Bookmark size={16} />
                  Save draft
                </div>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={removeKey != null} onOpenChange={(next) => !next && setRemoveKey(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove criterion?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget
                ? `Remove “${removeTarget.fields.label}”? You need at least ${MIN_RUBRIC_CRITERIA} criteria. Weights may need rebalancing.`
                : "Remove this criterion from the draft?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={confirmRemove}>
              Remove
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}