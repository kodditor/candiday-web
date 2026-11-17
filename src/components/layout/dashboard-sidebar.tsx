import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser as useAppUser } from "@/lib/context/user-context";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "@/lib/auth/session";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  Globe,
  Home,
  Library,
  Settings,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type DashboardNavItem = {
  label: string;
  to: string;
  section: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const dashboardNavItems: DashboardNavItem[] = [
  {
    label: "Home",
    to: "/dashboard",
    section: "home",
    icon: Home,
    exact: true,
  },
  {
    label: "Vendors",
    to: "/dashboard/vendors",
    section: "vendors",
    icon: Building2,
  },
  {
    label: "Data Owners",
    to: "/dashboard/data-owners",
    section: "data-owners",
    icon: UserCheck,
  },
  {
    label: "Global Vendors",
    to: "/dashboard/global-vendors",
    section: "global-vendors",
    icon: Library,
  },
  {
    label: "Trust Page",
    to: "/dashboard/trust-page",
    section: "trust-page",
    icon: Globe,
  },
  {
    label: "My Team",
    to: "/dashboard/team",
    section: "team",
    icon: Users,
  },
  {
    label: "Settings",
    to: "/dashboard/settings",
    section: "settings",
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const { data: session } = useSession();
  const appUser = useAppUser((state) => state.user);
  const appOrganization = useAppUser((state) => state.organization);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const orgName = appOrganization?.name ?? "Your organization";
  const orgLogo = appOrganization?.logoUrl ?? undefined;
  const orgInitials = orgName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const userName =
    [appUser?.firstName, appUser?.lastName].filter(Boolean).join(" ") ||
    session?.user.name ||
    session?.user.email ||
    "Account";

  const userImage = appUser?.imageUrl ?? session?.user.image ?? undefined;

  return (
    <aside
      aria-label="Dashboard navigation"
      className="fixed top-4 left-4 z-40 flex h-[calc(100vh-2rem)] w-72 flex-col rounded-2xl border border-hairline/60 bg-white p-4 shadow-[0_1px_2px_rgba(26,27,30,0.04),0_8px_24px_rgba(26,27,30,0.08)]"
    >
      <Link
        to="/dashboard/settings"
        className="flex items-center gap-3 rounded-[10px] px-2 py-2 transition-colors hover:bg-paper"
      >
        <Avatar className="size-10 rounded-[10px]">
          <AvatarImage
            src={orgLogo}
            alt={orgName}
            className="rounded-[10px] object-cover"
          />
          <AvatarFallback className="rounded-[10px] bg-statute/10 font-display text-sm font-semibold text-statute">
            {orgInitials}
          </AvatarFallback>
        </Avatar>
        <p className="truncate font-display text-sm font-semibold text-ink">
          {orgName}
        </p>
      </Link>

      <div className="my-3 border-t border-hairline/60" />

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto no-scrollbar">
        {dashboardNavItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.to
            : pathname === item.to || pathname.startsWith(`${item.to}/`);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-[#EEEBF5] font-semibold text-statute"
                  : "font-medium text-text-secondary hover:bg-paper hover:text-ink",
              )}
            >
              <item.icon className="size-4 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 pt-4">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="size-9">
            <AvatarImage src={userImage ?? undefined} alt={userName} />
            <AvatarFallback>{userName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
            {userName}
          </p>
        </div>
        <div className="flex flex-col gap-2 px-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/settings">Account settings</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              void signOut();
            }}
          >
            Sign out
          </Button>
        </div>

        <div className="px-2">
          <img src="/wordmark.png" alt="ProcVault" className="h-6" />
        </div>
      </div>
    </aside>
  );
}
