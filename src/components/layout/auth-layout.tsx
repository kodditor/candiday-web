import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-paper font-body antialiased">
      <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-statute px-10 py-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center">
              <img
                src="/wordmark-white.png"
                alt="ProcVault"
                className="h-8"
                fetchPriority="high"
              />
            </Link>
          </div>
          <div className="max-w-md space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground/70">
              Vendor compliance
            </p>
            <h1 className="text-balance font-display text-4xl font-bold leading-tight">
              Track GDPR vendor compliance without the spreadsheet.
            </h1>
            <p className="text-pretty text-base leading-relaxed text-primary-foreground/80">
              DPAs, subprocessors, and review deadlines in one place for lean legal and ops teams.
            </p>
          </div>
          <p className="text-xs text-primary-foreground/60">
            ProcVault organizes and tracks vendor compliance data. It does not provide legal advice.
          </p>
        </aside>

        <div className="flex flex-col px-[5%] py-8 sm:py-12">
          <div className="mb-8 flex justify-center lg:hidden">
            <Link to="/">
              <img
                src="/wordmark.png"
                alt="ProcVault"
                className="h-8"
                fetchPriority="high"
              />
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-balance font-display text-3xl font-bold text-ink">
                {title}
              </h2>
              <p className="mt-2 text-pretty text-sm text-text-secondary">
                {subtitle}
              </p>
            </div>

            <div
              className={cn(
                "rounded-2xl border border-hairline bg-paper-raised p-6 shadow-[0_1px_2px_rgba(26,27,30,0.04),0_8px_24px_rgba(26,27,30,0.06)] sm:p-8",
                className,
              )}
            >
              {children}
            </div>

            {footer ? (
              <div className="mt-6 text-center text-sm text-text-secondary">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
