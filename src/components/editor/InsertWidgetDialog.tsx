import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Box, Loader2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

type Widget = Tables<"widgets">;

interface InsertWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectWidget: (widgetId: string) => void;
}

export function InsertWidgetDialog({ open, onOpenChange, onSelectWidget }: InsertWidgetDialogProps) {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadWidgets();
    }
  }, [open]);

  const loadWidgets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("widgets")
      .select("*")
      .eq("is_published", true)
      .order("title");

    if (error) {
      toast.error("Failed to load widgets");
      console.error(error);
    } else {
      setWidgets(data || []);
    }
    setLoading(false);
  };

  const handleSelectWidget = (widgetId: string) => {
    onSelectWidget(widgetId);
    onOpenChange(false);
  };

  const categorizedWidgets = widgets.reduce((acc, widget) => {
    const category = widget.category || "uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(widget);
    return acc;
  }, {} as Record<string, Widget[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Insert Widget</DialogTitle>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="font-semibold mb-1">Widgets</p>
                <p className="text-sm">Reusable components that reference the original. When you update the widget, all instances update automatically.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <DialogDescription>
            Select a widget to insert as a reusable component
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : widgets.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Box className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No published widgets available</p>
            <p className="text-sm mt-2">Create and publish widgets from the Widgets page</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(categorizedWidgets).map(([category, categoryWidgets]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 capitalize">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryWidgets.map((widget) => (
                    <Card
                      key={widget.id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleSelectWidget(widget.id)}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Box className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{widget.title}</CardTitle>
                            {widget.category && (
                              <CardDescription className="text-xs capitalize">
                                {widget.category}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
