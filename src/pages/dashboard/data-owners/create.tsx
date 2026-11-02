import {
  CreateDataOwnerInitialValues,
  CreateDataOwnerSchema,
  DataOwnerForm,
} from "@/components/forms/data-owners";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { createDataOwner } from "@/lib/api/data-owners";
import { type AppMutation } from "@/lib/types/form.type";
import { wrapError } from "@/lib/utils/request";
import { useAuth } from "@clerk/react";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "sonner";

type Props = {
  open: boolean,
  closeModal: () => void;
  refetch?: () => void;
}

export function CreateDataOwnerModal({
  open,
  closeModal,
  refetch,
}: Props) {
  const { getToken } = useAuth();

  const mutate = useMutation({
    mutationFn: ({ values, helpers }: AppMutation) => wrapError(async () => {
      const token = await getToken({ skipCache: true });

      if (!token) {
        throw new Error("Missing session token");
      }

      await createDataOwner(token, {
        name: values.name,
        email: values.email,
        role: values.role || undefined,
        digestFrequency: values.digestFrequency,
        notificationsEnabled: values.notificationsEnabled,
      });

      closeModal();
      form.resetForm();
      refetch?.();
      toast.success("Data owner created successfully");
    }, helpers),
  });

  const form = useFormik({
    initialValues: CreateDataOwnerInitialValues,
    validationSchema: CreateDataOwnerSchema,
    onSubmit: (values, helpers) => mutate.mutate({ values, helpers }),
  });

  return (
    <Modal
      open={open}
      closeModal={closeModal}
      title="Add data owner"
      renderActions={() => (
        <Button
          disabled={!form.isValid || form.isSubmitting}
          onClick={() => form.submitForm()}
          loading={form.isSubmitting}
        >
          Create
        </Button>
      )}
    >
      <DataOwnerForm form={form} />
    </Modal>
  );
}
