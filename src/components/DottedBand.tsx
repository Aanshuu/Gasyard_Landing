"use client";

import React, { useEffect, useMemo, useRef, useState, useId } from "react";
import { cn } from "@/lib/utils";

export interface DottedBandProps {
  className?: string;
  twinkle?: boolean;
  height?: number | string;
  opacity?: number;
  svgPath?: string;
  mode?: "grid" | "svg";
  cell?: number;
  dotSize?: number;
  /** Percent fade at top and bottom edges for smooth stacking (0-49). */
  edgeFadePct?: number;
}

export const DottedBand: React.FC<DottedBandProps> = ({
  className,
  twinkle,
  height = 192,
  opacity = 0.35,
  svgPath,
  mode = "grid",
  cell = 12,
  dotSize = 4,
  edgeFadePct = 12,
}) => {
  const heightPx = useMemo(() => {
    if (typeof height === "number") return height;
    const parsed = parseInt(String(height), 10);
    return Number.isFinite(parsed) ? parsed : 192;
  }, [height]);

  const rand01 = (seed: number) => {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [cols, setCols] = useState(0);
  const rows = Math.max(1, Math.ceil(heightPx / cell));
  const clipId = useId();

  useEffect(() => {
    const node = containerRef.current;
    const compute = (width: number) => {
      setCols(Math.max(1, Math.floor(width / cell)));
    };

    const initialWidth =
      (node?.clientWidth ?? document.documentElement.clientWidth ?? window.innerWidth) || 0;
    compute(initialWidth);

    let ro: ResizeObserver | null = null;
    if (node && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = entry.contentRect?.width || node.clientWidth;
          compute(w);
        }
      });
      ro.observe(node);
    } else {
      const onResize = () => compute(window.innerWidth || document.documentElement.clientWidth);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    return () => {
      if (ro && node) ro.disconnect();
    };
  }, [cell]);

  const dots = useMemo(() => cols * rows, [cols, rows]);
  const gap = Math.max(0, (cell - dotSize) / 2);
  const fade = Math.max(0, Math.min(49, edgeFadePct));
  const vbWidth = cols * cell;
  const vbHeight = rows * cell;

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
        className="w-full"
        style={{
          height: heightPx,
          opacity,
          WebkitMaskImage:
            `linear-gradient(to bottom, transparent, black ${fade}%, black ${100 - fade}%, transparent)`,
          maskImage:
            `linear-gradient(to bottom, transparent, black ${fade}%, black ${100 - fade}%, transparent)`,
        }}
      >
        {mode === "grid" ? (
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
              gridAutoRows: `${cell}px`,
            }}
          >
            {Array.from({ length: dots }).map((_, i) => {
              const rowIndex = Math.floor(i / (cols || 1));
              const colIndex = i % (cols || 1);

              const r1 = rand01(rowIndex * 92821 + colIndex * 68927 + 101);
              const r2 = rand01(rowIndex * 131 + colIndex * 173 + 202);
              const r3 = rand01(rowIndex * 1973 + colIndex * 2713 + 303);
              const r4 = rand01(rowIndex * 3571 + colIndex * 4159 + 404);

              const baseOpacity = 0.18 + r1 * 0.62;
              const duration = 1.6 + r2 * 1.0;
              const phaseOffset = -r3 * duration;

              const easingIndex = Math.floor(r4 * 5);
              const easing =
                easingIndex === 0
                  ? "ease-in-out"
                  : easingIndex === 1
                  ? "cubic-bezier(0.42,0,0.58,1)"
                  : easingIndex === 2
                  ? "cubic-bezier(0.3,0.0,0.7,1)"
                  : easingIndex === 3
                  ? "cubic-bezier(0.2,0.0,0.8,1)"
                  : "ease";

              return (
                <span
                  key={i}
                  data-twinkle={twinkle ? "true" : "false"}
                  style={{
                    width: dotSize,
                    height: dotSize,
                    backgroundColor: "hsla(0, 0%, 100%, 1)",
                    opacity: baseOpacity,
                    margin: `${gap}px`,
                    animation: twinkle
                      ? `twinkle var(--tw-duration, ${duration}s) var(--tw-easing, ${easing}) var(--tw-delay, ${phaseOffset}s) infinite alternate`
                      : undefined,
                    display: "block",
                    borderRadius: 1,
                    willChange: twinkle ? "opacity" : undefined,
                    ["--tw-base" as any]: baseOpacity,
                    ["--tw-peak" as any]: Math.min(1, baseOpacity + 0.4),
                    ["--tw-duration" as any]: `${duration}s`,
                    ["--tw-delay" as any]: `${phaseOffset}s`,
                    ["--tw-easing" as any]: easing,
                  }}
                />
              );
            })}
          </div>
        ) : (
          <svg
            width="100%"
            height={heightPx}
            viewBox={`0 0 ${Math.max(1, vbWidth)} ${Math.max(1, vbHeight)}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            {svgPath ? (
              <defs>
                <clipPath id={`path-clip-${clipId}`}>
                  <path d={svgPath} />
                </clipPath>
              </defs>
            ) : null}
            <g clipPath={svgPath ? `url(#path-clip-${clipId})` : undefined}>
              {Array.from({ length: dots }).map((_, i) => {
                const rowIndex = Math.floor(i / (cols || 1));
                const colIndex = i % (cols || 1);

                const cx = colIndex * cell + cell / 2;
                const cy = rowIndex * cell + cell / 2;
                const r1 = rand01(rowIndex * 92821 + colIndex * 68927 + 101);
                const r2 = rand01(rowIndex * 131 + colIndex * 173 + 202);
                const r3 = rand01(rowIndex * 1973 + colIndex * 2713 + 303);
                const r4 = rand01(rowIndex * 3571 + colIndex * 4159 + 404);

                const baseOpacity = 0.18 + r1 * 0.62;
                const duration = 1.6 + r2 * 1.0;
                const phaseOffset = -r3 * duration;
                const easingIndex = Math.floor(r4 * 5);
                const easing =
                  easingIndex === 0
                    ? "ease-in-out"
                    : easingIndex === 1
                    ? "cubic-bezier(0.42,0,0.58,1)"
                    : easingIndex === 2
                    ? "cubic-bezier(0.3,0.0,0.7,1)"
                    : easingIndex === 3
                    ? "cubic-bezier(0.2,0.0,0.8,1)"
                    : "ease";

                return (
                  <circle
                    key={i}
                    data-twinkle={twinkle ? "true" : "false"}
                    cx={cx}
                    cy={cy}
                    r={dotSize / 2}
                    fill="white"
                    style={{
                      opacity: baseOpacity,
                      animation: twinkle
                        ? `twinkle var(--tw-duration, ${duration}s) var(--tw-easing, ${easing}) var(--tw-delay, ${phaseOffset}s) infinite alternate`
                        : undefined,
                      ["--tw-base" as any]: baseOpacity,
                      ["--tw-peak" as any]: Math.min(1, baseOpacity + 0.4),
                      ["--tw-duration" as any]: `${duration}s`,
                      ["--tw-delay" as any]: `${phaseOffset}s`,
                      ["--tw-easing" as any]: easing,
                    }}
                  />
                );
              })}
            </g>
          </svg>
        )}
      </div>
    </div>
  );
};

export default DottedBand;
