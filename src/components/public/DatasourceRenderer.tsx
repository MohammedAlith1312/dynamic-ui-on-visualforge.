"use client";

import { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CardView } from "@/components/entities/views/CardView";
import { KanbanView } from "@/components/entities/views/KanbanView";
import { GalleryView } from "@/components/entities/views/GalleryView";
import { ListView } from "@/components/entities/views/ListView";
import { TimelineView } from "@/components/entities/views/TimelineView";
import { CalendarView } from "@/components/entities/views/CalendarView";
import { GanttView } from "@/components/entities/views/GanttView";
import { fetchEntityData } from "@/components/datasource/adapters/EntityAdapter";
import { fetchQueryData } from "@/components/datasource/adapters/QueryAdapter";
import { fetchApiData } from "@/components/datasource/adapters/ApiAdapter";
import type { FieldInfo, DataRecord } from "@/components/datasource/adapters/EntityAdapter";
import { E_FieldDataType } from "@/components/entities/FieldEditor";

interface DatasourceRendererProps {
  content?: {
    dataSourceType?: 'entity' | 'query' | 'api';
    entityId?: string;
    queryId?: string;
    apiRequestId?: string;
    viewType?: 'table' | 'card' | 'kanban' | 'gallery' | 'list' | 'timeline' | 'calendar' | 'gantt';
    viewOptions?: {
      visibleColumns?: string[];
      sortField?: string | null;
      sortOrder?: 'asc' | 'desc';
      filters?: Array<{ field: string; operator: string; value: string }>;
      cardLayout?: any;
      kanbanConfig?: any;
      galleryConfig?: any;
      listConfig?: any;
      timelineConfig?: any;
      calendarConfig?: any;
      ganttConfig?: any;
    };
  };
}

import { EntityRecord, EntityField } from "@/types/entity";

