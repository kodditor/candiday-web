import { GoogleLogoIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GoogleAuthButtonProps = {
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

export function GoogleAuthButton({
  label,
  onClick,
  loading,
  disabled,
  className,
}: GoogleAuthButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={cn("h-11 w-full text-base active:scale-[0.96]", className)}
      onClick={onClick}
      loading={loading}
      disabled={disabled}
    >
      <GoogleLogoIcon weight="bold" className="size-5" />
      {label}
    </Button>
  );
}

export function AuthDivider() {
  return (
    <div className="relative py-2">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-hairline" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-paper-raised px-3 text-text-muted">or</span>
      </div>
    </div>
  );
}

export function ClerkFieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}

export function ClerkGlobalErrors({
  errors,
}: {
  errors?: Array<{ message?: string }> | null;
}) {
  if (!errors?.length) return null;

  return (
    <div className="space-y-1 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
      {errors.map((error, index) => (
        <p key={index} className="text-sm text-destructive">
          {error.message}
        </p>
      ))}
    </div>
  );
}
