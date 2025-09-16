import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between text-foreground">
          {/* Left: Logo */}
          <div className="font-medium tracking-wide">
            <Image src="/logo.svg" alt="Gasyard" width={140} height={56} priority />
          </div>

          {/* Center: Nav Links (hidden on small screens) */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
            <Link href="#docs" className="hover:text-white transition-colors">
              Docs
            </Link>
          </nav>

          {/* Right: CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="#launch"
              className="rounded-none border border-white/20 px-4 py-1.5 text-sm font-medium bg-foreground text-ink hover:bg-foreground/90 transition-colors"
            >
              Launch App
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
