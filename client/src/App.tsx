// client/src/App.tsx

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Dashboard from "@/pages/dashboard";
import Properties from "@/pages/properties";
import Heatmap from "@/pages/heatmap";
import Valuation from "@/pages/valuation";
import PropertyDetail from "@/pages/property-detail";
import NotFound from "@/pages/not-found";
import ListingsMap from "@/pages/ListingsMap";
import { CountryProvider } from "@/context/CountryContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/Auth/AuthModal";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/properties" component={Properties} />
      <Route path="/heatmap" component={Heatmap} />
      <Route path="/valuation" component={Valuation} />
      <Route path="/property/:id" component={PropertyDetail} />
      <Route path="/map" component={ListingsMap} />
      <Route component={NotFound} />
    </Switch>
  );
}

function GlobalAuthModal() {
  const { authModalOpen, closeAuthModal } = useAuth();
  return <AuthModal open={authModalOpen} onClose={closeAuthModal} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="propclue-theme">
        <CountryProvider>
          <AuthProvider>
            <TooltipProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <Router />
                </main>
                <Footer />
              </div>
              <Toaster />
              <GlobalAuthModal />
            </TooltipProvider>
          </AuthProvider>
        </CountryProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;