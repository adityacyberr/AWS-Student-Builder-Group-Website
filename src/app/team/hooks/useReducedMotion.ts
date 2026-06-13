import { useState, useEffect } from "react";

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    
    const timeoutId = setTimeout(() => {
      setReducedMotion(mediaQuery.matches);
    }, 0);

    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    
    return () => {
      clearTimeout(timeoutId);
      mediaQuery.removeEventListener("change", listener);
    };
  }, []);

  return reducedMotion;
}
