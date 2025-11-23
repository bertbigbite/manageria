// @ts-nocheck
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Booking {
  id: string;
  booking_reference: string;
  forename: string;
  surname: string;
  email: string;
  phone: string;
  event_date: string;
  room_choice: string;
  guests: number;
  status: string;
  created_at: string;
}

const AdminBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch bookings");
      if (import.meta.env.DEV) {
        console.error(error);
      }
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
      if (import.meta.env.DEV) {
        console.error(error);
      }
    } else {
      toast.success("Status updated successfully");
      fetchBookings();
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Reference",
      "Name",
      "Email",
      "Phone",
      "Event Date",
      "Room",
      "Guests",
      "Status",
    ];
    
    const rows = bookings.map((b) => [
      b.booking_reference,
      `${b.forename} ${b.surname}`,
      b.email,
      b.phone,
      new Date(b.event_date).toLocaleDateString("en-GB"),
      b.room_choice,
      b.guests,
      b.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif font-bold">Bookings</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/admin/bookings/new")} variant="gradient">
            New Booking
          </Button>
          <Button onClick={exportToCSV} variant="outline">
            Export CSV
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Event Date</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">
                  {booking.booking_reference}
                </TableCell>
                <TableCell>
                  {booking.forename} {booking.surname}
                </TableCell>
                <TableCell>{booking.email}</TableCell>
                <TableCell>
                  {new Date(booking.event_date).toLocaleDateString("en-GB")}
                </TableCell>
                <TableCell>{booking.room_choice}</TableCell>
                <TableCell>{booking.guests}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      booking.status === "Confirmed"
                        ? "default"
                        : booking.status === "Cancelled"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/admin/booking/${booking.id}`)}
                    >
                      View Details
                    </Button>
                    <Select
                      value={booking.status}
                      onValueChange={(value) => updateStatus(booking.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Provisional">Provisional</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminBookings;
