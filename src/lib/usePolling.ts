import { useEffect, useEffectEvent } from "react";

const REFRESH_INTERVAL_MS = 5_000;

// Jalankan refresh berkala selama tab terlihat. Poll yang gagal diabaikan:
// data terakhir tetap tampil dan tick berikutnya mencoba lagi.
// ponytail: polling /api/readings; ganti ke Supabase Realtime (subscribe INSERT sensor_logs) bila butuh push instan.
export function usePolling(refresh: () => Promise<unknown>) {
  const tick = useEffectEvent(refresh);
  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) tick().catch(() => {});
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
}
