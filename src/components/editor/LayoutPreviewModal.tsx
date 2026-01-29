import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ComponentRenderer } from "@/components/public/ComponentRenderer";
import { Tables } from "@/integrations/supabase/types";
import { ResponsiveControls, Breakpoint } from "./ResponsiveControls";
import { DeviceFrame } from "./DeviceFrame";

interface LayoutPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layout: Tables<"layouts"> | null;
  rows: Tables<"layout_rows">[];
  components: Tables<"layout_components">[];
}

export const LayoutPreviewModal = ({ 
  open, 
  onOpenChange, 
  layout,
  rows,
  components 
}: LayoutPreviewModalProps) => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>("desktop");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] p-0 gap-0" hideClose>
        <DialogTitle className="sr-only">Layout Preview: {layout?.title}</DialogTitle>
        <div className="flex items-center justify-between border-b px-4 py-3 bg-card">
          <h2 className="text-lg font-semibold" aria-hidden="true">Layout Preview: {layout?.title}</h2>
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
            <div className="min-h-full flex flex-col">
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
                    <div key={row.id} className="w-full">
                      <div 
                        className="max-w-7xl mx-auto px-4 py-8 grid gap-4"
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
                    </div>
                  );
                })}
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
