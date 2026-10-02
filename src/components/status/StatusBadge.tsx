"use client";

import { ShieldCheck, AlertTriangle, AlertOctagon } from "lucide-react";
import type { RiskStatus } from "@/types/domain";

interface StatusBadgeProps {
  status: RiskStatus;
  size?: "sm" | "md";
}

const ICONS = {
  AMAN:  ShieldCheck,
  SIAGA: AlertTriangle,
  AWAS:  AlertOctagon,
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const cls   = status.toLowerCase();
  const Icon  = ICONS[status];
  const iconSize = size === "md" ? 12 : 10;

  return (
    <span
      className={`status-badge ${cls}`}
      role="status"
      aria-label={`Status: ${status}`}
    >
      <Icon size={iconSize} strokeWidth={2.5} aria-hidden="true" />
      {status}
    </span>
  );
}
