import {
  DataOwnerForm,
  EditDataOwnerInitialValues,
  EditDataOwnerSchema,
} from "@/components/forms/data-owners";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { fetchDataOwner, updateDataOwner } from "@/lib/api/data-owners";
import { type AppMutation } from "@/lib/types/form.type";
import { wrapError } from "@/lib/utils/request";
import { useAuth } from "@clerk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean,
  closeModal: () => void;
  refetch?: () => void;
}

export function EditDataOwnerModal({
  open,
  closeModal,
  refetch,
}: Props) {
  const { getToken } = useAuth();
  const [id] = useQueryState("id");
  const queryClient = useQueryClient();

  const query = useQuery({
    enabled: Boolean(id && open),
    queryKey: ["data-owner", id],
    queryFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });

      if (!token) {
        throw new Error("Missing session token");
      }

      if (!id) {
        throw new Error("Missing data owner id");
      }

      return fetchDataOwner(token, id);
    }),
  });

  const mutate = useMutation({
    mutationFn: ({ values, helpers }: AppMutation) => wrapError(async () => {
      const token = await getToken({ skipCache: true });

      if (!token) {
        throw new Error("Missing session token");
      }

      if (!id) {
        throw new Error("Missing data owner id");
      }

      await updateDataOwner(token, id, {
        name: values.name,
        email: values.email,
        role: values.role || undefined,
        digestFrequency: values.digestFrequency,
        notificationsEnabled: values.notificationsEnabled,
      });

      await queryClient.invalidateQueries({ queryKey: ["data-owner", id] });
      closeModal();
      form.resetForm();
      refetch?.();
      toast.success("Data owner updated successfully");
    }, helpers),
  });

  const form = useFormik({
    initialValues: EditDataOwnerInitialValues,
    validationSchema: EditDataOwnerSchema,
    onSubmit: (values, helpers) => mutate.mutate({ values, helpers }),
  });

  useEffect(() => {
    if (query.data) {
      form.setValues({
        name: query.data.name || "",
        email: query.data.email || "",
        role: query.data.role || "",
        digestFrequency: query.data.digestFrequency,
        notificationsEnabled: query.data.notificationsEnabled,
      });
    }
  }, [query.data]);

  return (
    <Modal
      open={open}
      closeModal={closeModal}
      loading={query.isLoading}
      error={query.error}
      title="Edit data owner"
      renderActions={() => (
        <Button
          disabled={!form.isValid || form.isSubmitting}
          onClick={() => form.submitForm()}
          loading={form.isSubmitting}
        >
          Update
        </Button>
      )}
    >
      <DataOwnerForm form={form} />
    </Modal>
  );
}
