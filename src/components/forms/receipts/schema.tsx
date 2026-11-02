import * as yup from "yup";

export const ApproveReceiptInitialValues = {
  notes: "",
};

export const ApproveReceiptSchema = yup.object({
  notes: yup.string().optional(),
});