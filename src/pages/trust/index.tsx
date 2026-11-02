import { TrustPagePublicView } from "@/components/trust-page/trust-page-public-view";
import { fetchPublicTrustPage } from "@/lib/api/trust-page";
import type { TrustPagePreviewVendor } from "@/lib/types/trust-page.type";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link, createRoute } from "@tanstack/react-router";
import { rootRoute } from "@/router";

export const PublicTrustPageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/trust/$slug",
  component: PublicTrustPage,
});

function mapSnapshotVendor(vendor: {
  vendorId: string;
  name: string;
  logoUrl?: string | null;
  category: string;
  dataScopeTags: string[];
  hostingRegions: string[];
  lastReviewed: string;
  useCase?: string;
  description?: string;
}): TrustPagePreviewVendor {
  return {
    vendorId: vendor.vendorId,
    name: vendor.name,
    logoUrl: vendor.logoUrl,
    category: vendor.category,
    dataScopeTags: vendor.dataScopeTags,
    hostingRegions: vendor.hostingRegions,
    lastReviewed: vendor.lastReviewed,
    useCase: vendor.useCase,
    description: vendor.description,
  };
}

function PublicTrustPage() {
  const { slug } = PublicTrustPageRoute.useParams();

  const pageQuery = useQuery({
    queryKey: ["public-trust-page", slug],
    queryFn: () => fetchPublicTrustPage(slug),
    retry: false,
  });

  if (pageQuery.isPending) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper">
        <CircleNotchIcon size={28} className="animate-spin text-statute" />
      </div>
    );
  }

  if (pageQuery.isError || !pageQuery.data) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper px-6">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="font-display text-3xl font-bold text-ink">Page not found</h1>
          <p className="text-sm text-text-secondary">
            This trust page does not exist or is not currently published.
          </p>
          <Link to="/" className="text-sm font-medium text-statute hover:underline">
            Go to ProcVault
          </Link>
        </div>
      </div>
    );
  }

  const vendors = pageQuery.data.vendors?.map(mapSnapshotVendor) ?? [];
  const sections = pageQuery.data.sections?.map((section) => ({
    title: section.title,
    description: section.description,
    introText: section.introText,
    vendors: section.vendors.map(mapSnapshotVendor),
  })) ?? [];

  return (
    <TrustPagePublicView
      organizationName={pageQuery.data.organizationName}
      organizationLogoUrl={pageQuery.data.organizationLogoUrl}
      layout={pageQuery.data.layout}
      vendors={vendors}
      sections={sections}
      lastModifiedAt={pageQuery.data.lastModifiedAt}
      showSubprocessorHistory={pageQuery.data.showSubprocessorHistory}
      subprocessorChangeHistory={pageQuery.data.subprocessorChangeHistory}
    />
  );
}
