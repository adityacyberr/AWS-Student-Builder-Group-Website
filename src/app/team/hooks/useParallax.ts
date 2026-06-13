import { useSpring, useTransform, MotionValue } from "framer-motion";

export function useParallax(x: MotionValue<number>, y: MotionValue<number>) {
  const springConfig = { damping: 30, stiffness: 120 };

  const rotateX = useSpring(useTransform(y, [-400, 400], [2, -2]), springConfig);
  const rotateY = useSpring(useTransform(x, [-400, 400], [-2, 2]), springConfig);

  const avatarX = useSpring(useTransform(x, [-400, 400], [-3, 3]), springConfig);
  const avatarY = useSpring(useTransform(y, [-400, 400], [-3, 3]), springConfig);

  const shadowX = useSpring(useTransform(x, [-400, 400], [-5, 5]), springConfig);
  const shadowY = useSpring(useTransform(y, [-400, 400], [15, 25]), springConfig);

  return {
    rotateX,
    rotateY,
    avatarX,
    avatarY,
    shadowX,
    shadowY,
  };
}
