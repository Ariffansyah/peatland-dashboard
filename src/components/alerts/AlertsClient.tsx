"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ShieldCheck, AlertTriangle, AlertOctagon, ArrowRight } from "lucide-react";
import { monitoringRepository } from "@/features/monitoring/services/monitoringService";
import type { RiskAlert, RiskStatus } from "@/types/domain";
import { usePolling } from "@/lib/usePolling";
import { LoadingSkeleton, EmptyState, ErrorState } from "@/components/ui/States";
import { formatRelativeTime, formatFullDate } from "@/lib/constants";

type AlertFilter = "ALL" | RiskStatus;

const STATUS_ICONS = {
  AWAS: AlertOctagon,
  SIAGA: AlertTriangle,
  AMAN: ShieldCheck,
};

export function AlertsClient() {
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AlertFilter>("ALL");

  const fetchAlerts = useCallback(async (silent = false) => {
    if (!silent) {
      setError(null);
      setLoading(true);
    }
    try {
      const data = await monitoringRepository.getAlerts();
      setAlerts(data);
    } catch {
      if (!silent) setError("Gagal memuat data alerts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);
  usePolling(() => fetchAlerts(true));

  const filtered = filter === "ALL" ? alerts : alerts.filter((a) => a.status === filter);
  const awasCount = alerts.filter((a) => a.status === "AWAS").length;
  const siagaCount = alerts.filter((a) => a.status === "SIAGA").length;
  const amanCount = alerts.filter((a) => a.status === "AMAN").length;
  const unreadCount = alerts.filter((a) => !a.acknowledged).length;

  if (error) {
    return (
      <div className="page-content">
        <ErrorState message={error} onRetry={fetchAlerts} />
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header" data-aos="fade-down" data-aos-duration="350">
        <h1 className="page-title">Alert Center</h1>
        <p className="page-subtitle">
          Riwayat peringatan dini perubahan status kerawanan lahan gambut
          {unreadCount > 0 && (
            <span style={{ marginLeft: "8px", color: "var(--status-awas)", fontWeight: 600 }}>
              — {unreadCount} belum dibaca
            </span>
          )}
        </p>
      </div>

      {/* Summary Bar */}
      {!loading && (
        <div className="alert-summary-bar" role="region" aria-label="Ringkasan alerts" data-aos="fade-up" data-aos-delay="80">
          <div className="alert-summary-item awas" data-aos="zoom-in" data-aos-delay="100">
            <div>
              <div className="alert-summary-count awas" aria-label={`${awasCount} alert AWAS`}>{awasCount}</div>
              <div className="alert-summary-label awas">AWAS</div>
              <div className="alert-summary-desc">Tindakan diperlukan</div>
            </div>
            <AlertOctagon size={32} style={{ color: "var(--status-awas)", opacity: 0.4 }} aria-hidden="true" />
          </div>

          <div className="alert-summary-item siaga" data-aos="zoom-in" data-aos-delay="160">
            <div>
              <div className="alert-summary-count siaga" aria-label={`${siagaCount} alert SIAGA`}>{siagaCount}</div>
              <div className="alert-summary-label siaga">SIAGA</div>
              <div className="alert-summary-desc">Perlu pemantauan</div>
            </div>
            <AlertTriangle size={32} style={{ color: "var(--status-siaga)", opacity: 0.4 }} aria-hidden="true" />
          </div>

          <div className="alert-summary-item aman" data-aos="zoom-in" data-aos-delay="220">
            <div>
              <div className="alert-summary-count aman" aria-label={`${amanCount} alert AMAN`}>{amanCount}</div>
              <div className="alert-summary-label aman">AMAN</div>
              <div className="alert-summary-desc">Kembali normal</div>
            </div>
            <ShieldCheck size={32} style={{ color: "var(--status-aman)", opacity: 0.4 }} aria-hidden="true" />
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="alert-filter-tabs" role="tablist" aria-label="Filter alert">
        {(["ALL", "AWAS", "SIAGA", "AMAN"] as AlertFilter[]).map((f) => {
          const count = f === "ALL" ? alerts.length : alerts.filter((a) => a.status === f).length;
          return (
            <button
              key={f}
              className={`alert-filter-tab${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
              role="tab"
              aria-selected={filter === f}
              id={`alert-filter-${f}`}
            >
              {f === "ALL" ? "Semua" : f}
              <span className="alert-count-badge">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Alert List */}
      {loading ? (
        <LoadingSkeleton type="list" count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ada Alert"
          description="Tidak ada peringatan untuk filter yang dipilih."
        />
      ) : (
        <div className="alert-list" role="list" aria-label="Daftar alert">
          {filtered.map((alert, idx) => {
            const StatusIcon = STATUS_ICONS[alert.status];
            const cls = alert.status.toLowerCase();
            const isUnread = !alert.acknowledged;

            return (
              <div
                key={alert.id}
                data-aos="fade-up"
                data-aos-delay={Math.min(idx * 40, 200)}
                data-aos-duration="350"
              >
              <div
                className={`alert-item${isUnread ? ` unread ${cls}` : ""}`}
                role="listitem"
                id={`alert-${alert.id}`}
              >
                <div className={`alert-item-icon ${cls}`} aria-hidden="true">
                  <StatusIcon size={18} strokeWidth={2} />
                </div>

                <div className="alert-item-body">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                    <span className="alert-item-title">{alert.title}</span>
                    <span
                      className={`status-badge ${cls}`}
                      role="status"
                      aria-label={`Status: ${alert.status}`}
                    >
                      {alert.status}
                    </span>
                    {isUnread && (
                      <span style={{
                        display: "inline-block",
                        width: 8, height: 8,
                        borderRadius: "50%",
                        background: "var(--status-awas)",
                      }}
                        aria-label="Belum dibaca"
                      />
                    )}
                  </div>

                  {(alert.nodeName || alert.blockName) && (
                    <div className="alert-item-location">
                      {alert.nodeName}
                      {alert.blockName && ` — ${alert.blockName}`}
                    </div>
                  )}

                  <div className="alert-item-message">{alert.message}</div>

                  {(alert.nodeName || alert.nodeId) && (
                    <Link
                      href={`/monitoring/${alert.nodeId}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.8125rem",
                        color: "var(--accent)",
                        marginTop: "8px",
                        fontWeight: 500,
                      }}
                      aria-label={`Lihat detail node ${alert.nodeName ?? alert.nodeId}`}
                    >
                      Lihat Node <ArrowRight size={12} aria-hidden="true" />
                    </Link>
                  )}
                </div>

                <div className="alert-item-time" title={formatFullDate(alert.createdAt)}>
                  {formatRelativeTime(alert.createdAt)}
                </div>
              </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
