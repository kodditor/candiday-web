import { Button } from "@/components/ui/button";
import { FAQSection } from "@/components/ui/faq";
import config from "@/config";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const display = "font-['Barlow_Condensed',system-ui,sans-serif] font-semibold tracking-tight text-foreground";
const body = "font-['Barlow',system-ui,sans-serif] text-foreground";

const steps = [
  {
    title: "Add your role.",
    body: "Paste the job description. Candiday drafts the criteria.",
  },
  {
    title: "Approve your criteria.",
    body: "Edit, add or remove. Nothing is scored until you say so.",
  },
  {
    title: "Upload your CVs.",
    body: "Drop in a batch of PDFs.",
  },
  {
    title: "Review with evidence.",
    body: "See how each candidate matches, what stands out, and what's missing.",
  },
  {
    title: "Build your shortlist.",
    body: "Compare candidates side by side and export when you're ready.",
  },
] as const;

const features = [
  {
    title: "Your criteria, not a black box",
    body: "Candiday turns the job description into a clear rubric. You approve it, and every candidate is assessed against the same standard.",
  },
  {
    title: "Evidence behind every assessment",
    body: "Each judgment points to the relevant passage and page in the CV. No unexplained scores.",
  },
  {
    title: "See it in the original CV",
    body: "Click a criterion and jump straight to the supporting text in the candidate's actual CV. Verify in seconds instead of searching manually.",
  },
  {
    title: "Honest about what it doesn't know",
    body: "“Not evidenced in this CV” is not the same as “doesn't have the skill.” Candiday flags gaps and ambiguity so you know what to check, instead of quietly rejecting people.",
  },
  {
    title: "Compare like for like",
    body: "Line candidates up criterion by criterion, with the evidence and the unknowns visible.",
  },
  {
    title: (
      <>
        Ask questions,
        <br />
        get grounded answers
      </>
    ),
    body: "“Has she managed a team?” “Where did he work in 2022?” Answers come from the CV itself, with the page and quote.",
  },
] as const;

const faqItems = [
  {
    question: "Do I need an ATS?",
    answer: "No. Candiday works on its own with your CVs.",
  },
  {
    question: "Does it make hiring decisions?",
    answer: "No. It helps you review and prioritize. You decide.",
  },
  {
    question: "What file types are supported?",
    answer:
      "Text-based PDFs to start. Unreadable or scanned files are flagged instead of producing unreliable results.",
  },
  {
    question: "Can I control what it evaluates?",
    answer: "Yes. You approve the criteria before any CV is assessed.",
  },
  {
    question: "What happens to candidate data?",
    answer:
      "We'll publish retention and subprocessor terms before early access. This answer stays open until those terms are settled.",
  },
];

function Section({
  className,
  innerClassName,
  id,
  children,
}: {
  className?: string;
  innerClassName?: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("px-[5%]", className)}>
      <div className={cn("mx-auto w-full max-w-[1280px]", innerClassName)}>
        {children}
      </div>
    </section>
  );
}

function EarlyAccessButton({ className, variant = "default" }: { className?: string, variant?: "default" | "secondary" | "outline" | "neutral"}) {
  return (
    <Link to={config.clerk.signUpUrl} className="inline-flex items-center">
      <Button size="lg" className={cn("text-base font-semibold", className)} variant={variant}>
        Get Early Access
      </Button>
    </Link>
  );
}

function StepTimelineItem({
  index,
  title,
  body,
}: {
  index: number;
  title: string;
  body: string;
}) {
  const onLeft = index % 2 === 0;

  return (
    <li className="relative list-none pb-10 last:pb-0 lg:pb-14">
      <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-x-4 lg:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] lg:items-center lg:gap-x-10">
        <div className="col-start-1 row-start-1 flex justify-center lg:col-start-2">
          <span
            className={cn(
              display,
              "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-lg tabular-nums",
            )}
          >
            {index + 1}
          </span>
        </div>
        <div
          className={cn(
            "col-start-2 row-start-1 w-full lg:max-w-md",
            onLeft
              ? "lg:col-start-1 lg:justify-self-end"
              : "lg:col-start-3 lg:justify-self-start",
          )}
        >
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-xl font-semibold leading-8">{title}</p>
            <p className="mt-1 text-[17px] leading-[26px]">{body}</p>
          </div>
        </div>
      </div>
    </li>
  );
}

