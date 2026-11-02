
import { OnboardingOrganizationInfoForm } from './organization'
import { OnboardingSuccessForm } from './success'
import { OnboardingUserInfoForm } from './user'

export const FormSteps = [
  {
    accessor: "user",
    component: OnboardingUserInfoForm,
  },
  {
    accessor: "organization",
    component: OnboardingOrganizationInfoForm,
  },
  {
    accessor: "success",
    component: OnboardingSuccessForm,
  },
]