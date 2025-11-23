import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, GraduationCap, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const TrainingDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalModules: 0,
    activeModules: 0,
    totalPolicies: 0,
    completionRate: 0
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
      .maybeSingle();

    const hasAccess = roles && (roles.role === "super_admin" || roles.role === "trainer");
    
    if (error || !hasAccess) {
      toast.error("Access denied");
      navigate("/admin/dashboard");
    }
  };

  const fetchStats = async () => {
    const [modulesRes, activeRes, policiesRes, progressRes] = await Promise.all([
      supabase.from("training_modules").select("id", { count: "exact", head: true }),
      supabase.from("training_modules").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("policies").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("training_progress").select("status", { count: "exact" })
    ]);

    const totalProgress = progressRes.data?.length || 0;
    const completed = progressRes.data?.filter(p => p.status === "complete").length || 0;
    const completionRate = totalProgress > 0 ? Math.round((completed / totalProgress) * 100) : 0;

    setStats({
      totalModules: modulesRes.count || 0,
      activeModules: activeRes.count || 0,
      totalPolicies: policiesRes.count || 0,
      completionRate
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training Management</h1>
          <p className="text-muted-foreground mt-1">Manage training modules, policies, and track progress</p>
        </div>
        <Button onClick={() => navigate("/admin/training/modules/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Training Module
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <div className="text-2xl font-bold">{stats.totalModules}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-green-500" />
              <div className="text-2xl font-bold">{stats.activeModules}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-purple-500" />
              <div className="text-2xl font-bold">{stats.totalPolicies}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/training/modules")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookOpen className="h-10 w-10 text-blue-500" />
              <div>
                <CardTitle>Training Modules</CardTitle>
                <CardDescription>Manage learning content</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create and manage training modules for staff. Add rich content, set categories, and track completion.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/training/policies")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-10 w-10 text-purple-500" />
              <div>
                <CardTitle>Company Policies</CardTitle>
                <CardDescription>Manage policy documents</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Publish and manage company policy documents. Make them accessible to all staff members.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/training/progress")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <GraduationCap className="h-10 w-10 text-green-500" />
              <div>
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>Monitor staff progress</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track individual and overall training progress. View completion rates and identify training gaps.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainingDashboard;
