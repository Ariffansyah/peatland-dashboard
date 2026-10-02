"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { AppHeader } from "./AppHeader";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const closeSidebar  = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside
        className={`app-sidebar${sidebarOpen ? " open" : ""}`}
        aria-label="Navigasi utama"
        id="main-sidebar"
      >
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay${sidebarOpen ? " open" : ""}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Main */}
      <div className="app-main">
        <AppHeader onMenuClick={toggleSidebar} />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
