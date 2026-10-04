"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Radio, Wifi, WifiOff, Layers, ExternalLink } from "lucide-react";
import type { MonitoringNode, MonitoringReading, RiskStatus } from "@/types/domain";
import { StatusBadge } from "@/components/status/StatusBadge";
import { formatRelativeTime } from "@/lib/constants";
import "leaflet/dist/leaflet.css";

interface NodeMapProps {
  nodes: MonitoringNode[];
  readings: MonitoringReading[];
}

const STATUS_COLORS: Record<RiskStatus, string> = {
  AMAN: "#22c55e",
  SIAGA: "#eab308",
  AWAS: "#ef4444",
};

export function NodeMap({ nodes, readings }: NodeMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Map<string, any>>(new Map());

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(nodes[0]?.id ?? null);

  const getReading = (nodeId: string) => readings.find((r) => r.nodeId === nodeId);

  // Inisialisasi peta Leaflet sekali di sisi client
  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;
      if (isCancelled || !mapContainerRef.current) return;

      // Pusat Surabaya Utara: sekitar lat -7.210, lng 112.745
      const map = L.map(mapContainerRef.current, {
        center: [-7.21, 112.748],
        zoom: 13,
        scrollWheelZoom: false,
      });

      // Free OpenStreetMap Tile Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
      updateMarkers(L, map);
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current.clear();
      }
    };
  }, []);

  // Update marker ketika nodes atau readings berubah
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import("leaflet").then((mod) => {
      const L = mod.default;
      if (mapInstanceRef.current) {
        updateMarkers(L, mapInstanceRef.current);
      }
    });
  }, [nodes, readings]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function updateMarkers(L: any, map: any) {
    // Bersihkan marker lama
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    nodes.forEach((node) => {
      const lat = node.location?.latitude;
      const lng = node.location?.longitude;
      if (lat === undefined || lng === undefined) return;

      const reading = getReading(node.id);
      const status: RiskStatus = reading?.riskIndex.status ?? "AMAN";
      const color = STATUS_COLORS[status];
      const isLive = node.id === "NODE-001" || node.id === "NODE-004";

      // Kustom HTML Marker
      const customIcon = L.divIcon({
        className: "custom-map-marker",
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            cursor: pointer;
          ">
            <span style="
              position: absolute;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              background: ${color};
              opacity: 0.35;
              animation: pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            "></span>
            <div style="
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: #0f1712;
              border: 3px solid ${color};
              box-shadow: 0 0 12px ${color}88;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: ${color};
              "></div>
            </div>
            <div style="
              position: absolute;
              top: -24px;
              white-space: nowrap;
              background: rgba(10, 15, 10, 0.9);
              border: 1px solid var(--border-subtle, rgba(255,255,255,0.1));
              color: #f1f5f9;
              font-size: 11px;
              font-weight: 600;
              padding: 2px 7px;
              border-radius: 6px;
              pointer-events: none;
              box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            ">
              ${node.name}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      marker.on("click", () => {
        setSelectedNodeId(node.id);
        map.flyTo([lat, lng], 14, { duration: 0.8 });
      });

      markersRef.current.set(node.id, marker);
    });
  }

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? nodes[0];
  const selectedReading = selectedNode ? getReading(selectedNode.id) : null;
  const isSelectedLive = selectedNode?.id === "NODE-001" || selectedNode?.id === "NODE-004";

  const handleSelectNode = (node: MonitoringNode) => {
    setSelectedNodeId(node.id);
    const lat = node.location?.latitude;
    const lng = node.location?.longitude;
    if (lat && lng && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 0.8 });
    }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div
        style={{
          padding: "var(--space-4) var(--space-5)",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              background: "rgba(34, 197, 94, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent, #22c55e)",
            }}
          >
            <MapPin size={18} />
          </div>
          <div>
            <h2 className="text-section-title" style={{ margin: 0, fontSize: "1rem" }}>
              Peta Sebaran Node Pemantauan (Surabaya Utara)
            </h2>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              Data geografis OpenStreetMap & telemetri sensor real-time dari Supabase
            </p>
          </div>
        </div>

        {/* Tab Pemilihan Node Cepat */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {nodes.map((node) => {
            const reading = getReading(node.id);
            const status = reading?.riskIndex.status ?? "AMAN";
            const isSelected = node.id === selectedNodeId;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => handleSelectNode(node)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  border: isSelected ? "1px solid var(--accent, #22c55e)" : "1px solid var(--border-subtle)",
                  background: isSelected ? "rgba(34, 197, 94, 0.15)" : "var(--bg-card-subtle, rgba(255,255,255,0.03))",
                  color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                  transition: "all 0.15s ease",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: STATUS_COLORS[status],
                  }}
                />
                {node.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Map & Detail Panel */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr minmax(280px, 320px)",
          minHeight: 380,
        }}
        className="map-layout-grid"
      >
        {/* Kontainer Peta OSM */}
        <div style={{ position: "relative", minHeight: 380, width: "100%", background: "#0a0f0a" }}>
          <div ref={mapContainerRef} style={{ width: "100%", height: "100%", minHeight: 380 }} />
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              zIndex: 1000,
              background: "rgba(10, 15, 10, 0.85)",
              backdropFilter: "blur(6px)",
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: "0.7rem",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Layers size={12} /> Klik titik marker untuk memuat telemetri node
          </div>
        </div>

        {/* Panel Telemetri Node yang Dipilih */}
        <div
          style={{
            borderLeft: "1px solid var(--border-subtle)",
            background: "var(--bg-card, rgba(17, 26, 18, 0.95))",
            padding: "var(--space-4)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "var(--space-4)",
          }}
        >
          {selectedNode ? (
            <>
              <div>
                {/* Header Node */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {selectedNode.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                      {selectedNode.blockName ?? "Wilayah Surabaya Utara"}
                    </div>
                    <div style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>
                      ID: {selectedNode.id}
                    </div>
                  </div>
                  {selectedReading && <StatusBadge status={selectedReading.riskIndex.status} />}
                </div>

                {/* Badge Sumber Data Supabase */}
                {isSelectedLive && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      background: "rgba(34, 197, 94, 0.15)",
                      color: "#4ade80",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      marginBottom: "14px",
                    }}
                  >
                    <Radio size={11} className="pulse-live" /> Live Data dari Supabase
                  </div>
                )}

                {/* Indikator Telemetri Terbaru */}
                {selectedReading ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      marginBottom: "14px",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                        Indeks Risiko (IKG)
                      </div>
                      <div
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: 700,
                          fontFamily: "var(--font-mono)",
                          color: STATUS_COLORS[selectedReading.riskIndex.status],
                        }}
                      >
                        {selectedReading.riskIndex.value}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "10px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                        TMA
                      </div>
                      <div style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                        {selectedReading.waterLevel.value} <span style={{ fontSize: "0.75rem", fontWeight: 400 }}>{selectedReading.waterLevel.unit}</span>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "10px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                        Kelembaban
                      </div>
                      <div style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                        {selectedReading.soilMoisture.value} <span style={{ fontSize: "0.75rem", fontWeight: 400 }}>{selectedReading.soilMoisture.unit}</span>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "10px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                        Koneksi
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: selectedNode.connectionStatus === "ONLINE" ? "var(--status-aman)" : "var(--status-awas)",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          marginTop: "4px",
                        }}
                      >
                        {selectedNode.connectionStatus === "ONLINE" ? (
                          <>
                            <Wifi size={13} /> Online
                          </>
                        ) : (
                          <>
                            <WifiOff size={13} /> Offline
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "16px 0", color: "var(--text-tertiary)", fontSize: "0.85rem" }}>
                    Belum ada pembacaan telemetri untuk node ini.
                  </div>
                )}

                {/* Lokasi Koordinat */}
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                    background: "rgba(0,0,0,0.2)",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <MapPin size={12} style={{ color: "var(--accent)" }} />
                    <span style={{ fontFamily: "var(--font-mono)" }}>
                      {selectedNode.location?.latitude?.toFixed(4)}, {selectedNode.location?.longitude?.toFixed(4)}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "4px" }}>
                    Update terakhir: {selectedNode.lastSeenAt ? formatRelativeTime(selectedNode.lastSeenAt) : "Baru saja"}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/monitoring/${selectedNode.id}`}
                className="btn btn-secondary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  width: "100%",
                  textDecoration: "none",
                  fontSize: "0.8125rem",
                  padding: "9px 12px",
                }}
              >
                Lihat Detail Lengkap Node <ArrowRight size={14} />
              </Link>
            </>
          ) : (
            <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "center", padding: "30px 0" }}>
              Pilih node di peta
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
