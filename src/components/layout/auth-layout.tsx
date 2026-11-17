import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { bodyFont, displayFont } from "@/lib/typography";

export type AuthAsideContent = {
  eyebrow?: string;
  title?: string;
  body?: string;
  footer?: string;
  showHeroImage?: boolean;
};

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  aside?: AuthAsideContent;
};

const defaultAside: AuthAsideContent = {
  eyebrow: "Evidence-backed CV review",
  title: "The right candidate is in there. Find them faster.",
  body: "Upload your job description and CVs. Review every applicant against criteria you approve—with the evidence beside each decision.",
  footer: "Candiday shows the evidence. Your team makes the decision.",
  showHeroImage: true,
};

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  className,
  aside,
}: AuthLayoutProps) {
  const panel = { ...defaultAside, ...aside };

  return (
    <div className={cn("min-h-screen bg-background antialiased", bodyFont)}>
      <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-primary px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link to="/" className={cn("inline-flex text-2xl text-white", displayFont)}>
              Candiday
            </Link>
          </div>
          <div className="max-w-md space-y-4">
            {panel.eyebrow ? (
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/70">
                {panel.eyebrow}
              </p>
            ) : null}
            {panel.title ? (
              <h1
                className={cn(
                  "text-balance text-4xl leading-tight text-white",
                  displayFont,
                )}
              >
                {panel.title}
              </h1>
            ) : null}
            {panel.body ? (
              <p className="text-pretty text-base leading-relaxed text-white/85">
                {panel.body}
              </p>
            ) : null}
            {panel.showHeroImage !== false ? (
              <img
                src="/cv-stack.webp"
                alt=""
                className="mt-6 h-auto w-full max-w-sm opacity-90"
                decoding="async"
              />
            ) : null}
          </div>
          {panel.footer ? (
            <p className="text-xs text-white/65">{panel.footer}</p>
          ) : null}
        </aside>

        <div className="flex flex-col px-[5%] py-8 sm:py-12">
          <div className="mb-8 flex justify-center lg:hidden">
            <Link to="/" className={cn("text-2xl text-foreground", displayFont)}>
              Candiday
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
            <div className="mb-8 text-center lg:text-left">
              <h2 className={cn("text-balance text-3xl text-foreground", displayFont)}>
                {title}
              </h2>
              <p className="mt-2 text-pretty text-sm text-muted-foreground">{subtitle}</p>
            </div>

            <div
              className={cn(
                "rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8",
                className,
              )}
            >
              {children}
            </div>

            {footer ? (
              <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}