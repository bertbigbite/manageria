import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, UserPlus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const HRDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalContracts: 0,
    activeContracts: 0
  });

  useEffect(() => {
    checkAuth();
    fetchStats();
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

  const fetchStats = async () => {
    const [employeesRes, activeRes, contractsRes, activeContractsRes] = await Promise.all([
      supabase.from("employees").select("id", { count: "exact", head: true }),
      supabase.from("employees").select("id", { count: "exact", head: true }).eq("employment_status", "active"),
      supabase.from("contracts").select("id", { count: "exact", head: true }),
      supabase.from("contracts").select("id", { count: "exact", head: true }).eq("status", "active")
    ]);

    setStats({
      totalEmployees: employeesRes.count || 0,
      activeEmployees: activeRes.count || 0,
      totalContracts: contractsRes.count || 0,
      activeContracts: activeContractsRes.count || 0
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">HR Management</h1>
          <p className="text-muted-foreground mt-1">Manage employees, contracts, and documents</p>
        </div>
        <Button onClick={() => navigate("/admin/hr/employees/new")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-green-500" />
              <div className="text-2xl font-bold">{stats.activeEmployees}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-purple-500" />
              <div className="text-2xl font-bold">{stats.totalContracts}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-orange-500" />
              <div className="text-2xl font-bold">{stats.activeContracts}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/hr/employees")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="h-10 w-10 text-blue-500" />
              <div>
                <CardTitle>Employee Management</CardTitle>
                <CardDescription>View and manage all employees</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add, edit, and manage employee records including personal details, bank information, and employment status.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/hr/contracts")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-10 w-10 text-purple-500" />
              <div>
                <CardTitle>Contracts & Documents</CardTitle>
                <CardDescription>Manage employment contracts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create, view, and manage employment contracts. Export contracts as PDFs and email them to employees.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HRDashboard;
