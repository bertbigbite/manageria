// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { calculateBookingTotal } from "@/services/pricingService";

const bookingSchema = z.object({
  client_id: z.string().min(1, "Please select a client"),
  event_date: z.string().min(1, "Event date is required"),
  room_choice: z.enum(["Function Room (max 100 guests)", "Lounge (max 50 guests)"]),
  package: z.string().optional(),
  event_types: z.array(z.string()).min(1, "Select at least one event type"),
  guests: z.number().min(1, "Number of guests is required"),
  late_bar: z.boolean(),
  resident_dj: z.boolean(),
  food_required: z.boolean(),
  status: z.string(),
  further_details: z.string().optional(),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface Client {
  id: string;
  forename: string;
  surname: string;
  email: string;
}

const AdminBookingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      client_id: "",
      event_date: "",
      room_choice: "Function Room (max 100 guests)",
      package: "",
      event_types: [],
      guests: 1,
      late_bar: false,
      resident_dj: false,
      food_required: false,
      status: "Provisional",
      further_details: "",
      notes: "",
    },
  });

  useEffect(() => {
    checkAuth();
    fetchClients();
    if (!isNew) {
      fetchBooking();
    }
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }

    const { data: roles, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (error) {
      console.error("Error checking user role:", error);
      toast.error("Error verifying permissions");
      navigate("/admin/dashboard");
      return;
    }

    if (!roles) {
      toast.error("Access denied: Admin privileges required");
      navigate("/admin/dashboard");
    }
  };

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("id, forename, surname, email")
      .order("surname");

    if (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients");
      return;
    }

    if (data) setClients(data);
  };

  const fetchBooking = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Error fetching booking:", error);
        throw error;
      }

      form.reset({
        client_id: data.client_id || "",
        event_date: data.event_date,
        room_choice: data.room_choice as "Function Room (max 100 guests)" | "Lounge (max 50 guests)",
        package: data.package || "",
        event_types: data.event_types || [],
        guests: data.guests,
        late_bar: data.late_bar,
        resident_dj: data.resident_dj,
        food_required: data.food_required,
        status: data.status,
        further_details: data.further_details || "",
        notes: data.notes || "",
      });
    } catch (error) {
      toast.error("Failed to load booking");
      navigate("/admin/bookings");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: BookingFormValues) => {
    setSaving(true);
    try {
      // Get client details
      const client = clients.find(c => c.id === values.client_id);
      if (!client) throw new Error("Client not found");

      // Calculate pricing
      const pricing = await calculateBookingTotal({
        room_choice: values.room_choice,
        package: values.package,
        guests: values.guests,
        late_bar: values.late_bar,
        resident_dj: values.resident_dj,
        food_required: values.food_required,
      });

      const bookingData = {
        client_id: values.client_id,
        email: client.email,
        forename: client.forename,
        surname: client.surname,
        phone: "", // Get from client if needed
        event_date: values.event_date,
        room_choice: values.room_choice,
        package: values.package || null,
        event_types: values.event_types,
        guests: values.guests,
        late_bar: values.late_bar,
        resident_dj: values.resident_dj,
        food_required: values.food_required,
        status: values.status,
        further_details: values.further_details || null,
        notes: values.notes || null,
        total_amount: pricing.subtotal,
        deposit_amount: pricing.subtotal * 0.2,
      };

      if (isNew) {
        const { data, error } = await (supabase as any)
          .from("bookings")
          .insert([bookingData])
          .select("id, confirmation_token")
          .single();

        if (error || !data) throw error;

        // Update booking reference
        const year = new Date().getFullYear();
        const bookingReference = `BK-${year}-${data.confirmation_token.substring(0, 8).toUpperCase()}`;
        
        await (supabase as any)
          .from("bookings")
          .update({ booking_reference: bookingReference })
          .eq("id", data.id);

        toast.success("Booking created successfully");
        navigate(`/admin/booking/${data.id}`);
      } else {
        const { error } = await (supabase as any)
          .from("bookings")
          .update(bookingData)
          .eq("id", id);

        if (error) throw error;
        toast.success("Booking updated successfully");
        navigate(`/admin/booking/${id}`);
      }
    } catch (error) {
      console.error("Error saving booking:", error);
      toast.error("Failed to save booking");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/bookings")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bookings
        </Button>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
          {isNew ? "Create New Booking" : "Edit Booking"}
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-4">Client Information</h2>
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.forename} {client.surname} ({client.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-4">Event Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="event_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="room_choice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Choice *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Function Room (max 100 guests)">Function Room (max 100 guests)</SelectItem>
                          <SelectItem value="Lounge (max 50 guests)">Lounge (max 50 guests)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="package"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Wedding Package" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Guests *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Provisional">Provisional</SelectItem>
                          <SelectItem value="Confirmed">Confirmed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-4 space-y-4">
                <FormField
                  control={form.control}
                  name="late_bar"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Late Bar</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resident_dj"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Resident DJ</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="food_required"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Food Required</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="further_details"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Further Details</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Any additional event details..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Internal Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Private admin notes..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </GlassCard>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/bookings")}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={saving} className="gap-2">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isNew ? "Create Booking" : "Save Changes"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AdminBookingForm;
