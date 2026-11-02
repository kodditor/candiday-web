import { type FormikHelpers } from "formik"

export type AppMutation<TValues = any> = {
  values: TValues,
  helpers: FormikHelpers<TValues>
}