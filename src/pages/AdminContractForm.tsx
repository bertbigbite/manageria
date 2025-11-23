import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const contractSchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Contract content is required"),
  status: z.enum(["active", "archived"], {
    required_error: "Status is required",
  }),
  weekly_hours: z.number().min(0, "Weekly hours must be positive"),
  pay_rate: z.number().min(0, "Pay rate must be positive"),
});

type ContractFormValues = z.infer<typeof contractSchema>;

interface Employee {
  id: string;
  full_name: string;
}

const AdminContractForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const isEditMode = !!id;
  
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedEmployeeId = urlParams.get("employee_id");

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      employee_id: preselectedEmployeeId || "",
      title: "",
      content: "",
      status: "active",
      weekly_hours: 0,
      pay_rate: 0,
    },
  });

  useEffect(() => {
    checkAuth();
    fetchEmployees();
    if (isEditMode) {
      fetchContract();
    }
  }, [id]);

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

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("employees")
      .select("id, full_name")
      .eq("employment_status", "active")
      .order("full_name");

    if (error) {
      toast.error("Failed to load employees");
      console.error(error);
    } else {
      setEmployees(data || []);
    }
  };

  const fetchContract = async () => {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      form.reset({
        employee_id: data.employee_id,
        title: data.title,
        content: data.content,
        status: data.status as "active" | "archived",
        weekly_hours: Number(data.weekly_hours) || 0,
        pay_rate: Number(data.pay_rate) || 0,
      });
    } catch (error) {
      console.error("Error fetching contract:", error);
      toast.error("Failed to load contract details");
      navigate("/admin/hr/contracts");
    }
  };

  const onSubmit = async (values: ContractFormValues) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const contractData = {
        employee_id: values.employee_id,
        title: values.title,
        content: values.content,
        status: values.status,
        weekly_hours: values.weekly_hours,
        pay_rate: values.pay_rate,
        created_by: session?.user.id,
      };

      if (isEditMode) {
        const { error } = await supabase
          .from("contracts")
          .update(contractData)
          .eq("id", id);

        if (error) throw error;
        toast.success("Contract updated successfully");
      } else {
        const { error } = await supabase
          .from("contracts")
          .insert([contractData]);

        if (error) throw error;
        toast.success("Contract created successfully");
      }
      navigate("/admin/hr/contracts");
    } catch (error) {
      console.error("Error saving contract:", error);
      toast.error("Failed to save contract");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/hr/contracts")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditMode ? "Edit Contract" : "New Contract"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contract Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Title *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Employment Contract" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Content *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Enter the full contract terms and conditions..."
                        rows={15}
                        className="font-mono text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="weekly_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weekly Hours *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          placeholder="e.g., 8, 16, 40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pay_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pay Rate (£/hour) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          placeholder="e.g., 11.72"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : isEditMode ? "Update Contract" : "Create Contract"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/hr/contracts")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminContractForm;
