import { DataOwnerDigestFrequencies, type DataOwnerDigestFrequency } from "@/lib/types/data-owner.type";
import * as yup from "yup";

export const CreateDataOwnerInitialValues = {
  name: "",
  email: "",
  role: "",
  digestFrequency: "weekly" as DataOwnerDigestFrequency,
  notificationsEnabled: true,
};

export const CreateDataOwnerSchema = yup.object({
  name: yup.string().trim().max(255, "Name is too long").required("Name is required"),
  email: yup.string().trim().email("Enter a valid email address").required("Email is required"),
  role: yup.string().trim().max(255, "Role is too long").optional(),
  digestFrequency: yup.string().oneOf([...DataOwnerDigestFrequencies]).required(),
  notificationsEnabled: yup.boolean().required(),
});

export const EditDataOwnerInitialValues = {
  name: "",
  email: "",
  role: "",
  digestFrequency: "weekly" as DataOwnerDigestFrequency,
  notificationsEnabled: true,
};

export const EditDataOwnerSchema = CreateDataOwnerSchema;
