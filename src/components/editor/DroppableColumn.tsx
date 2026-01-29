import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Tables } from "@/integrations/supabase/types";
import { DraggableComponent } from "./DraggableComponent";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Clipboard } from "lucide-react";
import { useClipboard } from "@/contexts/ClipboardContext";

type Component = Tables<"page_components"> | Tables<"widget_components"> | Tables<"layout_components">;

interface DroppableColumnProps {
  rowId: string;
  columnIndex: number;
  components: Component[];
  onUpdate: (id: string, content: any) => void;
  onUpdateStyles: (id: string, styles: any) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onPaste: (rowId: string, columnIndex: number) => void;
  onMoveToPosition: (id: string, position: number) => void;
}

export const DroppableColumn = ({
  rowId,
  columnIndex,
  components,
  onUpdate,
  onUpdateStyles,
  onDelete,
  onDuplicate,
  onPaste,
  onMoveToPosition,
}: DroppableColumnProps) => {
  const droppableId = `${rowId}-${columnIndex}`;
  const { setNodeRef, isOver } = useDroppable({ 
    id: droppableId,
    data: { type: "droppable-column", rowId, columnIndex }
  });
  const { copiedComponent } = useClipboard();

  // Only include actual component IDs in sortable context
  const sortableIds = components.map((c) => c.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[200px] border-2 border-dashed rounded-lg p-4 transition-colors",
        isOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
      )}
    >
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {components.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm gap-2">
              <p>Drag components here</p>
              {copiedComponent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPaste(rowId, columnIndex)}
                  className="gap-2"
                >
                  <Clipboard className="h-4 w-4" />
                  Paste
                </Button>
              )}
            </div>
          ) : (
            <>
              {components.map((component) => (
            <DraggableComponent
              key={component.id}
              component={component}
              onUpdate={onUpdate}
              onUpdateStyles={onUpdateStyles}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              totalComponents={components.length}
              onMoveToPosition={onMoveToPosition}
            />
              ))}
              {copiedComponent && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPaste(rowId, columnIndex)}
                    className="gap-2"
                  >
                    <Clipboard className="h-4 w-4" />
                    Paste here
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </SortableContext>
    </div>
  );
};
