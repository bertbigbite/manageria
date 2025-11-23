// @ts-nocheck
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, ArrowLeft, Building2, Mail, Phone, TrendingUp, DollarSign } from "lucide-react";

interface Client {
  id: string;
  forename: string;
  surname: string;
  email: string;
  phone: string;
  company_name: string | null;
  total_bookings: number;
  total_spent: number;
  outstanding_balance: number;
}

const AdminClients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    checkAuth();
    fetchClients();
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
      .eq("role", "admin")
      .maybeSingle();

    if (error || !roles) {
      toast.error("Access denied: Admin privileges required");
      await supabase.auth.signOut();
      navigate("/admin/login");
    }
  };

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch clients");
    } else {
      setClients(data || []);
    }
    setLoading(false);
  };

  const filteredClients = clients.filter(client =>
    `${client.forename} ${client.surname} ${client.email} ${client.company_name || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-serif font-bold">Clients</h1>
              <p className="text-muted-foreground mt-1">Manage your client database</p>
            </div>
            <Button onClick={() => navigate("/admin/clients/new")}>
              <Plus className="mr-2 h-4 w-4" />
              New Client
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card
              key={client.id}
              className="hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => navigate(`/admin/clients/${client.id}`)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center justify-between">
                  <span className="group-hover:text-primary transition-colors">
                    {client.forename} {client.surname}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {client.company_name && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{client.company_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{client.phone}</span>
                </div>
                
                <div className="pt-3 border-t mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Total Bookings
                    </span>
                    <Badge variant="secondary">{client.total_bookings || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Total Spent
                    </span>
                    <span className="font-semibold">£{(client.total_spent || 0).toFixed(2)}</span>
                  </div>
                  {client.outstanding_balance > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Outstanding</span>
                      <span className="font-semibold text-destructive">
                        £{client.outstanding_balance.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No clients found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClients;
