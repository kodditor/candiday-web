import * as yup from "yup";

export const InviteTeamMemberInitialValues = {
  email: "",
  role: "org:member",
};

export const InviteTeamMemberSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
  role: yup
    .string()
    .oneOf(["org:admin", "org:member"], "Select a valid role")
    .required("Role is required"),
});
