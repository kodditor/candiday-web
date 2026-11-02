import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import type { ReactNode } from "react";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-paper font-body text-text-primary antialiased">
      <DashboardSidebar />

      <div className="min-h-screen pl-[20rem] pr-[5%] py-10">
        <div className="mx-auto max-w-5xl">
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
