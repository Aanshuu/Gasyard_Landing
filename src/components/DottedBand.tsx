"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

export interface DottedBandProps {
  className?: string;
  twinkle?: boolean;
  height?: number | string;
  /** Height to use on small screens (<sm). If provided with heightDesktop, component will switch between them. */
  heightMobile?: number | string;
  /** Height to use on >= sm screens. If provided with heightMobile, component will switch between them. */
  heightDesktop?: number | string;
  opacity?: number;
  svgPath?: string;
  mode?: "grid" | "svg";
  cell?: number;
  dotSize?: number;
  /** Percent fade at top and bottom edges for smooth stacking (0-49). */
  edgeFadePct?: number;
  /** Apply an opposite skew on the inner drawing surface to neutralize parent skew for crisp squares. */
  counterSkewXDeg?: number;
  /** Whether to run the canvas render loop (for subtle background panning) */
  running?: boolean;
  /** Horizontal panning speed in CSS px/sec (positive => right) */
  scrollSpeedX?: number;
  /** Vertical panning speed in CSS px/sec (positive => down) */
  scrollSpeedY?: number;
  /** Number of pre-generated twinkle frames to cycle through when twinkle is true */
  twinklePatterns?: number;
  /** Frames per second for twinkle frame stepping */
  twinkleFps?: number;
  /** How strongly the pattern modulates base alpha (0..1) */
  twinkleDepth?: number;
}

