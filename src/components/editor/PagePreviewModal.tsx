import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ComponentRenderer } from "@/components/public/ComponentRenderer";
import { Tables } from "@/integrations/supabase/types";
import { ResponsiveControls, Breakpoint } from "./ResponsiveControls";
import { DeviceFrame } from "./DeviceFrame";

interface PagePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: Tables<"pages"> | null;
  rows: Tables<"page_rows">[];
  components: Tables<"page_components">[];
  layout: Tables<"layouts"> | null;
  layoutRows: Tables<"layout_rows">[];
  layoutComponents: Tables<"layout_components">[];
  widgetData: Map<string, { rows: any[]; components: any[] }>;
}

export const PagePreviewModal = ({ 
  open, 
  onOpenChange, 
  page,
  rows,
  components,
  layout,
  layoutRows,
  layoutComponents,
  widgetData
}: PagePreviewModalProps) => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>("desktop");

  const handleFullscreen = () => {
    const url = `/p/${page?.slug}`;
    window.open(url, '_blank');
  };

  const renderWidgetContent = (widgetId: string) => {
    const widget = widgetData.get(widgetId);
    if (!widget) {
      return (
        <div className="p-4 border border-dashed border-muted-foreground/30 rounded-lg">
          <p className="text-sm text-muted-foreground">Widget not found</p>
        </div>
      );
    }

    return widget.rows
      .sort((a, b) => a.position - b.position)
      .map((row) => {
        const rowComponents = widget.components
          .filter((c: any) => c.row_id === row.id)
          .sort((a: any, b: any) => a.position - b.position);

        const columnComponents: any[] = Array.from(
          { length: row.columns },
          () => []
        );

        rowComponents.forEach((comp: any) => {
          if (comp.column_index < row.columns) {
            columnComponents[comp.column_index].push(comp);
          }
        });

        return (
          <div
            key={row.id}
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${row.columns}, 1fr)` }}
          >
            {columnComponents.map((colComps, colIndex) => (
              <div key={colIndex} className="space-y-4">
                {colComps.map((component: any) => (
                  <ComponentRenderer key={component.id} component={component} />
                ))}
              </div>
            ))}
          </div>
        );
      });
  };

  const renderContent = (contentRows: any[], contentComponents: any[]) => {
    return contentRows
      .sort((a, b) => a.position - b.position)
      .map((row) => {
        const rowComponents = contentComponents
          .filter((c) => c.row_id === row.id)
          .sort((a, b) => a.position - b.position);

        const columnComponents: typeof rowComponents[] = Array.from(
          { length: row.columns },
          () => []
        );

        rowComponents.forEach((comp) => {
          if (comp.column_index < row.columns) {
            columnComponents[comp.column_index].push(comp);
          }
        });

        return (
          <div
            key={row.id}
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${row.columns}, 1fr)` }}
          >
            {columnComponents.map((colComps, colIndex) => (
              <div key={colIndex} className="space-y-4">
                {colComps.map((component) => {
                  // Handle page-content placeholder in layout
                  if (component.component_type === "page-content") {
                    return (
                      <div key={component.id} className="w-full">
                        {renderContent(rows, components)}
                      </div>
                    );
                  }
                  
                  // Render widget instances
                  if ("is_widget_instance" in component && component.is_widget_instance && component.widget_id) {
                    return (
                      <div key={component.id}>
                        {renderWidgetContent(component.widget_id)}
                      </div>
                    );
                  }
                  
                  return <ComponentRenderer key={component.id} component={component} />;
                })}
              </div>
            ))}
          </div>
        );
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] p-0 gap-0" hideClose>
        <DialogTitle className="sr-only">Page Preview: {page?.title}</DialogTitle>
        <div className="flex items-center justify-between border-b px-4 py-3 bg-card">
          <h2 className="text-lg font-semibold" aria-hidden="true">Page Preview: {page?.title}</h2>
          <div className="flex items-center gap-4">
            <ResponsiveControls 
              currentBreakpoint={currentBreakpoint}
              onBreakpointChange={setCurrentBreakpoint}
            />
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-background">
          <DeviceFrame breakpoint={currentBreakpoint}>
            <div className="min-h-full">
              {layout ? (
                // Render with layout
                renderContent(layoutRows, layoutComponents)
              ) : (
                // Render page content only
                <div className="max-w-7xl mx-auto px-4 py-8">
                  {renderContent(rows, components)}
                </div>
              )}
              {rows.length === 0 && (
                <p className="text-center text-muted-foreground py-12">
                  No content yet. Add rows and components to see the preview.
                </p>
              )}
            </div>
          </DeviceFrame>
        </div>
      </DialogContent>
    </Dialog>
  );
};
