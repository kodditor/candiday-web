import { useFormik } from "formik";
import { OrganizationInfoSchema } from "./schema";
import { Button } from "@/components/ui/button";
import TextInput from "@/components/form/input";
import * as yup from 'yup';
import { UploadArea } from "@/components/form/single-upload";
import { ArrowLeftIcon } from "@phosphor-icons/react";


type Props = {
  initialValues: yup.InferType<typeof OrganizationInfoSchema>;
  handleSubmit: (values: any) => void;
  handlePrevStep: () => void;
  form: any;
  loading: boolean;
}

export function OnboardingOrganizationInfoForm({ initialValues, handleSubmit, handlePrevStep, loading }: Props) {

  const formik = useFormik({
    initialValues,
    validationSchema: OrganizationInfoSchema,
    onSubmit: values => {
      handleSubmit(values);
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-8">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-heading font-bold mb-2">Organization Details</h2>
          <p className="text-gray-600">Tell us about your organization.</p>
        </div>
        <TextInput
          id="name"
          label="Organization Name"
          placeholder="Acme Corporation"
          type="text"
          required
          {...formik}
        />
        <div>
          <UploadArea
            id="logo"
            label="Organization Logo"
            {...formik}
          />
        </div>
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevStep}
          >
            <ArrowLeftIcon strokeWidth={1.5} /> Back
          </Button>
          <Button
            type="button"
            loading={loading || formik.isSubmitting}
            onClick={formik.submitForm}
          >
            Create Organization
          </Button>
        </div>
      </form>
    </>
  )
}