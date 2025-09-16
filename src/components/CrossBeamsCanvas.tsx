"use client";

import { useEffect, useRef } from "react";

type CrossBeamsCanvasProps = {
  dotSize?: number; // pixel size before DPR
  grid?: number; // grid spacing in CSS px
  baseAlpha?: number; // background dot alpha
  // Beam controls
  beamMaxWidthPx?: number; // maximum half-width at the base (near square edge)
  beamLengthPx?: number; // how far the wedge may extend
  tailPx?: number; // bright segment length behind the moving front
  speed?: number; // pixels per second front moves from square outward
  // Core geometry
  coreHalfPx?: number; // half-size of bright central square (Chebyshev radius)
  holeRadiusPx?: number; // radius of circular hole at center (0 to disable)
  running?: boolean; // stop/start animation
};

/**
 * Four cardinal beams emanating from the center over a dotted grid.
 * The center dot stays bright, and bright segments sweep outward along +X, -X, +Y, -Y.
 */
export default function CrossBeamsCanvas({
  dotSize = 2,
  grid = 6,
  baseAlpha = 0.12,
  beamMaxWidthPx = 24,
  beamLengthPx = 220,
  tailPx = 120,
  speed = 90,
  coreHalfPx = 3 * 6, // ~3 grid units at default
  holeRadiusPx = 0, // 0 -> no hole
  running = true,
}: CrossBeamsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let dpr = Math.max(1, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);

    let dots: { x: number; y: number }[] = [];
    let width = 0;
    let height = 0;
    let cx = 0;
    let cy = 0;
    let R = 0; // usable radius

    const buildGrid = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w === 0 || h === 0) return;

      dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      width = canvas.width;
      height = canvas.height;
      cx = width / 2;
      cy = height / 2;

      const margin = 16 * dpr;
      R = Math.min(width, height) / 2 - margin;

      dots = [];
      const g = grid * dpr;
      // Align grid so a dot sits at the exact center
      const xOffset = ((cx % g) + g) % g;
      const yOffset = ((cy % g) + g) % g;
      for (let y = yOffset; y < height; y += g) {
        for (let x = xOffset; x < width; x += g) {
          dots.push({ x, y });
        }
      }
    };

    const clear = () => ctx.clearRect(0, 0, width, height);

    const drawFrame = (t: number) => {
      clear();

      const timeSec = t / 1000;
      const v = speed * dpr; // px/s in device space
      const tail = Math.max(10, tailPx * dpr);
      const front = running ? (v * timeSec) % (R + tail) : tail; // travel distance from the square edge

      // Geometry in device pixels
      const g = grid * dpr;
      const half = Math.max(g * 2, coreHalfPx * (dpr / 1)); // ensure at least ~2 grid cells
      const holeR = Math.max(0, holeRadiusPx * dpr);
      const maxW = Math.max(g, beamMaxWidthPx * dpr);
      const beamLen = Math.max(g * 4, beamLengthPx * dpr);

      ctx.fillStyle = "#FFFFFF";

      for (let i = 0; i < dots.length; i++) {
        const { x, y } = dots[i];
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.hypot(dx, dy);

        let a = baseAlpha;

        // Center/circle: brighten the circular hole area, keep rest dim
        if (holeR > 0) {
          if (dist <= holeR) {
            a = 1;
          }
        } else {
          // fallback when no hole configured: keep just the exact center dot bright
          if (dist <= g * 0.45) a = 1;
        }

        // Central square area intentionally left dim (no extra brighten)
        // const linf = Math.max(Math.abs(dx), Math.abs(dy));
        // if (linf <= half) { /* stay at baseAlpha */ }

        // Four tapering arms (mountain-like wedges) starting at the square edges
        // East (right) arm
        const alongE = dx - half; // 0 at square edge, grows outward
        const perpE = Math.abs(dy);
        if (alongE >= 0 && alongE <= beamLen) {
          const t = 1 - alongE / beamLen; // 1 -> 0
          const allowed = maxW * t; // taper width
          if (perpE <= allowed) {
            // optional moving front brightness
            const dseg = front - alongE;
            if (dseg >= 0 && dseg <= tail) {
              const seg = 1 - dseg / tail;
              a = Math.max(a, 0.6 + 0.4 * seg);
            } else {
              a = Math.max(a, 0.6 * t + 0.2); // static base
            }
          }
        }

        // West (left) arm
        const alongW = -dx - half;
        const perpW = Math.abs(dy);
        if (alongW >= 0 && alongW <= beamLen) {
          const t = 1 - alongW / beamLen;
          const allowed = maxW * t;
          if (perpW <= allowed) {
            const dseg = front - alongW;
            if (dseg >= 0 && dseg <= tail) {
              const seg = 1 - dseg / tail;
              a = Math.max(a, 0.6 + 0.4 * seg);
            } else {
              a = Math.max(a, 0.6 * t + 0.2);
            }
          }
        }

        // North (up) arm
        const alongN = -dy - half;
        const perpN = Math.abs(dx);
        if (alongN >= 0 && alongN <= beamLen) {
          const t = 1 - alongN / beamLen;
          const allowed = maxW * t;
          if (perpN <= allowed) {
            const dseg = front - alongN;
            if (dseg >= 0 && dseg <= tail) {
              const seg = 1 - dseg / tail;
              a = Math.max(a, 0.6 + 0.4 * seg);
            } else {
              a = Math.max(a, 0.6 * t + 0.2);
            }
          }
        }

        // South (down) arm
        const alongS = dy - half;
        const perpS = Math.abs(dx);
        if (alongS >= 0 && alongS <= beamLen) {
          const t = 1 - alongS / beamLen;
          const allowed = maxW * t;
          if (perpS <= allowed) {
            const dseg = front - alongS;
            if (dseg >= 0 && dseg <= tail) {
              const seg = 1 - dseg / tail;
              a = Math.max(a, 0.6 + 0.4 * seg);
            } else {
              a = Math.max(a, 0.6 * t + 0.2);
            }
          }
        }

        if (a <= 0.01) continue;
        const size = dotSize * dpr;
        ctx.globalAlpha = a;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
      }

      ctx.globalAlpha = 1;
    };

    buildGrid();

    if (prefersReduced || !running) {
      drawFrame(0);
      // still observe resize to keep static frame correct
      if (typeof ResizeObserver !== "undefined") {
        roRef.current = new ResizeObserver(() => {
          buildGrid();
          drawFrame(0);
        });
        if (canvas.parentElement) roRef.current.observe(canvas.parentElement);
      }
      return;
    }

    const loop = (t: number) => {
      drawFrame(t);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    if (typeof ResizeObserver !== "undefined") {
      roRef.current = new ResizeObserver(() => {
        buildGrid();
      });
      if (canvas.parentElement) roRef.current.observe(canvas.parentElement);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (roRef.current && canvas.parentElement) roRef.current.unobserve(canvas.parentElement);
    };
  }, [dotSize, grid, baseAlpha, beamMaxWidthPx, beamLengthPx, tailPx, speed, coreHalfPx, holeRadiusPx, running]);

  return <canvas ref={canvasRef} className="absolute inset-0 block" aria-hidden />;
}
