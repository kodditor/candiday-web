import { CheckIcon } from "@phosphor-icons/react";
import config, { type PlanKey } from "@/config";
import { cn } from "@/lib/utils";

type PlanSelectorProps = {
  value?: PlanKey;
  onChange: (planKey: PlanKey) => void;
  error?: string;
};

export function PlanSelector({ value, onChange, error }: PlanSelectorProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-ink">Choose your plan</p>
        <p className="text-sm text-text-secondary">
          You&apos;ll complete payment after creating your organization.
        </p>
      </div>

      <div className="grid gap-3">
        {config.pricing.plans.map((plan) => {
          const selected = value === plan.key;

          return (
            <button
              key={plan.key}
              type="button"
              onClick={() => onChange(plan.key)}
              className={cn(
                "rounded-xl border p-4 text-left transition-[border-color,box-shadow,transform] active:scale-[0.98]",
                selected
                  ? "border-statute shadow-[0_0_0_1px_rgba(51,40,90,0.15),0_8px_24px_rgba(51,40,90,0.08)]"
                  : "border-hairline hover:border-statute/30",
              )}
              aria-pressed={selected}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink">{plan.name}</p>
                    <span className="rounded-md bg-statute/10 px-2 py-0.5 font-mono text-xs text-statute tabular-nums">
                      {plan.price}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {plan.vendors} vendors
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckIcon className="size-3.5 text-statute" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div
                  className={cn(
                    "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border",
                    selected
                      ? "border-statute bg-statute text-primary-foreground"
                      : "border-hairline bg-paper",
                  )}
                >
                  {selected ? <CheckIcon className="size-3" weight="bold" /> : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
