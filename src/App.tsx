import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Booking from "./pages/Booking";
import Confirmation from "./pages/Confirmation";
import AdminLogin from "./pages/AdminLogin";
import AdminSetup from "./pages/AdminSetup";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBookings from "./pages/AdminBookings";
import AdminClients from "./pages/AdminClients";
import AdminWeddingPlanners from "./pages/AdminWeddingPlanners";
import AdminWeddingPlanner from "./pages/AdminWeddingPlanner";
import WeddingPlannerPublic from "./pages/WeddingPlannerPublic";
import BookingDetail from "./pages/BookingDetail";
import AdminClientDetail from "./pages/AdminClientDetail";
import AdminClientForm from "./pages/AdminClientForm";
import AdminBookingForm from "./pages/AdminBookingForm";
import BookingDashboard from "./pages/admin/booking/BookingDashboard";
import HRDashboard from "./pages/admin/hr/HRDashboard";
import Employees from "./pages/admin/hr/Employees";
import EmployeeDetail from "./pages/admin/hr/EmployeeDetail";
import AdminEmployeeForm from "./pages/AdminEmployeeForm";
import Contracts from "./pages/admin/hr/Contracts";
import AdminContractForm from "./pages/AdminContractForm";
import TrainingDashboard from "./pages/admin/training/TrainingDashboard";
import Modules from "./pages/admin/training/Modules";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/admin/AdminLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/confirmation/:confirmationToken" element={<Confirmation />} />
          <Route path="/admin/setup" element={<AdminSetup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* Booking Module */}
            <Route path="/admin/booking" element={<BookingDashboard />} />
            <Route path="/admin/booking/bookings" element={<AdminBookings />} />
            <Route path="/admin/booking/bookings/new" element={<AdminBookingForm />} />
            <Route path="/admin/booking/bookings/:id" element={<BookingDetail />} />
            <Route path="/admin/booking/bookings/:id/edit" element={<AdminBookingForm />} />
            <Route path="/admin/booking/clients" element={<AdminClients />} />
            <Route path="/admin/booking/clients/new" element={<AdminClientForm />} />
            <Route path="/admin/booking/clients/:id" element={<AdminClientDetail />} />
            <Route path="/admin/booking/clients/:id/edit" element={<AdminClientForm />} />
            <Route path="/admin/booking/wedding-planners" element={<AdminWeddingPlanners />} />
            <Route path="/admin/booking/wedding-planners/:id" element={<AdminWeddingPlanner />} />
            
            {/* HR Module */}
            <Route path="/admin/hr" element={<HRDashboard />} />
            <Route path="/admin/hr/employees" element={<Employees />} />
            <Route path="/admin/hr/employees/new" element={<AdminEmployeeForm />} />
            <Route path="/admin/hr/employees/:id" element={<EmployeeDetail />} />
            <Route path="/admin/hr/employees/edit/:id" element={<AdminEmployeeForm />} />
            <Route path="/admin/hr/contracts" element={<Contracts />} />
            <Route path="/admin/hr/contracts/new" element={<AdminContractForm />} />
            <Route path="/admin/hr/contracts/edit/:id" element={<AdminContractForm />} />
            
            {/* Training Module */}
            <Route path="/admin/training" element={<TrainingDashboard />} />
            <Route path="/admin/training/modules" element={<Modules />} />
          </Route>
          <Route path="/wedding/:token" element={<WeddingPlannerPublic />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
