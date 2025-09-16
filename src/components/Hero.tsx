import DottedBand from "@/components/DottedBand";
import Navbar from "@/components/Navbar";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Fixed Navbar inside Hero so the dotted band starts at page top behind it */}
      <Navbar />
      {/* === Band 1: Top band from page top to headline === */}
      <div className="relative h-[320px] sm:h-[380px]">
        <DottedBand
          className="top-0" // start below the fixed navbar; hero wrapper already sits under nav
          twinkle={false}
          height={380}
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
      <div className="relative -mt-6 sm:-mt-8 h-[220px] sm:h-[240px]">
        <DottedBand
          className="top-0"
          twinkle={false}
          height={300}
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
          Settlement and transaction complete in ~7s
        </p>

        {/* Layered bands: simple approximation with skewed cards and labels */}
        <div className="mt-6 sm:mt-8 grid grid-cols-[100px_1fr] gap-4 sm:gap-6 items-start">
          {/* Labels column */}
          <div className="text-white/60 space-y-8 sm:space-y-10 pt-16">
            <div className="text-sm sm:text-xl">Intent</div>
            <div className="text-sm sm:text-xl">Execution</div>
            <div className="text-sm sm:text-xl font-medium text-foreground">Finality</div>
          </div>

          {/* Layers column */}
          <div className="relative h-[280px]">
            {/* Top layer */}
            <div className="absolute left-0 right-0 top-[20px] mx-auto max-w-[720px] h-[90px] -skew-x-[45deg] border border-white/20 rounded-none overflow-hidden">
              <DottedBand className="top-0" twinkle={false} height={90} opacity={0.18} edgeFadePct={18} />
            </div>

            {/* Middle layer */}
            <div className="absolute left-0 right-0 top-[80px] mx-auto max-w-[720px] h-[90px] -skew-x-[45deg] border border-white/25 rounded-none overflow-hidden">
              <DottedBand className="top-0" twinkle={false} height={90} opacity={0.28} edgeFadePct={18} />
            </div>

            {/* Bottom layer */}
            <div className="absolute left-0 right-0 top-[140px] mx-auto max-w-[720px] h-[90px] -skew-x-[45deg] border border-white/40 rounded-none overflow-hidden">
              <DottedBand className="top-0" twinkle={false} height={90} opacity={0.42} edgeFadePct={18} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
