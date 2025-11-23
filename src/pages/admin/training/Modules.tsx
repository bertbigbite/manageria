import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Clock } from "lucide-react";

interface TrainingModule {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  estimated_time: number | null;
  status: string;
  created_at: string;
}

const Modules = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchModules();
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

  const fetchModules = async () => {
    const { data, error } = await supabase
      .from("training_modules")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load modules");
      console.error(error);
    } else {
      setModules(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training Modules</h1>
          <p className="text-muted-foreground mt-1">Manage training content</p>
        </div>
        <Button onClick={() => navigate("/admin/training/modules/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Module
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : modules.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No training modules found. Create your first module to get started.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Card
              key={module.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/admin/training/modules/${module.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <Badge variant={module.status === "active" ? "default" : "secondary"}>
                    {module.status}
                  </Badge>
                </div>
                {module.category && (
                  <Badge variant="outline" className="w-fit">
                    {module.category}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {module.description && (
                  <CardDescription className="line-clamp-2">
                    {module.description}
                  </CardDescription>
                )}
                {module.estimated_time && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{module.estimated_time} minutes</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Modules;
