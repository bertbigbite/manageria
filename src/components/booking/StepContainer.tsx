import { ReactNode } from "react";
import { GlassCard } from "@/components/ui/glass-card";
interface StepContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
}
const StepContainer = ({
  title,
  description,
  children
}: StepContainerProps) => {
  return <GlassCard className="p-8 animate-slide-up">
      <div className="mb-6">
        <h2 className="font-semibold text-foreground mb-2 font-serif text-3xl">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </GlassCard>;
};
export { StepContainer };