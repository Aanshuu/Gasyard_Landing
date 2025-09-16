import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="relative border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          {/* Left 3 columns: Social, Pages, Resources */}
          <div className="md:flex-1 grid grid-cols-1 sm:grid-cols-3 gap-y-8 justify-start items-start">
            <div>
              <h4 className="text-sm font-medium text-soft mb-3">Social</h4>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>
                  <Link href="#x" className="hover:text-white">X</Link>
                </li>
                <li>
                  <Link href="#discord" className="hover:text-white">Discord</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-soft mb-3">Pages</h4>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>
                  <Link href="#home" className="hover:text-white">Home</Link>
                </li>
                <li>
                  <Link href="#swap" className="hover:text-white">Swap</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-soft mb-3">Resources</h4>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>
                  <Link href="#docs" className="hover:text-white">Docs</Link>
                </li>
                <li>
                  <Link href="#media-kit" className="hover:text-white">Media Kit</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Legal as a column */}
          <div className="md:flex-1 flex flex-col md:items-end">
            <div>
              <h4 className="text-sm font-medium text-soft mb-3 md:text-right">LEGAL</h4>
              <ul className="space-y-2 text-white/80 text-sm md:text-right">
                <li>
                  <Link href="#terms" className="hover:text-white">Terms of Service</Link>
                </li>
                <li>
                  <Link href="#privacy" className="hover:text-white">Privacy Policy</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
