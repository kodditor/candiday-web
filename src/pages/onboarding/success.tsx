import { Button } from "@/components/ui/button";
import { CircleWavyCheckIcon } from "@phosphor-icons/react/dist/ssr";
import { useNavigate } from "@tanstack/react-router";
import type { FormikProps } from "formik";


type Props = {
  handleSubmit: (values: any) => void;
  handlePrevStep: () => void;
  form: FormikProps<any>
  loading: boolean;
}

export function OnboardingSuccessForm({ form }: Props) {

  const navigate = useNavigate()

  return (
    <>
      <div className="text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <CircleWavyCheckIcon size={30} className="text-white"/>
          </div>
          <h2 className="text-3xl font-heading font-bold mb-2">Welcome to FuelFlow!</h2>
          <p className="text-gray-600">
            Your organization <span className="font-semibold">{form.values.organization?.name}</span> has been created successfully.
          </p>
        </div>
        <Button
          onClick={() => navigate({ to: '/dashboard' })}
        >
          View Dashboard
        </Button>
      </div>
    </>
  )
}