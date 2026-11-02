import TextInput from "@/components/form/input";
import TextArea from "@/components/form/text-area";
import { Checkbox } from "@/components/ui/checkbox";
import { VendorLogo } from "@/components/vendors/vendor-logo";
import type { TrustPageVendor } from "@/lib/types/trust-page.type";
import { cn } from "@/lib/utils";
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { type FormikProps } from "formik";
import { useEffect, useMemo, useState } from "react";
import {
  type TrustPageSectionFormValues,
  type TrustPageSectionVendorFormValue,
} from "./schema";

export * from "./schema";

type Props = {
  form: FormikProps<TrustPageSectionFormValues>;
  allVendors: TrustPageVendor[];
  availableVendors: TrustPageVendor[];
  open: boolean;
};

export function TrustPageSectionForm({
  form,
  allVendors,
  availableVendors,
  open,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedVendorIds, setExpandedVendorIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) {
      return;
    }

    setSearchQuery("");
    setExpandedVendorIds(new Set());
  }, [open, form.initialValues]);

  const filteredAvailableVendors = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableVendors;
    }

    const query = searchQuery.trim().toLowerCase();
    return availableVendors.filter((vendor) => vendor.name.toLowerCase().includes(query));
  }, [availableVendors, searchQuery]);

  const selectedVendorIds = useMemo(
    () => new Set(form.values.vendors.map((vendor) => vendor.vendorId)),
    [form.values.vendors],
  );

  const toggleVendor = (vendor: TrustPageVendor, checked: boolean) => {
    if (checked) {
      form.setFieldValue("vendors", [
        ...form.values.vendors,
        {
          vendorId: vendor._id,
          useCase: vendor.trustPage.useCase ?? "",
          description: vendor.trustPage.description ?? "",
        } satisfies TrustPageSectionVendorFormValue,
      ]);
      setExpandedVendorIds((current) => new Set(current).add(vendor._id));
      return;
    }

    form.setFieldValue(
      "vendors",
      form.values.vendors.filter((entry) => entry.vendorId !== vendor._id),
    );
    setExpandedVendorIds((current) => {
      const next = new Set(current);
      next.delete(vendor._id);
      return next;
    });
  };

  const toggleExpanded = (vendorId: string) => {
    setExpandedVendorIds((current) => {
      const next = new Set(current);
      if (next.has(vendorId)) {
        next.delete(vendorId);
      } else {
        next.add(vendorId);
      }
      return next;
    });
  };

  return (
    <form className="space-y-8 p-6" onSubmit={form.handleSubmit}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="col-span-2 space-y-2">
          <TextInput
            id="title"
            label="Title"
            placeholder="Infrastructure and hosting"
            required
            {...form}
          />
        </div>

        <div className="col-span-2 space-y-2">
          <TextArea
            id="description"
            label="Description"
            placeholder="Optional section description"
            rows={3}
            {...form}
          />
        </div>
      </div>

      <div className="space-y-2">
        <TextArea
          id="introText"
          label="Intro text"
          placeholder="Optional intro text shown above the vendor list"
          rows={3}
          {...form}
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-ink">Vendors</h3>
            <p className="mt-1 text-sm text-text-secondary">
              {form.values.vendors.length} selected · {availableVendors.length} available
            </p>
          </div>
          <TextInput
            id="vendorSearch"
            values={{ vendorSearch: searchQuery }}
            handleChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search vendors..."
            className="max-w-xs"
            hideError
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-hairline">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">Include</th>
                <th className="px-4 py-3 font-medium">Vendor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredAvailableVendors.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-text-secondary">
                    No vendors available for this section.
                  </td>
                </tr>
              ) : (
                filteredAvailableVendors.map((vendor) => (
                  <tr key={vendor._id} className="align-top">
                    <td className="px-4 py-4">
                      <Checkbox
                        checked={selectedVendorIds.has(vendor._id)}
                        onCheckedChange={(checked) => toggleVendor(vendor, checked === true)}
                        aria-label={`Include ${vendor.name}`}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <VendorLogo name={vendor.name} logoUrl={vendor.logoUrl} size="sm" />
                        <span className="font-medium text-ink">{vendor.name}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {form.values.vendors.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-ink">Selected vendor details</h3>
          <div className="space-y-3">
            {form.values.vendors.map((selectedVendor, index) => {
              const vendor = allVendors.find((entry) => entry._id === selectedVendor.vendorId);

              if (!vendor) {
                return null;
              }

              const isExpanded = expandedVendorIds.has(selectedVendor.vendorId);

              return (
                <div
                  key={selectedVendor.vendorId}
                  className="rounded-xl border border-hairline bg-gray-50/60"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    onClick={() => toggleExpanded(selectedVendor.vendorId)}
                  >
                    <div className="flex items-center gap-3">
                      <VendorLogo name={vendor.name} logoUrl={vendor.logoUrl} size="sm" />
                      <span className="font-medium text-ink">{vendor.name}</span>
                    </div>
                    {isExpanded
                      ? <CaretUpIcon size={16} className="text-text-secondary" />
                      : <CaretDownIcon size={16} className="text-text-secondary" />}
                  </button>

                  <div
                    className={cn(
                      "grid gap-4 border-t border-hairline px-4 py-4",
                      !isExpanded && "hidden",
                    )}
                  >
                    <TextInput
                      id={`vendors.${index}.useCase`}
                      label="Use case"
                      placeholder="What this vendor is used for"
                      values={form.values}
                      errors={form.errors}
                      touched={form.touched}
                      handleChange={form.handleChange}
                      handleBlur={form.handleBlur}
                    />

                    <TextArea
                      id={`vendors.${index}.description`}
                      label="Description"
                      placeholder="Optional public description"
                      rows={3}
                      values={form.values}
                      errors={form.errors}
                      touched={form.touched}
                      handleChange={form.handleChange}
                      handleBlur={form.handleBlur}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </form>
  );
}
