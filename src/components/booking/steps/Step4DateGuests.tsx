import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { StepContainer } from "../StepContainer";

interface Step4DateGuestsProps {
  form: UseFormReturn<any>;
  roomChoice: string | undefined;
}

export const Step4DateGuests = ({ form, roomChoice }: Step4DateGuestsProps) => {
  const maxGuests = roomChoice === "Function Room (max 100 guests)" ? 100 : 50;

  return (
    <StepContainer
      title="Event Details"
      description="When is your event and how many guests?"
    >
      <FormField
        control={form.control}
        name="event_date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Event Date *</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
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
                min="1"
                max={maxGuests}
                placeholder={`Max ${maxGuests} guests`}
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <p className="text-sm text-muted-foreground">
              Maximum capacity: {maxGuests} guests
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </StepContainer>
  );
};
