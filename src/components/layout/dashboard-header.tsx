import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUser as useAppUser } from "@/lib/context/user-context";
import { signOut, useSession } from "@/lib/auth/session";
import { displayFont } from "@/lib/typography";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";

export type DashboardPillNavItem = {
  label: string;
  to: string;
  section: string;
  exact?: boolean;
};

export const dashboardPillNavItems: DashboardPillNavItem[] = [
  {
    label: "Home",
    to: "/dashboard",
    section: "home",
    exact: true,
  },
  {
    label: "Roles",
    to: "/dashboard/roles",
    section: "roles",
  },
  {
    label: "Users",
    to: "/dashboard/team",
    section: "team",
  },
  {
    label: "Settings",
    to: "/dashboard/settings",
    section: "settings",
  },
];

function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function DashboardHeader() {
  const { data: session } = useSession();
  const appUser = useAppUser((state) => state.user);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const userName =
    [appUser?.firstName, appUser?.lastName].filter(Boolean).join(" ") ||
    session?.user.name ||
    "Account";

  const userEmail =
    appUser?.emailAddress ?? session?.user.email ?? "";

  const userInitials = getUserInitials(userName);

  return (
    <header
      className="m-auto grid grid-cols-[1fr_auto_1fr] max-w-2xl items-center gap-4 rounded-full border border-hairline/80 bg-white/95 px-1.5 py-1 shadow-sm backdrop-blur-sm"
      aria-label="Dashboard"
    >
      <Link
        to="/dashboard"
        className={cn(
          "justify-self-start text-lg font-medium tracking-tight text-ink pl-4",
          displayFont,
        )}
      >
        Candiday
      </Link>

      <nav
        className="flex items-center gap-0.5 rounded-full bg-paper-raised p-1"
        aria-label="Main"
      >
        {dashboardPillNavItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.to
            : pathname === item.to || pathname.startsWith(`${item.to}/`);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-full px-4 py-2 text-sm text-text-muted transition-colors",
                isActive
                  ? "border border-hairline bg-white font-medium text-ink"
                  : "font-normal hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="justify-self-end">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-hairline bg-paper-raised text-xs font-medium text-text-muted"
              aria-label="Account menu"
            >
              {userInitials}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-max min-w-52 max-w-72 gap-3 border-hairline bg-white p-3 shadow-none ring-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{userName}</p>
              {userEmail ? (
                <p className="truncate text-xs text-text-muted" title={userEmail}>
                  {userEmail}
                </p>
              ) : null}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-hairline bg-white"
              onClick={() => {
                void signOut();
              }}
            >
              Log out
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}