import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsModalProps {
  children: React.ReactNode;
}

export const TermsModal = ({ children }: TermsModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms & Conditions</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-3 text-sm">
            <p>• The hirer is responsible for the conduct of all attendees.</p>
            <p>• The hirer will be charged for any damage caused to The Moline Cross property by any attendee.</p>
            <p>• External caterers CAN NOT be used, a range of catering options will be provided.</p>
            <p>• Any person appearing to be under the age of 25 will be asked for proof of identity.</p>
            <p>• Guests attending this function are requested to use the bar provided.</p>
            <p>• Drinks to be consumed 20 minutes after closing of the bar.</p>
            <p>• Room to be cleared 30 minutes after closing of the bar.</p>
            <p>• Only drinks purchased from the bar are allowed to be consumed on the premises. Any person not abiding by this rule will be asked to leave.</p>
            <p>• Guests attending the function WILL NOT have sole use of the outside terrace.</p>
            <p>• All music must cease on 'Time' being called.</p>
            <p>• All guests must exit the outside terrace by 10pm. Please respect our neighbours by leaving quietly.</p>
            <p>• Payments are refundable ONLY if cancelled within 3 weeks of making the original booking.</p>
            <p>• I acknowledge that at times when a cricket match is in progress it is my responsibility to ensure the safety of my guests when outside the function room.</p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
