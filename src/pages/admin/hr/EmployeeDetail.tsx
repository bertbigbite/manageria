import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Download, Mail } from "lucide-react";
import { toast } from "sonner";
import { generateContractPDF } from "@/services/contractPdfService";

interface Employee {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  employment_status: string;
  start_date: string;
  address: string | null;
  national_insurance_number: string | null;
}

interface Contract {
  id: string;
  title: string;
  status: string;
  created_at: string;
  weekly_hours: number;
  pay_rate: number;
}

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  uploaded_at: string;
}

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    if (id) {
      fetchEmployeeDetails();
      fetchContracts();
      fetchDocuments();
    }
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (!roleData || roleData.role !== "super_admin") {
      navigate("/admin/login");
      return;
    }
  };

  const fetchEmployeeDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setEmployee(data);
    } catch (error) {
      console.error("Error fetching employee:", error);
      toast.error("Failed to load employee details");
    } finally {
      setLoading(false);
    }
  };

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("employee_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error("Error fetching contracts:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("employee_documents")
        .select("*")
        .eq("employee_id", id)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const downloadContract = async (contract: Contract) => {
    if (!employee) return;

    try {
      const pdf = await generateContractPDF(employee, contract);
      pdf.save(`${employee.full_name.replace(/\s+/g, "_")}_Contract.pdf`);
      toast.success("Contract downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate contract PDF");
    }
  };

  const emailContract = async (contract: Contract) => {
    if (!employee) return;

    setSendingEmail(contract.id);
    try {
      const pdf = await generateContractPDF(employee, contract);
      const pdfBlob = pdf.output("blob");
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64Content = base64data.split(",")[1];

        const { error } = await supabase.functions.invoke("send-contract", {
          body: {
            to: employee.email,
            employeeName: employee.full_name,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Employee not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/hr/employees")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Employees
        </Button>
        <h1 className="text-3xl font-bold">{employee.full_name}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-semibold">Email:</span> {employee.email}
            </div>
            <div>
              <span className="font-semibold">Phone:</span> {employee.phone || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Role:</span> {employee.role}
            </div>
            <div>
              <span className="font-semibold">Status:</span>{" "}
              <span className={employee.employment_status === "active" ? "text-green-600" : "text-red-600"}>
                {employee.employment_status}
              </span>
            </div>
            <div>
              <span className="font-semibold">Start Date:</span>{" "}
              {new Date(employee.start_date).toLocaleDateString()}
            </div>
            {employee.address && (
              <div>
                <span className="font-semibold">Address:</span> {employee.address}
              </div>
            )}
            {employee.national_insurance_number && (
              <div>
                <span className="font-semibold">NI Number:</span> {employee.national_insurance_number}
              </div>
            )}
            <div className="pt-4">
              <Button onClick={() => navigate(`/admin/hr/employees/edit/${employee.id}`)}>
                Edit Employee
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contracts</CardTitle>
              <Button onClick={() => navigate(`/admin/hr/contracts/new?employee_id=${employee.id}`)}>
                New Contract
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {contracts.length === 0 ? (
              <p className="text-muted-foreground">No contracts found</p>
            ) : (
              <div className="space-y-3">
                {contracts.map((contract) => (
                  <div key={contract.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{contract.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(contract.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm">
                          {contract.weekly_hours} hours/week at £{contract.pay_rate}/hour
                        </p>
                      </div>
                      <span className={`text-sm px-2 py-1 rounded ${
                        contract.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {contract.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/hr/contracts/edit/${contract.id}`)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadContract(contract)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => emailContract(contract)}
                        disabled={sendingEmail === contract.id}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        {sendingEmail === contract.id ? "Sending..." : "Email"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Documents</CardTitle>
              <Button>Upload Document</Button>
            </div>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-muted-foreground">No documents found</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <p className="font-medium">{doc.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(doc.file_url, "_blank")}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