function HowItWorksTimeline() {
  return (
    <ol className="relative mt-7">
      <div
        aria-hidden
        className="absolute bottom-4 left-5 top-0 w-px -translate-x-1/2 bg-border lg:bottom-4 lg:left-1/2 lg:-translate-x-px"
      />
      {steps.map((step, index) => (
        <StepTimelineItem
          key={step.title}
          index={index}
          title={step.title}
          body={step.body}
        />
      ))}
    </ol>
  );
}

function AudienceSection() {
  return (
    <Section className="bg-muted py-16 lg:py-[88px]">
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <article className="rounded-lg bg-primary p-6 text-primary-foreground lg:p-8">
          <p className="text-sm font-medium text-primary-foreground/80">
            Who decides?
          </p>
          <div className="mt-4 flex flex-col gap-4 lg:mt-5 lg:flex-row lg:items-start lg:gap-8">
            <h2
              className={cn(
                display,
                "text-2xl leading-tight text-primary-foreground tracking-[-0.03em] lg:w-[48%] lg:shrink-0 lg:text-[32px] lg:leading-[1.1]",
              )}
            >
              You make the shortlist. You make the hiring decision.
            </h2>
            <p className="text-base leading-7 lg:w-[52%] lg:text-lg">
              Candiday helps you review and prioritize. It never auto-rejects
              anyone, and it never replaces your judgment. Your decisions, your
              notes, your call.
            </p>
          </div>
        </article>
        <article className="rounded-lg border border-border bg-card p-6 text-foreground lg:p-8">
          <p className="text-sm font-medium text-muted-foreground">
            Who is this meant for?
          </p>
          <div className="mt-4 flex flex-col gap-4 lg:mt-5 lg:flex-row lg:items-start lg:gap-8">
            <h2
              className={cn(
                display,
                "text-2xl leading-tight tracking-[-0.03em] lg:w-[48%] lg:shrink-0 lg:text-[32px] lg:leading-[1.1]",
              )}
            >
              Built for teams who hire without a big recruiting stack.
            </h2>
            <p className="text-base leading-7 lg:w-[52%] lg:text-lg">
              Growing businesses and small recruitment teams who need a faster,
              more consistent first pass without adopting a full applicant
              tracking system.
            </p>
          </div>
        </article>
      </div>
    </Section>
  );
}

function CvStack() {
  return (
    <div className="w-full shrink-0 lg:w-[min(100%,720px)] lg:-mt-18 lg:pb-10">
      <img
        src="/cv-stack.webp"
        alt="Several CVs in a pile, with one candidate highlighted in the middle and a cited line about team leadership."
        className="mx-auto h-auto w-full max-w-[720px] lg:mx-0"
        fetchPriority="high"
        decoding="async"
      />
    </div>
  );
}

function LandingNav() {
  return (
    <header className={cn(body, "border-b border-border bg-background")}>
      <Section className="py-5 pt-7" innerClassName="flex items-center justify-between">
        <Link
          to="/"
          className={cn(
            display,
            "inline-flex items-center text-[28px] leading-8 tracking-[-0.02em]",
          )}
        >
          Candiday
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to={config.clerk.signInUrl}
            search={{ redirect_to: undefined }}
            className="inline-flex items-center"
          >
            <Button variant="ghost" className="text-sm font-medium">
              Log in
            </Button>
          </Link>
          <EarlyAccessButton />
        </div>
      </Section>
    </header>
  );
}

