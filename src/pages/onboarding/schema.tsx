import * as Yup from 'yup';
  
export const OrganizationInfoSchema = Yup.object().shape({
  name: Yup.string().max(255, 'Organization name is too long').required('Organization name is required'),
  logo: Yup.string().url('Invalid URL').optional(),
});

export const UserInfoSchema = Yup.object().shape({
  firstName: Yup.string().max(100, 'First name is too long').required('First name is required'),
  lastName: Yup.string().max(100, 'Last name is too long').required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().min(7, 'Phone number is too short').max(15, 'Phone number is too long').required('Phone number is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').max(100, 'Password is too long').required('Password is required'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
});


export const OnboardingSchema = Yup.object().shape({
  user: UserInfoSchema,
  organization: OrganizationInfoSchema
});