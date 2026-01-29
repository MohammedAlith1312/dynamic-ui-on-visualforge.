"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { CreateWidgetDialog } from "@/components/admin/CreateWidgetDialog";
import { WidgetList } from "@/components/admin/WidgetList";
import { AdminLayout } from "@/components/admin/AdminLayout";

type Widget = Tables<"widgets">;

const Widgets = () => {
  const router = useRouter();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadWidgets();
  }, []);

  const loadWidgets = async () => {
    const { data, error } = await supabase
      .from("widgets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load widgets");
      return;
    }

    setWidgets(data || []);
    setLoading(false);
  };

  const handleCreateWidget = async (title: string, category?: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    const { data, error } = await supabase
      .from("widgets")
      .insert({
        title,
        category,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create widget");
      return;
    }

    toast.success("Widget created");
    setShowCreateDialog(false);
    router.push(`/admin/widgets/${data.id}`);
  };

  const handleDeleteWidget = async (id: string) => {
    if (!confirm("Delete this widget? This will remove it from all pages.")) return;

    const { error } = await supabase.from("widgets").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete widget");
      return;
    }

    setWidgets(widgets.filter((w) => w.id !== id));
    toast.success("Widget deleted");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Widgets</h1>
              <p className="text-muted-foreground mt-2">Manage reusable components</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2" data-create-widget>
              <Plus className="h-4 w-4" />
              New Widget
            </Button>
          </div>

          <WidgetList widgets={widgets} onDelete={handleDeleteWidget} />
          <CreateWidgetDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onSubmit={handleCreateWidget}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Widgets;
