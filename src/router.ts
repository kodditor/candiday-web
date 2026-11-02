import { createRouter, createRoute, createRootRoute } from "@tanstack/react-router";
import { Root } from "./router/Root";
import { Home } from "./router/Home";
import { NotFoundPage } from "./pages/not-found";
import { ErrorComponent } from "./pages/error";
import { SignupRoute } from "./pages/signup";
import { LoginRoute } from "./pages/login";
import { OnboardingRoute } from "./pages/onboarding";
import { SSOCallbackRoute } from "./pages/sso-callback";
import { DashboardRootRoute } from "./pages/dashboard/root";
import { DashboardIndexRoute } from "./pages/dashboard/index";
import { DashboardDataOwnersRoute } from "./pages/dashboard/data-owners";
import {
  DashboardVendorsRoute,
  DashboardVendorsIndexRoute,
} from "./pages/dashboard/vendors/index";
import {
  DashboardVendorsCreateRoute,
  DashboardVendorsCreateIndexRoute,
} from "./pages/dashboard/vendors/create/index";
import { DashboardVendorsCreateCustomRoute } from "./pages/dashboard/vendors/create/custom";
import { DashboardVendorDetailRoute } from "./pages/dashboard/vendors/view";
import { DashboardVendorReviewRoute } from "./pages/dashboard/vendors/review";
import {
  DashboardGlobalVendorsRoute,
  DashboardGlobalVendorsIndexRoute,
} from "./pages/dashboard/global-vendors/index";
import { DashboardGlobalVendorDetailRoute } from "./pages/dashboard/global-vendors/view";
import { DashboardTrustPageRoute } from "./pages/dashboard/trust-page";
import { DashboardTeamRoute } from "./pages/dashboard/team";
import { DashboardSettingsRoute } from "./pages/dashboard/settings";
import { DashboardSectionRoute } from "./pages/dashboard/section";
import { PublicTrustPageRoute } from "./pages/trust";

export const rootRoute = createRootRoute({
  component: Root,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  SignupRoute,
  LoginRoute,
  OnboardingRoute,
  SSOCallbackRoute,
  PublicTrustPageRoute,
  DashboardRootRoute.addChildren([
    DashboardIndexRoute,
    DashboardDataOwnersRoute,
    DashboardTrustPageRoute,
    DashboardTeamRoute,
    DashboardSettingsRoute,
    DashboardVendorsRoute.addChildren([
      DashboardVendorsIndexRoute,
      DashboardVendorsCreateRoute.addChildren([
        DashboardVendorsCreateIndexRoute,
        DashboardVendorsCreateCustomRoute,
      ]),
      DashboardVendorDetailRoute,
      DashboardVendorReviewRoute,
    ]),
    DashboardGlobalVendorsRoute.addChildren([
      DashboardGlobalVendorsIndexRoute,
      DashboardGlobalVendorDetailRoute,
    ]),
    DashboardSectionRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
