import SelectInput from "@/components/form/select";
import { TrustPageSectionModal } from "@/components/trust-page/trust-page-section-modal";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import Switch from "@/components/ui/switch";
import { RiskChip } from "@/components/ui/risk-chip";
import { VendorLogo } from "@/components/vendors/vendor-logo";
import {
  fetchTrustPageSettings,
  publishTrustPage,
  updateTrustPageSections,
  updateTrustPageSettings,
} from "@/lib/api/trust-page";
import { updateVendor } from "@/lib/api/vendors";
import { RISK_TIER_OPTIONS, VENDOR_CATEGORY_OPTIONS } from "@/lib/constants/vendor";
import type {
  TrustPageLayout,
  TrustPageSection,
  TrustPageSectionInput,
  TrustPageVendor,
} from "@/lib/types/trust-page.type";
import { formatCategoryLabel } from "@/lib/utils/vendor";
import { isValidSlug } from "@/lib/utils/slug";
import { wrapError } from "@/lib/utils/request";
import { useAuth } from "@clerk/react";
import {
  ArrowSquareOutIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CircleNotchIcon,
  CopyIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import config from "@/config";
import { cn } from "@/lib/cn";
import { DashboardRootRoute } from "../root";

export const DashboardTrustPageRoute = createRoute({
  getParentRoute: () => DashboardRootRoute,
  path: "/trust-page",
  component: TrustPageSettingsPage,
});

const TRUST_PAGE_LAYOUT_OPTIONS = [
  { value: "Simplified", label: "Simplified" },
  { value: "Sectioned", label: "Sectioned" },
] as const;

function toSectionInput(section: TrustPageSection, vendors: TrustPageVendor[]): TrustPageSectionInput {
  return {
    id: section.id,
    title: section.title,
    description: section.description ?? undefined,
    introText: section.introText ?? undefined,
    sortOrder: section.sortOrder,
    vendors: section.vendors.map((vendorId) => {
      const vendor = vendors.find((entry) => entry._id === vendorId);
      return {
        vendorId,
        useCase: vendor?.trustPage.useCase,
        description: vendor?.trustPage.description,
      };
    }),
  };
}

function TrustPageSettingsPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [slugDraft, setSlugDraft] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [includedById, setIncludedById] = useState<Record<string, boolean>>({});
  const [pendingVendorIds, setPendingVendorIds] = useState<Set<string>>(new Set());
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<TrustPageSection | undefined>();
  const [pendingLayout, setPendingLayout] = useState<TrustPageLayout | null>(null);

  const settingsQuery = useQuery({
    queryKey: ["trust-page-settings"],
    queryFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      return fetchTrustPageSettings(token);
    }),
  });

  const settings = settingsQuery.data?.settings;
  const vendors = settingsQuery.data?.vendors ?? [];
  const sections = settingsQuery.data?.sections ?? [];
  const isSectioned = settings?.layout === "Sectioned";

  const effectiveIncludedById = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const vendor of vendors) {
      map[vendor._id] = includedById[vendor._id] ?? vendor.trustPage.included;
    }
    return map;
  }, [vendors, includedById]);

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesSearch = !searchQuery
        || vendor.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || vendor.category === categoryFilter;
      const matchesRisk = riskFilter === "all" || vendor.riskTier === riskFilter;
      return matchesSearch && matchesCategory && matchesRisk;
    });
  }, [vendors, searchQuery, categoryFilter, riskFilter]);

  const includedCount = vendors.filter(
    (vendor) => effectiveIncludedById[vendor._id],
  ).length;

  const trustPageUrl = settings?.slug
    ? `${config.url.replace(/\/$/, "")}/trust/${settings.slug}`
    : "";

  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: {
      enabled?: boolean;
      slug?: string;
      showSubprocessorHistory?: boolean;
      layout?: TrustPageLayout;
    }) => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      return updateTrustPageSettings(token, payload);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["trust-page-settings"], data);
      setSlugDraft(null);
      toast.success("Trust page settings updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const sectionsMutation = useMutation({
    mutationFn: async (nextSections: TrustPageSectionInput[]) => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      return updateTrustPageSections(token, { sections: nextSections });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["trust-page-settings"], data);
      setSectionModalOpen(false);
      setEditingSection(undefined);
      toast.success("Trust page sections updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      return publishTrustPage(token);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["trust-page-settings"], data);
      setIncludedById({});
      toast.success("Trust page published");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const toggleVendorMutation = useMutation({
    mutationFn: async ({ vendorId, included }: { vendorId: string; included: boolean }) => {
      const token = await getToken({ skipCache: true });
      if (!token) throw new Error("Missing session token");
      await updateVendor(token, vendorId, {
        trustPage: { included },
      });
      return { vendorId, included };
    },
    onMutate: ({ vendorId, included }) => {
      setPendingVendorIds((current) => new Set(current).add(vendorId));
      setIncludedById((current) => ({ ...current, [vendorId]: included }));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["trust-page-settings"] });
    },
    onError: async (error: Error) => {
      toast.error(error.message);
      await queryClient.invalidateQueries({ queryKey: ["trust-page-settings"] });
    },
    onSettled: (_data, _error, variables) => {
      setPendingVendorIds((current) => {
        const next = new Set(current);
        next.delete(variables.vendorId);
        return next;
      });
    },
  });

  const handleLayoutChange = (layout: TrustPageLayout) => {
    if (!settings || layout === settings.layout) {
      return;
    }

    setPendingLayout(layout);
  };

  const confirmLayoutChange = () => {
    if (!pendingLayout) {
      return;
    }

    updateSettingsMutation.mutate(
      { layout: pendingLayout },
      { onSuccess: () => setPendingLayout(null) },
    );
  };

  const openCreateSectionModal = () => {
    setEditingSection(undefined);
    setSectionModalOpen(true);
  };

  const openEditSectionModal = (section: TrustPageSection) => {
    setEditingSection(section);
    setSectionModalOpen(true);
  };

  const saveSections = (nextSections: TrustPageSectionInput[]) => {
    sectionsMutation.mutate(
      nextSections.map((section, index) => ({
        ...section,
        sortOrder: index,
      })),
    );
  };

  const handleSectionSave = (sectionInput: TrustPageSectionInput) => {
    const existingIndex = sections.findIndex((section) => section.id === sectionInput.id);
    const updatedSection: TrustPageSection = existingIndex >= 0
      ? {
        ...sections[existingIndex],
        title: sectionInput.title,
        description: sectionInput.description ?? null,
        introText: sectionInput.introText ?? null,
        vendors: sectionInput.vendors.map((vendor) => vendor.vendorId),
      }
      : {
        id: sectionInput.id,
        title: sectionInput.title,
        description: sectionInput.description ?? null,
        introText: sectionInput.introText ?? null,
        sortOrder: sections.length,
        vendors: sectionInput.vendors.map((vendor) => vendor.vendorId),
      }; 

    const nextSections = existingIndex >= 0
      ? sections.map((section, index) => (index === existingIndex ? updatedSection : section))
      : [...sections, updatedSection];

    saveSections(nextSections.map((section, index) => {
      if (section.id === sectionInput.id) {
        return {
          ...sectionInput,
          sortOrder: index,
        };
      }

      return toSectionInput({ ...section, sortOrder: index }, vendors);
    }));
  };

  const handleSectionDelete = (sectionId: string) => {
    if (!window.confirm("Delete this section? Vendors will be removed from the trust page draft.")) {
      return;
    }

    const nextSections = sections
      .filter((section) => section.id !== sectionId)
      .map((section, index) => toSectionInput({ ...section, sortOrder: index }, vendors));

    saveSections(nextSections);
  };

  const moveSection = (sectionId: string, direction: "up" | "down") => {
    const currentIndex = sections.findIndex((section) => section.id === sectionId);

    if (currentIndex < 0) {
      return;
    }

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= sections.length) {
      return;
    }

    const reordered = [...sections];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    saveSections(reordered.map((section, index) => toSectionInput({
      ...section,
      sortOrder: index,
    }, vendors)));
  };

  const handleCopyLink = async () => {
    if (!trustPageUrl) return;

    try {
      await navigator.clipboard.writeText(trustPageUrl);
      toast.success("Trust page link copied");
    } catch {
      toast.error("Unable to copy link");
    }
  };

  const handleSelectAll = (included: boolean) => {
    for (const vendor of filteredVendors) {
      if (effectiveIncludedById[vendor._id] !== included) {
        toggleVendorMutation.mutate({ vendorId: vendor._id, included });
      }
    }
  };

  const handleSlugSave = () => {
    if (!settings || slugDraft === null) return;

    const normalizedSlug = slugDraft.trim().toLowerCase();

    if (normalizedSlug === settings.slug) {
      setSlugDraft(null);
      return;
    }

    if (!isValidSlug(normalizedSlug)) {
      toast.error("Slug must use lowercase letters, numbers, and hyphens (min. 2 characters).");
      return;
    }

    updateSettingsMutation.mutate({ slug: normalizedSlug });
  };

  const slugDraftValue = slugDraft ?? settings?.slug ?? "";
  const slugDraftInvalid = slugDraft !== null
    && slugDraft.trim().toLowerCase() !== settings?.slug
    && !isValidSlug(slugDraft.trim().toLowerCase());

  if (settingsQuery.isPending) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <CircleNotchIcon size={28} className="animate-spin text-statute" />
      </div>
    );
  }

  if (settingsQuery.isError || !settings) {
    return (
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
          Trust Page
        </h1>
        <p className="text-text-secondary">Unable to load trust page settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            Trust Page
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Configure and publish your public subprocessor trust page.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {settings.enabled && settings.publishedAt && (
            <Button
              variant="neutral"
              onClick={() => window.open(trustPageUrl, "_blank", "noopener,noreferrer")}
            >
              <ArrowSquareOutIcon size={18} className="mr-0.5" />
              View live page
            </Button>
          )}
          <Button
            variant="neutral"
            disabled={!settings.slug}
            onClick={handleCopyLink}
          >
            <CopyIcon size={18} className="mr-0.5" />
            Copy link
          </Button>
        </div>
      </div>

      {!settings.enabled && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Trust page is currently disabled — visitors cannot access it.
        </div>
      )}

      {settings.hasUnpublishedChanges && settings.publishedAt && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          Visitors currently see the version published on{" "}
          {dayjs(settings.publishedAt).format("MMM D, YYYY")}. You have unpublished changes.
        </div>
      )}

      <section className="rounded-xl border border-hairline bg-white p-6">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-6">
          <div className="min-w-0 space-y-2">
            <label htmlFor="trustPageSlug" className="text-sm font-medium text-ink">
              Public URL slug
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-text-secondary">procvault.com/trust/</span>
              <Input
                id="trustPageSlug"
                value={slugDraftValue}
                onChange={(event) => setSlugDraft(event.target.value)}
                className="max-w-xs font-mono"
              />
              {slugDraft !== null && slugDraft.trim().toLowerCase() !== settings.slug && (
                <Button
                  size="sm"
                  onClick={handleSlugSave}
                  disabled={updateSettingsMutation.isPending || slugDraftInvalid}
                >
                  Save slug
                </Button>
              )}
            </div>
            <p className="text-xs text-text-secondary">
              Lowercase letters, numbers, and hyphens only. Must be unique across all organizations.
            </p>
            {slugDraftInvalid && (
              <p className="text-xs text-red-600">
                Enter a valid slug before saving.
              </p>
            )}
          </div>

          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-ink">Enable public trust page</p>
              <p className="text-sm text-text-secondary">
                When disabled, the public URL returns not found.
              </p>
            </div>
            <div className="flex shrink-0 justify-end">
              <Switch
                id="trustPageEnabled"
                disabled={updateSettingsMutation.isPending}
                values={{ trustPageEnabled: settings.enabled }}
                setFieldValue={(_, value) => {
                  updateSettingsMutation.mutate({ enabled: Boolean(value) });
                }}
              />
            </div>
          </div>

          <div className="min-w-0 space-y-2"> 
            <div className="flex justify-between items-center">
              <p className="inline text-sm font-medium text-ink">Page layout</p>
              <div
                role="radiogroup"
                aria-label="Page layout"
                className={cn(
                  "grid max-w-xs grid-cols-2 gap-1 rounded-lg bg-paper-raised p-1",
                  updateSettingsMutation.isPending && "pointer-events-none opacity-50",
                )}
              >
                {TRUST_PAGE_LAYOUT_OPTIONS.map((option) => {
                  const isActive = settings.layout === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      disabled={updateSettingsMutation.isPending}
                      onClick={() => handleLayoutChange(option.value)}
                      className={cn(
                        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-white text-ink shadow-sm"
                          : "text-text-secondary hover:text-ink",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-xs text-text-secondary">
              Simplified shows a single vendor list. Sectioned lets you group vendors into sections with custom copy.
            </p>
          </div>

          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-ink">Show subprocessor change history</p>
              <p className="text-sm text-text-secondary">
                Display vendors added or removed on the public page when you publish.
              </p>
            </div>
            <div className="flex shrink-0 justify-end">
              <Switch
                id="trustPageShowSubprocessorHistory"
                disabled={updateSettingsMutation.isPending}
                values={{ trustPageShowSubprocessorHistory: settings.showSubprocessorHistory }}
                setFieldValue={(_, value) => {
                  updateSettingsMutation.mutate({ showSubprocessorHistory: Boolean(value) });
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {isSectioned ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-ink">Sections</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Organize vendors into sections for your public trust page.
              </p>
            </div>
            <Button onClick={openCreateSectionModal}>
              <PlusIcon size={18} className="mr-0.5" />
              Add section
            </Button>
          </div>

          <div className="space-y-3">
            {sections.length === 0 ? (
              <div className="rounded-xl border border-dashed border-hairline px-6 py-12 text-center text-sm text-text-secondary">
                No sections yet. Add a section to start organizing vendors.
              </div>
            ) : (
              sections.map((section, index) => (
                <div
                  key={section.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-hairline bg-white p-5"
                >
                  <div className="min-w-0 space-y-1">
                    <h3 className="font-medium text-ink">{section.title}</h3>
                    <p className="text-sm text-text-secondary">
                      {section.vendors.length} vendor{section.vendors.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="neutral"
                      size="sm"
                      disabled={index === 0 || sectionsMutation.isPending}
                      onClick={() => moveSection(section.id, "up")}
                    >
                      <ArrowUpIcon size={16} />
                    </Button>
                    <Button
                      variant="neutral"
                      size="sm"
                      disabled={index === sections.length - 1 || sectionsMutation.isPending}
                      onClick={() => moveSection(section.id, "down")}
                    >
                      <ArrowDownIcon size={16} />
                    </Button>
                    <Button
                      variant="neutral"
                      size="sm"
                      onClick={() => openEditSectionModal(section)}
                    >
                      <PencilSimpleIcon size={16} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="neutral"
                      size="sm"
                      disabled={sectionsMutation.isPending}
                      onClick={() => handleSectionDelete(section.id)}
                    >
                      <TrashIcon size={16} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      ) : (
      <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-ink">Vendor selection</h2>
              <p className="mt-1 text-sm text-text-secondary">
                {includedCount} of {vendors.length} vendors included
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="neutral"
                size="sm"
                className="rounded-md"
                onClick={() => handleSelectAll(true)}
                disabled={toggleVendorMutation.isPending}
              >
                Select all
              </Button>
              <Button
                variant="neutral"
                size="sm"
                className="rounded-md"
                onClick={() => handleSelectAll(false)}
                disabled={toggleVendorMutation.isPending}
              >
                Deselect all
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="max-w-xs bg-white"
            />
            <div className="max-w-xs">
              <SelectInput
                id="categoryFilter"
                placeholder=""
                values={{ categoryFilter }}
                handleChange={(event) => setCategoryFilter(event.target.value)}
                options={[
                  { value: "all", label: "All categories" },
                  ...VENDOR_CATEGORY_OPTIONS,
                ]}
              />
            </div>
            <div className="max-w-xs">
              <SelectInput
                id="riskFilter"
                placeholder=""
                values={{ riskFilter }}
                handleChange={(event) => setRiskFilter(event.target.value)}
                options={[
                  { value: "all", label: "All risk tiers" },
                  ...RISK_TIER_OPTIONS,
                ]}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-hairline">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-text-secondary">
                <tr>
                  <th className="px-4 py-3 font-medium">Include</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Risk</th>
                  <th className="px-4 py-3 font-medium">Data scope</th>
                  <th className="px-4 py-3 font-medium">Hosting</th>
                  <th className="px-4 py-3 font-medium">Last reviewed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-text-secondary">
                      No vendors match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => (
                    <VendorSelectionRow
                      key={vendor._id}
                      vendor={vendor}
                      included={effectiveIncludedById[vendor._id]}
                      pending={pendingVendorIds.has(vendor._id)}
                      onToggle={(included) => {
                        toggleVendorMutation.mutate({ vendorId: vendor._id, included });
                      }}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
      </section>
      )}

      <TrustPageSectionModal
        open={sectionModalOpen}
        closeModal={() => {
          setSectionModalOpen(false);
          setEditingSection(undefined);
        }}
        existingSections={sections}
        editingSection={editingSection}
        allVendors={vendors}
        onSave={handleSectionSave}
        saving={sectionsMutation.isPending}
      />

      <AlertDialog
        open={pendingLayout !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingLayout(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingLayout === "Sectioned"
                ? "Switch to sectioned layout?"
                : "Switch to simplified layout?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingLayout === "Sectioned"
                ? "Your included vendors will move into a default section."
                : "Section assignments will be converted back to vendor inclusion."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateSettingsMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              loading={updateSettingsMutation.isPending}
              onClick={confirmLayoutChange}
            >
              Switch layout
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-hairline bg-white p-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-ink">Publish changes</p>
          <p className="text-sm text-text-secondary">
            {settings.publishedAt
              ? `Last published ${dayjs(settings.publishedAt).format("MMM D, YYYY")}.`
              : "This trust page has not been published yet."}
          </p>
        </div>
        <Button
          onClick={() => publishMutation.mutate()}
          disabled={!settings.hasUnpublishedChanges || publishMutation.isPending}
        >
          {publishMutation.isPending ? "Publishing..." : "Publish trust page"}
        </Button>
      </section>
    </div>
  );
}

type VendorSelectionRowProps = {
  vendor: TrustPageVendor;
  included: boolean;
  pending: boolean;
  onToggle: (included: boolean) => void;
};

function VendorSelectionRow({
  vendor,
  included,
  pending,
  onToggle,
}: VendorSelectionRowProps) {
  return (
    <tr className="align-top bg-white">
      <td className="pl-8 pr-4 py-6">
        <Checkbox
          checked={included}
          disabled={pending}
          onCheckedChange={(checked) => onToggle(checked === true)}
          aria-label={`Include ${vendor.name} on trust page`}
        />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <VendorLogo name={vendor.name} logoUrl={vendor.logoUrl} size="sm" />
          <span className="font-medium text-ink">{vendor.name}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-text-secondary">
        {formatCategoryLabel(vendor.category, vendor.customCategoryLabel)}
      </td>
      <td className="px-4 py-4">
        <RiskChip tier={vendor.riskTier} />
      </td>
      <td className="px-4 py-4 text-text-secondary">
        {vendor.dataScopeTags.join(", ") || "—"}
      </td>
      <td className="px-4 py-4 text-text-secondary">
        {vendor.hostingLocations.map((location) => location.region).join(", ") || "—"}
      </td>
      <td className="px-4 py-4 text-text-secondary">
        {vendor.dpa.reviewDate
          ? dayjs(vendor.dpa.reviewDate).format("MMM D, YYYY")
          : "—"}
      </td>
    </tr>
  );
}
