"use client";

import { Button } from "@/components/ui/button";
import { E_FieldDataType } from "@/components/entities/FieldEditor";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";



import { EntityRecord, EntityField } from "@/types/entity";

interface CardLayout {
  titleField: string;
  subtitleField?: string;
  imageField?: string;
  displayFields: Array<{ fieldId: string; position: number }>;
}

interface CardViewProps {
  records: EntityRecord[];
  fields: EntityField[];
  cardLayout?: CardLayout;
  onEdit: (record: EntityRecord) => void;
  onDelete: (record: EntityRecord) => void;
  onTogglePublish: (record: EntityRecord) => void;
}

export const CardView = ({ records, fields, cardLayout, onEdit, onDelete, onTogglePublish }: CardViewProps) => {
  const getFieldValue = (record: EntityRecord, fieldName: string) => {
    const field = fields.find(f => f.name === fieldName);
    if (!field) return null;

    const value = record.data[field.name];
    if (value === null || value === undefined) return null;

    if (field.field_type === E_FieldDataType.Boolean) return value ? 'Yes' : 'No';
    if (field.field_type === E_FieldDataType.Date) return new Date(value).toLocaleDateString();
    if (field.field_type === E_FieldDataType.Image) return value;
    return String(value);
  };

  const titleField = fields.find(f => f.name === cardLayout?.titleField) || fields[0];
  const subtitleField = cardLayout?.subtitleField ? fields.find(f => f.name === cardLayout.subtitleField) : null;
  const imageField = cardLayout?.imageField ? fields.find(f => f.name === cardLayout.imageField) : null;

  const displayFields = cardLayout?.displayFields
    ?.sort((a, b) => a.position - b.position)
    .map(df => fields.find(f => f.name === df.fieldId))
    .filter(Boolean) as EntityField[] || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {records.map((record) => (
        <Card key={record.id} className="overflow-hidden">
          {imageField && getFieldValue(record, imageField.name) && (
            <div className="w-full h-48 overflow-hidden bg-muted">
              <img
                src={getFieldValue(record, imageField.name) || ''}
                alt={getFieldValue(record, titleField.name) || 'Record image'}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">
                  {getFieldValue(record, titleField.name) || 'Untitled'}
                </CardTitle>
                {subtitleField && (
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    {getFieldValue(record, subtitleField.name)}
                  </p>
                )}
              </div>
              <Badge variant={record.is_published ? "default" : "secondary"}>
                {record.is_published ? "Published" : "Draft"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {displayFields.map((field) => {
                const value = getFieldValue(record, field.name);
                if (!value) return null;

                return (
                  <div key={field.name} className="text-sm">
                    <span className="font-medium text-muted-foreground">{field.display_name}: </span>
                    {field.field_type === E_FieldDataType.TextArea ? (
                      <p className="line-clamp-2">{value}</p>
                    ) : (
                      <span>{value}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={() => onEdit(record)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTogglePublish(record)}
            >
              {record.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(record)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
