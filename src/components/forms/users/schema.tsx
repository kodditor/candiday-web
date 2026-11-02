import { parsePhoneNumber } from "awesome-phonenumber";
import * as yup from "yup"


export const CreateUserInitialValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "User",
  isDriver: false,
}

export const CreateUserSchema = yup.object({
  firstName: yup.string().max(100, "First Name is too long").required(),
  lastName: yup.string().max(100, "Last Name is too long").required(),
  email: yup.string().email("Kindly enter a valid email address").required(),
  phone: yup.string().required().test({
    message: "Kindly enter a valid phone number",
    test: (val) => {

      if(!val) return false;
      const parsedNumber = parsePhoneNumber(val, { regionCode: 'GH'})
      return parsedNumber.valid
    }
  }),
  role: yup.string().oneOf(["Admin", "User"]).required(),
  isDriver: yup.boolean().optional().default(false),
})

export const EditUserInitialValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "User",
  isDriver: false,
}

export const EditUserSchema = yup.object({
  firstName: yup.string().max(100, "First Name is too long").optional(),
  lastName: yup.string().max(100, "Last Name is too long").optional(),
  email: yup.string().email("Kindly enter a valid email address").optional(),
  phone: yup.string().optional().test({
    message: "Kindly enter a valid phone number",
    test: (val) => {
      if(!val) return true; // optional, so empty is ok
      const parsedNumber = parsePhoneNumber(val, { regionCode: 'GH'})
      return parsedNumber.valid
    }
  }),
  role: yup.string().oneOf(["Admin", "User"]).optional(),
  isDriver: yup.boolean().optional(),
})