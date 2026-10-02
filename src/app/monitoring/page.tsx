import type { Metadata } from "next";
import { MonitoringClient } from "@/components/monitoring/MonitoringClient";

export const metadata: Metadata = {
  title: "Monitoring",
  description: "Pantau kondisi seluruh node sensor IoT lahan gambut — TMA, kelembaban, dan indeks kerawanan tiap blok.",
};

export default function MonitoringPage() {
  return <MonitoringClient />;
}
