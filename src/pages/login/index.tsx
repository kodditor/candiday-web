import { useEffect, useState } from "react";
import { Link, createRoute, useNavigate, getRouteApi } from "@tanstack/react-router";
import { useClerk, useSignIn } from "@clerk/react";
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

function navigateAfterAuth(
  navigate: ReturnType<typeof useNavigate>,
  session: ReturnType<typeof useClerk>["session"],
  destination: string,
) {
  if (session?.currentTask) {
    navigate({
      to: `${config.clerk.onboardingUrl}?task=${session.currentTask.key}`,
    });
    return;
  }

  navigate({ to: destination });
}

function LoginPageContent() {
  const navigate = useNavigate();
  const clerk = useClerk();
  const { signIn, errors, fetchStatus } = useSignIn();
  const redirectTo = loginRouteApi.useSearch().redirect_to;
  const [step, setStep] = useState<LoginStep>("email");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const destination = redirectTo
    ? decodeURIComponent(redirectTo)
    : config.clerk.afterSignInUrl;

  const finalizeSignIn = async () => {
    const result = await signIn.finalize();

    if (result?.error) {
      return;
    }

    navigateAfterAuth(navigate, clerk.session, destination);
  };

  const emailForm = useFormik({
    initialValues: { email: "" },
    validationSchema: EmailSchema,
    onSubmit: async (values, helpers) => {
      const sendResult = await signIn.emailCode.sendCode({
        emailAddress: values.email.trim(),
      });

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
      const verifyResult = await signIn.emailCode.verifyCode({
        code: values.code.trim(),
      });

      if (verifyResult?.error) {
        helpers.setSubmitting(false);
        return;
      }

      await finalizeSignIn();
      helpers.setSubmitting(false);
    },
  });

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    const result = await signIn.sso({
      strategy: "oauth_google",
      redirectUrl: destination,
      redirectCallbackUrl: config.clerk.ssoCallbackUrl,
    });

    if (result?.error) {
      setIsGoogleLoading(false);
    }
  };

  const handleResendCode = async () => {
    await signIn.emailCode.sendCode({
      emailAddress: emailForm.values.email.trim(),
    });
  };

  useEffect(() => {
    if (signIn.status === "needs_first_factor") {
      setStep("verify");
    }
  }, [signIn.status]);

  const isSubmitting =
    fetchStatus === "fetching" ||
    emailForm.isSubmitting ||
    verifyForm.isSubmitting;

  return (
    <AuthLayout
      title={step === "email" ? "Welcome back" : "Check your email"}
      subtitle={
        step === "email"
          ? "Sign in to your ProcVault workspace."
          : `We sent a verification code to ${emailForm.values.email || "your email"}.`
      }
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            to={config.clerk.signUpUrl}
            className="font-medium text-statute hover:underline"
          >
            Start your free trial
          </Link>
        </>
      }
    >
      {step === "email" ? (
        <div className="space-y-6">
          <GoogleAuthButton
            label="Continue with Google"
            onClick={handleGoogleSignIn}
            loading={isGoogleLoading}
            disabled={isSubmitting}
          />

          <AuthDivider />

          <form className="space-y-4" onSubmit={emailForm.handleSubmit} noValidate>
            <ClerkGlobalErrors errors={errors?.global} />

            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                aria-invalid={Boolean(
                  emailForm.touched.email && emailForm.errors.email,
                )}
                {...emailForm.getFieldProps("email")}
              />
              {emailForm.touched.email && emailForm.errors.email ? (
                <p className="text-sm text-destructive">{emailForm.errors.email}</p>
              ) : null}
              <ClerkFieldError message={errors?.fields?.identifier?.message} />
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-11 w-full text-base active:scale-[0.96]"
              loading={emailForm.isSubmitting}
              disabled={isSubmitting}
            >
              Continue
            </Button>
          </form>
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
            Verify and sign in
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-text-secondary hover:text-ink"
              onClick={() => setStep("email")}
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

export function LoginPage() {
  const redirectTo = loginRouteApi.useSearch().redirect_to;
  const signedInDestination = redirectTo
    ? decodeURIComponent(redirectTo)
    : config.clerk.afterSignInUrl;

  return (
    <AuthGuard redirectIfSignedIn redirectTo={signedInDestination}>
      <LoginPageContent />
    </AuthGuard>
  );
}
