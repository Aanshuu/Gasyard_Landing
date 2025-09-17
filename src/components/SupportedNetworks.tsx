import Image from "next/image";

const CHAIN_LOGOS = [
  { src: "/etherium.svg", alt: "Ethereum" },
  { src: "/polygon.svg", alt: "Polygon" },
  { src: "/optimism.svg", alt: "Optimism" },
  { src: "/arbritrum.svg", alt: "Arbitrum" },
  { src: "/base.svg", alt: "Base" },
  { src: "/avalanch.svg", alt: "Avalanche" },
  { src: "/hyperliquid.svg", alt: "Hyperliquid" },
  { src: "/move.svg", alt: "Move" },
];

export default function SupportedNetworks() {
  return (
    <section id="networks" className="relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-sm sm:text-2xl lg:text-3xl tracking-[0.2em] text-soft text-center mb-6 sm:mb-8">
          SUPPORTED NETWORKS
        </h2>

        <div className="relative w-full overflow-hidden">
          <div
            className="flex items-center whitespace-nowrap"
            aria-hidden
          >
            {[...CHAIN_LOGOS, ...CHAIN_LOGOS].map((c, i) => (
              <div
                key={`${c.alt}-${i}`}
                className="basis-[12.5%] shrink-0 grow-0"
              >
                <Image
                  src={c.src}
                  alt={c.alt}
                  width={160}
                  height={64}
                  sizes="(max-width: 640px) 12.5vw, (max-width: 768px) 12.5vw, 12.5vw"
                  className="w-full h-auto max-h-16 sm:max-h-20 md:max-h-24 object-contain opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
