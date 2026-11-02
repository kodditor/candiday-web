import { useFormik } from "formik";
import { UserInfoSchema } from "./schema";
import { Button } from "@/components/ui/button";
import TextInput from "@/components/form/input";
import * as yup from 'yup';


type Props = {
  initialValues: yup.InferType<typeof UserInfoSchema>;
  handleSubmit: (values: any) => void;
  handlePrevStep: () => void;
  form: any;
  loading: boolean;
}

export function OnboardingUserInfoForm({ initialValues, handleSubmit }: Props) {

  const formik = useFormik({
    initialValues,
    validationSchema: UserInfoSchema,
    onSubmit: values => {
      handleSubmit(values);
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-8">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-heading font-bold mb-2">Create Your Account</h2>
          <p className="text-gray-600">Let's get you started with your new organization.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            id="firstName"
            label="First Name"
            placeholder="John"
            type="text"
            required
            {...formik}
          />
          <TextInput
            id="lastName"
            label="Last Name"
            placeholder="Doe"
            type="text"
            required
            {...formik}
          />
        </div>
        <TextInput
          id="email"
          label="Email Address"
          placeholder="john.doe@company.com"
          type="email"
          required
          {...formik}
        />
        <TextInput
          id="phone"
          label="Phone Number"
          placeholder="+233 XX XXX XXXX"
          type="text"
          required
          {...formik}
        />
        <TextInput
          id="password"
          label="Password"
          placeholder="••••••••"
          type="password"
          required
          {...formik}
        />
        <TextInput
          id="confirmPassword"
          label="Confirm Password"
          placeholder="••••••••"
          type="password"
          required
          {...formik}
        />
        <div className="flex justify-end">
          <Button 
            type="submit"
          >
            Continue
          </Button>
        </div>
      </form>
    </>
  )
}