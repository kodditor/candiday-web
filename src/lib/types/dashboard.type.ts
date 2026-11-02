import type { IVendor } from "@/lib/types/vendor.type";

export type DashboardSummary = {
  vendorCount: number;
  dpasTracked: number;
  reviewsDue: number;
  latestVendors: IVendor[];
};
