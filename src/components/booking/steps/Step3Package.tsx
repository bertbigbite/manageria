import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { StepContainer } from "../StepContainer";
import { PackageModal } from "../PackageModal";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Step3PackageProps {
  form: UseFormReturn<any>;
  roomChoice: string | undefined;
  onNext: () => void;
}

export const Step3Package = ({ form, roomChoice, onNext }: Step3PackageProps) => {
  const isFunctionRoom = roomChoice === "Function Room (max 100 guests)";

  if (!isFunctionRoom) {
    // Skip this step for Lounge - automatically proceed
    return (
      <StepContainer
        title="Package Selection"
        description="Package selection is only available for the Function Room"
      >
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-6">
            Packages are not available for the Lounge room.
          </p>
          <Button onClick={onNext} className="w-full" variant="gradient">
            Continue to Next Step
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </StepContainer>
    );
  }

  return (
    <StepContainer
      title="Select Your Package"
      description="Choose an optional package for your Function Room booking"
    >
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
            <p className="text-sm text-muted-foreground mt-2">
              Select a package or skip to customize your booking
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </StepContainer>
  );
};
