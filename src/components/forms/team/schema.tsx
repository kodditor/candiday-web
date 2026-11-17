import * as yup from "yup";

export const InviteTeamMemberInitialValues = {
  email: "",
  role: "member",
};

export const InviteTeamMemberSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
  role: yup
    .string()
    .oneOf(["admin", "member"], "Select a valid role")
    .required("Role is required"),
});
