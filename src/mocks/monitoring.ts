// Mock data — digunakan selama backend belum tersedia
// Ganti dengan SupabaseMonitoringRepository saat integrasi

import type {
  MonitoringNode,
  MonitoringReading,
  RiskAlert,
  SystemStatus,
  TrendDataPoint,
} from "@/types/domain";

// ─── Nodes ───────────────────────────────────────────────────────────────────

export const mockNodes: MonitoringNode[] = [
  {
    id: "NODE-001",
    name: "SoilMoisture",
    blockName: "Blok A",
    location: { latitude: -2.1234, longitude: 113.4567 },
    lastSeenAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    connectionStatus: "ONLINE",
  },
  {
    id: "NODE-002",
    name: "Ultrasonic",
    blockName: "Blok A",
    location: { latitude: -2.1289, longitude: 113.4612 },
    lastSeenAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    connectionStatus: "ONLINE",
  },
  {
    id: "NODE-003",
    name: "Temperature",
    blockName: "Blok B",
    location: { latitude: -2.1356, longitude: 113.4698 },
    lastSeenAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    connectionStatus: "ONLINE",
  },
];

// ─── Latest Readings ──────────────────────────────────────────────────────────

export const mockLatestReadings: MonitoringReading[] = [
  {
    id: "READ-001-LATEST",
    nodeId: "NODE-001",
    recordedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    waterLevel: { value: -31, unit: "cm" },
    soilMoisture: { value: 68, unit: "%" },
    riskIndex: { value: 42, status: "SIAGA", calculatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), previousValue: 35 },
  },
  {
    id: "READ-002-LATEST",
    nodeId: "NODE-002",
    recordedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    waterLevel: { value: -18, unit: "cm" },
    soilMoisture: { value: 81, unit: "%" },
    riskIndex: { value: 22, status: "AMAN", calculatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), previousValue: 24 },
  },
  {
    id: "READ-003-LATEST",
    nodeId: "NODE-003",
    recordedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    waterLevel: { value: -46, unit: "cm" },
    soilMoisture: { value: 41, unit: "%" },
    riskIndex: { value: 74, status: "AWAS", calculatedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(), previousValue: 68 },
  },
];

// ─── System Status ────────────────────────────────────────────────────────────

export const mockSystemStatus: SystemStatus = {
  overallStatus: "SIAGA",
  totalNodes: 3,
  onlineNodes: 3,
  lastUpdatedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
  isConnected: true,
};

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const mockAlerts: RiskAlert[] = [
  {
    id: "ALERT-001",
    nodeId: "NODE-003",
    nodeName: "Temperature",
    blockName: "Blok B",
    status: "AWAS",
    title: "Status Kerawanan AWAS",
    message: "Indeks kerawanan gambut meningkat signifikan. TMA turun ke -46 cm dengan kelembaban tanah 41%.",
    createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    acknowledged: false,
  },
  {
    id: "ALERT-002",
    nodeId: "NODE-001",
    nodeName: "SoilMoisture",
    blockName: "Blok A",
    status: "SIAGA",
    title: "Perubahan Status ke Siaga",
    message: "Indeks kerawanan meningkat dari 35 menjadi 42. Pemantauan lebih lanjut diperlukan.",
    createdAt: new Date(Date.now() - 17 * 60 * 1000).toISOString(),
    acknowledged: false,
  },
  {
    id: "ALERT-003",
    nodeId: "NODE-002",
    nodeName: "Ultrasonic",
    blockName: "Blok A",
    status: "SIAGA",
    title: "Perubahan Status ke Siaga",
    message: "TMA mencapai -35 cm. Kelembaban tanah menurun ke 61%.",
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    acknowledged: true,
  },
  {
    id: "ALERT-004",
    nodeId: "NODE-003",
    nodeName: "Temperature",
    blockName: "Blok B",
    status: "SIAGA",
    title: "Perubahan Status ke Siaga",
    message: "Kondisi hidrologi mulai memburuk. TMA turun ke -38 cm.",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    acknowledged: true,
  },
];

// ─── Trend Data Generator ─────────────────────────────────────────────────────

function generateTrendData(nodeId: string, hours: number): TrendDataPoint[] {
  const points: TrendDataPoint[] = [];
  const now = Date.now();
  const interval = (hours * 60 * 60 * 1000) / 48; // 48 data points

  // Seed values per node
  const seeds: Record<string, { wl: number; sm: number; ri: number }> = {
    "NODE-001": { wl: -28, sm: 72, ri: 35 },
    "NODE-002": { wl: -16, sm: 83, ri: 20 },
    "NODE-003": { wl: -38, sm: 48, ri: 58 },
  };

  const seed = seeds[nodeId] ?? { wl: -25, sm: 70, ri: 30 };
  let wl = seed.wl;
  let sm = seed.sm;
  let ri = seed.ri;

  for (let i = 48; i >= 0; i--) {
    wl = Math.max(-60, Math.min(-5, wl + (Math.random() - 0.48) * 2.5));
    sm = Math.max(20, Math.min(95, sm + (Math.random() - 0.45) * 3));
    ri = Math.max(0, Math.min(100, ri + (Math.random() - 0.45) * 4));
    points.push({
      timestamp: new Date(now - i * interval).toISOString(),
      waterLevel: Math.round(wl * 10) / 10,
      soilMoisture: Math.round(sm * 10) / 10,
      riskIndex: Math.round(ri),
    });
  }
  return points;
}

export function getMockTrendData(nodeId: string, period: "24h" | "7d" | "30d"): TrendDataPoint[] {
  const hours = period === "24h" ? 24 : period === "7d" ? 168 : 720;
  return generateTrendData(nodeId, hours);
}

// Global trend (agregasi semua node)
export function getMockGlobalTrendData(period: "24h" | "7d" | "30d"): TrendDataPoint[] {
  return getMockTrendData("NODE-001", period);
}
