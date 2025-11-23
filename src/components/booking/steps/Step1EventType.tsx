import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { StepContainer } from "../StepContainer";

interface Step1EventTypeProps {
  form: UseFormReturn<any>;
}

const eventTypeOptions = ["Wedding", "Birthday", "Engagement", "Christening", "Other"];

export const Step1EventType = ({ form }: Step1EventTypeProps) => {
  return (
    <StepContainer
      title="Event Type"
      description="What type of celebration are you planning?"
    >
      <FormField
        control={form.control}
        name="event_types"
        render={() => (
          <FormItem>
            <FormLabel>Select one or more *</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {eventTypeOptions.map((eventType) => (
                <FormField
                  key={eventType}
                  control={form.control}
                  name="event_types"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 space-y-0 p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
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
                      <label className="text-sm font-medium cursor-pointer">
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
    </StepContainer>
  );
};
