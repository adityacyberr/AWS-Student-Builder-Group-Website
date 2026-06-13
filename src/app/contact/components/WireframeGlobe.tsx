import { useEffect, useRef } from "react";

export function WireframeGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let rotationY = 0;

    // Fixed internal coordinates size
    const size = 560;
    canvas.width = size;
    canvas.height = size;

    const points: { x: number; y: number; z: number }[] = [];
    const rings = 14;
    const pointsPerRing = 20;
    const radius = 240;

    // Generate sphere points
    for (let i = 0; i < rings; i++) {
      const phi = (Math.PI * i) / (rings - 1);
      for (let j = 0; j < pointsPerRing; j++) {
        const theta = (2 * Math.PI * j) / pointsPerRing;
        points.push({
          x: radius * Math.sin(phi) * Math.cos(theta),
          y: radius * Math.cos(phi),
          z: radius * Math.sin(phi) * Math.sin(theta),
        });
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      
      const cosRY = Math.cos(rotationY);
      const sinRY = Math.sin(rotationY);

      // Rotate and project points
      const projected: { x: number; y: number; z: number }[] = [];
      points.forEach((p) => {
        // Rotate around Y
        const rotX = p.x * cosRY - p.z * sinRY;
        const rotZ = p.x * sinRY + p.z * cosRY;
        
        // Perspective projection
        const distance = 420;
        const scale = distance / (distance + rotZ);
        const projX = rotX * scale + size / 2;
        const projY = p.y * scale + size / 2;
        projected.push({ x: projX, y: projY, z: rotZ });
      });

      // Draw connections (latitudes)
      ctx.strokeStyle = "rgba(255, 140, 0, 0.05)";
      ctx.lineWidth = 0.8;
      for (let i = 0; i < rings; i++) {
        ctx.beginPath();
        for (let j = 0; j < pointsPerRing; j++) {
          const idx = i * pointsPerRing + j;
          const p = projected[idx];
          if (j === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Draw connections (longitudes)
      for (let j = 0; j < pointsPerRing; j++) {
        ctx.beginPath();
        for (let i = 0; i < rings; i++) {
          const idx = i * pointsPerRing + j;
          const p = projected[idx];
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // Draw glowing nodes at junctions
      projected.forEach((p) => {
        const opacity = p.z < 0 ? 0.3 : 0.06;
        ctx.fillStyle = `rgba(255, 140, 0, ${opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.z < 0 ? 1.8 : 1.0, 0, 2 * Math.PI);
        ctx.fill();
      });

      rotationY += 0.0012; // slow cinematic rotation
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute right-0 top-1/2 -translate-y-[45%] w-[560px] h-[560px] pointer-events-none select-none opacity-40 lg:opacity-60 translate-x-[42%] z-0"
      style={{ transformStyle: "preserve-3d" }}
    />
  );
}
