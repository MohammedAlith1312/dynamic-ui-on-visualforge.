import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Columns, GripVertical, Settings } from "lucide-react";
import { DroppableColumn } from "./DroppableColumn";
import { RowPropertiesPanel } from "./RowPropertiesPanel";
import { RowContextMenu } from "./RowContextMenu";
import { ColumnDivider } from "./ColumnDivider";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, Fragment } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type Row = Tables<"page_rows"> | Tables<"widget_rows"> | Tables<"layout_rows">;
type Component = Tables<"page_components"> | Tables<"widget_components"> | Tables<"layout_components">;

interface SortableRowProps {
  row: Row;
  components: Component[];
  onUpdate: (id: string, content: any) => void;
  onDelete: (id: string) => void;
  onDeleteRow: (rowId: string) => void;
  onUpdateRowColumns: (rowId: string, columns: number) => void;
  onUpdateRowStyles: (rowId: string, styles: any) => void;
  onUpdateRowColumnWidths?: (rowId: string, widths: number[]) => void;
  onUpdateRowResponsiveConfig?: (rowId: string, config: any) => void;
  onUpdateStyles: (id: string, styles: any) => void;
  onDuplicate: (id: string) => void;
  onPaste: (rowId: string, columnIndex: number) => void;
  onMoveToPosition: (id: string, position: number) => void;
  onAddRowAbove?: (rowId: string) => void;
  onAddRowBelow?: (rowId: string) => void;
  onDuplicateRow?: (rowId: string) => void;
}

