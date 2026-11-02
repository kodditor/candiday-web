import { EditUserInitialValues, EditUserSchema, UserForm } from "@/components/forms/users";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { api } from "@/lib/request";
import { type AppMutation } from "@/lib/types/form.type";
import { type AppRequest } from "@/lib/types/request.type";
import { type IUser } from "@/lib/types/user.type";
import { wrapError } from "@/lib/utils/request";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { useQueryState } from "nuqs";
import { toast } from "sonner";
import { useEffect } from "react";

type Props = {
  open: boolean,
  closeModal: () => void;
  refetch?: () => void;
}

export function EditUserModal({
  open,
  closeModal,
  refetch,
}: Props){

  const [id] = useQueryState("id");
  const queryClient = useQueryClient();
  

  const query = useQuery({
    enabled: Boolean(id && open),
    queryKey: ['user', id],
    queryFn: async () => await wrapError(async () => {
      const req = await api.get<AppRequest<IUser>>(`/users/${id}`);
      if(req.data.success){
        return req.data.data
      } else {
        throw new Error(req.data.error)
      }
    })
  })

  const mutate = useMutation({
    mutationFn: ({ values, helpers }: AppMutation) => wrapError(async () => {
      const req = await api.patch<AppRequest<{user: string}>>(`/users/${id}`, values);

      if(!req.data.success){
        throw new Error(req.data.error)
      } else if(req.data?.data?.user){
        await queryClient.invalidateQueries({ queryKey: ['user', id] });
        closeModal();
        form.resetForm();
        refetch?.();
        toast.success("User updated successfully")
      } else {
        throw new Error("Something's wrong, try again later")
      }
    }, helpers),
  })

  const form = useFormik({
    initialValues: EditUserInitialValues,
    validationSchema: EditUserSchema,
    onSubmit: (values, helpers) => mutate.mutate({ values, helpers })
  })

  useEffect(() => {
    if (query.data) {
      form.setValues({
        firstName: query.data.firstName || "",
        lastName: query.data.lastName || "",
        email: query.data.email || "",
        phone: query.data.phone || "",
        role: query.data.role || "User",
        isDriver: query.data.isDriver || false,
      });
    }
  }, [query.data]);

  return (
    <>
      <Modal
        open={open}
        closeModal={closeModal}
        loading={query.isLoading}
        error={query.error}
        title={"Edit User"}
        renderActions={() => (
          <>
            <Button
              disabled={!form.isValid || form.isSubmitting}
              onClick={() => form.submitForm()}
              loading={form.isSubmitting}
            >
              Update
            </Button>
          </>
        )}
      >
        <UserForm form={form} />
      </Modal>
    </>
  )
}