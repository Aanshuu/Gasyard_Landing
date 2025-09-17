"use client";

import DottedBand from "@/components/DottedBand";
import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useState } from "react";

export default function Hero() {
  // Cycle highlight across the three slabs (Intent, Execution, Finality)
  const [active, setActive] = useState(0); // 0..2
  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % 3), 3000);
    return () => clearInterval(id);
  }, []);

  // Base opacities preserved from original layout
  //   const baseOps = useMemo(() => [0.18, 0.28, 0.42], []);
  const baseOps = useMemo(() => [0.18, 0.28, 0.42], []);
  const slabOpacity = (idx: number) => {
    // Brighter when active, dimmer when inactive
    return Math.min(1, baseOps[idx] * (active === idx ? 2.6 : 0.4));
  };
  const slabCell = (idx: number) => (active === idx ? 6 : 10);
  const slabDot = (idx: number) => (active === idx ? 3.2 : 2.2);

  // Synchronized status messages (colors and text) tied to the same active index
  const statusTexts = useMemo(
    () => [
      '{"asset":"USDC", "from":"Arbitrum", "to":"Base", "amount":"500"}',
      'solver bids shown (fastest + cheapest route)',
      'Settlement and transaction complete in ~7s',
    ],
    []
  );
  const statusColors = ["#8697FF", "#FFEF0E", "#00B32D"] as const;

  return (
    <section className="relative overflow-hidden">
      {/* Fixed Navbar inside Hero so the dotted band starts at page top behind it */}
      <Navbar />
      {/* === Band 1: Top band from page top to headline === */}
      <div className="relative h-[320px] sm:h-[520px]">
        <DottedBand
          className="top-0" // start below the fixed navbar; hero wrapper already sits under nav
          twinkle={false}
          running={false}
          scrollSpeedX={-12}
          height={520}
          opacity={0.25}
          edgeFadePct={20}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 h-full flex items-end justify-end mb-[-10px]">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-foreground">
            INTENT EXECUTION ENGINE
          </h1>
        </div>
      </div>

      {/* === Band 2: Subheadline band directly below band 1, smooth overlap === */}
      <div className="relative -mt-6 sm:-mt-8 h-[220px] sm:h-[360px]">
        <DottedBand
          className="top-0"
          twinkle={false}
          running={false}
          scrollSpeedX={-10}
          height={360}
          opacity={0.08}
          edgeFadePct={20}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="px-4 text-center text-base sm:text-2xl text-foreground max-w-xl mt-12">
          Bridge, reserve assets, and gas across any chain — solver-powered and trust-minimized.
          </p>
        </div>
      </div>

      {/* === Supporting text and layered dotted visuals === */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-24 mt-12">
        <p className="text-center text-xs sm:text-lg text-soft">
          <span style={{ color: statusColors[active] }}>{statusTexts[active]}</span>
        </p>

        {/* Layered bands: simple approximation with skewed cards and labels */}
        <div className="mt-6 sm:mt-8 grid grid-cols-[100px_1fr] gap-4 sm:gap-6 items-start">
          {/* Labels column */}
          <div className="space-y-8 sm:space-y-10 pt-16">
            <div className={active === 0 ? "text-sm sm:text-xl font-medium text-foreground" : "text-sm sm:text-xl text-white/60"}>Intent</div>
            <div className={active === 1 ? "text-sm sm:text-xl font-medium text-foreground" : "text-sm sm:text-xl text-white/60"}>Execution</div>
            <div className={active === 2 ? "text-sm sm:text-xl font-medium text-foreground" : "text-sm sm:text-xl text-white/60"}>Finality</div>
          </div>

          {/* Layers column */}
          <div className="relative h-[280px]">
            {/* Top layer */}
            <div className="absolute left-0 right-0 top-[20px] mx-auto max-w-[720px] h-[90px] -skew-x-[45deg] border border-white/20 rounded-none overflow-hidden">
              <DottedBand
                className="top-0"
                twinkle={false}
                running={false}
                scrollSpeedX={-24}
                height={90}
                opacity={slabOpacity(0)}
                edgeFadePct={18}
                cell={slabCell(0)}
                dotSize={slabDot(0)}
                counterSkewXDeg={45}
              />
            </div>

            {/* Middle layer */}
            <div className="absolute left-0 right-0 top-[80px] mx-auto max-w-[720px] h-[90px] -skew-x-[45deg] border border-white/25 rounded-none overflow-hidden">
              <DottedBand
                className="top-0"
                twinkle={false}
                running={false}
                scrollSpeedX={-24}
                height={90}
                opacity={slabOpacity(1)}
                edgeFadePct={18}
                cell={slabCell(1)}
                dotSize={slabDot(1)}
                counterSkewXDeg={45}
              />
            </div>

            {/* Bottom layer */}
            <div className="absolute left-0 right-0 top-[140px] mx-auto max-w-[720px] h-[90px] -skew-x-[45deg] border border-white/40 rounded-none overflow-hidden">
              <DottedBand
                className="top-0"
                twinkle={false}
                running={false}
                scrollSpeedX={-24}
                height={90}
                opacity={slabOpacity(2)}
                edgeFadePct={18}
                cell={slabCell(2)}
                dotSize={slabDot(2)}
                counterSkewXDeg={45}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
