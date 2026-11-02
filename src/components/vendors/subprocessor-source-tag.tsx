import type { ISubprocessor } from "@/lib/types/vendor.type";
import { cn } from "@/lib/cn";

type SubprocessorSourceTagProps = {
  source: ISubprocessor["source"];
};

export function SubprocessorSourceTag({ source }: SubprocessorSourceTagProps) {
  const isDetected = source === "Global";

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
        isDetected ? "bg-blue-50 text-blue-800" : "bg-gray-100 text-gray-700",
      )}
    >
      {isDetected ? "Detected" : "Added by you"}
    </span>
  );
}
