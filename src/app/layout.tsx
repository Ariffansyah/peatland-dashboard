import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AOSProvider } from "@/components/providers/AOSProvider";

export const metadata: Metadata = {
  title: {
    template: "%s | Peatland IoT Analytics",
    default: "Peatland IoT Analytics",
  },
  description:
    "Sistem pemantauan hidrologi lahan gambut secara real-time. Visualisasi Indeks Kerawanan Gambut, Tinggi Muka Air, dan Kelembaban Tanah untuk peringatan dini kebakaran.",
  keywords: ["lahan gambut", "IoT", "monitoring", "hidrologi", "kerawanan gambut", "TMA", "kelembaban"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Anti-flash: terapkan tema sebelum render pertama */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('peatland-theme');
                  var preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var theme = saved || preferred;
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AOSProvider>
            <AppLayout>{children}</AppLayout>
          </AOSProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
