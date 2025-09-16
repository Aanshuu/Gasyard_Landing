"use client";

import { useEffect, useRef } from "react";

type RadarCanvasProps = {
  dotSize?: number; // pixel size of each dot (before DPR scaling)
  grid?: number; // grid spacing in CSS pixels
  ringThickness?: number; // thickness of the ring in pixels
  speed?: number; // radians per second
  wedgeWidth?: number; // radians
  running?: boolean; // if false, renders a static frame
  sweepWedge?: boolean; // if true, brighten dots under the sweeping wedge
  showHand?: boolean; // if true, draw a straight hand made of bright dots
  handWidthPx?: number; // constant hand thickness in pixels
  animateRing?: boolean; // if true, ring brightness sweeps around
  centerDot?: boolean; // if true, keep the exact center dot bright
  ringRadiusPx?: number; // optional custom ring radius in CSS pixels
  centerDotRadiusPx?: number; // radius of the center bright area in CSS pixels
  ringWave?: boolean; // if true, animate ring brightness as a clockwise traveling wave
  ringWaveBase?: number; // baseline alpha for ring when ringWave is on (0..1)
  ringWaveBoost?: number; // additional alpha added by wave (0..1)
  ringWaveSpeed?: number; // radians per second for ring/grid wave; defaults to 'speed'
  gridWave?: boolean; // if true, slightly modulate background dots as a wave
  gridWaveAmp?: number; // amplitude for background wave alpha
  respectReducedMotion?: boolean; // if true, honors prefers-reduced-motion
  brightnessScale?: number; // scales final alpha for all squares (0..n)
};

/**
 * Canvas-based radar made of a dotted grid with a bright ring and a sweeping hand.
 * Optimized by precomputing dot positions on resize and only updating alpha per frame.
 */
