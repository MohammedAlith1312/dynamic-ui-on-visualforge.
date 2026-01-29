import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, EyeOff, Monitor } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { WidgetPreviewModal } from "@/components/editor/WidgetPreviewModal";
import { supabase } from "@/integrations/supabase/client";

type Widget = Tables<"widgets">;
type WidgetRow = Tables<"widget_rows">;
type WidgetComponent = Tables<"widget_components">;

interface WidgetListProps {
  widgets: Widget[];
  onDelete: (id: string) => void;
}

export function WidgetList({ widgets, onDelete }: WidgetListProps) {
  const [previewWidget, setPreviewWidget] = useState<Widget | null>(null);
  const [previewRows, setPreviewRows] = useState<WidgetRow[]>([]);
  const [previewComponents, setPreviewComponents] = useState<WidgetComponent[]>([]);

  const handlePreview = async (widget: Widget) => {
    const { data: rows } = await supabase
      .from("widget_rows")
      .select("*")
      .eq("widget_id", widget.id)
      .order("position");

    const { data: components } = await supabase
      .from("widget_components")
      .select("*")
      .eq("widget_id", widget.id)
      .order("position");

    setPreviewWidget(widget);
    setPreviewRows(rows || []);
    setPreviewComponents(components || []);
  };
  if (widgets.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground mb-4">No widgets yet</p>
        <p className="text-sm text-muted-foreground">
          Create your first widget to start building reusable components
        </p>
      </Card>
    );
  }

  const groupedWidgets = widgets.reduce((acc, widget) => {
    const category = widget.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(widget);
    return acc;
  }, {} as Record<string, Widget[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedWidgets).map(([category, categoryWidgets]) => (
        <div key={category}>
          <h2 className="text-xl font-semibold mb-4">{category}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categoryWidgets.map((widget) => (
              <Card key={widget.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{widget.title}</h3>
                    <div className="flex items-center gap-2">
                      {widget.is_published ? (
                        <Badge variant="default" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <EyeOff className="h-3 w-3" />
                          Draft
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(widget)}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/admin/widgets/${widget.id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(widget.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <WidgetPreviewModal
        open={!!previewWidget}
        onOpenChange={(open) => !open && setPreviewWidget(null)}
        widget={previewWidget}
        rows={previewRows}
        components={previewComponents}
      />
    </div>
  );
}
