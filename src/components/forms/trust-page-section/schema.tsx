import type {
  TrustPageSection,
  TrustPageVendor,
} from "@/lib/types/trust-page.type";
import * as yup from "yup";

export type TrustPageSectionVendorFormValue = {
  vendorId: string;
  useCase: string;
  description: string;
};

export type TrustPageSectionFormValues = {
  title: string;
  description: string;
  introText: string;
  vendors: TrustPageSectionVendorFormValue[];
};

export const TrustPageSectionInitialValues: TrustPageSectionFormValues = {
  title: "",
  description: "",
  introText: "",
  vendors: [],
};

export const TrustPageSectionSchema = yup.object({
  title: yup
    .string()
    .trim()
    .max(255, "Title is too long")
    .required("Section title is required"),
  description: yup
    .string()
    .trim()
    .max(2000, "Description is too long"),
  introText: yup
    .string()
    .trim()
    .max(2000, "Intro text is too long"),
  vendors: yup.array().of(
    yup.object({
      vendorId: yup.string().required(),
      useCase: yup.string().trim().max(500, "Use case is too long"),
      description: yup.string().trim().max(2000, "Description is too long"),
    }),
  ).default([]),
});

export function buildTrustPageSectionInitialValues(
  editingSection: TrustPageSection | undefined,
  allVendors: TrustPageVendor[],
): TrustPageSectionFormValues {
  if (!editingSection) {
    return TrustPageSectionInitialValues;
  }

  return {
    title: editingSection.title ?? "",
    description: editingSection.description ?? "",
    introText: editingSection.introText ?? "",
    vendors: editingSection.vendors.map((vendorId) => {
      const vendor = allVendors.find((entry) => entry._id === vendorId);

      return {
        vendorId,
        useCase: vendor?.trustPage.useCase ?? "",
        description: vendor?.trustPage.description ?? "",
      };
    }),
  };
}
