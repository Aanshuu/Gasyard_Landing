import Hero from "@/components/Hero";
import FeatureBlocks from "@/components/FeatureBlocks";
import SupportedNetworks from "@/components/SupportedNetworks";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <div className="font-sans min-h-screen text-foreground">
      <main>
        <Hero />
        <FeatureBlocks />
        <SupportedNetworks />
      </main>
      <SiteFooter />
    </div>
  );
}
