import { UseFormReturn } from "react-hook-form";
import { StepContainer } from "../StepContainer";
import { GlassCard } from "@/components/ui/glass-card";
import { format } from "date-fns";
import { BookingFormCheckboxes } from "../BookingFormCheckboxes";
import { Calendar, Users, Home, Package, Clock, Music, Utensils } from "lucide-react";

interface Step8ReviewProps {
  form: UseFormReturn<any>;
}

export const Step8Review = ({ form }: Step8ReviewProps) => {
  const values = form.getValues();

  return (
    <StepContainer
      title="Review Your Booking"
      description="Please review your details before submitting"
    >
      <GlassCard className="p-6 space-y-4">
        <div className="grid gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Home className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Event Type</p>
              <p className="font-semibold">{values.event_types?.join(", ") || "Not specified"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Home className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Venue</p>
              <p className="font-semibold">{values.room_choice || "Not selected"}</p>
            </div>
          </div>

          {values.package && (
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Package</p>
                <p className="font-semibold">{values.package}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="font-semibold">
                {values.event_date ? format(values.event_date, "PPP") : "Not selected"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Guests</p>
              <p className="font-semibold">{values.guests || 0} guests</p>
            </div>
          </div>

          {values.late_bar && (
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Late Bar</p>
                <p className="font-semibold">Yes (£40)</p>
              </div>
            </div>
          )}

          {values.resident_dj && (
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Music className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resident DJ</p>
                <p className="font-semibold">Yes</p>
              </div>
            </div>
          )}

          {values.food_required && (
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Utensils className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Food Required</p>
                <p className="font-semibold">Yes</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contact</p>
              <p className="font-semibold">{values.forename} {values.surname}</p>
              <p className="text-sm text-muted-foreground">{values.email}</p>
              <p className="text-sm text-muted-foreground">{values.phone}</p>
            </div>
          </div>

          {values.further_details && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Additional Details</p>
              <p className="text-sm">{values.further_details}</p>
            </div>
          )}
        </div>
      </GlassCard>

      <BookingFormCheckboxes form={form} />
    </StepContainer>
  );
};
