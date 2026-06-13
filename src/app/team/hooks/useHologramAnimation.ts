import { useState, useEffect } from "react";

export type HologramPhase = "idle" | "projecting" | "materializing" | "revealed";

export function useHologramAnimation(active: boolean) {
  const [phase, setPhase] = useState<HologramPhase>("idle");

  useEffect(() => {
    if (!active) {
      const tIdle = setTimeout(() => {
        setPhase("idle");
      }, 0);
      return () => clearTimeout(tIdle);
    }

    const tProj = setTimeout(() => {
      setPhase("projecting");
    }, 0);

    const t1 = setTimeout(() => {
      setPhase("materializing");
    }, 150);

    const t2 = setTimeout(() => {
      setPhase("revealed");
    }, 400);

    return () => {
      clearTimeout(tProj);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active]);

  return phase;
}
