// @ts-nocheck
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  Home, 
  Package, 
  Clock, 
  Music, 
  Utensils,
  Mail,
  Save,
  Loader2,
  Heart
} from "lucide-react";
import { format } from "date-fns";

interface Booking {
  id: string;
  booking_reference: string;
  email: string;
  surname: string;
  forename: string;
  phone: string;
  event_date: string;
  room_choice: string;
  package: string | null;
  late_bar: boolean;
  event_types: string[];
  further_details: string | null;
  guests: number;
  resident_dj: boolean;
  food_required: boolean;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const BookingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [weddingPlannerId, setWeddingPlannerId] = useState<string | null>(null);
  const [creatingPlanner, setCreatingPlanner] = useState(false);

  useEffect(() => {
    fetchBooking();
    checkWeddingPlanner();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setBooking(data);
      setNotes(data.notes || "");
      setStatus(data.status);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching booking:", error);
      }
      toast.error("Failed to load booking details");
      navigate("/admin");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!booking) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("bookings")
        .update({
          notes,
          status,
          updated_by: user?.id,
        })
        .eq("id", booking.id);

      if (error) throw error;

      toast.success("Booking updated successfully");
      fetchBooking();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error updating booking:", error);
      }
      toast.error("Failed to update booking");
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = () => {
    if (!booking) return;

    const subject = encodeURIComponent(`Regarding Your Event Booking - ${booking.booking_reference}`);
    const body = encodeURIComponent(
      `Dear ${booking.forename} ${booking.surname},\n\n` +
      `Thank you for your booking at The Moline Cross.\n\n` +
      `Booking Reference: ${booking.booking_reference}\n` +
      `Event Date: ${format(new Date(booking.event_date), "PPP")}\n\n` +
      `Best regards,\n` +
      `The Moline Cross Team`
    );

    window.location.href = `mailto:${booking.email}?subject=${subject}&body=${body}`;
  };

  const checkWeddingPlanner = async () => {
    if (!id) return;
    
    try {
      const { data } = await supabase
        .from("wedding_planners")
        .select("id")
        .eq("booking_id", id)
        .maybeSingle();
      
      if (data) {
        setWeddingPlannerId(data.id);
      }
    } catch (error) {
      console.error("Error checking wedding planner:", error);
    }
  };

  const handleCreateWeddingPlanner = async () => {
    if (!booking) return;
    
    if (weddingPlannerId) {
      navigate(`/admin/wedding-planners/${weddingPlannerId}`);
      return;
    }

    setCreatingPlanner(true);
    try {
      const { data, error } = await supabase
        .from("wedding_planners")
        .insert({
          booking_id: booking.id,
          couple_names: `${booking.forename} ${booking.surname}`,
          wedding_date: booking.event_date,
          guests_count: booking.guests,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Wedding planner created");
      navigate(`/admin/wedding-planners/${data.id}`);
    } catch (error) {
      console.error("Error creating wedding planner:", error);
      toast.error("Failed to create wedding planner");
    } finally {
      setCreatingPlanner(false);
    }
  };

  const isWeddingPackage = booking.package === "Wedding Package 1" || booking.package === "Wedding Package 2";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Booking Details
              </h1>
              <p className="text-muted-foreground mt-1">
                Reference: {booking.booking_reference}
              </p>
            </div>
            <div className="flex gap-2">
              {isWeddingPackage && (
                <Button
                  variant="outline"
                  onClick={handleCreateWeddingPlanner}
                  disabled={creatingPlanner}
                  className="gap-2"
                >
                  {creatingPlanner ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className="h-4 w-4" />
                  )}
                  {weddingPlannerId ? "View" : "Create"} Wedding Planner
                </Button>
              )}
              <Button
                variant="gradient"
                onClick={handleSendMessage}
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Message Client
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Information */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Client Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{booking.forename} {booking.surname}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{booking.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{booking.phone}</p>
              </div>
            </div>
          </GlassCard>

          {/* Event Information */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Event Details
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Event Type</p>
                <p className="font-medium">{booking.event_types.join(", ")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {format(new Date(booking.event_date), "PPP")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Guests</p>
                <p className="font-medium">{booking.guests} guests</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Venue</p>
                <p className="font-medium">{booking.room_choice}</p>
              </div>
            </div>
          </GlassCard>

          {/* Add-ons & Services */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Services & Add-ons
            </h2>
            <div className="space-y-3">
              {booking.package && (
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span>{booking.package}</span>
                </div>
              )}
              {booking.late_bar && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Late Bar (£40)</span>
                </div>
              )}
              {booking.resident_dj && (
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-primary" />
                  <span>Resident DJ</span>
                </div>
              )}
              {booking.food_required && (
                <div className="flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-primary" />
                  <span>Food Required</span>
                </div>
              )}
              {!booking.package && !booking.late_bar && !booking.resident_dj && !booking.food_required && (
                <p className="text-muted-foreground text-sm">No additional services</p>
              )}
            </div>

            {booking.further_details && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-1">Additional Details</p>
                <p className="text-sm">{booking.further_details}</p>
              </div>
            )}
          </GlassCard>

          {/* Status Timeline */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Timeline
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <div className="w-px h-full bg-border mt-2" />
                </div>
                <div className="pb-6">
                  <p className="font-medium">Booking Created</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(booking.created_at), "PPP 'at' p")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                </div>
                <div>
                  <p className="font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(booking.updated_at), "PPP 'at' p")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border/50">
              <Label htmlFor="status">Current Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Provisional">Provisional</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </GlassCard>

          {/* Internal Notes */}
          <GlassCard className="p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Internal Notes</h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this booking (not visible to client)..."
              className="min-h-[150px] resize-none"
            />
            <p className="text-sm text-muted-foreground mt-2">
              These notes are only visible to admin users
            </p>
          </GlassCard>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <Button
            variant="gradient"
            size="lg"
            onClick={handleSave}
            disabled={saving}
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
