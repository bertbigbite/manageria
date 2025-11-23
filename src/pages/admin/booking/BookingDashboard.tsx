import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Heart, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const BookingDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingEvents: 0,
    totalClients: 0,
    weddingPlanners: 0
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
    const now = new Date();
    const [bookingsRes, upcomingRes, clientsRes, plannersRes] = await Promise.all([
      supabase.from("bookings").select("id", { count: "exact", head: true }),
      supabase.from("bookings").select("id", { count: "exact", head: true }).gte("event_date", now.toISOString().split("T")[0]),
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase.from("wedding_planners").select("id", { count: "exact", head: true })
    ]);

    setStats({
      totalBookings: bookingsRes.count || 0,
      upcomingEvents: upcomingRes.count || 0,
      totalClients: clientsRes.count || 0,
      weddingPlanners: plannersRes.count || 0
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Booking Management</h1>
          <p className="text-muted-foreground mt-1">Manage event bookings, clients, and wedding planners</p>
        </div>
        <Button onClick={() => navigate("/admin/booking/bookings/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Booking
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-purple-500" />
              <div className="text-2xl font-bold">{stats.totalClients}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Wedding Planners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-pink-500" />
              <div className="text-2xl font-bold">{stats.weddingPlanners}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/booking/bookings")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Calendar className="h-10 w-10 text-blue-500" />
              <div>
                <CardTitle>Event Bookings</CardTitle>
                <CardDescription>Manage all bookings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View, create, and manage event bookings. Track event details, dates, and guest information.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/booking/clients")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="h-10 w-10 text-purple-500" />
              <div>
                <CardTitle>Client Management</CardTitle>
                <CardDescription>Manage client records</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add and manage client information, contact details, and booking history.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/booking/wedding-planners")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Heart className="h-10 w-10 text-pink-500" />
              <div>
                <CardTitle>Wedding Planners</CardTitle>
                <CardDescription>Manage wedding details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create and manage wedding planning documents, schedules, and customizations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingDashboard;
