import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { StepContainer } from "../StepContainer";

interface Step6DetailsProps {
  form: UseFormReturn<any>;
}

export const Step6Details = ({ form }: Step6DetailsProps) => {
  return (
    <StepContainer
      title="Additional Details"
      description="Tell us more about your event (optional)"
    >
      <FormField
        control={form.control}
        name="further_details"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Further Details</FormLabel>
            <FormControl>
              <Textarea
                placeholder="e.g. 21st Birthday, 50th Anniversary, special requirements, etc."
                className="resize-none min-h-[150px]"
                {...field}
              />
            </FormControl>
            <p className="text-sm text-muted-foreground">
              Include any special requests or additional information about your event
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </StepContainer>
  );
};