export const DatasourceRenderer = ({ content }: DatasourceRendererProps) => {
  const [data, setData] = useState<DataRecord[]>([]);
  const [fields, setFields] = useState<FieldInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle content that might be a JSON string or nested object
  let normalizedContent = content;
  if (typeof content === 'string') {
    try {
      normalizedContent = JSON.parse(content);
    } catch {
      normalizedContent = {};
    }
  }

  // Handle nested content structure (in case it was saved incorrectly)
  if (normalizedContent && typeof normalizedContent === 'object' && 'content' in normalizedContent && Object.keys(normalizedContent).length === 1) {
    normalizedContent = (normalizedContent as any).content;
  }

  // Provide default values if content is missing or incomplete
  const safeContent = {
    dataSourceType: normalizedContent?.dataSourceType || 'entity',
    entityId: normalizedContent?.entityId,
    queryId: normalizedContent?.queryId,
    apiRequestId: normalizedContent?.apiRequestId,
    viewType: normalizedContent?.viewType || 'table',
    viewOptions: {
      visibleColumns: normalizedContent?.viewOptions?.visibleColumns || [],
      sortField: normalizedContent?.viewOptions?.sortField || null,
      sortOrder: (normalizedContent?.viewOptions?.sortOrder || 'asc') as 'asc' | 'desc',
      filters: normalizedContent?.viewOptions?.filters || [],
      cardLayout: normalizedContent?.viewOptions?.cardLayout,
      kanbanConfig: normalizedContent?.viewOptions?.kanbanConfig,
      galleryConfig: normalizedContent?.viewOptions?.galleryConfig,
      listConfig: normalizedContent?.viewOptions?.listConfig,
      timelineConfig: normalizedContent?.viewOptions?.timelineConfig,
      calendarConfig: normalizedContent?.viewOptions?.calendarConfig,
      ganttConfig: normalizedContent?.viewOptions?.ganttConfig,
    },
  };

  useEffect(() => {
    loadDataSource();
  }, [safeContent.dataSourceType, safeContent.entityId, safeContent.queryId, safeContent.apiRequestId]);

  const loadDataSource = async () => {
    setLoading(true);
    setError(null);

    try {
      let result;

      // Check which data source type is configured and has an ID
      if (safeContent.dataSourceType === 'entity') {
        if (!safeContent.entityId) {
          setError("Please select an entity in the component editor.");
          setLoading(false);
          return;
        }
        result = await fetchEntityData(safeContent.entityId);
      } else if (safeContent.dataSourceType === 'query') {
        if (!safeContent.queryId) {
          setError("Please select a query in the component editor.");
          setLoading(false);
          return;
        }
        result = await fetchQueryData(safeContent.queryId);
      } else if (safeContent.dataSourceType === 'api') {
        if (!safeContent.apiRequestId) {
          setError("Please select an API request in the component editor.");
          setLoading(false);
          return;
        }
        result = await fetchApiData(safeContent.apiRequestId);
      } else {
        setError("Please configure the data source type in the component editor.");
        setLoading(false);
        return;
      }

      setData(result.data);
      setFields(result.fields);
    } catch (err: any) {
      console.error("Error loading data source:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Convert FieldInfo to EntityField
  const entityFields: EntityField[] = fields.map(f => ({
    id: f.id,
    name: f.name,
    display_name: f.display_name,
    field_type: f.field_type,
  }));

  // Convert DataRecord to EntityRecord
  const entityRecords: EntityRecord[] = data.map(record => ({
    id: record.id,
    data: record.data,
    is_published: record.is_published ?? true,
    created_at: record.created_at || new Date().toISOString(),
  }));

  // Apply filters
  const filteredRecords = useMemo(() => {
    if (!safeContent.viewOptions.filters || safeContent.viewOptions.filters.length === 0) {
      return entityRecords;
    }

    return entityRecords.filter(record => {
      return safeContent.viewOptions.filters.every(filter => {
        const field = fields.find(f => f.id === filter.field || f.name === filter.field);
        if (!field) return true;

        const value = record.data[field.name];
        const filterValue = filter.value;

        switch (filter.operator) {
          case 'equals':
            return String(value) === filterValue;
          case 'contains':
            return String(value).toLowerCase().includes(filterValue.toLowerCase());
          case 'greater_than':
            return Number(value) > Number(filterValue);
          case 'less_than':
            return Number(value) < Number(filterValue);
          default:
            return true;
        }
      });
    });
  }, [entityRecords, safeContent.viewOptions.filters, fields]);

  // Apply sorting
  const sortedRecords = useMemo(() => {
    if (!safeContent.viewOptions.sortField) {
      return filteredRecords;
    }

    const field = fields.find(f => f.id === safeContent.viewOptions.sortField || f.name === safeContent.viewOptions.sortField);
    if (!field) return filteredRecords;

    const sorted = [...filteredRecords].sort((a, b) => {
      const aValue = a.data[field.name];
      const bValue = b.data[field.name];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if ([E_FieldDataType.Interger, E_FieldDataType.Decimal, E_FieldDataType.Int64].includes(field.field_type)) {
        return (Number(aValue) - Number(bValue)) * (safeContent.viewOptions.sortOrder === 'asc' ? 1 : -1);
      }

      if ([E_FieldDataType.Date, E_FieldDataType.DateTime].includes(field.field_type)) {
        const aDate = new Date(aValue).getTime();
        const bDate = new Date(bValue).getTime();
        return (aDate - bDate) * (safeContent.viewOptions.sortOrder === 'asc' ? 1 : -1);
      }

      return String(aValue).localeCompare(String(bValue)) * (safeContent.viewOptions.sortOrder === 'asc' ? 1 : -1);
    });

    return sorted;
  }, [filteredRecords, safeContent.viewOptions.sortField, safeContent.viewOptions.sortOrder, fields]);

  // Get visible fields for table view
  const visibleFields = useMemo(() => {
    if (safeContent.viewOptions.visibleColumns.length === 0) {
      return entityFields;
    }
    return entityFields.filter(f => safeContent.viewOptions.visibleColumns.includes(f.id));
  }, [entityFields, safeContent.viewOptions.visibleColumns]);

  // No-op handlers for public view (no edit/delete)
  const noopHandlers = {
    onEdit: () => { },
    onDelete: () => { },
    onTogglePublish: () => { },
  };

  if (loading) {
    return <div className="text-muted-foreground p-4">Loading data...</div>;
  }

  if (error) {
    return <div className="text-destructive p-4">Error: {error}</div>;
  }

  if (sortedRecords.length === 0) {
    return <div className="text-muted-foreground p-4">No data available</div>;
  }

  const viewType = safeContent.viewType || 'table';
  const commonProps = {
    records: sortedRecords,
    fields: entityFields,
    ...noopHandlers,
  };

  switch (viewType) {
    case 'card':
      return <CardView {...commonProps} cardLayout={safeContent.viewOptions.cardLayout} />;

    case 'kanban':
      return <KanbanView {...commonProps} kanbanConfig={safeContent.viewOptions.kanbanConfig} />;

    case 'gallery':
      return <GalleryView {...commonProps} galleryConfig={safeContent.viewOptions.galleryConfig} />;

    case 'list':
      return <ListView {...commonProps} listConfig={safeContent.viewOptions.listConfig} />;

    case 'timeline':
      return <TimelineView {...commonProps} timelineConfig={safeContent.viewOptions.timelineConfig} />;

    case 'calendar':
      return <CalendarView {...commonProps} calendarConfig={safeContent.viewOptions.calendarConfig} />;

    case 'gantt':
      return <GanttView {...commonProps} ganttConfig={safeContent.viewOptions.ganttConfig} entityId={safeContent.entityId || ''} />;

    case 'table':
    default:
      return (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleFields.map((field) => (
                  <TableHead key={field.id} className="min-w-[150px]">
                    {field.display_name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRecords.map((record) => (
                <TableRow key={record.id}>
                  {visibleFields.map((field) => (
                    <TableCell key={field.id} className="max-w-xs">
                      <div className="truncate">
                        {renderFieldValue(record.data[field.name], field.field_type)}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
  }
};

function renderFieldValue(value: any, fieldType: EntityField['field_type']): string {
  if (value === null || value === undefined) return "-";

  if (fieldType === E_FieldDataType.Boolean) return value ? 'Yes' : 'No';
  if (fieldType === E_FieldDataType.Date || fieldType === E_FieldDataType.DateTime) {
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return String(value);
    }
  }
  if (fieldType === E_FieldDataType.Image) return String(value);

  return String(value);
}

