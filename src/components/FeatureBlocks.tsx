"use client";

// Dotted left-side panel is inlined per-row to avoid extra components for now
import dynamic from "next/dynamic";

// Lazy-load client canvas to avoid SSR cost
const RadarCanvas = dynamic(() => import("./RadarCanvas"), { ssr: false });
const CrossBeamsCanvas = dynamic(() => import("./CrossBeamsCanvas"), {
  ssr: false,
});

const FEATURES = [
  {
    title: "SUB-7S FINALITY",
    subtitle:
      "Settlement completes on the destination chain in under seven seconds under normal network conditions.",
  },
  {
    title: "SOLVER-POWERED EXECUTION",
    subtitle:
      "Aggregated solvers compete to fulfill intents optimally, minimizing user friction and failures.",
  },
  {
    title: "UNIVERSAL LIQUIDITY",
    subtitle:
      "Tap into cross-chain liquidity sources to reserve assets and gas where and when you need it.",
  },
];

export default function FeatureBlocks() {
  return (
    <section id="features" className="relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="space-y-8">
          {FEATURES.map((f, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-1 ${
                idx === 0 || idx === 1 || idx === 2
                  ? "md:grid-cols-[minmax(220px,300px)_1fr]"
                  : "md:grid-cols-[280px_1fr]"
              } items-start gap-6 rounded-none ${
                idx === 0 ? "" : "border border-background/10"
              } bg-black p-6 sm:p-10 min-h-[260px]`}
            >
              {/* Left: panel (first block gets animated canvas) */}
              {idx === 0 ? (
                <div className="relative w-full aspect-square md:max-w-[240px] overflow-hidden bg-white/5">
                  <RadarCanvas
                    dotSize={2}
                    grid={6}
                    ringThickness={10}
                    speed={Math.PI / 6}
                    running={true}
                    sweepWedge={false}
                    showHand={true}
                    handWidthPx={8}
                    ringRadiusPx={100}
                    brightnessScale={0.95}
                  />
                </div>
              ) : idx === 1 ? (
                <div className="relative w-full aspect-square md:max-w-[240px] overflow-hidden bg-white/5">
                  <CrossBeamsCanvas
                    dotSize={2}
                    grid={6}
                    baseAlpha={0.12}
                    beamMaxWidthPx={26}
                    beamLengthPx={100}
                    tailPx={120}
                    speed={90}
                    coreHalfPx={19}
                    holeRadiusPx={13}
                    running={true}
                  />
                </div>
              ) : idx === 2 ? (
                <div className="relative w-full aspect-square md:max-w-[240px] overflow-hidden bg-white/5">
                  <RadarCanvas
                    dotSize={2}
                    grid={6}
                    ringThickness={8}
                    ringRadiusPx={50}
                    speed={Math.PI / 6}
                    running={true}
                    animateRing={false}
                    ringWave={true}
                    ringWaveBase={0.25}
                    ringWaveBoost={0.95}
                    gridWave={true}
                    gridWaveAmp={0.06}
                    ringWaveSpeed={Math.PI / 4}
                    centerDot={true}
                    sweepWedge={false}
                    showHand={false}
                    centerDotRadiusPx={12}
                  />
                </div>
              ) : (
                <div className="relative h-[200px] md:h-[220px] w-full overflow-hidden border border-white/10 bg-white/5">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1.4px)",
                      backgroundSize: "10px 10px",
                    }}
                    aria-hidden
                  />
                  {/* Optional inner ring accent */}
                  <div
                    className="absolute inset-6 rounded-full border border-white/30 opacity-40"
                    aria-hidden
                  />
                </div>
              )}

              {/* Right: copy */}
              <div className="mt-6">
                <h1 className="text-4xl sm:text-4xl lg:text-5xl font-medium text-foreground tracking-wide">
                  {f.title}
                </h1>
                <p className="mt-3 text-lg sm:text-base text-foreground max-w-prose">
                  {f.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
