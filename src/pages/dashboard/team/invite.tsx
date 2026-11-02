import {
  InviteTeamMemberForm,
  InviteTeamMemberInitialValues,
  InviteTeamMemberSchema,
} from "@/components/forms/team";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { type AppMutation } from "@/lib/types/form.type";
import { wrapError } from "@/lib/utils/request";
import { useOrganization } from "@clerk/react";
import { isClerkAPIResponseError } from "@clerk/react/errors";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "sonner";

type Props = {
  open: boolean;
  closeModal: () => void;
  onInvited?: () => Promise<void> | void;
};

function resolveInviteError(error: unknown): string {
  if (isClerkAPIResponseError(error)) {
    const message = error.errors[0]?.longMessage ?? error.errors[0]?.message;

    if (message) {
      return message;
    }
  }

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
  const { organization } = useOrganization();

  const mutate = useMutation({
    mutationFn: ({ values, helpers }: AppMutation<{ email: string; role: string }>) =>
      wrapError(async () => {
        if (!organization) {
          throw new Error("No active organization selected");
        }

        await organization.inviteMember({
          emailAddress: values.email.trim(),
          role: values.role,
        });

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
          disabled={!form.isValid || form.isSubmitting || !organization}
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
