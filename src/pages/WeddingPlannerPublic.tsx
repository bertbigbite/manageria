import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Calendar, Users, MapPin } from "lucide-react";
import { downloadWeddingPlannerPDF } from "@/services/weddingPlannerPdfService";
import { toast } from "sonner";
import molineLogo from "@/assets/moline-cross-logo.png";

export default function WeddingPlannerPublic() {
  const { token } = useParams();

  const { data: planner, isLoading } = useQuery({
    queryKey: ["wedding-planner-public", token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wedding_planners")
        .select("*")
        .eq("public_token", token)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const handleDownload = async () => {
    if (!planner) return;
    try {
      await downloadWeddingPlannerPDF({
        ...planner,
        entertainment: planner.entertainment as { name: string; time?: string }[],
        schedule: planner.schedule as { time: string; event: string }[],
        food_options: planner.food_options as { item: string; quantity: number }[],
      });
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!planner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">Wedding Planner Not Found</h2>
            <p className="text-muted-foreground">
              The wedding planner you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const schedule = planner.schedule as { time: string; event: string }[] || [];
  const entertainment = planner.entertainment as { name: string; time?: string }[] || [];
  const foodOptions = planner.food_options as { item: string; quantity: number }[] || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-8 flex justify-center">
            <img src={molineLogo} alt="The Moline Cross" className="h-20 w-auto" />
          </div>
          <h1 className="text-4xl font-serif mb-4 text-foreground">
            Celebrating the wedding of
          </h1>
          <h2 className="text-5xl font-serif text-primary mb-6">{planner.couple_names}</h2>
          <div className="flex items-center justify-center gap-6 text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {new Date(planner.wedding_date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {planner.venue_name}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {planner.guests_count} guests
            </div>
          </div>
          <Button onClick={handleDownload} size="lg">
            <Download className="h-5 w-5 mr-2" />
            Download PDF
          </Button>
        </div>

        {/* Setup Details */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h3 className="text-2xl font-serif mb-4">Setup Details</h3>
            <div className="space-y-2 text-muted-foreground">
              <p>Tables: {planner.tables_count}</p>
              {planner.room_decorations && (
                <div>
                  <p className="font-semibold text-foreground">Room Decorations:</p>
                  <p>{planner.room_decorations}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Entertainment */}
        {entertainment.length > 0 && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-serif mb-4">Entertainment</h3>
              <ul className="space-y-2">
                {entertainment.map((item, idx) => (
                  <li key={idx} className="text-muted-foreground">
                    • {item.name} {item.time && `(${item.time})`}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Schedule */}
        {schedule.length > 0 && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-serif mb-4">Schedule</h3>
              <div className="space-y-3">
                {schedule.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="font-semibold text-primary min-w-[80px]">{item.time}</span>
                    <span className="text-muted-foreground">{item.event}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Food & Drinks */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h3 className="text-2xl font-serif mb-4">Food & Drinks</h3>
            {foodOptions.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold mb-2">Food Options:</p>
                <ul className="space-y-1">
                  {foodOptions.map((item, idx) => (
                    <li key={idx} className="text-muted-foreground">
                      • {item.item} ({item.quantity})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {planner.kids_meals && (
              <p className="text-muted-foreground mb-2">
                <span className="font-semibold text-foreground">Kids Meals:</span> {planner.kids_meals}
              </p>
            )}
            {planner.welcome_drinks && (
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Welcome Drinks:</span>{' '}
                {planner.welcome_drinks}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-muted-foreground italic mt-12">
          <p>{planner.venue_name}</p>
        </div>
      </div>
    </div>
  );
}
