import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface DisclaimerModalProps {
  children: React.ReactNode;
}

export const DisclaimerModal = ({ children }: DisclaimerModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Food Safety Disclaimer</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm py-4">
          <p>The Moline Cross accepts no responsibility for any food items removed from the premises for consumption at a later time.</p>
          <p>It is the sole responsibility of the guest, and any individuals who partake in the consumption of this food, that they do so entirely at their own risk.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
