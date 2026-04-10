import { Building2, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center justify-center w-11 h-11">
                <img
                  src="/favicon.png"
                  alt="Propclue"
                  className="h-8 w-8 object-contain"
                />
              </div>

              <span className="text-xl font-semibold tracking-tight">
                <span>Prop</span>
                <span
                  className="ml-0.5"
                  style={{ color: "hsl(174, 79%, 29%)" }}
                >
                  Clue
                </span>
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              AI-powered Dubai real estate valuations with comprehensive market
              insights and future value predictions.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>

            <nav aria-label="Footer Navigation" className="flex flex-col gap-2">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </Link>

              <Link
                href="/heatmap"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Heatmap
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Contact</h3>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Bangalore, Karnataka, India</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a
                  href="mailto:sales@propftx.com"
                  className="hover:text-foreground"
                >
                  sales@propftx.com
                </a>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+916361377627" className="hover:text-foreground">
                  +91 - 6361377627
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} PropClue. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
