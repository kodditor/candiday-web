import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { shadcn } from "@clerk/ui/themes";
import App from "./App.tsx";
import config from "./config.ts";

const publishableKey = config.clerk.publishableKey;

if (!publishableKey) {
  console.warn(
    "Missing VITE_CLERK_PUBLISHABLE_KEY. Clerk auth routes will not work until it is configured.",
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={publishableKey}
      signInUrl={config.clerk.signInUrl}
      signUpUrl={config.clerk.signUpUrl}
      signInFallbackRedirectUrl={config.clerk.afterSignInUrl}
      signUpFallbackRedirectUrl={config.clerk.afterSignUpUrl}
      appearance={{
        theme: shadcn,
        variables: {
          colorPrimary: "#33285A",
          borderRadius: "0.5rem",
        },
        options: {
          logoImageUrl: "/wordmark.png",
        },
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>,
);
