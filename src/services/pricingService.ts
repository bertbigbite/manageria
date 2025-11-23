// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";

export interface PricingBreakdown {
  basePrice: number;
  guestPrice: number;
  lateBarPrice: number;
  residentDjPrice: number;
  foodPrice: number;
  subtotal: number;
  lineItems: Array<{
    description: string;
    amount: number;
  }>;
}

export interface BookingFormData {
  room_choice?: string;
  package?: string;
  guests?: number;
  late_bar?: boolean;
  resident_dj?: boolean;
  food_required?: boolean;
}

export const calculateBookingTotal = async (
  formData: BookingFormData
): Promise<PricingBreakdown> => {
  const {
    room_choice,
    package: selectedPackage,
    guests = 0,
    late_bar = false,
    resident_dj = false,
    food_required = false,
  } = formData;

  // Default pricing breakdown
  const breakdown: PricingBreakdown = {
    basePrice: 0,
    guestPrice: 0,
    lateBarPrice: 0,
    residentDjPrice: 0,
    foodPrice: 0,
    subtotal: 0,
    lineItems: [],
  };

  if (!room_choice) {
    return breakdown;
  }

  // Fetch applicable pricing rule
  const { data: pricingRules, error } = await supabase
    .from("pricing_rules")
    .select("*")
    .eq("room_choice", room_choice)
    .eq("active", true);

  if (error || !pricingRules || pricingRules.length === 0) {
    console.error("Error fetching pricing rules:", error);
    return breakdown;
  }

  // Find matching pricing rule based on package selection
  let applicableRule = pricingRules.find(
    (rule) => rule.package === selectedPackage
  );

  // If no package selected or package not found, use base pricing
  if (!applicableRule) {
    applicableRule = pricingRules.find((rule) => rule.package === null);
  }

  if (!applicableRule) {
    return breakdown;
  }

  // Calculate base price
  breakdown.basePrice = applicableRule.base_price || 0;
  breakdown.lineItems.push({
    description: selectedPackage
      ? `${selectedPackage}`
      : `${room_choice} - Base Hire`,
    amount: breakdown.basePrice,
  });

  // Calculate per-guest price (only for Lounge or non-package bookings)
  if (guests > 0 && applicableRule.per_guest_price) {
    breakdown.guestPrice = guests * (applicableRule.per_guest_price || 0);
    breakdown.lineItems.push({
      description: `${guests} guests @ £${applicableRule.per_guest_price} per person`,
      amount: breakdown.guestPrice,
    });
  }

  // Check if this is a wedding package (late bar already included)
  const isWeddingPackage = selectedPackage?.includes("Wedding Package");

  // Add late bar if selected and NOT a wedding package
  if (late_bar && !isWeddingPackage && applicableRule.add_on_late_bar) {
    breakdown.lateBarPrice = applicableRule.add_on_late_bar;
    breakdown.lineItems.push({
      description: "Late Bar",
      amount: breakdown.lateBarPrice,
    });
  }

  // DJ is now cash payment only - not included in pricing
  // But we keep the field for informational purposes
  breakdown.residentDjPrice = 0;

  // Add food if required
  if (food_required && applicableRule.add_on_food_price) {
    breakdown.foodPrice = applicableRule.add_on_food_price;
    breakdown.lineItems.push({
      description: "Food & Catering",
      amount: breakdown.foodPrice,
    });
  }

  // Calculate total (excluding DJ which is cash payment)
  breakdown.subtotal =
    breakdown.basePrice +
    breakdown.guestPrice +
    breakdown.lateBarPrice +
    breakdown.foodPrice;

  return breakdown;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
};
