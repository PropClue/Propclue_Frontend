// client/src/components/header.tsx

import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Building2, TrendingUp, Map, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCountry } from "@/context/CountryContext";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const navItems = [
  { href: "/",       label: "Dashboard",    icon: TrendingUp },
  { href: "/heatmap",label: "Heatmap",      icon: Map        },
  { href: "/map",    label: "Listings Map", icon: Building2  },
];

function CountrySelector() {
  const {
    selectedCountry, selectedCity, countries, cities,
    setSelectedCountry, setSelectedCity, isLoadingCountries, isLoadingCities,
  } = useCountry();

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center h-8 bg-background/50 border border-primary/20 rounded-md min-w-[140px]">
        {countries.length > 0 && selectedCountry && (
          <div
            className="absolute top-0 bottom-0 bg-primary/20 rounded-md shadow-sm transition-all duration-300 ease-in-out"
            style={{
              width: `${100 / countries.length}%`,
              left: `${(Math.max(0, countries.indexOf(selectedCountry)) / countries.length) * 100}%`,
            }}
          />
        )}
        {countries.map((c) => (
          <button key={c} disabled={isLoadingCountries} onClick={() => setSelectedCountry(c)}
            className={`relative z-10 flex-1 h-full px-3 flex items-center justify-center text-xs font-medium transition-colors ${
              selectedCountry === c ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}>
            {c}
          </button>
        ))}
      </div>
      <Select value={selectedCity} onValueChange={setSelectedCity}
        disabled={isLoadingCities || cities.length === 0}>
        <SelectTrigger className="h-8 w-[120px] text-xs bg-background/50 border-primary/20"
          data-testid="select-city">
          <SelectValue placeholder="City" />
        </SelectTrigger>
        <SelectContent>
          {cities.map((city) => (
            <SelectItem key={city} value={city} className="text-xs">{city}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLoggedIn, user, logout, openAuthModal } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5" data-testid="link-logo">
            <div className="flex items-center justify-center w-11 h-11">
              <img src="/favicon-1.webp" alt="Propclue" className="h-8 w-8 object-contain" />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              <span>Prop</span>
              <span className="ml-0.5" style={{ color: "hsl(174, 79%, 29%)" }}>Clue</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button variant={isActive ? "secondary" : "ghost"} className="gap-2"
                    data-testid={`link-nav-${item.label.toLowerCase().replace(" ", "-")}`}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex">
              <CountrySelector />
            </div>

            {/* Auth */}
            {isLoggedIn ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{user?.full_name}</span>
                <Button variant="ghost" size="sm" onClick={logout}
                  className="text-xs text-muted-foreground">
                  Log out
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm"
                className="hidden md:flex text-xs"
                onClick={openAuthModal}>
                Log in
              </Button>
            )}

            <ThemeToggle />

            <Button variant="ghost" size="icon" className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`link-mobile-nav-${item.label.toLowerCase().replace(" ", "-")}`}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {isLoggedIn ? (
              <div className="flex items-center justify-between px-1 pt-2 border-t mt-2">
                <span className="text-sm font-medium">{user?.full_name}</span>
                <Button variant="ghost" size="sm" onClick={logout}
                  className="text-xs text-muted-foreground">Log out</Button>
              </div>
            ) : (
              <Button variant="outline" className="w-full mt-2 text-xs"
                onClick={() => { setMobileMenuOpen(false); openAuthModal(); }}>
                Log in
              </Button>
            )}

            <div className="pt-3 pb-1 px-1 border-t mt-2">
              <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">Market</p>
              <CountrySelector />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}