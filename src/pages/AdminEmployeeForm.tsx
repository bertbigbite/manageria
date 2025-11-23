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
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const employeeSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().min(1, "Phone number is required").max(20),
  address: z.string().min(1, "Address is required").max(500),
  bank_details_encrypted: z.string().min(1, "Bank details are required").max(500),
  national_insurance_number: z
    .string()
    .min(1, "National insurance number is required")
    .regex(/^[A-Z]{2}[0-9]{6}[A-Z]?$/, "Invalid NI number format (e.g., AB123456C)"),
  start_date: z.string().min(1, "Start date is required"),
  employment_status: z.enum(["active", "inactive"], {
    required_error: "Employment status is required",
  }),
  role: z.enum([
    "Manager",
    "Assistant Manager",
    "Team Leader",
    "Staff",
    "Supervisor",
    "Coordinator",
    "Administrator",
    "Director",
    "Chef",
    "Bartender",
    "Server",
    "Host",
    "Cleaner",
    "Maintenance",
    "Security",
    "Other"
  ], {
    required_error: "Role is required",
  }),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

const AdminEmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!id;

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      address: "",
      bank_details_encrypted: "",
      national_insurance_number: "",
      start_date: new Date().toISOString().split("T")[0],
      employment_status: "active",
      role: "Staff",
    },
  });

  useEffect(() => {
    checkAuth();
    if (isEditMode) {
      fetchEmployee();
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

  const fetchEmployee = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      form.reset({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || "",
        address: data.address || "",
        bank_details_encrypted: data.bank_details_encrypted || "",
        national_insurance_number: data.national_insurance_number || "",
        start_date: data.start_date,
        employment_status: data.employment_status as "active" | "inactive",
        role: data.role as EmployeeFormValues["role"],
      });
    } catch (error) {
      console.error("Error fetching employee:", error);
      toast.error("Failed to load employee details");
      navigate("/admin/hr/employees");
    }
  };

  const onSubmit = async (values: EmployeeFormValues) => {
    setLoading(true);
    try {
      const employeeData = {
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        bank_details_encrypted: values.bank_details_encrypted,
        national_insurance_number: values.national_insurance_number,
        start_date: values.start_date,
        employment_status: values.employment_status,
        role: values.role,
      };

      if (isEditMode) {
        const { error } = await supabase
          .from("employees")
          .update(employeeData)
          .eq("id", id);

        if (error) throw error;
        toast.success("Employee updated successfully");
        navigate("/admin/hr/employees");
      } else {
        const { error } = await supabase
          .from("employees")
          .insert([employeeData]);

        if (error) throw error;
        toast.success("Employee created successfully");
        navigate("/admin/hr/employees");
      }
    } catch (error) {
      console.error("Error saving employee:", error);
      toast.error("Failed to save employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/hr/employees")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditMode ? "Edit Employee" : "New Employee"}
        </h1>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          All sensitive data (bank details, NI numbers) should be encrypted at rest in the database.
          Handle this information with appropriate security measures.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Smith" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} placeholder="john@example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+44 1234 567890" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address *</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Full address including postcode" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <h3 className="text-lg font-semibold">Sensitive Information</h3>
                
                <FormField
                  control={form.control}
                  name="national_insurance_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>National Insurance Number *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="AB123456C"
                          maxLength={9}
                          className="uppercase"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bank_details_encrypted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Details *</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Bank name, account number, sort code"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Assistant Manager">Assistant Manager</SelectItem>
                          <SelectItem value="Team Leader">Team Leader</SelectItem>
                          <SelectItem value="Staff">Staff</SelectItem>
                          <SelectItem value="Supervisor">Supervisor</SelectItem>
                          <SelectItem value="Coordinator">Coordinator</SelectItem>
                          <SelectItem value="Administrator">Administrator</SelectItem>
                          <SelectItem value="Director">Director</SelectItem>
                          <SelectItem value="Chef">Chef</SelectItem>
                          <SelectItem value="Bartender">Bartender</SelectItem>
                          <SelectItem value="Server">Server</SelectItem>
                          <SelectItem value="Host">Host</SelectItem>
                          <SelectItem value="Cleaner">Cleaner</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Security">Security</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="employment_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employment status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : isEditMode ? "Update Employee" : "Create Employee"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/hr/employees")}
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

export default AdminEmployeeForm;
