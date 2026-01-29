"use client";

import { Button } from "@/components/ui/button";
import { E_FieldDataType } from "@/components/entities/FieldEditor";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";



import { EntityRecord, EntityField } from "@/types/entity";

interface ListConfig {
  titleField: string;
  subtitleField?: string;
  displayFields: Array<{ fieldId: string; position: number }>;
}

interface ListViewProps {
  records: EntityRecord[];
  fields: EntityField[];
  listConfig?: ListConfig;
  onEdit: (record: EntityRecord) => void;
  onDelete: (record: EntityRecord) => void;
  onTogglePublish: (record: EntityRecord) => void;
}

export const ListView = ({ records, fields, listConfig, onEdit, onDelete, onTogglePublish }: ListViewProps) => {
  const getFieldValue = (record: EntityRecord, fieldName: string) => {
    const field = fields.find(f => f.name === fieldName);
    if (!field) return null;

    const value = record.data[field.name];
    if (value === null || value === undefined) return null;

    if (field.field_type === E_FieldDataType.Boolean) return value ? 'Yes' : 'No';
    if (field.field_type === E_FieldDataType.Date || field.field_type === E_FieldDataType.DateTime) return new Date(value).toLocaleDateString();
    return String(value);
  };

  const titleField = fields.find(f => f.name === listConfig?.titleField) || fields[0];
  const subtitleField = listConfig?.subtitleField ? fields.find(f => f.name === listConfig.subtitleField) : null;

  const displayFields = listConfig?.displayFields
    ?.sort((a, b) => a.position - b.position)
    .map(df => fields.find(f => f.name === df.fieldId))
    .filter(Boolean) as EntityField[] || [];

  return (
    <div className="space-y-2">
      {records.map((record) => (
        <div
          key={record.id}
          className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">
                {getFieldValue(record, titleField.name) || 'Untitled'}
              </h3>
              <Badge variant={record.is_published ? "default" : "secondary"}>
                {record.is_published ? "Published" : "Draft"}
              </Badge>
            </div>
            {subtitleField && (
              <p className="text-sm text-muted-foreground mb-2 truncate">
                {getFieldValue(record, subtitleField.name)}
              </p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {displayFields.map((field) => {
                const value = getFieldValue(record, field.name);
                if (!value) return null;

                return (
                  <div key={field.name} className="text-muted-foreground">
                    <span className="font-medium">{field.display_name}:</span>{' '}
                    {field.field_type === E_FieldDataType.TextArea ? (
                      <p className="line-clamp-1">{value}</p>
                    ) : (
                      <span>{value}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={() => onEdit(record)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTogglePublish(record)}
            >
              {record.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(record)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
