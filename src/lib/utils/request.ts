import { AxiosError } from "axios";
import { type FormikHelpers } from "formik";
import { toast } from "sonner"


export async function wrapError<T>(fn: () => Promise<T>, helpers?: FormikHelpers<any>): Promise<Awaited<T>>{
  try {
    const result =  await fn()
    helpers?.setSubmitting?.(false)
    return result;
  } catch(e: any){
    let err = e?.message || "An error occurred"

    if(e instanceof AxiosError){
      err = e.response?.data.error || err
    }
    toast.error(err)
    helpers?.setSubmitting?.(false)
    throw new Error(err)
  }
}