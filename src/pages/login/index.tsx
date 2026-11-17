import { useState } from "react";
import { Link, createRoute, useNavigate, getRouteApi } from "@tanstack/react-router";
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

const EmailSchema = Yup.object({
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

type LoginStep = "email" | "verify";

const loginRouteApi = getRouteApi("/auth/login");

export const LoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/login",
  validateSearch: (search: Record<string, unknown>) => ({
    redirect_to:
      typeof search.redirect_to === "string" ? search.redirect_to : undefined,
  }),
  component: LoginPage,
});

function LoginPageContent() {
  const navigate = useNavigate();
  const redirectTo = loginRouteApi.useSearch().redirect_to;
  const [step, setStep] = useState<LoginStep>("email");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [emailForVerify, setEmailForVerify] = useState("");

  const destination = redirectTo
    ? decodeURIComponent(redirectTo)
    : config.auth.afterSignInUrl;

  const emailForm = useFormik({
    initialValues: { email: "" },
    validationSchema: EmailSchema,
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

      setEmailForVerify(email);
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
        email: emailForVerify,
        otp: values.code.trim(),
      });

      if (error) {
        setGlobalError(error.message ?? "Invalid verification code.");
        helpers.setSubmitting(false);
        return;
      }

      navigate({ to: destination });
    },
  });

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setGlobalError(null);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${config.url}${destination}`,
    });
    setIsGoogleLoading(false);
  };

  return (
    <AuthLayout
      title={step === "email" ? "Log in" : "Check your email"}
      subtitle={
        step === "email"
          ? "Welcome back. Enter your work email and we'll send you a code."
          : `We sent a code to ${emailForVerify}.`
      }
    >
      {step === "email" ? (
        <form onSubmit={emailForm.handleSubmit} className="space-y-5">
          <AuthGlobalErrors
            errors={globalError ? [{ message: globalError }] : null}
          />
          <GoogleAuthButton
            label="Continue with Google"
            onClick={() => void handleGoogleSignIn()}
            loading={isGoogleLoading}
          />
          <AuthDivider />
          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={emailForm.values.email}
              onChange={emailForm.handleChange}
              onBlur={emailForm.handleBlur}
            />
            <AuthFieldError
              message={
                emailForm.touched.email ? emailForm.errors.email : undefined
              }
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={emailForm.isSubmitting}
          >
            Continue
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            New to Candiday?{" "}
            <Link
              to={config.auth.signUpUrl}
              search={{}}
              className="font-medium text-primary"
            >
              Get early access
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
            Verify and sign in
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setStep("email")}
          >
            Use a different email
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

function LoginPage() {
  const redirectTo = loginRouteApi.useSearch().redirect_to;
  const destination = redirectTo
    ? decodeURIComponent(redirectTo)
    : config.auth.afterSignInUrl;

  return (
    <AuthGuard redirectIfSignedIn redirectTo={destination}>
      <LoginPageContent />
    </AuthGuard>
  );
}
