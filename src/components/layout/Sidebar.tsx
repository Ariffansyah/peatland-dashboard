"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Activity, Bell, Leaf, Wifi, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/monitoring", label: "Monitoring", icon: Activity },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon" aria-hidden="true">
          <Leaf size={16} color="white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="sidebar-brand-text">Peatland</div>
          <div className="sidebar-brand-sub">IoT Analytics System</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item${active ? " active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                size={18}
                className="sidebar-nav-icon"
                aria-hidden="true"
                strokeWidth={active ? 2.5 : 2}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* Connection indicator */}
        <div className="connection-indicator">
          <span
            className="connection-dot online"
            role="status"
            aria-label="Status koneksi sistem: terhubung"
          />
          <Wifi size={12} aria-hidden="true" />
          <span>System connected</span>
        </div>

        {/* Theme toggle */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Mode ${theme === "dark" ? "gelap aktif — klik untuk mode terang" : "terang aktif — klik untuk mode gelap"}`}
          id="theme-toggle-sidebar"
        >
          {theme === "dark" ? (
            <><Sun size={14} aria-hidden="true" /> Mode Terang</>
          ) : (
            <><Moon size={14} aria-hidden="true" /> Mode Gelap</>
          )}
          <div className="theme-toggle-track" aria-hidden="true">
            <div className="theme-toggle-thumb" />
          </div>
        </button>
      </div>
    </>
  );
}
