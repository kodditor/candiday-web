"use client";

import { VendorLogo } from "@/components/vendors/vendor-logo";
import {
  formatChangeCount,
  getTotalChanges,
} from "@/components/trust-page/subprocessor-change-history-accordion";
import { MonitoringSourceDocumentCard } from "@/components/vendors/monitoring-source-document-card";
import { SubprocessorHistoryAccordion } from "@/components/vendors/subprocessor-history-accordion";
import { SubprocessorHistoryModal } from "@/components/vendors/subprocessor-history-modal";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/lib/context/user-context";
import type { IGlobalVendor } from "@/lib/types/global-vendor.type";
import { cn } from "@/lib/cn";
import {
  getSubprocessorHistoryUpgradeMessage,
  isSubprocessorHistoryEnabled,
  parseSubscriptionPlan,
} from "@/lib/utils/plan-limits";
import { formatCategoryLabel } from "@/lib/utils/vendor";
import {
  ArrowSquareOutIcon,
  ClockCounterClockwiseIcon,
  FilePdfIcon,
  GlobeIcon,
  LockSimpleIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

type GlobalVendorContainerProps = {
  globalVendor: IGlobalVendor;
};

const CARD_CLASS = "rounded-xl border border-hairline bg-white p-6";

function DetailCard({
  title,
  icon: IconComponent,
  iconClassName,
  children,
}: {
  title: string;
  icon?: Icon;
  iconClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={CARD_CLASS}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {IconComponent && (
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg",
                iconClassName,
              )}
            >
              <IconComponent size={18} weight="fill" />
            </span>
          )}
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function formatMonitoringSourceLabel(
  monitoringSource: NonNullable<IGlobalVendor["monitoringSource"]>,
) {

  if (monitoringSource.type === "SubprocessorPage") {
    return "Subprocessor page";
  }

  return "Trust page";
}

function SubprocessorHistoryLockedState({
  upgradeMessage,
}: {
  upgradeMessage: string;
}) {
  return (
    <div className="space-y-1.5 rounded-lg border border-dashed border-hairline bg-paper-raised px-4 py-6 text-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto gap-1.5 rounded-md bg-white px-2 py-1 text-text-secondary hover:bg-white hover:text-text-secondary"
              asChild
            >
              <Link to="/dashboard/settings">
                <LockSimpleIcon size={14} />
                View subprocessor history
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {upgradeMessage}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <p className="text-xs text-text-secondary">{upgradeMessage}</p>
    </div>
  );
}

export function GlobalVendorContainer({ globalVendor }: GlobalVendorContainerProps) {
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const organization = useUser((state) => state.organization);
  const subscriptionPlan = parseSubscriptionPlan(organization?.plan);
  const subprocessorHistoryEnabled = isSubprocessorHistoryEnabled(subscriptionPlan);
  const subprocessorHistoryUpgradeMessage = getSubprocessorHistoryUpgradeMessage();

  const sortedHistory = useMemo(
    () => [...globalVendor.subprocessorHistory]
      .sort((a, b) => dayjs(b.detectedAt).valueOf() - dayjs(a.detectedAt).valueOf()),
    [globalVendor.subprocessorHistory],
  );

  const sidebarHistory = sortedHistory.slice(0, 10);
  const isPdfFormat = globalVendor.monitoringSource?.format === "PDF";

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {globalVendor.website ? (
              <a
                href={globalVendor.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${globalVendor.name} website`}
                className="rounded-lg transition-opacity hover:opacity-80"
              >
                <VendorLogo
                  name={globalVendor.name}
                  logoUrl={globalVendor.logoUrl}
                  size="lg"
                />
              </a>
            ) : (
              <VendorLogo
                name={globalVendor.name}
                logoUrl={globalVendor.logoUrl}
                size="lg"
              />
            )}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
                  {globalVendor.name}
                </h1>
                {globalVendor.isCurated && (
                  <span className="rounded-full bg-statute/10 px-3 py-1 text-xs font-medium text-statute">
                    Curated
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">
                <span>{formatCategoryLabel(globalVendor.category)}</span>
                {globalVendor.website && (
                  <>
                    <span aria-hidden="true">·</span>
                    <a
                      href={globalVendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-statute hover:underline"
                    >
                      {globalVendor.website.replace(/^https?:\/\//, "")}
                      <ArrowSquareOutIcon size={14} />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {isPdfFormat && globalVendor.monitoringSource ? (
            <>
              <DetailCard
                title="Vendor-provided PDF"
                icon={FilePdfIcon}
                iconClassName="bg-red-50 text-red-600"
              >
                <MonitoringSourceDocumentCard
                  monitoringSource={globalVendor.monitoringSource}
                />
              </DetailCard>

              <DetailCard
                title="Subprocessor history"
                icon={ClockCounterClockwiseIcon}
                iconClassName="bg-violet-50 text-violet-700"
              >
                {subprocessorHistoryEnabled ? (
                  <SubprocessorHistoryAccordion history={sortedHistory} />
                ) : (
                  <SubprocessorHistoryLockedState
                    upgradeMessage={subprocessorHistoryUpgradeMessage}
                  />
                )}
              </DetailCard>
            </>
          ) : (
            <DetailCard
              title="Subprocessors"
              icon={ShareNetworkIcon}
              iconClassName="bg-amber-50 text-amber-700"
            >
              {globalVendor.knownSubprocessors.length === 0 ? (
                <p className="text-sm text-text-secondary">No subprocessors recorded.</p>
              ) : (
                <ul className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-hairline">
                  {globalVendor.knownSubprocessors.map((entry) => (
                    <li
                      key={entry.name}
                      className="flex items-start justify-between gap-4 px-4 py-3.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink">{entry.name}</p>
                        {entry.region && (
                          <p className="mt-1 text-xs text-text-secondary">{entry.region}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </DetailCard>
          )}
        </div>

        <aside className="space-y-6">
          <DetailCard
            title="Overview"
            icon={GlobeIcon}
            iconClassName="bg-blue-50 text-blue-600"
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Primary jurisdiction
                </p>
                <p className="text-sm text-ink">{globalVendor.primaryJurisdiction}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Available regions
                </p>
                {globalVendor.availableRegions.length === 0 ? (
                  <p className="text-sm text-text-secondary">—</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {globalVendor.availableRegions.map((region) => (
                      <span
                        key={region}
                        className="rounded-full border border-hairline bg-paper-raised px-3 py-1 text-sm"
                      >
                        {region}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Monitoring source
                </p>
                {globalVendor.monitoringSource ? (
                  <div className="space-y-1">
                    <a
                      href={globalVendor.monitoringSource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-ink hover:underline"
                    >
                      {formatMonitoringSourceLabel(globalVendor.monitoringSource)}
                      <ArrowSquareOutIcon size={14} />
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">—</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Last crawled
                </p>
                <p className="text-sm text-ink">
                  {globalVendor.lastCrawledAt
                    ? dayjs(globalVendor.lastCrawledAt).format("DD MMM YYYY")
                    : "—"}
                </p>
              </div>

              {!isPdfFormat && sidebarHistory.length > 0 && (
                <div className="space-y-3 border-t border-hairline pt-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                    Subprocessor history
                  </p>
                  <ul className="space-y-2">
                    {sidebarHistory.map((entry, index) => (
                      <li
                        key={`${entry.detectedAt}-${index}`}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="text-text-secondary">
                          {dayjs(entry.detectedAt).format("DD MMM YYYY")}
                        </span>
                        <span className="text-ink">
                          {formatChangeCount(getTotalChanges(entry))}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {subprocessorHistoryEnabled ? (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto mt-2 w-full text-statute bg-statute/5 px-2 py-1 rounded-md hover:bg-statute/10 hover:text-statute/80"
                        onClick={() => setHistoryModalOpen(true)}
                      >
                        View Full History
                      </Button>
                      {historyModalOpen && (
                        <SubprocessorHistoryModal
                          open={historyModalOpen}
                          closeModal={() => setHistoryModalOpen(false)}
                          history={sortedHistory}
                        />
                      )}
                    </>
                  ) : (
                    <div className="mt-2 space-y-1.5">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto w-full gap-1.5 rounded-md bg-paper-raised px-2 py-1 text-text-secondary hover:bg-paper-raised hover:text-text-secondary"
                              asChild
                            >
                              <Link to="/dashboard/settings">
                                <LockSimpleIcon size={14} />
                                View Full History
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {subprocessorHistoryUpgradeMessage}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <p className="text-center text-xs text-text-secondary">
                        {subprocessorHistoryUpgradeMessage}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DetailCard>
        </aside>
      </div>
    </div>
  );
}
