import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PricingBreakdown, formatCurrency } from "@/services/pricingService";
interface PricingSummaryProps {
  pricing: PricingBreakdown | null;
  isLoading?: boolean;
  roomChoice?: string;
  residentDj?: boolean;
}
export const PricingSummary = ({
  pricing,
  isLoading,
  roomChoice,
  residentDj
}: PricingSummaryProps) => {
  const isFunctionRoom = roomChoice === "Function Room (max 100 guests)";
  if (isLoading) {
    return <Card className="glass-card">
        <CardHeader>
          <CardTitle>Pricing Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Calculating...</p>
        </CardContent>
      </Card>;
  }
  if (!pricing || pricing.subtotal === 0) {
    return <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-serif text-3xl">Pricing Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete your selections to see pricing
          </p>
        </CardContent>
      </Card>;
  }
  return <Card className="glass-card">
      <CardHeader>
        <CardTitle>Pricing Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pricing.lineItems.map((item, index) => <div key={index} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.description}</span>
            <span className="font-medium">{formatCurrency(item.amount)}</span>
          </div>)}
        
        <Separator className="my-3" />
        
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(pricing.subtotal)}
          </span>
        </div>
        
        <p className="text-xs text-muted-foreground mt-4">
          * Prices are estimates. Final invoice may vary based on specific requirements.
        </p>
        
        {residentDj && isFunctionRoom && <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
            <p className="text-sm font-medium">Note: Resident DJ</p>
            <p className="text-xs text-muted-foreground">
              Resident DJ is payable on the evening (not included in total)
            </p>
          </div>}
      </CardContent>
    </Card>;
};