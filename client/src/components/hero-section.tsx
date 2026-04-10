import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { TrendingUp, Calculator, MapPin, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[500px] flex items-center overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {/* SEO image hints for search engines */}
        <img
          src="/hero-1.webp"
          alt="PropClue AI-powered real estate valuation and market insights platform"
          width="1920"
          height="1080"
          loading="eager"
          fetchPriority="high"
          className="sr-only"
        />

        <img
          src="/hero-2.webp"
          alt="Interactive property heatmap and price trend analysis on PropClue"
          width="1920"
          height="1080"
          loading="lazy"
          fetchPriority="low"
          className="sr-only"
        />

        <div
          className="absolute inset-0 bg-cover bg-center animate-hero1"
          style={{ backgroundImage: "url('/hero-1.webp')" }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center animate-hero2"
          style={{ backgroundImage: "url('/hero-2.webp')" }}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="max-w-2xl space-y-6">
          {/* <div className="flex items-center gap-1.5">
          <div className="flex items-center justify-center w-11 h-11">
              <img
                src="/favicon.png"
                alt="Propclue"
                className="h-8 w-8 object-contain"
              />
            </div>

            <span className="font-medium text-primary-foreground/90">
              <span>Prop</span>
              <span
                className="ml-0.5"
                style={{ color: "hsl(174, 79%, 29%)", fontWeight: "bold" }}
              >
                Clue
              </span>
            </span>
          </div> */}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Data Driven Real Estate
            <span className="block text-primary">Valuation & Insights</span>
          </h1>

          <p className="text-lg text-white/80 max-w-lg">
            Get accurate property valuations, future value predictions, and
            comprehensive market insights with Y-o-Y and Q-o-Q growth analysis.
          </p>

          {/* <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/valuation">
              <Button
                size="lg"
                className="gap-2"
                data-testid="button-hero-valuation"
              >
                <Calculator className="h-5 w-5" />
                Get Instant Valuation
              </Button>
            </Link>
            <Link href="/properties">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                data-testid="button-hero-explore"
              >
                <MapPin className="h-5 w-5" />
                Explore Properties
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div> */}

          <div className="flex flex-wrap items-center gap-6 pt-6 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>10,000+ Properties Analyzed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Real-time Market Data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>AI-Powered Predictions</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
