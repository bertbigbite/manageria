import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingStepsProps {
  currentStep: number;
  totalSteps: number;
}

const BookingSteps = ({ currentStep, totalSteps }: BookingStepsProps) => {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-center">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          
          return (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                  isCompleted && "bg-primary text-white shadow-lg",
                  isCurrent && "bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_20px_rgba(123,97,255,0.5)] scale-110",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{step}</span>
                )}
              </div>
              {step < totalSteps && (
                <div
                  className={cn(
                    "w-12 sm:w-16 h-1 mx-1 transition-all duration-300",
                    step < currentStep ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    </div>
  );
};

export { BookingSteps };
