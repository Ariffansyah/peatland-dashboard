import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Izinkan origin Vercel untuk Server Actions dan Dev Origins
  experimental: {
    serverActions: {
      allowedOrigins: ["peatland-dashboard.vercel.app", "https://peatland-dashboard.vercel.app"],
    },
  },
  allowedDevOrigins: ["peatland-dashboard.vercel.app"],

  // URL aplikasi
  env: {
    NEXT_PUBLIC_APP_URL: "https://peatland-dashboard.vercel.app",
    NEXT_PUBLIC_SITE_URL: "https://peatland-dashboard.vercel.app",
  },

  // Rewrite /webhook langsung ke /api/webhook jika MQTT/EMQX menembak URL /webhook
  async rewrites() {
    return [
      {
        source: "/webhook",
        destination: "/api/webhook",
      },
    ];
  },

  // CORS headers agar API dapat menerima request dari MQTT broker / HTTP Action / Webhook
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-webhook-secret, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
