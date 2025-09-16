// Dotted left-side panel is inlined per-row to avoid extra components for now

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
              className="grid grid-cols-1 md:grid-cols-[280px_1fr] items-start gap-6 rounded-none border border-background/10 bg-black p-6 sm:p-10 min-h-[260px]"
            >
              {/* Left: large dotted panel */}
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
                <div className="absolute inset-6 rounded-full border border-white/30 opacity-40" aria-hidden />
              </div>

              {/* Right: copy */}
              <div className="">
                <h1 className="text-4xl sm:text-4xl lg:text-5xl font-medium text-foreground tracking-wide">{f.title}</h1>
                <p className="mt-3 text-lg sm:text-base text-foreground max-w-prose">{f.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
