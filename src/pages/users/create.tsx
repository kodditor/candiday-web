import { CreateUserInitialValues, CreateUserSchema, UserForm } from "@/components/forms/users";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { api } from "@/lib/request";
import { type AppMutation } from "@/lib/types/form.type";
import { type AppRequest } from "@/lib/types/request.type";
import { type IUser } from "@/lib/types/user.type";
import { wrapError } from "@/lib/utils/request";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";

type Props = {
  open: boolean,
  closeModal: () => void;
  refetch?: () => void;
}

export function CreateUserModal({
  open, 
  closeModal,
  refetch,
}: Props){

  const mutate = useMutation({
    mutationFn: ({ values, helpers }: AppMutation) => wrapError(async () => {
      const req = await api.post<AppRequest<{user: Partial<IUser>}>>("/users", values);

      if(!req.data.success){
        throw new Error(req.data.error)
      } else if(req.data?.data?.user){  
    
        closeModal();
        form.resetForm();
        refetch?.();
      } else {
        throw new Error("Something's wrong, try again later")
      }
    }, helpers),
  })

  const form = useFormik({
    initialValues: CreateUserInitialValues,
    validationSchema: CreateUserSchema,
    onSubmit: (values, helpers) => mutate.mutate({ values, helpers })
  })
  
  return (
    <>
      <Modal
        open={open}
        closeModal={closeModal}
        title={"Create User"}
        renderActions={() => (
          <>
            <Button
              disabled={!form.isValid || form.isSubmitting} 
              onClick={() => form.submitForm()}
              loading={form.isSubmitting}
            >
              Create
            </Button>
          </>
        )}
      >
        <UserForm form={form} />
      </Modal>
    </>
  )
}