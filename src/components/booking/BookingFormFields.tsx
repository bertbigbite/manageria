import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { PackageModal } from "./PackageModal";

interface BookingFormFieldsProps {
  form: UseFormReturn<any>;
  roomChoice: string | undefined;
}

const eventTypeOptions = ["Wedding", "Birthday", "Engagement", "Christening", "Other"];

export const BookingFormFields = ({ form, roomChoice }: BookingFormFieldsProps) => {
  const isLounge = roomChoice === "Lounge (max 50 guests)";
  const isFunctionRoom = roomChoice === "Function Room (max 100 guests)";

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="forename"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forename *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="surname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Surname *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number *</FormLabel>
              <FormControl>
                <Input type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

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
        name="package"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Package (Optional)</FormLabel>
            <FormControl>
              <PackageModal
                selectedPackage={field.value}
                onSelectPackage={field.onChange}
              />
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
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Function Room (max 100 guests)">
                  Function Room (max 100 guests)
                </SelectItem>
                <SelectItem value="Lounge (max 50 guests)">
                  Lounge (max 50 guests)
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {isFunctionRoom && (
        <FormField
          control={form.control}
          name="late_bar"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Late Bar</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === "yes")}
                  value={field.value ? "yes" : "no"}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="late-bar-yes" />
                    <label htmlFor="late-bar-yes" className="cursor-pointer">Yes</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="late-bar-no" />
                    <label htmlFor="late-bar-no" className="cursor-pointer">No</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <p className="text-sm text-muted-foreground">
                Last orders 11:50pm – additional cost £40
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="event_types"
        render={() => (
          <FormItem>
            <FormLabel>Event Type *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {eventTypeOptions.map((eventType) => (
                <FormField
                  key={eventType}
                  control={form.control}
                  name="event_types"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(eventType)}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            const updated = checked
                              ? [...current, eventType]
                              : current.filter((val: string) => val !== eventType);
                            field.onChange(updated);
                          }}
                        />
                      </FormControl>
                      <label className="text-sm font-normal cursor-pointer">
                        {eventType}
                      </label>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="further_details"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Further Details</FormLabel>
            <FormControl>
              <Textarea
                placeholder="e.g. 21st Birthday, 50th Anniversary etc."
                className="resize-none"
                {...field}
              />
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
                min="1"
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
        name="resident_dj"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Resident DJ</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(value) => field.onChange(value === "yes")}
                value={field.value ? "yes" : "no"}
                className="flex gap-4"
                disabled={isLounge}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="dj-yes" disabled={isLounge} />
                  <label htmlFor="dj-yes" className={cn("cursor-pointer", isLounge && "opacity-50")}>
                    Yes
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="dj-no" />
                  <label htmlFor="dj-no" className="cursor-pointer">No</label>
                </div>
              </RadioGroup>
            </FormControl>
            {isLounge && (
              <p className="text-sm text-muted-foreground">
                DJ option only available for Function Room
              </p>
            )}
            {!isLounge && (
              <p className="text-sm text-muted-foreground">
                £150 for 7-11pm, £30 for each extra hour, payable on the evening
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="food_required"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Food Required</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(value) => field.onChange(value === "yes")}
                value={field.value ? "yes" : "no"}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="food-yes" />
                  <label htmlFor="food-yes" className="cursor-pointer">Yes</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="food-no" />
                  <label htmlFor="food-no" className="cursor-pointer">No</label>
                </div>
              </RadioGroup>
            </FormControl>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                External caterers cannot be used. Menus available on request
              </p>
              <a
                href="https://www.themolinecross.co.uk/_files/ugd/4376b1_ac768766344943c2949ab10bf2c1e4d6.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-secondary hover:text-secondary/80 inline-flex items-center gap-1"
              >
                View Catering Menu <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
