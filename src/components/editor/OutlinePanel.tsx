import { useState } from "react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OutlineTreeItem } from "./OutlineTreeItem";
import { Tables } from "@/integrations/supabase/types";
import { Separator } from "@/components/ui/separator";

type Row = Tables<"page_rows"> | Tables<"widget_rows"> | Tables<"layout_rows">;
type Component = Tables<"page_components"> | Tables<"widget_components"> | Tables<"layout_components">;

interface OutlinePanelProps {
  title: string;
  rows: Row[];
  components: Component[];
  selectedComponentId?: string | null;
  onSelectComponent: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
}

export const OutlinePanel = ({
  title,
  rows,
  components,
  selectedComponentId,
  onSelectComponent,
  onToggleVisibility,
  onToggleLock,
}: OutlinePanelProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(rows.map(r => r.id)));
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set());
  
  const sortedRows = [...rows].sort((a, b) => a.position - b.position);

  const getComponentsByRowAndColumn = (rowId: string, columnIndex: number) => {
    return components
      .filter((c) => c.row_id === rowId && c.column_index === columnIndex)
      .sort((a, b) => a.position - b.position);
  };

  const getComponentLabel = (component: Component) => {
    const content = component.content as any;
    const type = component.component_type;
    
    // Try to get meaningful label from content
    if (content?.text) return content.text.substring(0, 30);
    if (content?.title) return content.title.substring(0, 30);
    if (content?.label) return content.label.substring(0, 30);
    if (content?.alt) return content.alt.substring(0, 30);
    
    // Fallback to type name
    return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getVisibility = (component: Component) => {
    const styles = (component as any).styles || {};
    return styles.visible !== false;
  };

  const getLocked = (component: Component) => {
    const styles = (component as any).styles || {};
    return styles.locked === true;
  };

  const toggleRowExpand = (rowId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const toggleColumnExpand = (colKey: string) => {
    setExpandedColumns(prev => {
      const next = new Set(prev);
      if (next.has(colKey)) {
        next.delete(colKey);
      } else {
        next.add(colKey);
      }
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // Drag and drop reordering can be implemented here in the future
    console.log('Drag ended in outline:', event);
  };


  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full bg-background">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {rows.length} row{rows.length !== 1 ? 's' : ''}, {components.length} component{components.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <ScrollArea className="flex-1">
          <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <div className="p-2 space-y-1">
          {sortedRows.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No content yet
            </div>
          ) : (
            sortedRows.map((row, rowIndex) => {
              const rowExpanded = expandedRows.has(row.id);
              
              return (
                <div key={row.id}>
                  <OutlineTreeItem
                    id={`row-${row.id}`}
                    label={`Row ${rowIndex + 1} (${row.columns} column${row.columns !== 1 ? 's' : ''})`}
                    type="row"
                    level={0}
                    hasChildren={true}
                    isExpanded={rowExpanded}
                    onToggleExpand={() => toggleRowExpand(row.id)}
                    onSelect={() => {}}
                  />
                  
                  {rowExpanded && Array.from({ length: row.columns }, (_, colIndex) => {
                    const columnComponents = getComponentsByRowAndColumn(row.id, colIndex);
                    const colKey = `${row.id}-${colIndex}`;
                    const colExpanded = expandedColumns.has(colKey);
                    
                    return (
                      <div key={colKey}>
                        {row.columns > 1 && (
                          <OutlineTreeItem
                            id={`col-${colKey}`}
                            label={`Column ${colIndex + 1}`}
                            type="column"
                            level={1}
                            hasChildren={columnComponents.length > 0}
                            isExpanded={colExpanded}
                            onToggleExpand={() => toggleColumnExpand(colKey)}
                            onSelect={() => {}}
                          />
                        )}
                        
                        {(row.columns === 1 || colExpanded) && columnComponents.map((component) => {
                          console.log('[OutlinePanel] Rendering component:', component.id, {
                            hasVisibilityHandler: !!onToggleVisibility,
                            hasLockHandler: !!onToggleLock,
                            hasSelectHandler: !!onSelectComponent,
                          });
                          
                          return (
                            <OutlineTreeItem
                              key={component.id}
                              id={component.id}
                              label={getComponentLabel(component)}
                              type="component"
                              componentType={component.component_type}
                              level={row.columns > 1 ? 2 : 1}
                              visible={getVisibility(component)}
                              locked={getLocked(component)}
                              isSelected={selectedComponentId === component.id}
                              onSelect={() => {
                                console.log('[OutlinePanel] onSelect called for:', component.id);
                                onSelectComponent(component.id);
                              }}
                              onToggleVisibility={() => {
                                console.log('[OutlinePanel] onToggleVisibility called for:', component.id);
                                onToggleVisibility(component.id);
                              }}
                              onToggleLock={() => {
                                console.log('[OutlinePanel] onToggleLock called for:', component.id);
                                onToggleLock(component.id);
                              }}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                  
                  {rowIndex < sortedRows.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              );
            })
          )}
            </div>
          </SortableContext>
        </ScrollArea>
      </div>
    </DndContext>
  );
};
