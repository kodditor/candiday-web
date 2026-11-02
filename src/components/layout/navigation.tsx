import { Link } from "@tanstack/react-router";
import config, { getPrimaryCtaLabel } from "@/config";
import { Button } from "../ui/button";

const navLinkClass =
  "text-sm font-medium text-text-secondary transition-colors hover:text-ink";

export default function Navigation() {
  return (
    <section className="z-[999] t-0 fixed bg-paper-raised flex w-full items-center border-b border-hairline font-body lg:min-h-18 lg:px-[5%]">
      <div className="flex min-h-16 w-full items-center justify-between px-[5%] md:min-h-24 lg:min-h-full lg:px-0 py-4">
        <Link to="/" className="font-display text-xl font-bold text-statute tracking-tight">
          <img src="/wordmark.png" fetchPriority="high" alt="ProcVault Logo" className="h-8 -ml-3" />
        </Link>

        <nav className="flex items-center gap-4 md:gap-6 lg:gap-8">
          <div className="hidden items-center gap-6 md:flex">
            <Link to="/" hash="how-it-works" className={navLinkClass}>
              How it works
            </Link>
            <Link to="/" hash="pricing" className={navLinkClass}>
              Pricing
            </Link>
            <Link to="/" hash="faq" className={navLinkClass}>
              FAQ
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/auth/login" search={{ redirect_to: undefined }}>
              <Button variant="ghost" className="text-sm">
                Log in
              </Button>
            </Link>
            <Link to={config.clerk.signUpUrl}>
              <Button className="text-sm">{getPrimaryCtaLabel()}</Button>
            </Link>
          </div>
        </nav>
      </div>
    </section>
  );
}
