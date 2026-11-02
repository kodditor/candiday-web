import { useCallback, useEffect, useRef, useState } from "react";
import { Link, createRoute, useNavigate } from "@tanstack/react-router";
import { useAuth, useClerk, useSignUp } from "@clerk/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AuthLayout } from "@/components/layout/auth-layout";
import { AuthGuard } from "@/components/auth/auth-guard";
import {
  AuthDivider,
  ClerkFieldError,
  ClerkGlobalErrors,
  GoogleAuthButton,
} from "@/components/auth/auth-primitives";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import config from "@/config";
import { rootRoute } from "@/router";

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

function navigateAfterAuth(
  navigate: ReturnType<typeof useNavigate>,
  session: ReturnType<typeof useClerk>["session"],
) {
  if (session?.currentTask) {
    navigate({
      to: `${config.clerk.onboardingUrl}?task=${session.currentTask.key}`,
    });
    return;
  }

  navigate({ to: config.clerk.afterSignUpUrl });
}

function isVerificationAlreadyVerified(error: { code?: string }) {
  return error.code === "verification_already_verified";
}

function SignupPageContent() {
  const navigate = useNavigate();
  const clerk = useClerk();
  const { isSignedIn } = useAuth();
  const { signUp, errors, fetchStatus } = useSignUp();
  const [step, setStep] = useState<SignUpStep>("details");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const isFinalizingRef = useRef(false);

  const finalizeSignUp = useCallback(async () => {
    if (isFinalizingRef.current || isSignedIn) {
      return;
    }

    if (signUp.existingSession?.sessionId) {
      isFinalizingRef.current = true;
      setIsFinalizing(true);

      await clerk.setActive({
        session: signUp.existingSession.sessionId,
      });

      navigateAfterAuth(navigate, clerk.session);
      return;
    }

    if (signUp.status !== "complete" || !signUp.createdSessionId) {
      return;
    }

    isFinalizingRef.current = true;
    setIsFinalizing(true);

    const result = await signUp.finalize();

    if (result?.error) {
      isFinalizingRef.current = false;
      setIsFinalizing(false);
      return;
    }

    navigateAfterAuth(navigate, clerk.session);
  }, [clerk, isSignedIn, navigate, signUp]);

  const detailsForm = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
    validationSchema: SignUpSchema,
    onSubmit: async (values, helpers) => {
      const createResult = await signUp.create({
        emailAddress: values.email.trim(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
      });

      if (createResult?.error) {
        helpers.setSubmitting(false);
        return;
      }

      const sendResult = await signUp.verifications.sendEmailCode();

      if (sendResult?.error) {
        helpers.setSubmitting(false);
        return;
      }

      setStep("verify");
      helpers.setSubmitting(false);
    },
  });

  const verifyForm = useFormik({
    initialValues: { code: "" },
    validationSchema: VerificationSchema,
    onSubmit: async (values, helpers) => {
      const verifyResult = await signUp.verifications.verifyEmailCode({
        code: values.code.trim(),
      });

      if (
        verifyResult?.error &&
        !isVerificationAlreadyVerified(verifyResult.error)
      ) {
        helpers.setSubmitting(false);
        return;
      }

      if (signUp.status === "complete") {
        await finalizeSignUp();
      }

      helpers.setSubmitting(false);
    },
  });

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);

    const result = await signUp.sso({
      strategy: "oauth_google",
      redirectUrl: config.clerk.onboardingUrl,
      redirectCallbackUrl: config.clerk.ssoCallbackUrl,
    });

    if (result?.error) {
      setIsGoogleLoading(false);
    }
  };

  const handleResendCode = async () => {
    await signUp.verifications.sendEmailCode();
  };

  useEffect(() => {
    if (
      signUp.status === "missing_requirements" &&
      signUp.unverifiedFields?.includes("email_address") &&
      signUp.missingFields.length === 0 &&
      step !== "verify"
    ) {
      setStep("verify");
    }
  }, [signUp.status, signUp.unverifiedFields, signUp.missingFields, step]);

  useEffect(() => {
    if (step === "verify" && signUp.status === "complete" && !isSignedIn) {
      void finalizeSignUp();
    }
  }, [step, signUp.status, isSignedIn, finalizeSignUp]);

  const isSubmitting =
    fetchStatus === "fetching" ||
    detailsForm.isSubmitting ||
    verifyForm.isSubmitting ||
    isFinalizing;

  if (step === "verify" && (signUp.status === "complete" || isSignedIn)) {
    return (
      <AuthLayout
        title="Verify your email"
        subtitle="Setting up your account..."
        footer={
          <>
            Already have an account?{" "}
            <Link
              to={config.clerk.signInUrl}
              search={{ redirect_to: undefined }}
              className="font-medium text-statute hover:underline"
            >
              Sign in
            </Link>
          </>
        }
      >
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-statute border-t-transparent" />
          <p className="text-sm text-text-secondary">
            Starting your free trial...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={step === "details" ? "Create your account" : "Verify your email"}
      subtitle={
        step === "details"
          ? "Start tracking vendor compliance in minutes."
          : `We sent a verification code to ${detailsForm.values.email || "your email"}.`
      }
      footer={
        <>
          Already have an account?{" "}
          <Link
            to={config.clerk.signInUrl}
            search={{ redirect_to: undefined }}
            className="font-medium text-statute hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      {step === "details" ? (
        <div className="space-y-6">
          <GoogleAuthButton
            label="Continue with Google"
            onClick={handleGoogleSignUp}
            loading={isGoogleLoading}
            disabled={isSubmitting}
          />

          <AuthDivider />

          <form
            className="space-y-4"
            onSubmit={detailsForm.handleSubmit}
            noValidate
          >
            <ClerkGlobalErrors errors={errors?.global} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  placeholder="Jane"
                  aria-invalid={Boolean(
                    detailsForm.touched.firstName && detailsForm.errors.firstName,
                  )}
                  {...detailsForm.getFieldProps("firstName")}
                />
                {detailsForm.touched.firstName && detailsForm.errors.firstName ? (
                  <p className="text-sm text-destructive">
                    {detailsForm.errors.firstName}
                  </p>
                ) : null}
                <ClerkFieldError message={errors?.fields?.firstName?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  placeholder="Doe"
                  aria-invalid={Boolean(
                    detailsForm.touched.lastName && detailsForm.errors.lastName,
                  )}
                  {...detailsForm.getFieldProps("lastName")}
                />
                {detailsForm.touched.lastName && detailsForm.errors.lastName ? (
                  <p className="text-sm text-destructive">
                    {detailsForm.errors.lastName}
                  </p>
                ) : null}
                <ClerkFieldError message={errors?.fields?.lastName?.message} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                aria-invalid={Boolean(
                  detailsForm.touched.email && detailsForm.errors.email,
                )}
                {...detailsForm.getFieldProps("email")}
              />
              {detailsForm.touched.email && detailsForm.errors.email ? (
                <p className="text-sm text-destructive">
                  {detailsForm.errors.email}
                </p>
              ) : null}
              <ClerkFieldError message={errors?.fields?.emailAddress?.message} />
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-11 w-full text-base active:scale-[0.96]"
              loading={detailsForm.isSubmitting}
              disabled={isSubmitting}
            >
              Continue
            </Button>
          </form>

          <div id="clerk-captcha" />
        </div>
      ) : (
        <form className="space-y-4" onSubmit={verifyForm.handleSubmit} noValidate>
          <ClerkGlobalErrors errors={errors?.global} />

          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              className="tabular-nums tracking-[0.3em]"
              aria-invalid={Boolean(
                verifyForm.touched.code && verifyForm.errors.code,
              )}
              {...verifyForm.getFieldProps("code")}
            />
            {verifyForm.touched.code && verifyForm.errors.code ? (
              <p className="text-sm text-destructive">{verifyForm.errors.code}</p>
            ) : null}
            <ClerkFieldError message={errors?.fields?.code?.message} />
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full text-base active:scale-[0.96]"
            loading={verifyForm.isSubmitting}
            disabled={isSubmitting}
          >
            Verify and continue
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-text-secondary hover:text-ink"
              onClick={async () => {
                await signUp.reset();
                setStep("details");
              }}
            >
              Edit email
            </button>
            <button
              type="button"
              className="font-medium text-statute hover:underline"
              onClick={handleResendCode}
              disabled={isSubmitting}
            >
              Resend code
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}

export function SignupPage() {
  return (
    <AuthGuard redirectIfSignedIn>
      <SignupPageContent />
    </AuthGuard>
  );
}
