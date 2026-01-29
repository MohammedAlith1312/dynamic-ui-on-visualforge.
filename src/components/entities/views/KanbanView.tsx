"use client";

import { useState, useMemo } from "react";
import { E_FieldDataType } from "@/components/entities/FieldEditor";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";



import { EntityRecord, EntityField } from "@/types/entity";

interface CardLayout {
  titleField: string;
  subtitleField?: string;
  displayFields: Array<{ fieldId: string; position: number }>;
}

interface KanbanConfig {
  groupByField: string;
  cardLayout: CardLayout;
}

interface KanbanViewProps {
  records: EntityRecord[];
  fields: EntityField[];
  kanbanConfig?: KanbanConfig;
  onEdit: (record: EntityRecord) => void;
  onDelete: (record: EntityRecord) => void;
  onTogglePublish: (record: EntityRecord) => void;
}

export const KanbanView = ({ records, fields, kanbanConfig, onEdit, onDelete, onTogglePublish }: KanbanViewProps) => {
  const getFieldValue = (record: EntityRecord, fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return null;

    const value = record.data[field.name];
    if (value === null || value === undefined) return null;

    if (field.field_type === E_FieldDataType.Boolean) return value ? 'Yes' : 'No';
    if (field.field_type === E_FieldDataType.Date) return new Date(value).toLocaleDateString();
    return String(value);
  };

  const groupByField = fields.find(f => f.id === kanbanConfig?.groupByField);
  const titleField = fields.find(f => f.id === kanbanConfig?.cardLayout.titleField) || fields[0];
  const subtitleField = kanbanConfig?.cardLayout.subtitleField
    ? fields.find(f => f.id === kanbanConfig.cardLayout.subtitleField)
    : null;

  const displayFields = kanbanConfig?.cardLayout.displayFields
    ?.sort((a, b) => a.position - b.position)
    .map(df => fields.find(f => f.id === df.fieldId))
    .filter(Boolean) as EntityField[] || [];

  const groupedRecords = useMemo(() => {
    if (!groupByField) return { 'All Records': records };

    const groups: Record<string, EntityRecord[]> = {};
    records.forEach(record => {
      const groupValue = record.data[groupByField.name] || 'Uncategorized';
      if (!groups[groupValue]) {
        groups[groupValue] = [];
      }
      groups[groupValue].push(record);
    });
    return groups;
  }, [records, groupByField]);

  if (!kanbanConfig || !groupByField) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Please configure the Kanban view by selecting a grouping field in View Options.
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Object.entries(groupedRecords).map(([groupName, groupRecords]) => (
        <div key={groupName} className="flex-shrink-0 w-80">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{groupName}</h3>
              <Badge variant="secondary">{groupRecords.length}</Badge>
            </div>
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-3 pr-4">
                {groupRecords.map((record) => (
                  <Card key={record.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base truncate">
                          {getFieldValue(record, titleField.id) || 'Untitled'}
                        </CardTitle>
                        <Badge variant={record.is_published ? "default" : "secondary"} className="flex-shrink-0">
                          {record.is_published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      {subtitleField && (
                        <p className="text-sm text-muted-foreground truncate">
                          {getFieldValue(record, subtitleField.id)}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-1">
                        {displayFields.map((field) => {
                          const value = getFieldValue(record, field.id);
                          if (!value) return null;

                          return (
                            <div key={field.id} className="text-sm">
                              <span className="font-medium text-muted-foreground">{field.display_name}: </span>
                              {field.field_type === E_FieldDataType.TextArea ? (
                                <p className="line-clamp-1">{value}</p>
                              ) : (
                                <span>{value}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2 pt-3 border-t">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(record)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTogglePublish(record)}
                      >
                        {record.is_published ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(record)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      ))}
    </div>
  );
};
