import { DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Tables } from "@/integrations/supabase/types";
import { SortableRow } from "./SortableRow";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { SectionTemplatesDialog } from "./SectionTemplatesDialog";

type Row = Tables<"page_rows"> | Tables<"widget_rows"> | Tables<"layout_rows">;
type Component = Tables<"page_components"> | Tables<"widget_components"> | Tables<"layout_components">;

interface GridCanvasProps {
  rows: Row[];
  components: Component[];
  onUpdateComponent: (id: string, content: any) => void;
  onUpdateComponentStyles: (id: string, styles: any) => void;
  onDeleteComponent: (id: string) => void;
  onAddRow: () => void;
  onDeleteRow: (rowId: string) => void;
  onUpdateRowColumns: (rowId: string, columns: number) => void;
  onUpdateRowStyles: (rowId: string, styles: any) => void;
  onUpdateRowColumnWidths?: (rowId: string, widths: number[]) => void;
  onUpdateRowResponsiveConfig?: (rowId: string, config: any) => void;
  onReorderRows: (rows: any[]) => void;
  activeComponentType: string | null;
  onDuplicateComponent: (id: string) => void;
  onPasteComponent: (rowId: string, columnIndex: number) => void;
  onInsertTemplate?: (templateData: any) => void;
  onMoveComponentToPosition: (id: string, position: number) => void;
  onAddRowAbove?: (rowId: string) => void;
  onAddRowBelow?: (rowId: string) => void;
  onDuplicateRow?: (rowId: string) => void;
}

export const GridCanvas = ({
  rows,
  components,
  onUpdateComponent,
  onUpdateComponentStyles,
  onDeleteComponent,
  onAddRow,
  onDeleteRow,
  onUpdateRowColumns,
  onUpdateRowStyles,
  onUpdateRowColumnWidths,
  onUpdateRowResponsiveConfig,
  onReorderRows,
  activeComponentType,
  onDuplicateComponent,
  onPasteComponent,
  onInsertTemplate,
  onMoveComponentToPosition,
  onAddRowAbove,
  onAddRowBelow,
  onDuplicateRow,
}: GridCanvasProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  if (rows.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-muted-foreground/25 rounded-lg">
        <p className="text-muted-foreground mb-4">Your page is empty. Add a row to get started.</p>
        <Button onClick={onAddRow} className="gap-2">
          <Plus className="h-4 w-4" />
          Add First Row
        </Button>
      </div>
    );
  }

  return (
    <>
      <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-6 max-w-7xl mx-auto">
          {rows.map((row) => (
            <SortableRow
              key={row.id}
              row={row}
              components={components}
              onUpdate={onUpdateComponent}
              onDelete={onDeleteComponent}
              onDeleteRow={onDeleteRow}
              onUpdateRowColumns={onUpdateRowColumns}
              onUpdateRowStyles={onUpdateRowStyles}
              onUpdateRowColumnWidths={onUpdateRowColumnWidths}
              onUpdateRowResponsiveConfig={onUpdateRowResponsiveConfig}
              onDuplicate={onDuplicateComponent}
              onPaste={onPasteComponent}
              onUpdateStyles={onUpdateComponentStyles}
              onMoveToPosition={onMoveComponentToPosition}
              onAddRowAbove={onAddRowAbove}
              onAddRowBelow={onAddRowBelow}
              onDuplicateRow={onDuplicateRow}
            />
          ))}
          <div className="flex justify-center gap-2">
            {onInsertTemplate && (
              <SectionTemplatesDialog onInsertTemplate={onInsertTemplate} />
            )}
            <Button onClick={onAddRow} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Row
            </Button>
          </div>
        </div>
      </SortableContext>

      <DragOverlay>
        {activeComponentType ? (
          <Card className="p-4 opacity-80 shadow-2xl">
            <div className="text-center text-muted-foreground">Adding {activeComponentType}...</div>
          </Card>
        ) : null}
      </DragOverlay>
    </>
  );
};
