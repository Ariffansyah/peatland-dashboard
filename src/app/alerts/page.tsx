import type { Metadata } from "next";
import { AlertsClient } from "@/components/alerts/AlertsClient";

export const metadata: Metadata = {
  title: "Alerts",
  description: "Pusat peringatan dini perubahan status kerawanan lahan gambut — riwayat Siaga dan Awas.",
};

export default function AlertsPage() {
  return <AlertsClient />;
}
