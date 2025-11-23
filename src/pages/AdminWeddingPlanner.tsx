import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, Plus, Trash2, Save, Eye } from "lucide-react";
import { downloadWeddingPlannerPDF } from "@/services/weddingPlannerPdfService";

export default function AdminWeddingPlanner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === "new";

  const [formData, setFormData] = useState({
    couple_names: "",
    wedding_date: "",
    venue_name: "Moline Events",
    guests_count: 0,
    tables_count: 0,
    room_decorations: "",
    color_theme: "blush",
    font_style: "romantic",
    kids_meals: "",
    welcome_drinks: "",
  });

  const [entertainment, setEntertainment] = useState<{ name: string; time?: string }[]>([]);
  const [schedule, setSchedule] = useState<{ time: string; event: string }[]>([]);
  const [foodOptions, setFoodOptions] = useState<{ item: string; quantity: number }[]>([]);

  const { data: planner } = useQuery({
    queryKey: ["wedding-planner", id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase
        .from("wedding_planners")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (planner) {
      setFormData({
        couple_names: planner.couple_names,
        wedding_date: planner.wedding_date,
        venue_name: planner.venue_name,
        guests_count: planner.guests_count,
        tables_count: planner.tables_count,
        room_decorations: planner.room_decorations || "",
        color_theme: planner.color_theme,
        font_style: planner.font_style,
        kids_meals: planner.kids_meals || "",
        welcome_drinks: planner.welcome_drinks || "",
      });
      setEntertainment((planner.entertainment as { name: string; time?: string }[]) || []);
      setSchedule((planner.schedule as { time: string; event: string }[]) || []);
      setFoodOptions((planner.food_options as { item: string; quantity: number }[]) || []);
    }
  }, [planner]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        entertainment,
        schedule,
        food_options: foodOptions,
        ...(planner?.booking_id && { booking_id: planner.booking_id }),
      };

      if (isNew) {
        const { data, error } = await supabase
          .from("wedding_planners")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("wedding_planners")
          .update({ ...payload, version: (planner?.version || 1) + 1 })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      toast.success("Wedding planner saved successfully");
      queryClient.invalidateQueries({ queryKey: ["wedding-planners"] });
      if (isNew) {
        navigate(`/admin/wedding-planners/${data.id}`);
      }
    },
    onError: () => {
      toast.error("Failed to save wedding planner");
    },
  });

  const handleDownloadPDF = async () => {
    try {
      await downloadWeddingPlannerPDF({
        ...formData,
        entertainment,
        schedule,
        food_options: foodOptions,
      });
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  const handleViewPublic = () => {
    if (planner?.public_token) {
      window.open(`/wedding/${planner.public_token}`, "_blank");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {isNew ? "Create Wedding Planner" : "Edit Wedding Planner"}
        </h1>
        <div className="flex gap-2">
          {!isNew && planner && (
            <>
              <Button variant="outline" onClick={handleViewPublic}>
                <Eye className="h-4 w-4 mr-2" />
                View Public
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </>
          )}
          <Button onClick={() => saveMutation.mutate()}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Couple's Names</Label>
              <Input
                value={formData.couple_names}
                onChange={(e) => setFormData({ ...formData, couple_names: e.target.value })}
                placeholder="John & Jane"
              />
            </div>
            <div>
              <Label>Wedding Date</Label>
              <Input
                type="date"
                value={formData.wedding_date}
                onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Venue Name</Label>
              <Input
                value={formData.venue_name}
                onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Number of Guests</Label>
                <Input
                  type="number"
                  value={formData.guests_count}
                  onChange={(e) =>
                    setFormData({ ...formData, guests_count: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label>Number of Tables</Label>
                <Input
                  type="number"
                  value={formData.tables_count}
                  onChange={(e) =>
                    setFormData({ ...formData, tables_count: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Room Decorations Notes</Label>
              <Textarea
                value={formData.room_decorations}
                onChange={(e) => setFormData({ ...formData, room_decorations: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Entertainment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Entertainment
              <Button
                size="sm"
                onClick={() => setEntertainment([...entertainment, { name: "", time: "" }])}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {entertainment.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Entertainment name"
                  value={item.name}
                  onChange={(e) => {
                    const updated = [...entertainment];
                    updated[index].name = e.target.value;
                    setEntertainment(updated);
                  }}
                />
                <Input
                  placeholder="Time (optional)"
                  value={item.time || ""}
                  onChange={(e) => {
                    const updated = [...entertainment];
                    updated[index].time = e.target.value;
                    setEntertainment(updated);
                  }}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setEntertainment(entertainment.filter((_, i) => i !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Schedule
              <Button size="sm" onClick={() => setSchedule([...schedule, { time: "", event: "" }])}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {schedule.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="time"
                  value={item.time}
                  onChange={(e) => {
                    const updated = [...schedule];
                    updated[index].time = e.target.value;
                    setSchedule(updated);
                  }}
                />
                <Input
                  placeholder="Event description"
                  value={item.event}
                  onChange={(e) => {
                    const updated = [...schedule];
                    updated[index].event = e.target.value;
                    setSchedule(updated);
                  }}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setSchedule(schedule.filter((_, i) => i !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Food & Drinks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Food Options
              <Button
                size="sm"
                onClick={() => setFoodOptions([...foodOptions, { item: "", quantity: 0 }])}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {foodOptions.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Food item"
                  value={item.item}
                  onChange={(e) => {
                    const updated = [...foodOptions];
                    updated[index].item = e.target.value;
                    setFoodOptions(updated);
                  }}
                />
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => {
                    const updated = [...foodOptions];
                    updated[index].quantity = parseInt(e.target.value) || 0;
                    setFoodOptions(updated);
                  }}
                  className="w-24"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setFoodOptions(foodOptions.filter((_, i) => i !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="space-y-4 mt-4">
              <div>
                <Label>Kids Meals</Label>
                <Input
                  value={formData.kids_meals}
                  onChange={(e) => setFormData({ ...formData, kids_meals: e.target.value })}
                  placeholder="Describe kids meal options"
                />
              </div>
              <div>
                <Label>Welcome Drinks</Label>
                <Input
                  value={formData.welcome_drinks}
                  onChange={(e) => setFormData({ ...formData, welcome_drinks: e.target.value })}
                  placeholder="e.g., Prosecco, Orange Juice"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Design Options */}
        <Card>
          <CardHeader>
            <CardTitle>Design Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Color Theme</Label>
              <Select value={formData.color_theme} onValueChange={(val) => setFormData({ ...formData, color_theme: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blush">Blush</SelectItem>
                  <SelectItem value="ivory">Ivory</SelectItem>
                  <SelectItem value="navy">Navy</SelectItem>
                  <SelectItem value="sage">Sage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Font Style</Label>
              <Select value={formData.font_style} onValueChange={(val) => setFormData({ ...formData, font_style: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="romantic">Romantic Script</SelectItem>
                  <SelectItem value="modern">Modern Clean</SelectItem>
                  <SelectItem value="classic">Classic Serif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
