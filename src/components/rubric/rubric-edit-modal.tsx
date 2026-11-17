import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { buildDraftValidation } from "@/lib/rubric/validation";
import { rebalanceWeights } from "@/lib/rubric/weights";
import type { RubricItem } from "@/lib/rubric/schema";
import { useCallback, useEffect, useMemo, useState } from "react";

type RubricEditModalProps = {
  open: boolean;
  items: RubricItem[];
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (items: RubricItem[]) => Promise<void>;
};

export function RubricEditModal({
  open,
  items,
  saving,
  onOpenChange,
  onSave,
}: RubricEditModalProps) {
  const [draft, setDraft] = useState<RubricItem[]>(items);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(items);
      setDirty(false);
    }
  }, [open, items]);

  const validation = useMemo(() => buildDraftValidation(draft), [draft]);

  const updateItem = useCallback((id: string, patch: Partial<RubricItem>) => {
    setDraft((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    setDirty(true);
  }, []);

  const handleAutoBalance = () => {
    setDraft((prev) => rebalanceWeights(prev, 100));
    setDirty(true);
  };

  const handleSave = async () => {
    if (validation.errors.length || validation.lintViolations.length) return;
    await onSave(draft);
    setDirty(false);
  };

  const canSave =
    dirty &&
    !saving &&
    validation.weightTotal === 100 &&
    validation.errors.length === 0 &&
    validation.lintViolations.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,56rem)] w-[calc(100%-1.5rem)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="shrink-0 border-b border-hairline px-6 py-5">
          <DialogTitle className="text-lg">Edit rubric</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {draft.map((item) => (
            <div key={item.id} className="space-y-3 rounded-lg border border-hairline bg-paper/40 p-5">
              <label className="text-xs font-medium text-text-muted">Label</label>
              <Input
                className="h-10"
                value={item.label}
                onChange={(e) => updateItem(item.id, { label: e.target.value })}
              />
              <label className="text-xs font-medium text-text-muted">Description</label>
              <textarea
                className="flex min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm leading-relaxed"
                value={item.description}
                onChange={(e) => updateItem(item.id, { description: e.target.value })}
                rows={6}
              />
              <div>
                <label className="text-xs font-medium text-text-muted">Weight %</label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={item.weight}
                  onChange={(e) =>
                    updateItem(item.id, { weight: Number.parseInt(e.target.value, 10) || 1 })
                  }
                />
              </div>
            </div>
          ))}

          {validation.errors.length > 0 ? (
            <ul className="text-sm text-red-600" role="alert">
              {validation.errors.map((e, i) => (
                <li key={`${e.itemId ?? "x"}-${i}`}>{e.message}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-hairline bg-white px-6 py-4 sm:justify-between">
          <Button type="button" variant="outline" onClick={handleAutoBalance}>
            Auto-balance weights
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={!canSave} onClick={() => void handleSave()}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}