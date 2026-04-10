import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ValuationForm } from "@/components/valuation-form";
import { ValuationResultComponent } from "@/components/valuation-result";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calculator, Sparkles, TrendingUp, Shield } from "lucide-react";
import { ValuationRequest, ValuationResult } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useCountry } from "@/context/CountryContext";

export default function Valuation() {
  const { currency, selectedCity } = useCountry();
  const [result, setResult] = useState<ValuationResult | null>(null);

  const valuationMutation = useMutation({
    mutationFn: async (data: ValuationRequest) => {
      const response = await apiRequest("POST", "/api/valuation", data);
      return response.json();
    },
    onSuccess: (data: ValuationResult) => {
      setResult(data);
    },
  });

  const handleSubmit = (data: ValuationRequest) => {
    valuationMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Property Valuation</h1>
              <p className="text-muted-foreground">
                Get an instant AI-powered valuation with future value
                predictions
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <ValuationForm
              onSubmit={handleSubmit}
              isLoading={valuationMutation.isPending}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">AI-Powered</p>
                    <p className="text-xs text-muted-foreground">
                      Advanced algorithms for accurate valuations
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Future Predictions</p>
                    <p className="text-xs text-muted-foreground">
                      12, 24, and 36-month forecasts
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10 flex-shrink-0">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Market Data</p>
                    <p className="text-xs text-muted-foreground">
                      Based on real {selectedCity} transactions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            {valuationMutation.isPending ? (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <div className="text-center py-4">
                      <Skeleton className="h-4 w-32 mx-auto mb-2" />
                      <Skeleton className="h-10 w-48 mx-auto" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-16 w-full rounded-lg" />
                      <Skeleton className="h-16 w-full rounded-lg" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-48 mb-4" />
                    <Skeleton className="h-72 w-full" />
                  </CardContent>
                </Card>
              </div>
            ) : result ? (
              <ValuationResultComponent result={result} currency={currency} />
            ) : (
              <Card className="h-full min-h-[400px] flex items-center justify-center">
                <CardContent className="text-center py-16">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto mb-4">
                    <Calculator className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Ready to Valuate
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Fill in the property details on the left to get an instant
                    AI-powered valuation with future value predictions.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
