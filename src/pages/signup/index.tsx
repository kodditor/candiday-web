import { useState } from "react";
import { Link, createRoute, useNavigate } from "@tanstack/react-router";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AuthLayout } from "@/components/layout/auth-layout";
import { AuthGuard } from "@/components/auth/auth-guard";
import {
  AuthDivider,
  AuthFieldError,
  AuthGlobalErrors,
  GoogleAuthButton,
} from "@/components/auth/auth-primitives";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import config from "@/config";
import { rootRoute } from "@/router";
import { authClient } from "@/lib/auth/client";

const SignUpSchema = Yup.object({
  firstName: Yup.string()
    .trim()
    .max(100, "First name is too long")
    .required("First name is required"),
  lastName: Yup.string()
    .trim()
    .max(100, "Last name is too long")
    .required("Last name is required"),
  email: Yup.string()
    .trim()
    .email("Enter a valid work email")
    .required("Work email is required"),
});

const VerificationSchema = Yup.object({
  code: Yup.string()
    .trim()
    .min(6, "Enter the 6-digit code")
    .required("Verification code is required"),
});

type SignUpStep = "details" | "verify";

export const SignupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/signup",
  component: SignupPage,
});

function SignupPageContent() {
  const navigate = useNavigate();
  const [step, setStep] = useState<SignUpStep>("details");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [pendingProfile, setPendingProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const detailsForm = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
    validationSchema: SignUpSchema,
    onSubmit: async (values, helpers) => {
      setGlobalError(null);
      const email = values.email.trim();
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      if (error) {
        setGlobalError(error.message ?? "Unable to send verification code.");
        helpers.setSubmitting(false);
        return;
      }

      setPendingProfile({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email,
      });
      setStep("verify");
      helpers.setSubmitting(false);
    },
  });

  const verifyForm = useFormik({
    initialValues: { code: "" },
    validationSchema: VerificationSchema,
    onSubmit: async (values, helpers) => {
      setGlobalError(null);
      const { error } = await authClient.signIn.emailOtp({
        email: pendingProfile.email,
        otp: values.code.trim(),
      });

      if (error) {
        setGlobalError(error.message ?? "Invalid verification code.");
        helpers.setSubmitting(false);
        return;
      }

      const fullName = `${pendingProfile.firstName} ${pendingProfile.lastName}`.trim();
      await authClient.updateUser({
        name: fullName,
      });

      navigate({ to: config.auth.onboardingUrl });
    },
  });

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setGlobalError(null);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${config.url}${config.auth.onboardingUrl}`,
    });
    setIsGoogleLoading(false);
  };

  return (
    <AuthLayout
      title={step === "details" ? "Get early access" : "Verify your email"}
      subtitle={
        step === "details"
          ? "Create your account to start reviewing CVs against the criteria that matter."
          : `Enter the code we sent to ${pendingProfile.email}.`
      }
    >
      {step === "details" ? (
        <form onSubmit={detailsForm.handleSubmit} className="space-y-5">
          <AuthGlobalErrors
            errors={globalError ? [{ message: globalError }] : null}
          />
          <GoogleAuthButton
            label="Continue with Google"
            onClick={() => void handleGoogleSignUp()}
            loading={isGoogleLoading}
          />
          <AuthDivider />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={detailsForm.values.firstName}
                onChange={detailsForm.handleChange}
                onBlur={detailsForm.handleBlur}
              />
              <AuthFieldError
                message={
                  detailsForm.touched.firstName
                    ? detailsForm.errors.firstName
                    : undefined
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={detailsForm.values.lastName}
                onChange={detailsForm.handleChange}
                onBlur={detailsForm.handleBlur}
              />
              <AuthFieldError
                message={
                  detailsForm.touched.lastName
                    ? detailsForm.errors.lastName
                    : undefined
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={detailsForm.values.email}
              onChange={detailsForm.handleChange}
              onBlur={detailsForm.handleBlur}
            />
            <AuthFieldError
              message={
                detailsForm.touched.email ? detailsForm.errors.email : undefined
              }
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={detailsForm.isSubmitting}
          >
            Continue
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to={config.auth.signInUrl}
              search={{ redirect_to: undefined }}
              className="font-medium text-primary"
            >
              Log in
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={verifyForm.handleSubmit} className="space-y-5">
          <AuthGlobalErrors
            errors={globalError ? [{ message: globalError }] : null}
          />
          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={verifyForm.values.code}
              onChange={verifyForm.handleChange}
              onBlur={verifyForm.handleBlur}
            />
            <AuthFieldError
              message={
                verifyForm.touched.code ? verifyForm.errors.code : undefined
              }
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={verifyForm.isSubmitting}
          >
            Verify and continue
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setStep("details")}
          >
            Back
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

function SignupPage() {
  return (
    <AuthGuard redirectIfSignedIn>
      <SignupPageContent />
    </AuthGuard>
  );
}
