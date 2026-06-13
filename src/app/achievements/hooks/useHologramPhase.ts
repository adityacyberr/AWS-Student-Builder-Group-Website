import { useState, useEffect } from "react";

export type HologramPhase = "idle" | "projecting" | "materializing" | "revealed";

export function useHologramPhase(active: boolean) {
  const [phase, setPhase] = useState<HologramPhase>("idle");

  useEffect(() => {
    if (!active) {
      const timer1 = setTimeout(() => {
        setPhase("idle");
      }, 0);
      return () => clearTimeout(timer1);
    }

    const timer1 = setTimeout(() => {
      setPhase("projecting");
    }, 0);

    const timer2 = setTimeout(() => {
      setPhase("materializing");
    }, 120);

    const timer3 = setTimeout(() => {
      setPhase("revealed");
    }, 380);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [active]);

  return phase;
}
