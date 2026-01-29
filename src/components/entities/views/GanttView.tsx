import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, EyeOff, Trash2 } from "lucide-react";
import { format, differenceInDays, startOfMonth, endOfMonth, eachMonthOfInterval, isWithinInterval, parseISO, addDays } from "date-fns";
import { useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { E_FieldDataType } from "@/components/entities/FieldEditor";
import { toast } from "sonner";



import { EntityRecord, EntityField } from "@/types/entity";

interface GanttConfig {
  startDateField: string;
  endDateField: string;
  titleField: string;
  groupByField?: string;
  colorByField?: string;
  dependenciesField?: string;
  progressField?: string;
}

interface GanttViewProps {
  records: EntityRecord[];
  fields: EntityField[];
  ganttConfig?: GanttConfig;
  entityId: string;
  onEdit: (record: EntityRecord) => void;
  onDelete: (record: EntityRecord) => void;
  onTogglePublish: (record: EntityRecord) => void;
}

const STATUS_COLORS: Record<string, string> = {
  'planned': 'bg-blue-500',
  'in progress': 'bg-yellow-500',
  'completed': 'bg-green-500',
  'on hold': 'bg-gray-500',
  'cancelled': 'bg-red-500',
};

const PRIORITY_COLORS: Record<string, string> = {
  'low': 'bg-blue-400',
  'medium': 'bg-yellow-500',
  'high': 'bg-orange-500',
  'critical': 'bg-red-600',
};

export const GanttView = ({
  records,
  fields,
  ganttConfig,
  entityId,
  onEdit,
  onDelete,
  onTogglePublish,
}: GanttViewProps) => {
  const [draggingRecord, setDraggingRecord] = useState<{ id: string; startX: number; initialLeft: number } | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const getFieldValue = (record: EntityRecord, fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return '';
    return record.data[field.name] || '';
  };

  const ganttData = useMemo(() => {
    if (!ganttConfig?.startDateField || !ganttConfig?.endDateField || !ganttConfig?.titleField) {
      return null;
    }

    const validRecords = records.filter(record => {
      const startDate = getFieldValue(record, ganttConfig.startDateField);
      const endDate = getFieldValue(record, ganttConfig.endDateField);
      return startDate && endDate;
    });

    if (validRecords.length === 0) return null;

    // Parse dates and find timeline range
    const parsedRecords = validRecords.map(record => {
      const startDate = parseISO(getFieldValue(record, ganttConfig.startDateField));
      const endDate = parseISO(getFieldValue(record, ganttConfig.endDateField));
      return { record, startDate, endDate };
    });

    const allDates = parsedRecords.flatMap(r => [r.startDate, r.endDate]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    const months = eachMonthOfInterval({ start: startOfMonth(minDate), end: endOfMonth(maxDate) });
    const totalDays = differenceInDays(endOfMonth(maxDate), startOfMonth(minDate));

    // Group records if groupByField is specified
    const grouped: Record<string, typeof parsedRecords> = {};
    if (ganttConfig.groupByField) {
      parsedRecords.forEach(item => {
        const groupValue = getFieldValue(item.record, ganttConfig.groupByField!) || 'Ungrouped';
        if (!grouped[groupValue]) grouped[groupValue] = [];
        grouped[groupValue].push(item);
      });
    } else {
      grouped['All Tasks'] = parsedRecords;
    }

    return {
      grouped,
      months,
      minDate: startOfMonth(minDate),
      maxDate: endOfMonth(maxDate),
      totalDays,
    };
  }, [records, fields, ganttConfig]);

  if (!ganttConfig?.startDateField || !ganttConfig?.endDateField || !ganttConfig?.titleField) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">Gantt view not configured</p>
          <p className="text-sm mt-2">Please configure start date, end date, and title fields in View Options</p>
        </div>
      </div>
    );
  }

  if (!ganttData) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">No records with valid dates</p>
          <p className="text-sm mt-2">Add records with both start and end dates to see the Gantt chart</p>
        </div>
      </div>
    );
  }

  const getBarColor = (record: EntityRecord) => {
    if (!ganttConfig.colorByField) return 'bg-primary';

    const colorValue = getFieldValue(record, ganttConfig.colorByField).toLowerCase();
    return STATUS_COLORS[colorValue] || PRIORITY_COLORS[colorValue] || 'bg-primary';
  };

  const getBarPosition = (startDate: Date, endDate: Date) => {
    const daysFromStart = differenceInDays(startDate, ganttData.minDate);
    const duration = differenceInDays(endDate, startDate) + 1;
    const left = (daysFromStart / ganttData.totalDays) * 100;
    const width = (duration / ganttData.totalDays) * 100;
    return { left: `${left}%`, width: `${width}%` };
  };

  const handleBarMouseDown = useCallback((e: React.MouseEvent, record: EntityRecord, currentLeft: number) => {
    e.preventDefault();
    setDraggingRecord({ id: record.id, startX: e.clientX, initialLeft: currentLeft });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingRecord || !ganttData) return;

    const deltaX = e.clientX - draggingRecord.startX;
    setDragOffset(deltaX);
  }, [draggingRecord, ganttData]);

  const handleMouseUp = useCallback(async () => {
    if (!draggingRecord || !ganttData || !ganttConfig) {
      setDraggingRecord(null);
      setDragOffset(0);
      return;
    }

    const record = records.find(r => r.id === draggingRecord.id);
    if (!record) {
      setDraggingRecord(null);
      setDragOffset(0);
      return;
    }

    // Calculate new dates based on drag offset
    const containerWidth = document.querySelector('.gantt-timeline')?.clientWidth || 1000;
    const pixelsPerDay = containerWidth / ganttData.totalDays;
    const daysMoved = Math.round(dragOffset / pixelsPerDay);

    if (daysMoved !== 0) {
      const startDateField = fields.find(f => f.id === ganttConfig.startDateField);
      const endDateField = fields.find(f => f.id === ganttConfig.endDateField);

      if (startDateField && endDateField) {
        const oldStartDate = parseISO(record.data[startDateField.name]);
        const oldEndDate = parseISO(record.data[endDateField.name]);

        const newStartDate = addDays(oldStartDate, daysMoved);
        const newEndDate = addDays(oldEndDate, daysMoved);

        // Update the record in the database
        const updatedData = {
          ...record.data,
          [startDateField.name]: format(newStartDate, 'yyyy-MM-dd'),
          [endDateField.name]: format(newEndDate, 'yyyy-MM-dd'),
        };

        const { error } = await supabase
          .from('entity_records')
          .update({ data: updatedData })
          .eq('id', record.id);

        if (error) {
          toast.error('Failed to update task dates');
          console.error(error);
        } else {
          toast.success('Task dates updated');
        }
      }
    }

    setDraggingRecord(null);
    setDragOffset(0);
  }, [draggingRecord, dragOffset, ganttData, ganttConfig, records, fields]);

  // Attach mouse event listeners
  useState(() => {
    if (draggingRecord) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  });

  const getDependencies = useCallback((record: EntityRecord): string[] => {
    if (!ganttConfig?.dependenciesField) return [];
    const field = fields.find(f => f.id === ganttConfig.dependenciesField);
    if (!field) return [];

    const deps = record.data[field.name];
    if (!deps) return [];
    if (Array.isArray(deps)) return deps;
    if (typeof deps === 'string') {
      try {
        const parsed = JSON.parse(deps);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return deps.split(',').map(d => d.trim()).filter(Boolean);
      }
    }
    return [];
  }, [ganttConfig, fields]);

  const getProgress = useCallback((record: EntityRecord): number => {
    if (!ganttConfig?.progressField) return 0;
    const field = fields.find(f => f.id === ganttConfig.progressField);
    if (!field) return 0;

    const progress = record.data[field.name];
    const num = Number(progress);
    return isNaN(num) ? 0 : Math.max(0, Math.min(100, num));
  }, [ganttConfig, fields]);

  const recordPositions = useMemo(() => {
    if (!ganttData) return new Map();

    const positions = new Map<string, { top: number; left: number; width: number }>();
    let currentTop = 0;
    const rowHeight = 48; // 32px bar + 16px gap

    Object.entries(ganttData.grouped).forEach(([groupName, items]) => {
      if (ganttConfig?.groupByField) {
        currentTop += 40; // Group header height
      }

      items.forEach(({ record, startDate, endDate }) => {
        const position = getBarPosition(startDate, endDate);
        const leftPercent = parseFloat(position.left);
        const widthPercent = parseFloat(position.width);

        positions.set(record.id, {
          top: currentTop,
          left: leftPercent,
          width: widthPercent,
        });

        currentTop += rowHeight;
      });
    });

    return positions;
  }, [ganttData, ganttConfig, getBarPosition]);

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto border rounded-lg relative">
        <div className="min-w-[800px] gantt-timeline">{ganttData && ganttConfig?.dependenciesField && (
          <svg
            className="absolute inset-0 pointer-events-none z-0"
            style={{ width: '100%', height: '100%' }}
          >
            {Object.entries(ganttData.grouped).flatMap(([, items]) =>
              items.flatMap(({ record }) => {
                const deps = getDependencies(record);
                const fromPos = recordPositions.get(record.id);
                if (!fromPos || deps.length === 0) return [];

                return deps.map(depId => {
                  const toPos = recordPositions.get(depId);
                  if (!toPos) return null;

                  const x1 = fromPos.left + '%';
                  const y1 = fromPos.top + 16;
                  const x2 = toPos.left + toPos.width + '%';
                  const y2 = toPos.top + 16;

                  return (
                    <g key={`${record.id}-${depId}`}>
                      <defs>
                        <marker
                          id={`arrowhead-${record.id}-${depId}`}
                          markerWidth="10"
                          markerHeight="10"
                          refX="9"
                          refY="3"
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3, 0 6" fill="hsl(var(--muted-foreground))" />
                        </marker>
                      </defs>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth="2"
                        markerEnd={`url(#arrowhead-${record.id}-${depId})`}
                        strokeDasharray="4"
                      />
                    </g>
                  );
                }).filter(Boolean);
              })
            )}
          </svg>
        )}
          {/* Timeline Header */}
          <div className="bg-muted/50 border-b sticky top-0 z-10">
            <div className="flex">
              <div className="w-64 p-3 border-r font-semibold">Task</div>
              <div className="flex-1 flex">
                {ganttData.months.map((month, idx) => {
                  const monthStart = startOfMonth(month);
                  const monthEnd = endOfMonth(month);
                  const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
                  const width = (daysInMonth / ganttData.totalDays) * 100;

                  return (
                    <div
                      key={idx}
                      className="border-r px-2 py-3 text-center text-sm font-medium"
                      style={{ width: `${width}%` }}
                    >
                      {format(month, 'MMM yyyy')}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Gantt Rows */}
          <div className="divide-y">
            {Object.entries(ganttData.grouped).map(([groupName, items]) => (
              <div key={groupName}>
                {ganttConfig.groupByField && (
                  <div className="bg-muted/30 px-3 py-2 font-semibold text-sm border-b">
                    {groupName}
                  </div>
                )}
                {items.map(({ record, startDate, endDate }) => {
                  const title = getFieldValue(record, ganttConfig.titleField);
                  let position = getBarPosition(startDate, endDate);
                  const barColor = getBarColor(record);
                  const progress = getProgress(record);

                  // Apply drag offset if this record is being dragged
                  if (draggingRecord?.id === record.id && ganttData) {
                    const containerWidth = 1000; // approximate
                    const pixelsPerDay = containerWidth / ganttData.totalDays;
                    const daysMoved = dragOffset / pixelsPerDay;
                    const percentMoved = (daysMoved / ganttData.totalDays) * 100;

                    const currentLeft = parseFloat(position.left);
                    position = {
                      ...position,
                      left: `${currentLeft + percentMoved}%`
                    };
                  }

                  return (
                    <div key={record.id} className="flex hover:bg-muted/30 transition-colors group">
                      <div className="w-64 p-3 border-r flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{title}</div>
                          <Badge
                            variant={record.is_published ? "default" : "secondary"}
                            className="mt-1 text-xs"
                          >
                            {record.is_published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex-1 relative p-3 z-10">
                        {/* Timeline grid lines */}
                        <div className="absolute inset-0 flex">
                          {ganttData.months.map((month, idx) => {
                            const monthStart = startOfMonth(month);
                            const monthEnd = endOfMonth(month);
                            const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
                            const width = (daysInMonth / ganttData.totalDays) * 100;

                            return (
                              <div
                                key={idx}
                                className="border-r border-border/30"
                                style={{ width: `${width}%` }}
                              />
                            );
                          })}
                        </div>

                        {/* Gantt Bar */}
                        <div
                          className="absolute top-1/2 -translate-y-1/2 h-8 cursor-move select-none"
                          style={position}
                          onMouseDown={(e) => handleBarMouseDown(e, record, parseFloat(position.left))}
                        >
                          <div
                            className={`h-full rounded-md ${barColor} border-2 border-background shadow-sm hover:shadow-md transition-shadow relative flex items-center px-2 text-white text-xs font-medium overflow-hidden`}
                            title={`${title}\n${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}${progress > 0 ? `\n${progress}% complete` : ''}`}
                          >
                            {/* Progress indicator */}
                            {progress > 0 && (
                              <div
                                className="absolute inset-0 bg-white/30 rounded-l-md transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            )}
                            <span className="truncate relative z-10">{title}</span>
                            {progress > 0 && (
                              <span className="ml-auto relative z-10 text-[10px] font-bold">{progress}%</span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-background/95 p-1 rounded-md shadow-lg border">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(record)}
                            className="h-7 px-2"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onTogglePublish(record)}
                            className="h-7 px-2"
                          >
                            {record.is_published ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(record)}
                            className="h-7 px-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
