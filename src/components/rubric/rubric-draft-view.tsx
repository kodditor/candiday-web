import type { RubricItem } from "@/lib/rubric/schema";
import type { DraftValidation } from "@/lib/types/rubric.type";

type RubricDraftViewProps = {
  items: RubricItem[];
  validation: DraftValidation | null;
  staleBanner?: boolean;
};

export function RubricDraftView({
  items,
  validation,
  staleBanner,
}: RubricDraftViewProps) {
  return (
    <div className="space-y-4">
      {staleBanner ? (
        <p
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          role="status"
        >
          The job description changed since this rubric was created. Review criteria before
          approving.
        </p>
      ) : null}

      <ul className="space-y-3" aria-label="Rubric criteria">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-lg border border-hairline bg-muted/30 px-4 py-3"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-ink">{item.label}</p>
              <span className="text-xs text-text-muted">
                {item.requirement} · {item.weight}%
              </span>
            </div>
            <p className="mt-1 text-sm text-text-muted">{item.description}</p>
          </li>
        ))}
      </ul>

      {validation && validation.lintViolations.length > 0 ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          <p className="font-medium">Fix before approval</p>
          <ul className="mt-1 list-disc pl-5">
            {validation.lintViolations.map((v) => (
              <li key={v.itemId}>{v.reason}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}