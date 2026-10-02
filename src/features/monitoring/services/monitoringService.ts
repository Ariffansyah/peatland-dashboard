// Monitoring Service — abstraction layer antara UI dan data source
// Ganti implementasinya tanpa mengubah UI

import type {
  MonitoringNode,
  MonitoringReading,
  RiskAlert,
  SystemStatus,
  TimePeriod,
  TrendDataPoint,
} from "@/types/domain";
import {
  getMockGlobalTrendData,
  getMockTrendData,
  mockAlerts,
  mockLatestReadings,
  mockNodes,
  mockSystemStatus,
} from "@/mocks/monitoring";

export interface MonitoringRepository {
  getSystemStatus(): Promise<SystemStatus>;
  getLatestReading(nodeId?: string): Promise<MonitoringReading | null>;
  getLatestReadings(): Promise<MonitoringReading[]>;
  getNodes(): Promise<MonitoringNode[]>;
  getNode(nodeId: string): Promise<MonitoringNode | null>;
  getTrendData(nodeId: string, period: TimePeriod): Promise<TrendDataPoint[]>;
  getGlobalTrendData(period: TimePeriod): Promise<TrendDataPoint[]>;
  getAlerts(params?: { nodeId?: string; status?: string }): Promise<RiskAlert[]>;
}

// ─── Mock Implementation ──────────────────────────────────────────────────────
// Ganti kelas ini dengan SupabaseMonitoringRepository saat backend siap

class MockMonitoringRepository implements MonitoringRepository {
  private delay(ms = 600) {
    return new Promise((res) => setTimeout(res, ms));
  }

  async getSystemStatus(): Promise<SystemStatus> {
    await this.delay(400);
    return mockSystemStatus;
  }

  async getLatestReading(nodeId?: string): Promise<MonitoringReading | null> {
    await this.delay();
    if (nodeId) {
      return mockLatestReadings.find((r) => r.nodeId === nodeId) ?? null;
    }
    // Return reading dengan risk tertinggi sebagai global overview
    return mockLatestReadings.reduce((prev, curr) =>
      curr.riskIndex.value > prev.riskIndex.value ? curr : prev
    );
  }

  async getLatestReadings(): Promise<MonitoringReading[]> {
    await this.delay();
    return mockLatestReadings;
  }

  async getNodes(): Promise<MonitoringNode[]> {
    await this.delay(300);
    return mockNodes;
  }

  async getNode(nodeId: string): Promise<MonitoringNode | null> {
    await this.delay(300);
    return mockNodes.find((n) => n.id === nodeId) ?? null;
  }

  async getTrendData(nodeId: string, period: TimePeriod): Promise<TrendDataPoint[]> {
    await this.delay(800);
    return getMockTrendData(nodeId, period);
  }

  async getGlobalTrendData(period: TimePeriod): Promise<TrendDataPoint[]> {
    await this.delay(800);
    return getMockGlobalTrendData(period);
  }

  async getAlerts(params?: { nodeId?: string; status?: string }): Promise<RiskAlert[]> {
    await this.delay(400);
    let alerts = [...mockAlerts];
    if (params?.nodeId) {
      alerts = alerts.filter((a) => a.nodeId === params.nodeId);
    }
    if (params?.status && params.status !== "ALL") {
      alerts = alerts.filter((a) => a.status === params.status);
    }
    return alerts;
  }
}

// ─── Singleton Instance ───────────────────────────────────────────────────────
// Tukar dengan SupabaseMonitoringRepository di sini saat integrasi

export const monitoringRepository: MonitoringRepository =
  new MockMonitoringRepository();