function LandingFooter() {
  return (
    <footer className={cn(body, "border-t border-border bg-background py-8")}>
      <Section>
        <p className={cn(display, "text-xl")}>Candiday</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Evidence-backed CV review for teams who hire without a big recruiting
          stack.
        </p>
        <p className="mt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Candiday
        </p>
      </Section>
    </footer>
  );
}

export function HomePage() {
  return (
    <div className={cn(body, "min-h-screen bg-background antialiased")}>
      <LandingNav />

      <Section className="pt-10 md:pt-16">
        <h1 className={cn(display, "max-w-4xl text-[2.75rem] leading-[1.05] tracking-[-0.035em] md:text-6xl lg:text-[5.5rem] lg:leading-[0.95]")}>
          The right candidate is in there.
          <br />
          Find them faster.
        </h1>
      </Section>

      <Section className="pt-8 pb-12 lg:pb-[72px]">
        <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-start lg:gap-14">
          <div className="flex max-w-md shrink-0 flex-col gap-7 pt-0 lg:pt-3">
            <p className="text-lg leading-7">
              Upload your job description and a stack of CVs. Candiday assesses
              every applicant against the criteria you approve, and shows the
              evidence behind each assessment, right next to the original CV.
            </p>
            <EarlyAccessButton className="self-start" />
          </div>
          <CvStack />
        </div>
      </Section>

      <Section className="bg-muted py-16 lg:py-24">
        <h2 className={cn(display, "max-w-4xl text-3xl leading-tight tracking-[-0.03em] md:text-[52px] md:leading-[54px]")}>
          Reviewing CVs shouldn't mean 80 open tabs and a spreadsheet.
        </h2>
        <p className="mt-5 max-w-xl text-lg leading-7">
          Every hire starts the same way: a pile of CVs, a job description, and a
          growing worry that someone good is getting skimmed past. Candiday gives
          you a consistent way to work through the pile, so you spend your
          attention on the people worth talking to.
        </p>
      </Section>

      <Section className="py-16 lg:py-[104px]" id="how-it-works">
        <h2 className={cn(display, "text-3xl text-center leading-tight tracking-[-0.03em] md:text-[44px] md:leading-[48px] md:pb-6")}>
          How it works
        </h2>
        <HowItWorksTimeline />
      </Section>

      <Section className="py-16 lg:py-[104px]">
        <h2 className={cn(display, "text-3xl leading-tight tracking-[-0.03em] md:text-[44px] md:leading-[48px]")}>
          What you can see
        </h2>
        <ul className="mt-7 border-b border-border">
          {features.map((feature) => (
            <li
              key={typeof feature.title === "string" ? feature.title : "ask"}
              className="flex flex-col gap-3 border-t border-border py-5 lg:flex-row lg:gap-12 lg:py-[22px]"
            >
              <h3
                className={cn(
                  display,
                  "shrink-0 text-2xl leading-[34px] tracking-[-0.02em] lg:w-[380px] lg:text-[32px]",
                )}
              >
                {feature.title}
              </h3>
              <p className="text-[17px] leading-[26px] lg:pt-1">{feature.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <AudienceSection />

      <Section className="py-16 lg:py-[104px]" id="faq">
        <h2 className={cn(display, "text-3xl leading-tight tracking-[-0.03em] md:text-[44px] md:leading-[48px]")}>
          Questions
        </h2>
        <div className="mt-7 max-w-[860px]">
          <FAQSection items={faqItems} />
        </div>
      </Section>

      <Section className="bg-primary pb-16 pt-20 lg:pb-24 lg:pt-28">
        <h2 className={cn(display, "max-w-4xl text-3xl text-primary-foreground leading-tight tracking-[-0.03em] md:text-[64px] md:leading-[66px]")}>
          Less time buried in CVs. More time with the right candidates.
        </h2>
        <div className="mt-7">
          <EarlyAccessButton variant="outline" />
        </div>
      </Section>

      <LandingFooter />
    </div>
  );
}
