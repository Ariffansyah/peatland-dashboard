import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview kondisi kerentanan lahan gambut — Indeks Kerawanan, TMA, dan Kelembaban Tanah.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