export default function RadarCanvas({
  dotSize = 2.2,
  grid = 10,
  ringThickness = 10,
  speed = Math.PI / 6, // one rotation ~12s
  wedgeWidth = Math.PI / 10,
  running = true,
  sweepWedge = false,
  showHand = true,
  handWidthPx = 6,
  animateRing = false,
  centerDot = false,
  ringRadiusPx,
  centerDotRadiusPx,
  ringWave = false,
  ringWaveBase = 0.35,
  ringWaveBoost = 0.65,
  gridWave = false,
  gridWaveAmp = 0.06,
  ringWaveSpeed = speed,
  respectReducedMotion = true,
  brightnessScale = 1,
}: RadarCanvasProps) {
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

    // precomputed grid positions in device pixels
    let dots: { x: number; y: number }[] = [];
    let width = 0;
    let height = 0;
    let cx = 0;
    let cy = 0;
    let R = 0; // ring radius in device pixels

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

      // Leave a margin so the ring doesn't clip
      const margin = 16 * dpr;
      R = Math.min(width, height) / 2 - margin;

      dots = [];
      const g = grid * dpr; // grid in device pixels
      // Choose offsets so the grid includes the exact canvas center
      const xOffset = ((cx % g) + g) % g;
      const yOffset = ((cy % g) + g) % g;
      for (let y = yOffset; y < height; y += g) {
        for (let x = xOffset; x < width; x += g) {
          dots.push({ x, y });
        }
      }
    };

    const clear = () => {
      ctx.clearRect(0, 0, width, height);
    };

    const drawFrame = (t: number) => {
      clear();

      const timeSec = t / 1000;
      const angle = (timeSec * speed) % (Math.PI * 2);
      const ringT = ringThickness * dpr;
      const wedgeHalf = wedgeWidth / 2;
      const ux = Math.cos(angle);
      const uy = Math.sin(angle);
      const gs = grid * dpr; // grid spacing in device pixels
      const Rdraw = ringRadiusPx ? Math.min(R, ringRadiusPx * dpr) : R; // actual ring radius to use

      // background dim level for dots not near ring or wedge
      const baseAlpha = 0.12;
      const ringAlphaConst = 1.0;
      const wedgeAlpha = 0.85;

      ctx.fillStyle = "#FFFFFF";

      for (let i = 0; i < dots.length; i++) {
        const { x, y } = dots[i];
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.hypot(dx, dy);

        // Draw all dots to cover the entire square background (no skipping)

        // Angle from center
        const phi = Math.atan2(dy, dx);
        const dAng = Math.abs(angularDiff(phi, angle));

        // Base alpha with optional background wave modulation (angular)
        let a = baseAlpha;
        if (gridWave) {
          const bgPhase = timeSec * ringWaveSpeed;
          const bgWave = Math.cos(phi - bgPhase); // -1..1, clockwise
          a = clamp01(baseAlpha + gridWaveAmp * bgWave);
        }

        // Outer ring highlight (constant, wave, or animated wedge)
        if (Math.abs(dist - Rdraw) <= ringT) {
          if (ringWave) {
            // Cosine wave around the ring; phase increases clockwise
            const phase = timeSec * ringWaveSpeed; // rad/s
            const wave = 0.5 + 0.5 * Math.cos(phi - phase); // clockwise motion
            const waveAlpha = clamp01(ringWaveBase + ringWaveBoost * wave);
            a = Math.max(a, waveAlpha);
          } else if (animateRing) {
            const falloff = Math.max(0, 1 - dAng / wedgeHalf); // 1 at sweep center -> 0 at wedge edge
            a = Math.min(1, 0.85 + 0.18 * falloff);
          } else {
            a = ringAlphaConst;
          }
        }

        // Center ring disabled to avoid a gap-looking artifact
        // Optional bright center dot
        if (centerDot) {
          const gs = grid * dpr;
          const cR = centerDotRadiusPx ? centerDotRadiusPx * dpr : gs * 0.45;
          if (dist <= cR) {
            a = Math.max(a, 1);
          }
        }

        // Sweeping wedge (optional legacy effect)
        if (sweepWedge && dAng <= wedgeHalf && dist < Rdraw - ringT) {
          // Falloff as we move away from the sweep center angle
          const falloff = 1 - dAng / wedgeHalf; // 1..0
          a = Math.max(a, wedgeAlpha * (0.6 + 0.4 * falloff));
        }

        // Straight hand made of dots (constant thickness in pixels)
        if (showHand && running) {
          // Perpendicular distance from point to the ray at 'angle'
          const perp = Math.abs(dx * uy - dy * ux); // since (ux,uy) is unit length
          const along = dx * ux + dy * uy; // only forward from center
          // allow a small negative tolerance so there's no gap at the exact center
          if (along >= -gs * 0.5 && dist <= Rdraw) {
            const handPx = handWidthPx * dpr;
            if (perp <= handPx) {
              a = Math.max(a, 0.95);
            }
          }
        }

        // Apply global brightness scaling
        a = clamp01(a * brightnessScale);

        if (a <= 0.01) continue;

        // draw square dot centered on the grid point
        const size = dotSize * dpr;
        ctx.globalAlpha = a;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
      }

      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      drawFrame(t);
      rafRef.current = requestAnimationFrame(loop);
    };

    // Build grid initially and on resize
    buildGrid();

    if ((respectReducedMotion && prefersReduced) || !running) {
      // Draw a static frame and still observe resize for proper layout
      drawFrame(0);
      if (typeof ResizeObserver !== "undefined") {
        roRef.current = new ResizeObserver(() => {
          buildGrid();
          drawFrame(0);
        });
        if (canvas.parentElement) roRef.current.observe(canvas.parentElement);
      }
      return;
    }

    rafRef.current = requestAnimationFrame(loop);

    // Observe size changes of parent
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
  }, [dotSize, grid, ringThickness, speed, wedgeWidth, running, sweepWedge, showHand, handWidthPx, animateRing, centerDot, ringRadiusPx, centerDotRadiusPx, ringWave, ringWaveBase, ringWaveBoost, gridWave, gridWaveAmp, ringWaveSpeed, respectReducedMotion, brightnessScale]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 block" aria-hidden />
  );
}

function angularDiff(a: number, b: number) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function clamp01(x: number) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
