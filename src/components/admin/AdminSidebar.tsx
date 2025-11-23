import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, Users, GraduationCap, FileText, Heart, LogOut, Building2, BookOpen } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const mainMenu = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard
  }
];

const bookingMenu = [
  {
    title: "Bookings",
    url: "/admin/booking/bookings",
    icon: Calendar
  },
  {
    title: "Clients",
    url: "/admin/booking/clients",
    icon: Users
  },
  {
    title: "Wedding Planners",
    url: "/admin/booking/wedding-planners",
    icon: Heart
  }
];

const hrMenu = [
  {
    title: "Employees",
    url: "/admin/hr/employees",
    icon: Users
  },
  {
    title: "Contracts",
    url: "/admin/hr/contracts",
    icon: FileText
  }
];

const trainingMenu = [
  {
    title: "Training Modules",
    url: "/admin/training/modules",
    icon: BookOpen
  },
  {
    title: "Policies",
    url: "/admin/training/policies",
    icon: FileText
  },
  {
    title: "Progress Tracking",
    url: "/admin/training/progress",
    icon: GraduationCap
  }
];
export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { open } = useSidebar();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      navigate("/admin/login");
    }
  };

  const isActive = (url: string) => {
    return location.pathname === url || location.pathname.startsWith(url + "/");
  };

  const renderMenuSection = (title: string, items: typeof mainMenu) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider">
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.url)}
                tooltip={item.title}
                className="h-10"
              >
                <a href={item.url} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {open && <span>{item.title}</span>}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className={open ? "w-64" : "w-14"}>
      <div className="p-4 flex justify-between items-center border-b">
        {open && <Building2 className="h-6 w-6" />}
        <SidebarTrigger />
      </div>

      <SidebarContent>
        {renderMenuSection("Main", mainMenu)}
        <Separator className="my-4" />
        {renderMenuSection("Booking", bookingMenu)}
        <Separator className="my-4" />
        {renderMenuSection("HR", hrMenu)}
        <Separator className="my-4" />
        {renderMenuSection("Training", trainingMenu)}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start h-10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              {open && <span>Logout</span>}
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}