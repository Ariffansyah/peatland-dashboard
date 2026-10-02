"use client";

import { AlertOctagon, RefreshCw, SearchX, Leaf } from "lucide-react";

/* ═══════════════════════════════════════
   LOADING SKELETON
   ═══════════════════════════════════════ */

interface LoadingSkeletonProps {
  type?: "card" | "list";
  count?: number;
}

export function LoadingSkeleton({ type = "card", count = 1 }: LoadingSkeletonProps) {
  if (type === "list") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-4) var(--space-5)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-4)",
            }}
          >
            <div className="skeleton" style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", flexShrink: 0 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="skeleton skeleton-text lg" style={{ width: "55%" }} />
              <div className="skeleton skeleton-text" style={{ width: "35%" }} />
            </div>
            <div className="skeleton skeleton-text" style={{ width: 52 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{ minHeight: 160, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="skeleton skeleton-text" style={{ width: 100 }} />
        <div className="skeleton skeleton-badge" />
      </div>
      <div className="skeleton skeleton-text xl" style={{ width: "70%", marginTop: 4 }} />
      <div className="skeleton skeleton-text" style={{ width: "50%" }} />
      <div className="skeleton" style={{ height: 3, borderRadius: 2, marginTop: "auto" }} />
    </div>
  );
}

/* ═══════════════════════════════════════
   ERROR STATE
   ═══════════════════════════════════════ */

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Terjadi kesalahan saat memuat data.", onRetry }: ErrorStateProps) {
  return (
    <div className="card state-container" role="alert" aria-live="assertive">
      <div style={{ width: 48, height: 48, background: "var(--status-awas-bg)", border: "1px solid var(--status-awas-border)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--status-awas)" }}>
        <AlertOctagon size={22} strokeWidth={2} />
      </div>
      <div className="state-title">Gagal Memuat Data</div>
      <div className="state-desc">{message}</div>
      {onRetry && (
        <button className="btn-retry" onClick={onRetry} aria-label="Coba lagi">
          <RefreshCw size={14} aria-hidden="true" />
          Coba Lagi
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════ */

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({
  title = "Tidak Ada Data",
  description = "Belum ada data yang tersedia saat ini.",
  action,
}: EmptyStateProps) {
  return (
    <div className="card state-container">
      <div style={{ width: 48, height: 48, background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)" }}>
        <SearchX size={22} strokeWidth={1.5} />
      </div>
      <div className="state-title">{title}</div>
      <div className="state-desc">{description}</div>
      {action && (
        <button className="btn-retry" onClick={action.onClick} aria-label={action.label}>
          <Leaf size={14} aria-hidden="true" />
          {action.label}
        </button>
      )}
    </div>
  );
}
