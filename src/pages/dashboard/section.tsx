import { dashboardPillNavItems } from "@/components/layout/dashboard-header";
import { createRoute } from "@tanstack/react-router";
import { DashboardRootRoute } from "./root";

const sectionTitles = Object.fromEntries(
  dashboardPillNavItems.map((item) => [item.section, item.label]),
);

export const DashboardSectionRoute = createRoute({
  getParentRoute: () => DashboardRootRoute,
  path: "/$section",
  component: DashboardSectionPage,
});

function DashboardSectionPage() {
  const { section } = DashboardSectionRoute.useParams();
  const title = sectionTitles[section] ?? "Dashboard";

  return (
    <div className="space-y-2">
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
        {title}
      </h1>
      <p className="text-text-secondary">This section is coming soon.</p>
    </div>
  );
}
