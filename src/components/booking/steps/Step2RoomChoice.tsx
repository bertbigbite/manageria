import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { StepContainer } from "../StepContainer";
import { Users } from "lucide-react";

interface Step2RoomChoiceProps {
  form: UseFormReturn<any>;
}

export const Step2RoomChoice = ({ form }: Step2RoomChoiceProps) => {
  return (
    <StepContainer
      title="Select Your Venue"
      description="Choose the room that best fits your event size"
    >
      <FormField
        control={form.control}
        name="room_choice"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Room Choice *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid gap-4"
              >
                <label
                  htmlFor="function-room"
                  className={`flex items-start space-x-4 p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    field.value === "Function Room (max 100 guests)"
                      ? "border-primary bg-primary/5 shadow-lg"
                      : "border-border/50 hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="Function Room (max 100 guests)" id="function-room" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">Function Room</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Perfect for larger celebrations with up to 100 guests
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Includes access to late bar option and full event packages
                    </p>
                  </div>
                </label>

                <label
                  htmlFor="lounge"
                  className={`flex items-start space-x-4 p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    field.value === "Lounge (max 50 guests)"
                      ? "border-primary bg-primary/5 shadow-lg"
                      : "border-border/50 hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="Lounge (max 50 guests)" id="lounge" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">Lounge</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Intimate space ideal for smaller gatherings with up to 50 guests
                    </p>
                  </div>
                </label>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </StepContainer>
  );
};
