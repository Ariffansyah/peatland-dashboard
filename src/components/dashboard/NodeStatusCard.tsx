"use client";

import { Server, Wifi, WifiOff } from "lucide-react";
import type { MonitoringNode } from "@/types/domain";
import Link from "next/link";

interface NodeStatusCardProps {
  nodes: MonitoringNode[];
}

export function NodeStatusCard({ nodes }: NodeStatusCardProps) {
  const online = nodes.filter((n) => n.connectionStatus === "ONLINE").length;
  const offline = nodes.filter((n) => n.connectionStatus === "OFFLINE").length;
  const total = nodes.length;
  const allOnline = offline === 0 && total > 0;

  return (
    <div className="card" id="node-status-card">
      <div className="card-header">
        <div className="card-label">
          <Server size={14} className="card-icon" aria-hidden="true" />
          Status Node
        </div>
        <span
          className={`status-badge ${allOnline ? "aman" : offline > 1 ? "awas" : "siaga"}`}
          role="status"
          aria-label={`${offline} node offline`}
        >
          {allOnline ? "Semua Online" : `${offline} Offline`}
        </span>
      </div>

      <div className="param-value" aria-label={`${online} dari ${total} node online`}>
        <span>{online}</span>
        <span className="param-unit" style={{ fontSize: "1.25rem" }}>/ {total}</span>
      </div>

      <div className="param-desc">node online</div>

      {/* Mini node list */}
      <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {nodes.slice(0, 4).map((node) => (
          <div
            key={node.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              padding: "2px 0",
            }}
          >
            <span>{node.name} {node.blockName && `· ${node.blockName}`}</span>
            <span
              style={{
                color: node.connectionStatus === "ONLINE" ? "var(--status-aman)" : "var(--status-awas)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
              aria-label={`Status: ${node.connectionStatus}`}
            >
              {node.connectionStatus === "ONLINE"
                ? <Wifi size={11} aria-hidden="true" />
                : <WifiOff size={11} aria-hidden="true" />}
            </span>
          </div>
        ))}
        {total > 4 && (
          <Link href="/monitoring" style={{ fontSize: "0.75rem", color: "var(--accent)", marginTop: "4px" }}>
            +{total - 4} lainnya →
          </Link>
        )}
      </div>
    </div>
  );
}
