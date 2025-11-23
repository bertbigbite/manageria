import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, Users, FileText } from "lucide-react";
import { toast } from "sonner";

export default function AdminWeddingPlanners() {
  const navigate = useNavigate();

  const { data: planners, isLoading } = useQuery({
    queryKey: ["wedding-planners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wedding_planners")
        .select("*, bookings(forename, surname, booking_reference)")
        .order("wedding_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Wedding Planners</h1>
        <Button onClick={() => navigate("/admin/wedding-planners/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Planner
        </Button>
      </div>

      {!planners || planners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground mb-4">No wedding planners created yet</p>
            <Button onClick={() => navigate("/admin/wedding-planners/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Planner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {planners.map((planner) => (
            <Card
              key={planner.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/admin/wedding-planners/${planner.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{planner.couple_names}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    v{planner.version}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(planner.wedding_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    {planner.guests_count} guests
                  </div>
                  <div className="text-muted-foreground">
                    {planner.venue_name}
                  </div>
                  {planner.bookings && (
                    <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                      Linked to: {planner.bookings.forename} {planner.bookings.surname} (
                      {planner.bookings.booking_reference})
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
