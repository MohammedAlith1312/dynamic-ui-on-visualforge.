import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, EyeOff, Monitor } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { LayoutPreviewModal } from "@/components/editor/LayoutPreviewModal";
import { supabase } from "@/integrations/supabase/client";

type Layout = Tables<"layouts">;
type LayoutRow = Tables<"layout_rows">;
type LayoutComponent = Tables<"layout_components">;

interface LayoutListProps {
  layouts: Layout[];
  onDelete: (id: string) => void;
}

export function LayoutList({ layouts, onDelete }: LayoutListProps) {
  const [previewLayout, setPreviewLayout] = useState<Layout | null>(null);
  const [previewRows, setPreviewRows] = useState<LayoutRow[]>([]);
  const [previewComponents, setPreviewComponents] = useState<LayoutComponent[]>([]);

  const handlePreview = async (layout: Layout) => {
    const { data: rows } = await supabase
      .from("layout_rows")
      .select("*")
      .eq("layout_id", layout.id)
      .order("position");

    const { data: components } = await supabase
      .from("layout_components")
      .select("*")
      .eq("layout_id", layout.id)
      .order("position");

    setPreviewLayout(layout);
    setPreviewRows(rows || []);
    setPreviewComponents(components || []);
  };
  if (layouts.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground mb-4">No layouts yet</p>
        <p className="text-sm text-muted-foreground">
          Create your first layout to add headers and footers to your site
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {layouts.map((layout) => (
        <Card key={layout.id} className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{layout.title}</h3>
              <div className="flex items-center gap-2">
                {layout.is_published ? (
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
              onClick={() => handlePreview(layout)}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/admin/layouts/${layout.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(layout.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}

      <LayoutPreviewModal
        open={!!previewLayout}
        onOpenChange={(open) => !open && setPreviewLayout(null)}
        layout={previewLayout}
        rows={previewRows}
        components={previewComponents}
      />
    </div>
  );
}
