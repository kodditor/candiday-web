import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createRole, rolesQueryKeys } from "@/lib/api/roles";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import * as Yup from "yup";
import { DashboardRootRoute } from "../root";
import TextInput from "@/components/form/input";
import TextArea from "@/components/form/text-area";

const NewRoleSchema = Yup.object({
  title: Yup.string()
    .trim()
    .min(1, "Required")
    .max(200, "Title is too long")
    .required("Required"),
  company: Yup.string()
    .trim()
    .max(200, "Company name is too long")
    .required("Required"),
  description: Yup.string()
    .trim()
    .min(50, "Paste a fuller job description so we can draft useful criteria")
    .max(50_000, "Job description is too long")
    .required("Required"),
});

export const DashboardRoleNewRoute = createRoute({
  getParentRoute: () => DashboardRootRoute,
  path: "/roles/new",
  component: NewRolePage,
});

function NewRolePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useFormik({
    initialValues: {
      title: "",
      company: "",
      description: "",
    },
    validationSchema: NewRoleSchema,
    onSubmit: async (values) => {
      try {
        await createRole({
          title: values.title,
          companyName: values.company,
          jobDescription: values.description,
        });
        await queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
        toast.success("Role created.");
        void navigate({ to: "/dashboard/roles" });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to save your role.",
        );
      }
    },
  });

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-medium tracking-tight text-ink">New role</h1>
        <p className="text-sm text-text-secondary">
          Add the hiring company and job description. Candiday will draft screening
          criteria for you to review.
        </p>
      </div>

      <form className="space-y-8" onSubmit={form.handleSubmit} noValidate>
        <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
          <div className="space-y-2">
            <TextInput
              id="title"
              label="Role title"
              placeholder="Senior Frontend Engineer"
              aria-invalid={Boolean(form.touched.title && form.errors.title)}
              {...form}
            />
          </div>

          <div className="space-y-2">
            <TextInput
              id="company"
              label="Company"
              placeholder="Candiday Recruitment"
              {...form}
            />
          </div>
        </div>

        <div className="space-y-2">
          <TextArea
            id="description"
            rows={14}
            placeholder="Paste the full job description here…"
            label="Job description"
            {...form}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            className="h-10 flex-1"
            onClick={() => void navigate({ to: "/dashboard/roles" })}
            disabled={form.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-10 flex-[2]"
            loading={form.isSubmitting}
            disabled={form.isSubmitting}
          >
            Create role
          </Button>
        </div>
      </form>
    </div>
  );
}