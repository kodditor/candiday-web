import {
  TrustPageSectionForm,
  TrustPageSectionSchema,
  buildTrustPageSectionInitialValues,
} from "@/components/forms/trust-page-section";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import type {
  TrustPageSection,
  TrustPageSectionInput,
  TrustPageVendor,
} from "@/lib/types/trust-page.type";
import { useFormik } from "formik";
import { useMemo } from "react";

type TrustPageSectionModalProps = {
  open: boolean;
  closeModal: () => void;
  existingSections: TrustPageSection[];
  editingSection?: TrustPageSection;
  allVendors: TrustPageVendor[];
  onSave: (section: TrustPageSectionInput) => void;
  saving?: boolean;
};

export function TrustPageSectionModal({
  open,
  closeModal,
  existingSections,
  editingSection,
  allVendors,
  onSave,
  saving = false,
}: TrustPageSectionModalProps) {
  const assignedElsewhere = useMemo(() => new Set(
    existingSections
      .filter((section) => section.id !== editingSection?.id)
      .flatMap((section) => section.vendors),
  ), [existingSections, editingSection?.id]);

  const availableVendors = useMemo(() => (
    allVendors.filter((vendor) => !assignedElsewhere.has(vendor._id))
  ), [allVendors, assignedElsewhere]);

  const initialValues = useMemo(
    () => buildTrustPageSectionInitialValues(editingSection, allVendors),
    [editingSection, allVendors],
  );

  const form = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: TrustPageSectionSchema,
    onSubmit: (values) => {
      onSave({
        id: editingSection?.id ?? crypto.randomUUID(),
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        introText: values.introText.trim() || undefined,
        sortOrder: editingSection?.sortOrder ?? existingSections.length,
        vendors: values.vendors.map((vendor) => ({
          vendorId: vendor.vendorId,
          useCase: vendor.useCase.trim() || undefined,
          description: vendor.description.trim() || undefined,
        })),
      });
    },
  });

  return (
    <Modal
      open={open}
      closeModal={closeModal}
      title={editingSection ? "Edit section" : "Add section"}
      size="3xl"
      renderActions={() => (
        <Button
          disabled={!form.isValid || saving}
          onClick={() => form.submitForm()}
          loading={saving}
        >
          Save section
        </Button>
      )}
    >
      <TrustPageSectionForm
        form={form}
        allVendors={allVendors}
        availableVendors={availableVendors}
        open={open}
      />
    </Modal>
  );
}
