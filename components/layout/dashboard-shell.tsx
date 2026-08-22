"use client";

import { useState } from "react";

import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import {
  Topbar,
  type SerializedNotification,
} from "@/components/layout/topbar";

type DashboardShellProps = {
  children: React.ReactNode;
  notifications: SerializedNotification[];
};

export function DashboardShell({
  children,
  notifications,
}: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[url('/images/dashboard-bg.png')] bg-cover bg-center bg-no-repeat"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none fixed inset-0 z-0 bg-black/42 dark:bg-black/58"
        aria-hidden="true"
      />

      <div className="relative z-10 min-h-screen">
        <Sidebar />

        <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
          <Topbar
            notifications={notifications}
            onMenuClick={() => setMobileNavOpen(true)}
          />

          <main
            id="main-content"
            tabIndex={-1}
            className="min-w-0 flex-1 bg-transparent"
          >
            {children}
          </main>
        </div>

        <MobileNav
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />
      </div>
    </div>
  );
}
