// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { BookingSteps } from "@/components/booking/BookingSteps";
import { Step1EventType } from "@/components/booking/steps/Step1EventType";
import { Step2RoomChoice } from "@/components/booking/steps/Step2RoomChoice";
import { Step3Package } from "@/components/booking/steps/Step3Package";
import { Step4DateGuests } from "@/components/booking/steps/Step4DateGuests";
import { Step5AddOns } from "@/components/booking/steps/Step5AddOns";
import { Step6Details } from "@/components/booking/steps/Step6Details";
import { Step7Contact } from "@/components/booking/steps/Step7Contact";
import { Step8Review } from "@/components/booking/steps/Step8Review";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { calculateBookingTotal, PricingBreakdown } from "@/services/pricingService";
import { BookingConfirmationModal } from "@/components/booking/BookingConfirmationModal";
import { PricingSummary } from "@/components/booking/PricingSummary";
import molineLogo from "@/assets/moline-cross-logo.png";
const bookingSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  surname: z.string().min(1, "Surname is required"),
  forename: z.string().min(1, "Forename is required"),
  phone: z.string().min(1, "Phone number is required"),
  event_date: z.date({
    required_error: "Event date is required"
  }),
  room_choice: z.enum(["Function Room (max 100 guests)", "Lounge (max 50 guests)"], {
    required_error: "Please select a room"
  }),
  package: z.string().optional(),
  late_bar: z.boolean(),
  event_types: z.array(z.string()).min(1, "Please select at least one event type"),
  further_details: z.string().optional(),
  guests: z.number().min(1, "Number of guests is required"),
  resident_dj: z.boolean(),
  food_required: z.boolean(),
  food_safety_accepted: z.boolean().refine(val => val === true, {
    message: "You must accept the food safety disclaimer"
  }),
  conditions_accepted: z.boolean().refine(val => val === true, {
    message: "You must accept the conditions of hire"
  })
}).refine(data => {
  const maxGuests = data.room_choice === "Function Room (max 100 guests)" ? 100 : 50;
  return data.guests <= maxGuests;
}, {
  message: "Number of guests exceeds maximum capacity of selected room",
  path: ["guests"]
});
type BookingFormValues = z.infer<typeof bookingSchema>;
const Booking = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const totalSteps = 8;
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      email: "",
      surname: "",
      forename: "",
      phone: "",
      room_choice: undefined,
      package: undefined,
      late_bar: false,
      event_types: [],
      further_details: "",
      guests: 0,
      resident_dj: false,
      food_required: false,
      food_safety_accepted: false,
      conditions_accepted: false
    }
  });
  const roomChoice = form.watch("room_choice");
  const packageChoice = form.watch("package");
  const guests = form.watch("guests");
  const lateBar = form.watch("late_bar");
  const residentDj = form.watch("resident_dj");
  const foodRequired = form.watch("food_required");

  // Calculate pricing whenever relevant fields change
  useEffect(() => {
    const calculatePricing = async () => {
      if (!roomChoice) {
        setPricing(null);
        return;
      }
      setIsPricingLoading(true);
      try {
        const breakdown = await calculateBookingTotal({
          room_choice: roomChoice,
          package: packageChoice,
          guests: guests || 0,
          late_bar: lateBar,
          resident_dj: residentDj,
          food_required: foodRequired
        });
        setPricing(breakdown);
      } catch (error) {
        console.error("Error calculating pricing:", error);
      } finally {
        setIsPricingLoading(false);
      }
    };
    calculatePricing();
  }, [roomChoice, packageChoice, guests, lateBar, residentDj, foodRequired]);
  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof BookingFormValues)[] = [];
    switch (step) {
      case 1:
        fieldsToValidate = ["event_types"];
        break;
      case 2:
        fieldsToValidate = ["room_choice"];
        break;
      case 3:
        // Package is optional, no validation needed
        return true;
      case 4:
        fieldsToValidate = ["event_date", "guests"];
        break;
      case 5:
        // Add-ons have default values, no strict validation needed
        return true;
      case 6:
        // Further details is optional
        return true;
      case 7:
        fieldsToValidate = ["forename", "surname", "email", "phone"];
        break;
      case 8:
        fieldsToValidate = ["food_safety_accepted", "conditions_accepted"];
        break;
      default:
        return true;
    }
    const result = await form.trigger(fieldsToValidate);
    return result;
  };
  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };
  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  const handleSubmitClick = async () => {
    // Validate final step
    const isValid = await validateStep(currentStep);
    if (!isValid) return;

    // Show confirmation modal
    setShowConfirmModal(true);
  };
  const onSubmit = async (values: BookingFormValues) => {
    setIsSubmitting(true);
    try {
      // First, create or find client record
      let clientId: string;
      const {
        data: existingClient
      } = await supabase.from("clients").select("id").eq("email", values.email).maybeSingle();
      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const {
          data: newClient,
          error: clientError
        } = await supabase.from("clients").insert({
          forename: values.forename,
          surname: values.surname,
          email: values.email,
          phone: values.phone,
          tags: ["event_client"]
        }).select("id").single();
        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      // Generate booking reference upfront
      const tempToken = crypto.randomUUID();
      const year = new Date().getFullYear();
      const bookingReference = `BK-${year}-${tempToken.substring(0, 8).toUpperCase()}`;

      // Insert booking with client_id and total_amount
      const {
        data,
        error
      } = await supabase.from("bookings").insert({
        booking_reference: bookingReference,
        email: values.email,
        surname: values.surname,
        forename: values.forename,
        phone: values.phone,
        event_date: values.event_date.toISOString().split("T")[0],
        room_choice: values.room_choice,
        package: values.package || null,
        late_bar: values.late_bar,
        event_types: values.event_types,
        further_details: values.further_details || null,
        guests: values.guests,
        resident_dj: values.resident_dj,
        food_required: values.food_required,
        status: "Provisional",
        client_id: clientId,
        total_amount: pricing?.subtotal || 0,
        deposit_amount: (pricing?.subtotal || 0) * 0.2 // 20% deposit
      }).select('confirmation_token, id').single();
      if (error) throw error;

      // Create invoice record (draft status, will be sent by admin)
      if (pricing && pricing.subtotal > 0) {
        const {
          data: invoice,
          error: invoiceError
        } = await supabase.from("invoices").insert({
          invoice_number: "",
          // Auto-generated by trigger
          booking_id: data.id,
          client_id: clientId,
          status: "draft",
          subtotal: pricing.subtotal,
          tax_amount: 0,
          discount_amount: 0,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          // 30 days from now
          notes: `Booking reference: ${bookingReference}`
        }).select("id").single();
        if (invoiceError) {
          console.error("Error creating invoice:", invoiceError);
        } else {
          // Link invoice to booking
          await supabase.from("bookings").update({
            invoice_id: invoice.id
          }).eq("id", data.id);

          // Create invoice line items
          if (pricing.lineItems.length > 0) {
            await supabase.from("invoice_line_items").insert(pricing.lineItems.map(item => ({
              invoice_id: invoice.id,
              description: item.description,
              quantity: 1,
              unit_price: item.amount
            })));
          }
        }
      }
      toast.success("Booking submitted successfully!");
      setShowConfirmModal(false);
      navigate(`/confirmation/${data.confirmation_token}`);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error submitting booking:", error);
      }
      toast.error("Failed to submit booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1EventType form={form} />;
      case 2:
        return <Step2RoomChoice form={form} />;
      case 3:
        return <Step3Package form={form} roomChoice={roomChoice} onNext={handleNext} />;
      case 4:
        return <Step4DateGuests form={form} roomChoice={roomChoice} />;
      case 5:
        return <Step5AddOns form={form} roomChoice={roomChoice} />;
      case 6:
        return <Step6Details form={form} />;
      case 7:
        return <Step7Contact form={form} />;
      case 8:
        return <Step8Review form={form} />;
      default:
        return null;
    }
  };
  return <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <div className="mb-6 flex justify-center">
            <img src={molineLogo} alt="The Moline Cross" className="h-40 w-auto" />
          </div>
          <h1 className="font-serif text-foreground mb-2 text-5xl">
            Event Booking
          </h1>
          <p className="text-muted-foreground">Complete your booking in simple steps</p>
        </div>

        <BookingSteps currentStep={currentStep} totalSteps={totalSteps} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {renderStep()}

                <div className="flex gap-4 pt-6">
                  {currentStep > 1 && <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>}

                  {currentStep < totalSteps && <Button type="button" onClick={handleNext} className="flex-1" variant="gradient">
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>}

                  {currentStep === totalSteps && <Button type="button" onClick={handleSubmitClick} className="flex-1" variant="gradient" size="lg" disabled={isSubmitting}>
                      Review & Submit Booking
                    </Button>}
                </div>
              </form>
            </Form>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <PricingSummary pricing={pricing} isLoading={isPricingLoading} roomChoice={roomChoice} residentDj={residentDj} />
            </div>
          </div>
        </div>

        <BookingConfirmationModal open={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={form.handleSubmit(onSubmit)} isSubmitting={isSubmitting} bookingData={form.getValues()} pricing={pricing || {
        basePrice: 0,
        guestPrice: 0,
        lateBarPrice: 0,
        residentDjPrice: 0,
        foodPrice: 0,
        subtotal: 0,
        lineItems: []
      }} />
      </div>
    </div>;
};
export default Booking;