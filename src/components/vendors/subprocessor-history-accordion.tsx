import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  formatChangeCount,
  getTotalChanges,
  SubprocessorList,
} from "@/components/trust-page/subprocessor-change-history-accordion";
import type { ISubprocessorDiffEntry } from "@/lib/types/global-vendor.type";
import dayjs from "dayjs";

type SubprocessorHistoryAccordionProps = {
  history: ISubprocessorDiffEntry[];
  className?: string;
  defaultOpenFirst?: boolean;
};

function getHistoryEntryKey(entry: ISubprocessorDiffEntry, index: number) {
  return `${entry.detectedAt}-${index}`;
}

export function SubprocessorHistoryAccordion({
  history,
  className,
  defaultOpenFirst = true,
}: SubprocessorHistoryAccordionProps) {
  const sortedHistory = [...history].sort(
    (a, b) => dayjs(b.detectedAt).valueOf() - dayjs(a.detectedAt).valueOf(),
  );

  if (sortedHistory.length === 0) {
    return (
      <p className="text-sm text-text-secondary">No subprocessor history recorded.</p>
    );
  }

  const defaultValue = defaultOpenFirst
    ? getHistoryEntryKey(sortedHistory[0], 0)
    : undefined;

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultValue}
      className={className}
    >
      {sortedHistory.map((entry, index) => {
        const totalChanges = getTotalChanges(entry);
        const entryKey = getHistoryEntryKey(entry, index);

        return (
          <AccordionItem key={entryKey} value={entryKey}>
            <AccordionTrigger>
              <span className="flex flex-1 items-center justify-between gap-4 pr-2">
                <span className="text-sm text-ink">
                  {dayjs(entry.detectedAt).format("DD MMM YYYY")}
                </span>
                <span className="text-sm text-text-secondary">
                  {formatChangeCount(totalChanges)}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  AI summary
                </p>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {entry.aiSummary || "No summary available."}
                </p>
              </div>

              <SubprocessorList
                title="Added subprocessors"
                items={entry.diff.added}
                emptyMessage="No subprocessors added."
              />

              <SubprocessorList
                title="Removed subprocessors"
                items={entry.diff.removed}
                emptyMessage="No subprocessors removed."
              />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
