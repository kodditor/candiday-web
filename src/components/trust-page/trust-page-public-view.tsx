import { Badge } from "@/components/ui/badge";
import { SubprocessorChangeHistoryAccordion } from "@/components/trust-page/subprocessor-change-history-accordion";
import { VendorLogo } from "@/components/vendors/vendor-logo";
import type {
  ITrustPageSubprocessorHistoryEntry,
  TrustPageLayout,
  TrustPagePreviewSection,
  TrustPagePreviewVendor,
} from "@/lib/types/trust-page.type";
import { formatCategoryLabel } from "@/lib/utils/vendor";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { Link } from "@tanstack/react-router";

type TrustPagePublicViewProps = {
  organizationName: string;
  organizationLogoUrl?: string | null;
  layout?: TrustPageLayout;
  vendors?: TrustPagePreviewVendor[];
  sections?: TrustPagePreviewSection[];
  lastModifiedAt?: string | null;
  showSubprocessorHistory?: boolean;
  subprocessorChangeHistory?: ITrustPageSubprocessorHistoryEntry[];
  preview?: boolean;
  className?: string;
};

function TrustPageVendorTable({ vendors, layout }: { vendors: TrustPagePreviewVendor[], layout: TrustPageLayout }) {
  const showUseCase = vendors.some((vendor) => vendor.useCase);
  const showDescription = vendors.some((vendor) => vendor.description);

  if (vendors.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-hairline px-6 py-12 text-center text-sm text-text-secondary">
        No subprocessors are listed in this section yet.
      </div>
    );
  }

  return (
    <div className="-mx-4 overflow-x-auto border-y border-hairline sm:mx-0 sm:rounded-lg sm:border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-text-secondary">
          <tr>
            <th className="px-4 py-3 font-medium whitespace-pre">Vendor</th>
            <th className="px-4 py-3 font-medium whitespace-pre">Category</th>
            <th className="px-4 py-3 font-medium whitespace-pre">Hosting</th>
            {showUseCase && <th className="px-4 py-3 font-medium whitespace-pre">Use case</th>}
            {showDescription && <th className="px-4 py-3 font-medium whitespace-pre">Description</th>}
            {layout === "Simplified" && <th className="px-4 py-3 font-medium whitespace-pre">Data scope</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {vendors.map((vendor) => (
            <tr key={vendor.vendorId} className="align-middle">
              <td className="px-4 py-4 whitespace-pre">
                <div className="flex items-center gap-3">
                  <VendorLogo name={vendor.name} logoUrl={vendor.logoUrl} size="sm" />
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="font-medium text-ink">{vendor.name}</span>
                    {vendor.isUnpublished && (
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        Unpublished
                      </Badge>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-text-secondary whitespace-pre">
                {formatCategoryLabel(vendor.category, vendor.customCategoryLabel)}
              </td>
              <td className="px-4 py-4 text-text-secondary whitespace-pre">
                {vendor.hostingRegions.length > 0
                  ? vendor.hostingRegions.join(", ")
                  : "—"}
              </td>
              {showUseCase && (
                <td className="px-4 py-4 text-text-secondary whitespace-pre">
                  {vendor.useCase || "—"}
                </td>
              )}
              {showDescription && (
                <td className="px-4 py-4 text-text-secondary break-words max-w-[400px]">
                  {vendor.description || "—"}
                </td>
              )}
              {
                layout === "Simplified" && (
                  <td className="px-4 py-4 text-text-secondary whitespace-pre">
                    {vendor.dataScopeTags.length > 0
                      ? vendor.dataScopeTags.join(", ")
                      : "—"}
                  </td>
                )
              }
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TrustPagePublicView({
  organizationName,
  organizationLogoUrl,
  layout = "Simplified",
  vendors = [],
  sections = [],
  lastModifiedAt,
  showSubprocessorHistory = false,
  subprocessorChangeHistory = [],
  preview = false,
  className,
}: TrustPagePublicViewProps) {
  const isSectioned = layout === "Sectioned";

  return (
    <div
      className={cn(
        "flex min-h-full flex-col rounded-xl border border-hairline bg-white",
        preview ? "shadow-sm" : "min-h-screen border-0 rounded-none",
        className,
      )}
    >
      <header className="border-b border-hairline px-4 py-6 sm:px-10 sm:py-8">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          {organizationLogoUrl ? (
            <img
              src={organizationLogoUrl}
              alt={`${organizationName} logo`}
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : (
            <VendorLogo name={organizationName} size="lg" />
          )}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              Subprocessor trust page
            </p>
            <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              {organizationName}
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-10 sm:py-8">
        <div className="mx-auto max-w-4xl space-y-12">
          {isSectioned ? (
            sections.length === 0 ? (
              <div className="rounded-lg border border-dashed border-hairline px-6 py-12 text-center text-sm text-text-secondary">
                No subprocessors are listed on this page yet.
              </div>
            ) : (
              sections.map((section) => (
                <section key={section.title} className="space-y-4">
                  <div className="space-y-2">
                    <h2 className="font-display text-lg font-bold text-ink">
                      {section.title}
                    </h2>
                    {section.description ? (
                      <p className="text-sm text-text-secondary">{section.description}</p>
                    ) : null}
                    {section.introText ? (
                      <p className="text-sm text-text-secondary">{section.introText}</p>
                    ) : null}
                  </div>
                  <TrustPageVendorTable vendors={section.vendors} layout={layout} />
                </section>
              ))
            )
          ) : (
            <section className="space-y-4">
              <h2 className="font-display text-lg font-bold text-ink">
                Our Subprocessors
              </h2>
              <p className="text-sm text-text-secondary">
                Third-party subprocessors used to deliver our services.
              </p>

              {vendors.length === 0 ? (
                <div className="rounded-lg border border-dashed border-hairline px-6 py-12 text-center text-sm text-text-secondary">
                  No subprocessors are listed on this page yet.
                </div>
              ) : (
                <TrustPageVendorTable vendors={vendors} layout={layout} />
              )}
            </section>
          )}

          {showSubprocessorHistory && (
            <section className="space-y-4">
              <h2 className="font-display text-lg font-bold text-gray-800">
                Subprocessor change history
              </h2>
              {subprocessorChangeHistory.length === 0 ? (
                <div className="rounded-lg border border-dashed border-hairline px-6 py-8 text-center text-sm text-text-secondary">
                  No subprocessor changes recorded yet.
                </div>
              ) : (
                <div className="rounded-lg border border-hairline">
                  <SubprocessorChangeHistoryAccordion
                    history={subprocessorChangeHistory}
                    className="w-full px-4"
                  />
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <footer className="border-t border-hairline px-4 py-4 sm:px-10 sm:py-6">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 text-xs text-text-secondary">
          <span>
            {lastModifiedAt
              ? `Last updated: ${dayjs(lastModifiedAt).format("MMM D, YYYY")}`
              : "Not published yet"}
          </span>
          <span>
            Powered by{" "}
            <Link
              to="/"
              className="font-medium text-statute hover:underline"
              target={preview ? "_blank" : undefined}
            >
              ProcVault
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
