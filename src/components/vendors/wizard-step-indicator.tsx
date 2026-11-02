import { WIZARD_STEPS } from "@/lib/constants/vendor";
import { cn } from "@/lib/cn";

type WizardStepId = 2 | 3 | 4 | 5 | 6;

type WizardStepIndicatorProps = {
  currentStep: WizardStepId;
  steps?: WizardStepId[];
  className?: string;
};

export function WizardStepIndicator({
  currentStep,
  steps,
  className,
}: WizardStepIndicatorProps) {
  const visibleSteps = WIZARD_STEPS.filter((step) => (
    steps ? steps.includes(step.id) : true
  ));

  return (
    <nav
      aria-label="Wizard progress"
      className={cn("shrink-0", className)}
    >
      <ol className="flex flex-col">
        {visibleSteps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isComplete = step.id < currentStep;
          const isLast = index === visibleSteps.length - 1;

          return (
            <li key={step.id} className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                    isActive && "border-statute bg-statute text-white",
                    isComplete && "border-statute bg-statute/10 text-statute",
                    !isActive && !isComplete && "border-hairline bg-paper text-text-secondary",
                  )}
                >
                  {index + 1}
                </span>
                {!isLast && (
                  <span
                    aria-hidden
                    className={cn(
                      "my-2 w-px flex-1 min-h-8",
                      isComplete ? "bg-statute/40" : "bg-hairline",
                    )}
                  />
                )}
              </div>

              <div className={cn("pb-10 pt-1.5", isLast && "pb-0")}>
                <p
                  className={cn(
                    "text-sm font-medium leading-none",
                    isActive ? "text-ink" : "text-text-secondary",
                  )}
                >
                  {step.label}
                </p>
                {isActive && (
                  <p className="mt-2 text-xs text-text-secondary">
                    In progress
                  </p>
                )}
                {isComplete && (
                  <p className="mt-2 text-xs text-statute">
                    Complete
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
