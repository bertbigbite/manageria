import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package } from "lucide-react";

interface PackageModalProps {
  selectedPackage?: string;
  onSelectPackage: (packageName: string) => void;
}

const packages = [
  {
    name: "Package 1 - Day",
    description: "£95 - 4 hour room hire",
  },
  {
    name: "Package 1 - Evening",
    description: "£95 - 4 hour room hire",
  },
  {
    name: "Package 2 - Day",
    description: "£125 - 4 hour room hire including tablecloths",
  },
  {
    name: "Package 2 - Evening",
    description: "£125 - 4 hour room hire including tablecloths",
  },
  {
    name: "Wedding Package 1",
    description: "£450 - All day room hire, tablecloths, late bar included",
  },
  {
    name: "Wedding Package 2",
    description: "£650 - All day room hire, tablecloths, late bar, fizz toast OR welcome drink (up to 100 guests)",
  },
];

export const PackageModal = ({ selectedPackage, onSelectPackage }: PackageModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-full">
          <Package className="mr-2 h-4 w-4" />
          {selectedPackage || "View & Select Package (Optional)"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select a Package</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {packages.map((pkg) => (
            <Card
              key={pkg.name}
              className={`p-4 cursor-pointer transition-all hover:border-secondary ${
                selectedPackage === pkg.name ? "border-secondary bg-secondary/10" : ""
              }`}
              onClick={() => onSelectPackage(pkg.name)}
            >
              <h3 className="font-semibold text-lg">{pkg.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
              {selectedPackage === pkg.name && (
                <p className="text-xs text-secondary mt-2 font-medium">✓ Selected</p>
              )}
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
