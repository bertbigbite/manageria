import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, FileText, Mail } from "lucide-react";
import { generateContractPDF } from "@/services/contractPdfService";

interface Contract {
  id: string;
  employee_id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  weekly_hours: number;
  pay_rate: number;
  employees?: {
    full_name: string;
    email: string;
    role: string;
    start_date: string;
  };
}

const Contracts = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchContracts();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }

    const { data: roles, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "super_admin")
      .maybeSingle();

    if (error || !roles) {
      toast.error("Access denied");
      navigate("/admin/dashboard");
    }
  };

  const fetchContracts = async () => {
    const { data, error } = await supabase
      .from("contracts")
      .select(`
        *,
        employees (
          full_name,
          email,
          role,
          start_date
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load contracts");
      console.error(error);
    } else {
      setContracts(data || []);
    }
    setLoading(false);
  };

  const downloadPDF = async (contract: Contract) => {
    if (!contract.employees) {
      toast.error("Employee information not found");
      return;
    }

    try {
      const doc = await generateContractPDF(contract.employees, contract);
      doc.save(`${contract.employees.full_name.replace(/\s+/g, '_')}_Contract.pdf`);
      toast.success("Contract downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate contract PDF");
    }
  };

  const emailContract = async (contract: Contract) => {
    if (!contract.employees?.email) {
      toast.error("Employee email not found");
      return;
    }

    setSendingEmail(contract.id);
    try {
      const doc = await generateContractPDF(contract.employees, contract);
      const pdfBlob = doc.output("blob");
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64Content = base64data.split(",")[1];

        const { error } = await supabase.functions.invoke("send-contract", {
          body: {
            to: contract.employees?.email,
            employeeName: contract.employees?.full_name,
            contractTitle: contract.title,
            pdfContent: base64Content,
          },
        });

        if (error) throw error;
        toast.success("Contract emailed successfully");
      };

      reader.readAsDataURL(pdfBlob);
    } catch (error) {
      console.error("Error emailing contract:", error);
      toast.error("Failed to email contract");
    } finally {
      setSendingEmail(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contracts</h1>
          <p className="text-muted-foreground mt-1">Manage employee contracts</p>
        </div>
        <Button onClick={() => navigate("/admin/hr/contracts/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Contract
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Contracts</CardTitle>
          <CardDescription>Create, edit, and send contracts to employees</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No contracts found. Create your first contract to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.title}</TableCell>
                    <TableCell>{contract.employees?.full_name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={contract.status === "active" ? "default" : "secondary"}>
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(contract.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/hr/contracts/edit/${contract.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadPDF(contract)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => emailContract(contract)}
                          disabled={sendingEmail === contract.id}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Contracts;
