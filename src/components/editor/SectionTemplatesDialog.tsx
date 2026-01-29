import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Sparkles, DollarSign, MessageSquare, Grid3x3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SectionTemplatesDialogProps {
  onInsertTemplate: (templateData: any) => void;
}

const categoryIcons = {
  hero: Sparkles,
  pricing: DollarSign,
  testimonials: MessageSquare,
  features: Grid3x3,
};

export const SectionTemplatesDialog = ({ onInsertTemplate }: SectionTemplatesDialogProps) => {
  const [open, setOpen] = useState(false);

  const { data: templates, isLoading } = useQuery({
    queryKey: ["section-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("section_templates")
        .select("*")
        .eq("is_public", true)
        .order("category", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const categories = templates
    ? Array.from(new Set(templates.map((t) => t.category)))
    : [];

  const handleInsertTemplate = (templateData: any) => {
    onInsertTemplate(templateData);
    setOpen(false);
    toast.success("Section template inserted");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Insert Section Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Section Templates</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No templates available</div>
        ) : (
          <Tabs defaultValue={categories[0]} className="w-full">
            <TabsList className="w-full justify-start">
              {categories.map((category) => {
                const Icon = categoryIcons[category as keyof typeof categoryIcons];
                return (
                  <TabsTrigger key={category} value={category} className="gap-2 capitalize">
                    {Icon && <Icon className="h-4 w-4" />}
                    {category}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category}>
                <ScrollArea className="h-[50vh]">
                  <div className="grid grid-cols-2 gap-4 p-1">
                    {templates
                      ?.filter((t) => t.category === category)
                      .map((template) => (
                        <Card key={template.id} className="cursor-pointer hover:border-primary transition-colors">
                          <CardHeader>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            {template.description && (
                              <CardDescription>{template.description}</CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            <Button
                              onClick={() => handleInsertTemplate(template.template_data)}
                              className="w-full gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Insert Section
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