export const SortableRow = ({
  row,
  components,
  onUpdate,
  onDelete,
  onDeleteRow,
  onUpdateRowColumns,
  onUpdateRowStyles,
  onUpdateRowColumnWidths,
  onUpdateRowResponsiveConfig,
  onUpdateStyles,
  onDuplicate,
  onPaste,
  onMoveToPosition,
  onAddRowAbove,
  onAddRowBelow,
  onDuplicateRow,
}: SortableRowProps) => {
  const [showProperties, setShowProperties] = useState(false);
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [localColumnWidths, setLocalColumnWidths] = useState<number[]>(
    (row as any).column_widths?.length === row.columns
      ? (row as any).column_widths
      : Array(row.columns).fill(100 / row.columns)
  );

  const SNAP_THRESHOLD = 3; // Snap within 3% of target
  const SNAP_POINTS = [25, 33.33, 50, 66.67, 75];

  const snapToNearestPoint = (value: number): number => {
    for (const snapPoint of SNAP_POINTS) {
      if (Math.abs(value - snapPoint) <= SNAP_THRESHOLD) {
        return snapPoint;
      }
    }
    return value;
  };

  useEffect(() => {
    const handleDragEnd = () => {
      setIsDraggingDivider(false);
    };

    document.addEventListener('columnDividerDragEnd', handleDragEnd);
    return () => {
      document.removeEventListener('columnDividerDragEnd', handleDragEnd);
    };
  }, []);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.id,
    data: { type: "row", row },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const rowStyles = (row as any).styles || {};
  const responsiveConfig = (row as any).responsive_config || {};
  const rowStyleString = {
    backgroundColor: rowStyles.backgroundColor,
    backgroundImage: rowStyles.backgroundImage ? `url(${rowStyles.backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    paddingTop: rowStyles.paddingTop,
    paddingBottom: rowStyles.paddingBottom,
    paddingLeft: rowStyles.paddingLeft,
    paddingRight: rowStyles.paddingRight,
    borderRadius: rowStyles.borderRadius,
    boxShadow: rowStyles.boxShadow,
  };

  const getColumnComponents = (columnIndex: number) => {
    return components
      .filter((c) => c.row_id === row.id && c.column_index === columnIndex)
      .sort((a, b) => a.position - b.position);
  };

  // Get column widths from row data or use equal widths
  const columnWidths = localColumnWidths;
  const hasCustomWidths = columnWidths.length === row.columns;
  const stackOnMobile = responsiveConfig.mobile?.stackColumns || false;

  const getColumnStyle = (index: number) => {
    if (hasCustomWidths) {
      return { width: `${columnWidths[index]}%` };
    }
    return { flex: 1 };
  };

  const getContainerClassName = () => {
    let className = "flex gap-4";
    if (stackOnMobile) {
      className += " flex-col md:flex-row";
    }
    return className;
  };

  const handleDividerDrag = (columnIndex: number, deltaX: number) => {
    if (!containerRef.current) return;

    setIsDraggingDivider(true);

    const containerWidth = containerRef.current.offsetWidth;
    const deltaPercent = (deltaX / containerWidth) * 100;

    const newWidths = [...localColumnWidths];

    // Adjust current column and next column
    let newCurrentWidth = Math.max(5, Math.min(95, newWidths[columnIndex] + deltaPercent));
    let newNextWidth = Math.max(5, Math.min(95, newWidths[columnIndex + 1] - deltaPercent));

    // Apply snapping to current column
    const snappedCurrentWidth = snapToNearestPoint(newCurrentWidth);
    if (snappedCurrentWidth !== newCurrentWidth) {
      // Adjust the next column to compensate for snapping
      const snapDelta = snappedCurrentWidth - newCurrentWidth;
      newCurrentWidth = snappedCurrentWidth;
      newNextWidth = Math.max(5, Math.min(95, newNextWidth - snapDelta));
    }

    // Only update if both columns are within valid range
    if (newCurrentWidth >= 5 && newCurrentWidth <= 95 && newNextWidth >= 5 && newNextWidth <= 95) {
      newWidths[columnIndex] = newCurrentWidth;
      newWidths[columnIndex + 1] = newNextWidth;

      setLocalColumnWidths(newWidths);
      onUpdateRowColumnWidths?.(row.id, newWidths);
    }
  };

  const handleDividerDragEnd = () => {
    setIsDraggingDivider(false);
  };

  return (
    <RowContextMenu
      rowId={row.id}
      onAddRowAbove={() => onAddRowAbove?.(row.id)}
      onAddRowBelow={() => onAddRowBelow?.(row.id)}
      onDuplicateRow={() => onDuplicateRow?.(row.id)}
      onDeleteRow={() => onDeleteRow(row.id)}
      onToggleProperties={() => setShowProperties(!showProperties)}
    >
      <div ref={setNodeRef} style={style}>
        <Card className="p-6 space-y-4" style={rowStyleString}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
              <Columns className="h-5 w-5 text-primary" />
              <Select
                value={row.columns.toString()}
                onValueChange={(val) => onUpdateRowColumns(row.id, parseInt(val))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Column</SelectItem>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProperties(!showProperties)}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                {showProperties ? 'Hide' : 'Show'} Styles
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDeleteRow(row.id)} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Row
              </Button>
            </div>
          </div>

          <Collapsible open={showProperties}>
            <CollapsibleContent>
              <RowPropertiesPanel
                rowId={row.id}
                columns={row.columns}
                styles={rowStyles}
                columnWidths={columnWidths}
                responsiveConfig={responsiveConfig}
                onUpdate={(styles) => onUpdateRowStyles(row.id, styles)}
                onUpdateColumnWidths={(widths) => onUpdateRowColumnWidths?.(row.id, widths)}
                onUpdateResponsiveConfig={(config) => onUpdateRowResponsiveConfig?.(row.id, config)}
              />
            </CollapsibleContent>
          </Collapsible>


          <div ref={containerRef} className={cn(getContainerClassName(), "relative")}>
            {Array.from({ length: row.columns }, (_, i) => (
              <Fragment key={i}>
                <div
                  key={i}
                  style={getColumnStyle(i)}
                  className={stackOnMobile ? "w-full md:w-auto" : ""}
                >
                  <DroppableColumn
                    rowId={row.id}
                    columnIndex={i}
                    components={getColumnComponents(i)}
                    onUpdate={onUpdate}
                    onUpdateStyles={onUpdateStyles}
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onPaste={onPaste}
                    onMoveToPosition={onMoveToPosition}
                  />
                </div>
                {i < row.columns - 1 && !stackOnMobile && (
                  <ColumnDivider
                    key={`divider-${i}`}
                    onDrag={(deltaX) => handleDividerDrag(i, deltaX)}
                    showGuides={isDraggingDivider}
                  />
                )}
              </Fragment>
            ))}
          </div>
        </Card>
      </div>
    </RowContextMenu>
  );
};
