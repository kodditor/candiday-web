import TextInput from "@/components/form/input";
import TextArea from "@/components/form/text-area";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { rolesQueryKeys, updateRole } from "@/lib/api/roles";
import { rubricQueryKeys, startRubricGeneration } from "@/lib/api/rubric";
import { roleFormSchema, type RoleFormValues } from "@/lib/roles/role-form-schema";
import type { RoleDetailDto } from "@/lib/types/role.type";
import { Bookmark, BookmarkIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { useMemo } from "react";
import { toast } from "sonner";

type RoleEditModalProps = {
  open: boolean;
  role: RoleDetailDto;
  onOpenChange: (open: boolean) => void;
};

function toFormValues(role: RoleDetailDto): RoleFormValues {
  return {
    title: role.title,
    company: role.companyName?.trim() ?? "",
    description: role.jobDescription,
    requirementsNotes: role.requirementsNotes?.trim() ?? "",
  };
}

export function RoleEditModal({ open, role, onOpenChange }: RoleEditModalProps) {
  const queryClient = useQueryClient();
  const regenBlocked = role.status === "GeneratingRubric";

  const showReapprovalWarning =
    role.rubricApprovedAt != null || role.applicantsCount > 0;

  const initialValues = useMemo(() => toFormValues(role), [role]);

  const form = useFormik<RoleFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: roleFormSchema,
    onSubmit: async (values) => {
      try {
        await updateRole(role.id, {
          title: values.title,
          companyName: values.company,
          jobDescription: values.description,
          requirementsNotes: values.requirementsNotes || null,
        });
        await startRubricGeneration(role.id, crypto.randomUUID(), true);

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: rolesQueryKeys.detail(role.id) }),
          queryClient.invalidateQueries({ queryKey: rubricQueryKeys.view(role.id) }),
          queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all }),
        ]);

        toast.success("Role updated. Generating rubric…");
        onOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to save role.");
        void queryClient.invalidateQueries({ queryKey: rolesQueryKeys.detail(role.id) });
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,56rem)] w-[calc(100%-1.5rem)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="shrink-0 space-y-2 border-b border-hairline px-6 py-5">
          <DialogTitle className="text-lg">Edit role</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-text-muted">
            Update the job description and recruiter context used to generate and score applicants.
            Saving replaces the evaluation rubric with a new draft you&apos;ll need to approve again.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col bg-paper/40"
          onSubmit={form.handleSubmit}
          noValidate
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput
                id="title"
                label="Role title"
                placeholder="Senior Frontend Engineer"
                disabled={regenBlocked}
                aria-invalid={Boolean(form.touched.title && form.errors.title)}
                {...form}
              />
              <TextInput
                id="company"
                label="Company"
                placeholder="Candiday Recruitment"
                disabled={regenBlocked}
                {...form}
              />
            </div>

            <TextArea
              id="description"
              rows={12}
              label="Job description"
              placeholder="Paste the full job description here…"
              disabled={regenBlocked}
              {...form}
            />

            <TextArea
              id="requirementsNotes"
              rows={4}
              label="Recruiter notes"
              placeholder="Optional context for screening…"
              disabled={regenBlocked}
              {...form}
            />

            {showReapprovalWarning ? (
              <p
                className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
                role="status"
              >
                Saving will regenerate the evaluation rubric. You&apos;ll need to approve the new
                criteria before screening can continue with the updated role details.
              </p>
            ) : null}

            {regenBlocked ? (
              <p className="text-sm text-text-muted" role="status">
                A rubric is currently generating. Try again when generation finishes.
              </p>
            ) : null}
          </div>

          <DialogFooter className="mx-0 mb-0 shrink-0 gap-2 rounded-b-xl border-t border-hairline bg-white px-6 py-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={form.isSubmitting}
              disabled={form.isSubmitting || regenBlocked}
            >
              <div className="flex items-center gap-2">
                <BookmarkIcon size={16} />
                Save and regenerate rubric
              </div>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}