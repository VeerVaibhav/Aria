"use client";

import { useEffect, useState } from "react";

/** Tracks the GIGW high-contrast state (html.high-contrast) for chart palettes. */
export function useHighContrast(): boolean {
  const [hc, setHc] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const update = () => setHc(el.classList.contains("high-contrast"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return hc;
}

/** Chart palette that works on both the standard slate and the inverted HC ground. */
export function chartPalette(hc: boolean) {
  return hc
    ? {
        primary: "#FFE600",
        secondary: "#FFFFFF",
        grid: "#666666",
        tick: "#FFFFFF",
        dashedRef: "#FFFFFF",
      }
    : {
        primary: "#0B3C5D",
        secondary: "#FF9933",
        grid: "#e2e8f0",
        tick: "#475569",
        dashedRef: "#94a3b8",
      };
}
