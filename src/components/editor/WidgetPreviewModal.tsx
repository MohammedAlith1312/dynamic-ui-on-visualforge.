import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ComponentRenderer } from "@/components/public/ComponentRenderer";
import { Tables } from "@/integrations/supabase/types";
import { ResponsiveControls, Breakpoint } from "./ResponsiveControls";
import { DeviceFrame } from "./DeviceFrame";

interface WidgetPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widget: Tables<"widgets"> | null;
  rows: Tables<"widget_rows">[];
  components: Tables<"widget_components">[];
}

export const WidgetPreviewModal = ({ 
  open, 
  onOpenChange, 
  widget,
  rows,
  components 
}: WidgetPreviewModalProps) => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>("desktop");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] p-0 gap-0" hideClose>
        <DialogTitle className="sr-only">Widget Preview: {widget?.title}</DialogTitle>
        <div className="flex items-center justify-between border-b px-4 py-3 bg-card">
          <h2 className="text-lg font-semibold" aria-hidden="true">Widget Preview: {widget?.title}</h2>
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
            <div className="max-w-4xl mx-auto p-8 space-y-8">
              {rows
                .sort((a, b) => a.position - b.position)
                .map((row) => {
                  const rowComponents = components
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
                          {colComps.map((component) => (
                            <ComponentRenderer key={component.id} component={component} />
                          ))}
                        </div>
                      ))}
                    </div>
                  );
                })}
              {rows.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
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
