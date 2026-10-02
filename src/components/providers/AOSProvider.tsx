"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export function AOSProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    AOS.init({
      duration: 450,
      easing: "ease-out-cubic",
      once: true,
      offset: 40,
      delay: 0,
    });
  }, []);

  return <>{children}</>;
}