export const DottedBand: React.FC<DottedBandProps> = ({
  className,
  twinkle,
  height = 192,
  heightMobile,
  heightDesktop,
  opacity = 0.35,
  // legacy, unused but kept for API compatibility
  svgPath: _svgPath,
  mode: _mode,
  cell = 12,
  dotSize = 4,
  edgeFadePct = 12,
  counterSkewXDeg = 0,
  running = false,
  scrollSpeedX = -20,
  scrollSpeedY = 0,
  twinklePatterns = 4,
  twinkleFps = 1,
  twinkleDepth = 0.6,
}) => {
  const [isDesktop, setIsDesktop] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia && window.matchMedia("(min-width: 640px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(min-width: 640px)");
    const onChange = () => setIsDesktop(mq.matches);
    if (typeof mq.addEventListener === "function") mq.addEventListener("change", onChange);
    else (mq as any).addListener?.(onChange);
    onChange();
    return () => {
      if (typeof mq.removeEventListener === "function") mq.removeEventListener("change", onChange);
      else (mq as any).removeListener?.(onChange);
    };
  }, []);

  const heightPx = useMemo(() => {
    const pick = (val: number | string | undefined) => {
      if (typeof val === "number") return val;
      const parsed = parseInt(String(val), 10);
      return Number.isFinite(parsed) ? parsed : undefined;
    };
    const chosen = isDesktop ? pick(heightDesktop) ?? pick(height) : pick(heightMobile) ?? pick(height);
    return chosen ?? 192;
  }, [height, heightMobile, heightDesktop, isDesktop]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const framesRef = useRef<number[][]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Device pixel ratio for crisp rendering
    let dpr = Math.max(1, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);

    // Precomputed grid
    let width = 0;
    let heightDev = 0;
    let dots: {
      x: number;
      y: number;
      base: number; // base alpha
      amp: number; // twinkle amplitude
      w: number; // angular frequency (rad/s)
      phase: number; // phase offset (rad)
      size: number; // device px
    }[] = [];

    const rand01 = (seed: number) => {
      const x = Math.sin(seed * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

    const build = () => {
      const wCssBase = container.clientWidth;
      const hCss = heightPx; // fixed band height in CSS px
      if (wCssBase === 0 || hCss === 0) return;

      // Expand drawing width so skewed parents do not leave empty triangular corners.
      const theta = Math.abs(counterSkewXDeg) * (Math.PI / 180);
      const extraX = Math.tan(theta) * hCss; // css px to add horizontally
      const wCss = wCssBase + (Number.isFinite(extraX) ? extraX : 0);

      dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(wCss * dpr);
      canvas.height = Math.floor(hCss * dpr);
      canvas.style.width = `${wCss}px`;
      canvas.style.height = `${hCss}px`;

      width = canvas.width;
      heightDev = canvas.height;

      // Build grid points centered within cells, with 1-cell margin around to cover panning
      dots = [];
      const g = cell * dpr;
      const size = Math.max(1, dotSize * dpr);
      // Start from edges with an extra cell margin so panning doesn't create gaps
      const xOffset = Math.max(size / 2, 0) - g;
      const yOffset = Math.max(size / 2, 0) - g;

      let row = 0;
      for (let y = yOffset; y < heightDev + g; y += g) {
        let col = 0;
        for (let x = xOffset; x < width + g; x += g) {
          // deterministic per-cell seeds for predictable twinkle
          const r1 = rand01(row * 92821 + col * 68927 + 101);

          const base = 0.18 + r1 * 0.62; // 0.18..0.8
          const peak = Math.min(1, base + 0.4);
          const amp = Math.max(0, peak - base);

          // store dummy w/phase for backward compat (unused in frame-based twinkle)
          const w = 0;
          const phase = 0;
          dots.push({ x, y, base, amp, w, phase, size });
          col++;
        }
        row++;
      }

      // Pre-generate twinkle frames (N patterns), deterministic from grid indices and frame index
      framesRef.current = [];
      const N = Math.max(1, Math.floor(twinklePatterns));
      const depth = clamp01(twinkleDepth);
      const total = dots.length;
      for (let f = 0; f < N; f++) {
        const frame: number[] = new Array(total);
        let idx = 0;
        row = 0;
        for (let y = yOffset; y < heightDev + g; y += g) {
          let col = 0;
          for (let x = xOffset; x < width + g; x += g) {
            const r = rand01(row * 104729 + col * 13007 + (f + 1) * 7919);
            // shape the distribution so some dots spike higher; bias ~smooth
            const shaped = Math.pow(r, 1.6); // 0..1, concentrates near 0
            frame[idx++] = clamp01(1 - depth + depth * (0.4 + 0.6 * shaped));
            col++;
          }
          row++;
        }
        framesRef.current.push(frame);
      }
    };

    const clear = () => ctx.clearRect(0, 0, width, heightDev);

    const drawFrame = (t: number) => {
      clear();
      const timeSec = t / 1000;
      ctx.fillStyle = "#FFFFFF";

      // Subtle background movement even when twinkle is off
      const g = cell * dpr;
      const vX = scrollSpeedX * dpr;
      const vY = scrollSpeedY * dpr;
      // wrap to [0,g)
      const panX = ((timeSec * vX) % g + g) % g;
      const panY = ((timeSec * vY) % g + g) % g;

      const useFrames = twinkle && !prefersReduced && framesRef.current.length > 0;
      const frameIdx = useFrames ? Math.floor(timeSec * Math.max(0.1, twinkleFps)) % framesRef.current.length : 0;
      const frame = useFrames ? framesRef.current[frameIdx] : undefined;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        let a = d.base;
        if (useFrames && frame) {
          const m = frame[i]; // 0..1 multiplier
          a = clamp01(d.base * m + d.amp * (m - 1 + 1)); // bias toward base with multiplier
        }
        if (a <= 0.01) continue;
        ctx.globalAlpha = a;
        const x = d.x + panX;
        const y = d.y + panY;
        ctx.fillRect(x - d.size / 2, y - d.size / 2, d.size, d.size);
      }

      ctx.globalAlpha = 1;
    };

    // Initial build and optional animation
    build();

    if (prefersReduced || (!twinkle && !running)) {
      drawFrame(0);
      if (typeof ResizeObserver !== "undefined") {
        roRef.current = new ResizeObserver(() => {
          build();
          drawFrame(0);
        });
        roRef.current.observe(container);
      }
      return () => {
        if (roRef.current) roRef.current.disconnect();
      };
    }

    const loop = (t: number) => {
      drawFrame(t);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    if (typeof ResizeObserver !== "undefined") {
      roRef.current = new ResizeObserver(() => {
        build();
      });
      roRef.current.observe(container);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (roRef.current) roRef.current.disconnect();
    };
  }, [heightPx, cell, dotSize, twinkle, twinklePatterns, twinkleFps, twinkleDepth, running, scrollSpeedX, scrollSpeedY, counterSkewXDeg]);

  const fade = Math.max(0, Math.min(49, edgeFadePct));

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute inset-x-0 flex justify-center overflow-hidden",
        className
      )}
      aria-hidden
    >
      <div
        className="w-full transition-opacity duration-500"
        style={{
          height: heightPx,
          opacity,
          WebkitMaskImage: `linear-gradient(to bottom, transparent, black ${fade}%, black ${100 - fade}%, transparent)`,
          maskImage: `linear-gradient(to bottom, transparent, black ${fade}%, black ${100 - fade}%, transparent)`,
        }}
      >
        <div className="relative h-full w-full">
          <div
            className="absolute top-0 bottom-0"
            style={{
              // Expand and center the inner drawing area horizontally so the skewed parent has no empty corners
              width: `calc(100% + ${Math.tan(Math.abs(counterSkewXDeg) * Math.PI / 180) * heightPx}px)`,
              left: `calc(-${Math.tan(Math.abs(counterSkewXDeg) * Math.PI / 180) * heightPx / 2}px)`,
              transform: counterSkewXDeg ? `skewX(${counterSkewXDeg}deg)` : undefined,
              transformOrigin: "center",
            }}
          >
            <canvas ref={canvasRef} className="absolute inset-0 block" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DottedBand;
