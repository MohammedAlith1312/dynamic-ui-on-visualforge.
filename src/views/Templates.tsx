"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { CreateTemplateDialog } from "@/components/admin/CreateTemplateDialog";
import { TemplateList } from "@/components/admin/TemplateList";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

type SectionTemplate = Tables<"section_templates">;

const Templates = () => {
  const router = useRouter();
  const [templates, setTemplates] = useState<SectionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from("section_templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load templates");
      return;
    }

    setTemplates((data as any) || []);
    setLoading(false);
  };

  const handleCreateTemplate = async (name: string, category: string, description?: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    const { data, error } = await supabase
      .from("section_templates")
      .insert({
        name,
        category,
        description,
        template_data: { rows: [], components: [] },
        created_by: user.id,
        is_public: false,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create template");
      return;
    }

    toast.success("Template created");
    setShowCreateDialog(false);
    router.push(`/admin/templates/${data.id}/editor`);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;

    const { error } = await supabase.from("section_templates").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete template");
      return;
    }

    setTemplates(templates.filter((t) => t.id !== id));
    toast.success("Template deleted");
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
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">Section Templates</h1>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="font-semibold mb-1">Section Templates</p>
                    <p className="text-sm">Pre-built layout patterns that you can insert into pages. Once inserted, they become independent copies that you can customize.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-muted-foreground mt-2">Create reusable section layouts (Hero, Pricing, etc.)</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          </div>

          <TemplateList templates={templates} onDelete={handleDeleteTemplate} />
          <CreateTemplateDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onSubmit={handleCreateTemplate}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Templates;
