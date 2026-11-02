import { Button } from "@/components/ui/button";
import type { IMonitoringSource } from "@/lib/types/global-vendor.type";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";

type MonitoringSourceDocumentCardProps = {
  monitoringSource: IMonitoringSource;
  title?: string;
};

export function MonitoringSourceDocumentCard({
  monitoringSource,
  title = "Subprocessor list",
}: MonitoringSourceDocumentCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-hairline bg-paper-raised p-4">
      <div className="min-w-0 flex-1 space-y-3">
        <div>
          <p className="text-sm font-medium text-ink">{title}</p>
          <p className="mt-1 text-sm text-text-secondary">
            This vendor publishes their subprocessor list as a PDF document.
          </p>
        </div>
        {monitoringSource.pdfUrl ? (
          <Button type="button" variant="neutral" size="sm" asChild>
            <a
              href={monitoringSource.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5"
            >
              View Document
              <ArrowSquareOutIcon size={14} />
            </a>
          </Button>
        ) : (
          <p className="text-sm text-text-secondary">
            PDF document link will appear after the next catalog crawl.
          </p>
        )}
      </div>
    </div>
  );
}
