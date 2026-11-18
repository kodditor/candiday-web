import { Badge } from "@/components/ui/badge";
import type { RubricItem } from "@/lib/rubric/schema";
import { cn } from "@/lib/cn";

function rubricSummary(items: RubricItem[]) {
  const essential = items.filter((i) => i.requirement === "essential").length;
  return {
    total: items.length,
    essential,
    preferred: items.length - essential,
    weightTotal: items.reduce((sum, i) => sum + i.weight, 0),
  };
}

function RequirementPill({ requirement }: { requirement: RubricItem["requirement"] }) {
  const isEssential = requirement === "essential";
  return (
    <Badge
      variant="secondary"
      className={cn(
        "shrink-0 border-0 font-normal",
        isEssential ? "bg-amber-50 text-amber-900" : "bg-neutral-100 text-neutral-700",
      )}
    >
      {isEssential ? "Essential" : "Preferred"}
    </Badge>
  );
}

type RubricApprovedViewProps = {
  items: RubricItem[];
};

export function RubricApprovedView({ items }: RubricApprovedViewProps) {
  const summary = rubricSummary(items);

  return (
    <div className="space-y-4">
      <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted">
        <div className="flex gap-1.5">
          <dt className="sr-only">Criteria count</dt>
          <dd>
            <span className="tabular-nums text-ink">{summary.total}</span> criteria
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="sr-only">Essential count</dt>
          <dd>
            <span className="tabular-nums text-ink">{summary.essential}</span> essential
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="sr-only">Preferred count</dt>
          <dd>
            <span className="tabular-nums text-ink">{summary.preferred}</span> preferred
          </dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="sr-only">Total weight</dt>
          <dd>
            <span className="tabular-nums text-ink">{summary.weightTotal}</span>% weight total
          </dd>
        </div>
      </dl>

      <ul className="space-y-3" aria-label="Approved rubric criteria">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="rounded-lg border border-hairline bg-muted/30 px-4 py-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex min-w-0 items-baseline gap-2">
                <span
                  className="shrink-0 text-xs font-medium tabular-nums text-text-muted"
                  aria-hidden
                >
                  #{index + 1}
                </span>
                <p className="text-sm font-medium text-ink">{item.label}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <RequirementPill requirement={item.requirement} />
                <span className="rounded-sm border border-hairline bg-paper-raised px-2 py-0.5 text-xs font-medium tabular-nums text-ink">
                  {item.weight}%
                </span>
              </div>
            </div>
            <p className="mt-1.5 text-sm text-text-muted">{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}