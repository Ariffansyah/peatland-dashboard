"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";
import type { RiskStatus, TrendDataPoint } from "@/types/domain";
import { monitoringRepository } from "@/features/monitoring/services/monitoringService";

interface NodeMiniChartProps {
  nodeId: string;
  status: RiskStatus;
}

const STATUS_COLOR_HEX: Record<RiskStatus, string> = {
  AMAN: "#22c55e",
  SIAGA: "#eab308",
  AWAS: "#ef4444",
};

export function NodeMiniChart({ nodeId, status }: NodeMiniChartProps) {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadTrend() {
      try {
        const trend = await monitoringRepository.getTrendData(nodeId, "24h");
        if (!isCancelled) {
          setData(trend);
        }
      } catch {
        // Abaikan error sparkline
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadTrend();

    return () => {
      isCancelled = true;
    };
  }, [nodeId]);

  const color = STATUS_COLOR_HEX[status] ?? "#22c55e";
  const gradientId = `sparkline-grad-${nodeId}`;

  if (loading) {
    return (
      <div
        style={{
          height: 80,
          borderRadius: "8px",
          background: "rgba(255,255,255,0.03)",
          animation: "pulse 1.5s infinite ease-in-out",
        }}
      />
    );
  }

  if (data.length === 0) {
    return (
      <div
        style={{
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.75rem",
          color: "var(--text-tertiary)",
          border: "1px dashed var(--border-subtle)",
          borderRadius: "8px",
        }}
      >
        Belum ada histori data
      </div>
    );
  }

  // Format poin data untuk chart
  const chartPoints = data.map((d) => ({
    value: d.riskIndex,
    time: new Date(d.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    tma: d.waterLevel,
    moisture: d.soilMoisture,
  }));

  const latestVal = chartPoints[chartPoints.length - 1]?.value ?? 0;
  const firstVal = chartPoints[0]?.value ?? latestVal;
  const isUp = latestVal >= firstVal;

  return (
    <div style={{ width: "100%", padding: "4px 0" }}>
      {/* Header Kecil Tren */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "6px",
          fontSize: "0.7rem",
          color: "var(--text-tertiary)",
        }}
      >
        <span>Tren Indeks 24 Jam</span>
        <span style={{ color, fontWeight: 600 }}>
          {isUp ? "↑" : "↓"} {latestVal}
        </span>
      </div>

      {/* Mini Area Chart */}
      <div style={{ width: "100%", height: 75 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartPoints} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload;
                  return (
                    <div
                      style={{
                        background: "rgba(10, 15, 10, 0.95)",
                        border: "1px solid var(--border-subtle)",
                        padding: "6px 8px",
                        borderRadius: "6px",
                        fontSize: "0.7rem",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                      }}
                    >
                      <div style={{ color: "var(--text-tertiary)", fontSize: "0.65rem" }}>{p.time}</div>
                      <div style={{ color, fontWeight: 700 }}>IKG: {p.value}</div>
                      <div style={{ color: "var(--text-secondary)" }}>TMA: {p.tma} cm | SM: {p.moisture}%</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
