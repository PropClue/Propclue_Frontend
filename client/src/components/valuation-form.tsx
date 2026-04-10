import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calculator, Sparkles } from "lucide-react";
import { dubaiAreas, propertyTypes, valuationRequestSchema, ValuationRequest } from "@shared/schema";

interface ValuationFormProps {
  onSubmit: (data: ValuationRequest) => void;
  isLoading?: boolean;
}

export function ValuationForm({ onSubmit, isLoading }: ValuationFormProps) {
  const form = useForm<ValuationRequest>({
    resolver: zodResolver(valuationRequestSchema),
    defaultValues: {
      area: "Dubai Marina",
      propertyType: "apartment",
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200
    }
  });

  return (
    <Card data-testid="card-valuation-form">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Get Property Valuation</CardTitle>
            <CardDescription>
              Enter your property details for an instant AI-powered valuation
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-valuation-area">
                          <SelectValue placeholder="Select area" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dubaiAreas.map((area) => (
                          <SelectItem key={area} value={area}>{area}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-valuation-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        max={10}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-valuation-bedrooms"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        max={10}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        data-testid="input-valuation-bathrooms"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sqft"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Size (sqft)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={200} 
                        max={50000}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 200)}
                        data-testid="input-valuation-sqft"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full gap-2" 
              size="lg"
              disabled={isLoading}
              data-testid="button-get-valuation"
            >
              <Sparkles className="h-5 w-5" />
              {isLoading ? "Calculating..." : "Get Instant Valuation"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
