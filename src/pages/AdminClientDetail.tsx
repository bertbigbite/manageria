// @ts-nocheck
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Mail, Phone, Building } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatCurrency } from "@/services/pricingService";

interface Client {
  id: string;
  forename: string;
  surname: string;
  email: string;
  phone: string;
  company_name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postcode: string | null;
  total_bookings: number;
  total_spent: number;
  outstanding_balance: number;
  tags: string[];
}

interface Booking {
  id: string;
  booking_reference: string;
  event_date: string;
  room_choice: string;
  status: string;
  total_amount: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  total_amount: number;
  amount_paid: number;
  amount_owed: number;
  status: string;
}

const AdminClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const fetchClientData = async () => {
    try {
      // Fetch client details
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);

      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("id, booking_reference, event_date, room_choice, status, total_amount")
        .eq("client_id", id)
        .order("event_date", { ascending: false });

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);

      // Fetch invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices")
        .select("id, invoice_number, issue_date, total_amount, amount_paid, amount_owed, status")
        .eq("client_id", id)
        .order("issue_date", { ascending: false });

      if (invoicesError) throw invoicesError;
      setInvoices(invoicesData || []);
    } catch (error) {
      console.error("Error fetching client data:", error);
      toast.error("Failed to load client details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Client not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {client.forename} {client.surname}
          </h1>
          {client.company_name && (
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Building className="h-4 w-4" />
              {client.company_name}
            </p>
          )}
        </div>
        <Button onClick={() => navigate(`/admin/clients/${id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Client
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${client.email}`} className="hover:underline">
                {client.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${client.phone}`} className="hover:underline">
                {client.phone}
              </a>
            </div>
            {client.address_line1 && (
              <div className="text-sm text-muted-foreground">
                <p>{client.address_line1}</p>
                {client.address_line2 && <p>{client.address_line2}</p>}
                {client.city && <p>{client.city}</p>}
                {client.postcode && <p>{client.postcode}</p>}
              </div>
            )}
            {client.tags && client.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {client.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Bookings</span>
              <span className="font-semibold">{client.total_bookings}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Spent</span>
              <span className="font-semibold">{formatCurrency(client.total_spent)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Outstanding Balance</span>
              <span className="font-semibold text-destructive">
                {formatCurrency(client.outstanding_balance)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <Card>
            <CardContent className="pt-6">
              {bookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No bookings found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Event Date</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow
                        key={booking.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/admin/booking/${booking.id}`)}
                      >
                        <TableCell className="font-medium">
                          {booking.booking_reference}
                        </TableCell>
                        <TableCell>
                          {format(new Date(booking.event_date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>{booking.room_choice}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{booking.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(booking.total_amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardContent className="pt-6">
              {invoices.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No invoices found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Owed</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow
                        key={invoice.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
                      >
                        <TableCell className="font-medium">
                          {invoice.invoice_number}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.issue_date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(invoice.total_amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(invoice.amount_paid)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(invoice.amount_owed)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{invoice.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminClientDetail;
