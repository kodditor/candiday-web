import {
  InviteTeamMemberForm,
  InviteTeamMemberInitialValues,
  InviteTeamMemberSchema,
} from "@/components/forms/team";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { authClient } from "@/lib/auth/client";
import { type AppMutation } from "@/lib/types/form.type";
import { wrapError } from "@/lib/utils/request";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "sonner";

type Props = {
  open: boolean;
  closeModal: () => void;
  onInvited?: () => Promise<void> | void;
};

function resolveInviteError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to send invitation. Please try again.";
}

export function InviteTeamMemberModal({
  open,
  closeModal,
  onInvited,
}: Props) {
  const mutate = useMutation({
    mutationFn: ({ values, helpers }: AppMutation<{ email: string; role: string }>) =>
      wrapError(async () => {
        const role =
          values.role === "admin" || values.role === "org:admin" ? "admin" : "member";
        const { error } = await authClient.organization.inviteMember({
          email: values.email.trim(),
          role,
        });

        if (error) {
          throw new Error(error.message ?? "Unable to send invitation.");
        }

        await onInvited?.();
        closeModal();
        form.resetForm();
        toast.success("Invitation sent successfully");
      }, helpers),
    onError: (error) => {
      toast.error(resolveInviteError(error));
    },
  });

  const form = useFormik({
    initialValues: InviteTeamMemberInitialValues,
    validationSchema: InviteTeamMemberSchema,
    onSubmit: (values, helpers) => mutate.mutate({ values, helpers }),
  });

  return (
    <Modal
      open={open}
      closeModal={closeModal}
      title="Add member"
      renderActions={() => (
        <Button
          disabled={!form.isValid || form.isSubmitting}
          onClick={() => form.submitForm()}
          loading={form.isSubmitting}
        >
          Send invitation
        </Button>
      )}
    >
      <InviteTeamMemberForm form={form} />
    </Modal>
  );
}
