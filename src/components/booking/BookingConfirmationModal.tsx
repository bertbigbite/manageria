import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PricingBreakdown, formatCurrency } from "@/services/pricingService";
import { CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface BookingConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  bookingData: {
    forename?: string;
    surname?: string;
    email?: string;
    phone?: string;
    room_choice?: string;
    event_date?: Date;
    guests?: number;
    package?: string;
    event_types?: string[];
    late_bar?: boolean;
    resident_dj?: boolean;
    food_required?: boolean;
  };
  pricing: PricingBreakdown;
}

export const BookingConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  isSubmitting,
  bookingData,
  pricing,
}: BookingConfirmationModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">Confirm Your Booking</DialogTitle>
          </div>
          <DialogDescription>
            Please review your booking details before submitting
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Contact Information */}
          <div>
            <h3 className="font-semibold mb-3">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">
                  {bookingData.forename || ''} {bookingData.surname || ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{bookingData.email || ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{bookingData.phone || ''}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Event Details */}
          <div>
            <h3 className="font-semibold mb-3">Event Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Event Type:</span>
                <span className="font-medium">{bookingData.event_types?.join(", ") || ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">
                  {bookingData.event_date ? format(bookingData.event_date, "PPP") : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Venue:</span>
                <span className="font-medium">{bookingData.room_choice || ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Guests:</span>
                <span className="font-medium">{bookingData.guests || 0}</span>
              </div>
              {bookingData.package && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Package:</span>
                  <span className="font-medium">{bookingData.package}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Add-ons */}
          {(bookingData.late_bar || bookingData.resident_dj || bookingData.food_required) && (
            <>
              <div>
                <h3 className="font-semibold mb-3">Selected Add-ons</h3>
                <div className="space-y-2 text-sm">
                  {bookingData.late_bar && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Late Bar</span>
                    </div>
                  )}
                  {bookingData.resident_dj && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Resident DJ</span>
                    </div>
                  )}
                  {bookingData.food_required && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Food & Catering</span>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Pricing Breakdown */}
          <div>
            <h3 className="font-semibold mb-3">Pricing Breakdown</h3>
            <div className="space-y-2">
              {pricing.lineItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.description}</span>
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-semibold">Total Amount Due</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(pricing.subtotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-sm">Payment Information</h3>
            <p className="text-xs text-muted-foreground">
              A deposit invoice will be sent to your email address. We accept bank transfers,
              card payments, and cash. Full payment terms will be included in your booking
              confirmation.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Review Booking
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting} variant="gradient">
            {isSubmitting ? "Submitting..." : "Confirm & Submit Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
