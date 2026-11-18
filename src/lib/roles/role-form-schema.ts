import * as Yup from "yup";

/** Matches backend rubric generation minimum (ROLE_MIN_JD_CHARS, default 200). */
export const ROLE_MIN_JD_CHARS = 200;

export const roleFormSchema = Yup.object({
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
    .min(
      ROLE_MIN_JD_CHARS,
      "Paste a fuller job description so we can draft useful criteria",
    )
    .max(50_000, "Job description is too long")
    .required("Required"),
  requirementsNotes: Yup.string()
    .trim()
    .max(5_000, "Notes are too long")
    .optional(),
});

export type RoleFormValues = Yup.InferType<typeof roleFormSchema>;