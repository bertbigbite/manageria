import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { DisclaimerModal } from "./DisclaimerModal";
import { TermsModal } from "./TermsModal";

interface BookingFormCheckboxesProps {
  form: UseFormReturn<any>;
}

export const BookingFormCheckboxes = ({ form }: BookingFormCheckboxesProps) => {
  return (
    <div className="space-y-4 border-t pt-6">
      <FormField
        control={form.control}
        name="food_safety_accepted"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="cursor-pointer">
                I have read the{" "}
                <DisclaimerModal>
                  <span className="underline text-secondary hover:text-secondary/80 cursor-pointer">
                    food safety disclaimer
                  </span>
                </DisclaimerModal>{" "}
                and accept all responsibility *
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="conditions_accepted"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="cursor-pointer">
                I have read and accept the{" "}
                <TermsModal>
                  <span className="underline text-secondary hover:text-secondary/80 cursor-pointer">
                    conditions of hire
                  </span>
                </TermsModal>{" "}
                *
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};
