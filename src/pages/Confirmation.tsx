// @ts-nocheck
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface Booking {
  booking_reference: string;
  forename: string;
  surname: string;
  email: string;
  phone: string;
  event_date: string;
  room_choice: string;
  late_bar: boolean;
  event_types: string[];
  further_details: string | null;
  guests: number;
  resident_dj: boolean;
  food_required: boolean;
}

const Confirmation = () => {
  const { confirmationToken } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!confirmationToken) return;

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("confirmation_token", confirmationToken)
        .single();

      if (error) {
        if (import.meta.env.DEV) {
          console.error("Error fetching booking:", error);
        }
      } else {
        setBooking(data);
      }
      setLoading(false);
    };

    fetchBooking();
  }, [confirmationToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Booking not found</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        {/* Success Animation */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mb-6 animate-glow-pulse">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Booking Received!
          </h1>
          <p className="text-xl text-muted-foreground">
            Thank you — we'll be in touch soon!
          </p>
        </div>

        {/* Booking Details Glass Card */}
        <GlassCard className="p-8 mb-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <h2 className="text-2xl font-semibold">Booking Details</h2>
            <div className="bg-gradient-to-r from-primary to-secondary px-4 py-2 rounded-full">
              <span className="text-white font-semibold text-sm">{booking.booking_reference}</span>
            </div>
          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-base">{booking.forename} {booking.surname}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{booking.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-base">{booking.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Event Date</p>
                <p className="text-base">
                  {new Date(booking.event_date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Room</p>
                <p className="text-base">{booking.room_choice}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Guests</p>
                <p className="text-base">{booking.guests}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Event Type</p>
                <p className="text-base">{booking.event_types.join(", ")}</p>
              </div>
              {booking.further_details && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Details</p>
                  <p className="text-base">{booking.further_details}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Late Bar</p>
                <p className="text-base">{booking.late_bar ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resident DJ</p>
                <p className="text-base">{booking.resident_dj ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Food Required</p>
                <p className="text-base">{booking.food_required ? "Yes" : "No"}</p>
              </div>
            </div>
          </GlassCard>

        {/* Payment Information Glass Card */}
        <GlassCard className="p-8 mb-8 bg-gradient-to-br from-secondary/10 to-primary/10">
          <h2 className="text-2xl font-semibold mb-6">Payment Information</h2>
          <p className="text-sm mb-6">
            Please make payment to the following account:
          </p>
          <div className="space-y-3 bg-white/30 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
            <div className="flex justify-between items-center">
              <span className="font-medium text-foreground">Bank:</span>
              <span className="text-foreground">[Your Bank Name]</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-foreground">Account Name:</span>
              <span className="text-foreground">[Business Name]</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-foreground">Sort Code:</span>
              <span className="text-foreground">12-34-56</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-foreground">Account Number:</span>
              <span className="text-foreground">12345678</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-white/20">
              <span className="font-medium text-foreground">Reference:</span>
              <span className="font-bold text-primary text-lg">{booking.booking_reference}</span>
            </div>
          </div>
          <div className="mt-6 p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20">
            <p className="text-sm font-medium text-center text-foreground">
              Your booking will only be confirmed once payment has been received. Please
              include your booking reference when making payment.
            </p>
          </div>
        </GlassCard>

        <div className="text-center">
          <Link to="/">
            <Button variant="glass" size="lg">Return to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
