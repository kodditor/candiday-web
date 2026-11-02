import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ITrustPageSubprocessorHistoryEntry } from "@/lib/types/trust-page.type";
import dayjs from "dayjs";

type SubprocessorDiffEntry = {
  diff: {
    added: string[];
    removed: string[];
  };
};

function getTotalChanges(entry: SubprocessorDiffEntry) {
  return entry.diff.added.length + entry.diff.removed.length;
}

function getHistoryEntryKey(entry: ITrustPageSubprocessorHistoryEntry, index: number) {
  return `${entry.changedAt}-${index}`;
}

function formatChangeCount(count: number) {
  return count === 1 ? "1 change" : `${count} changes`;
}

export function SubprocessorList({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: string[];
  emptyMessage: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
        {title}
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-text-secondary">{emptyMessage}</p>
      ) : (
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink">
          {items.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

type SubprocessorChangeHistoryAccordionProps = {
  history: ITrustPageSubprocessorHistoryEntry[];
  className?: string;
};

export function SubprocessorChangeHistoryAccordion({
  history,
  className,
}: SubprocessorChangeHistoryAccordionProps) {
  const sortedHistory = [...history].sort(
    (a, b) => dayjs(b.changedAt).valueOf() - dayjs(a.changedAt).valueOf(),
  );

  if (sortedHistory.length === 0) {
    return null;
  }

  return (
    <Accordion
      type="single"
      collapsible
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
                  {dayjs(entry.changedAt).format("DD MMM YYYY")}
                </span>
                <span className="text-sm text-text-secondary">
                  {formatChangeCount(totalChanges)}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-5">
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

export { getTotalChanges, formatChangeCount };
