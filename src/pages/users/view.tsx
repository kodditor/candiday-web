import { UserContainer } from "@/components/containers/user.container";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { api } from "@/lib/request";
import { type AppMutation } from "@/lib/types/form.type";
import { type AppRequest } from "@/lib/types/request.type";
import { type IUser } from "@/lib/types/user.type";
import { wrapError } from "@/lib/utils/request";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { useQueryState } from "nuqs";
import { toast } from "sonner";

type Props = {
  open: boolean,
  closeModal: () => void;
  refetch?: () => void;
}

export function ViewUserModal({
  open,
  closeModal,
  refetch,
}: Props){

  const [id] = useQueryState("id");
  const [, setModal] = useQueryState("modal");


  const query = useQuery({
    enabled: Boolean(id),
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

  const suspendMutate = useMutation({
    mutationFn: ({ helpers }: AppMutation) => wrapError(async () => {
      const req = await api.post<AppRequest<{user: string}>>(`/users/${id}/suspend`);

      if(!req.data.success){
        throw new Error(req.data.error)
      } else if(req.data?.data?.user){
        query.refetch()
        closeModal()
        toast.success("User suspended successfully")
        suspendUserForm.resetForm();
      } else {
        throw new Error("Something's wrong, try again later")
      }
    }, helpers),
  })

  const suspendUserForm = useFormik({
    initialValues: {},
    onSubmit: (values, helpers) => suspendMutate.mutate({ values, helpers }),
  })

  const unsuspendMutate = useMutation({
    mutationFn: ({ helpers }: AppMutation) => wrapError(async () => {
      const req = await api.post<AppRequest<{user: string}>>(`/users/${id}/unsuspend`);

      if(!req.data.success){
        throw new Error(req.data.error)
      } else if(req.data?.data?.user){
        query.refetch()
        closeModal()
        toast.success("User restored successfully")
        unsuspendUserForm.resetForm();
      } else {
        throw new Error("Something's wrong, try again later")
      }
    }, helpers),
  })

  const unsuspendUserForm = useFormik({
    initialValues: {},
    onSubmit: (values,  helpers) => unsuspendMutate.mutate({ values, helpers }),
  })

  const deleteMutate = useMutation({
    mutationFn: ({ helpers }: AppMutation) => wrapError(async () => {
      const req = await api.delete<AppRequest<{user: string}>>(`/users/${id}`);

      if(!req.data.success){
        throw new Error(req.data.error)
      } else if(req.data?.data?.user){
        closeModal()
        refetch?.()
        toast.success("User Deleted successfully")
      } else {
        throw new Error("Something's wrong, try again later")
      }
    }, helpers)
  })

  const deleteUserForm = useFormik({
    initialValues: {},
    onSubmit: (values, helpers) => deleteMutate.mutate({ values, helpers }),
  })

  return (
    <>
      <Modal
        open={open}
        closeModal={closeModal}
        loading={query.isLoading}
        error={query.error}
        title={"View User"}
        size="xl"
        renderActions={() => (
          <>
            <Button
              variant={"ghost"}
              onClick={() => setModal("edit")}
            >
              Edit
            </Button>
            {
              query.data?.status === "Active" ? (
                <>
                  <Button
                    loading={suspendUserForm.isSubmitting}
                    onClick={() => suspendUserForm.submitForm()}
                  >
                    Suspend
                  </Button>
                  <Button
                    loading={deleteUserForm.isSubmitting}
                    onClick={() => deleteUserForm.submitForm()}
                    variant={"destructive"}>
                    Delete
                  </Button>
                </>
              ) : null
            }
            {
              query.data?.status === "Suspended" ? (
                <>
                  <Button 
                    loading={unsuspendUserForm.isSubmitting}
                    onClick={() => unsuspendUserForm.submitForm()}
                  >
                    Restore
                  </Button>
                </>
              ) : null
            }
          </>
        )}
      >
        { Boolean(query.data) && <UserContainer datum={query.data!} /> }
      </Modal>
    </>
  )


}