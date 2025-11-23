import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { StepContainer } from "../StepContainer";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface Step5AddOnsProps {
  form: UseFormReturn<any>;
  roomChoice: string | undefined;
}

export const Step5AddOns = ({ form, roomChoice }: Step5AddOnsProps) => {
  const isLounge = roomChoice === "Lounge (max 50 guests)";
  const isFunctionRoom = roomChoice === "Function Room (max 100 guests)";
  const selectedPackage = form.watch("package");
  const isWeddingPackage = selectedPackage?.includes("Wedding Package");

  return (
    <StepContainer
      title="Enhancements & Add-Ons"
      description="Customize your event with additional services"
    >
      {isFunctionRoom && !isWeddingPackage && (
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

      {isFunctionRoom && isWeddingPackage && (
        <div className="space-y-2 p-4 rounded-lg border bg-muted/50">
          <p className="font-semibold">Late Bar</p>
          <p className="text-sm text-muted-foreground">
            Late bar is included in your wedding package
          </p>
        </div>
      )}

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
                £150 for 7-11pm, £30 for each extra hour - Cash payment on the evening
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
    </StepContainer>
  );
};
