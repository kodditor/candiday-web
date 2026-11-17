import { DashboardHeader } from "@/components/layout/dashboard-header";
import type { ReactNode } from "react";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-paper font-body text-text-primary antialiased">
      <div className="mx-auto w-full max-w-5xl px-6 py-5">
        <div className="sticky top-4 z-50 mb-8">
          <DashboardHeader />
        </div>
        <main>{children}</main>
      </div>
    </div>
  );
}