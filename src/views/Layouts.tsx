"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { CreateLayoutDialog } from "@/components/admin/CreateLayoutDialog";
import { LayoutList } from "@/components/admin/LayoutList";
import { AdminLayout } from "@/components/admin/AdminLayout";

type Layout = Tables<"layouts">;

const Layouts = () => {
  const router = useRouter();
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadLayouts();
  }, []);

  const loadLayouts = async () => {
    const { data, error } = await supabase
      .from("layouts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load layouts");
      return;
    }

    setLayouts(data || []);
    setLoading(false);
  };

  const handleCreateLayout = async (title: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    const { data, error } = await supabase
      .from("layouts")
      .insert({
        title,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create layout");
      return;
    }

    toast.success("Layout created");
    setShowCreateDialog(false);
    router.push(`/admin/layouts/${data.id}`);
  };

  const handleDeleteLayout = async (id: string) => {
    if (!confirm("Delete this layout? This will remove it from all pages using it.")) return;

    const { error } = await supabase.from("layouts").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete layout");
      return;
    }

    setLayouts(layouts.filter((l) => l.id !== id));
    toast.success("Layout deleted");
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
              <h1 className="text-3xl font-bold">Layouts</h1>
              <p className="text-muted-foreground mt-2">Manage site headers and footers</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2" data-create-layout>
              <Plus className="h-4 w-4" />
              New Layout
            </Button>
          </div>

          <LayoutList layouts={layouts} onDelete={handleDeleteLayout} />
          <CreateLayoutDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onSubmit={handleCreateLayout}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Layouts;
