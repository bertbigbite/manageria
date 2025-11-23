import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, GraduationCap, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
const AdminDashboard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    checkAuth();
  }, []);
  const checkAuth = async () => {
    const {
      data: {
        session
      }
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }
    const {
      data: roles,
      error
    } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "super_admin").maybeSingle();
    if (error || !roles) {
      toast.error("Access denied: Super Admin privileges required");
      await supabase.auth.signOut();
      navigate("/admin/login");
    }
  };
  const modules = [{
    title: "Booking Management",
    description: "Manage event bookings, clients, and wedding planners",
    icon: Calendar,
    path: "/admin/booking",
    color: "from-blue-500 to-blue-600"
  }, {
    title: "HR Management",
    description: "Manage employees, contracts, and documents",
    icon: Users,
    path: "/admin/hr",
    color: "from-green-500 to-green-600"
  }, {
    title: "Training Management",
    description: "Manage training modules, policies, and staff progress",
    icon: GraduationCap,
    path: "/admin/training",
    color: "from-purple-500 to-purple-600"
  }];
  return <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome to your unified management platform</p>
        </div>
        <Building2 className="h-12 w-12 text-muted-foreground" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {modules.map(module => <Card key={module.path} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className={`h-2 bg-gradient-to-r ${module.color}`} />
            <CardHeader className="py-16">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${module.color}`}>
                  <module.icon className="h-6 w-6 text-white" />
                </div>
                <div className="pr-20">
                  <CardTitle className="text-3xl">{module.title}</CardTitle>
                </div>
              </div>
              <CardDescription className="mt-3">{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate(module.path)} className="w-full px-[20px] py-[30px] text-lg">
                Open {module.title}
              </Button>
            </CardContent>
          </Card>)}
      </div>

      <Card>
        <CardHeader className="text-left">
          <CardTitle className="text-3xl">Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Button variant="outline" onClick={() => navigate("/admin/booking/bookings/new")}>
            <Calendar className="mr-2 h-4 w-4" />
            New Booking
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/hr/employees/new")}>
            <Users className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/training/modules/new")}>
            <GraduationCap className="mr-2 h-4 w-4" />
            Create Training Module
          </Button>
        </CardContent>
      </Card>
    </div>;
};
export default AdminDashboard;