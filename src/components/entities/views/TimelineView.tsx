"use client";

import { useMemo } from "react";
import { E_FieldDataType } from "@/components/entities/FieldEditor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";



import { EntityRecord, EntityField } from "@/types/entity";

interface TimelineConfig {
  dateField: string;
  titleField: string;
  descriptionField?: string;
}

interface TimelineViewProps {
  records: EntityRecord[];
  fields: EntityField[];
  timelineConfig?: TimelineConfig;
  onEdit: (record: EntityRecord) => void;
  onDelete: (record: EntityRecord) => void;
  onTogglePublish: (record: EntityRecord) => void;
}

export const TimelineView = ({ records, fields, timelineConfig, onEdit, onDelete, onTogglePublish }: TimelineViewProps) => {
  const getFieldValue = (record: EntityRecord, fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return null;
    return record.data[field.name];
  };

  const dateField = fields.find(f => f.id === timelineConfig?.dateField);
  const titleField = fields.find(f => f.id === timelineConfig?.titleField) || fields[0];
  const descriptionField = timelineConfig?.descriptionField
    ? fields.find(f => f.id === timelineConfig.descriptionField)
    : null;

  const sortedRecords = useMemo(() => {
    if (!dateField) return records;

    return [...records].sort((a, b) => {
      const dateA = new Date(a.data[dateField.name] || a.created_at).getTime();
      const dateB = new Date(b.data[dateField.name] || b.created_at).getTime();
      return dateB - dateA; // Most recent first
    });
  }, [records, dateField]);

  if (!timelineConfig || !dateField) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Please configure the Timeline view by selecting a date field in View Options.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-8">
          {sortedRecords.map((record, index) => {
            const date = getFieldValue(record, dateField.id);
            const title = getFieldValue(record, titleField.id) || 'Untitled';
            const description = descriptionField ? getFieldValue(record, descriptionField.id) : null;
            const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'No date';

            return (
              <div key={record.id} className="relative pl-16">
                {/* Timeline dot */}
                <div className="absolute left-6 w-5 h-5 rounded-full bg-primary border-4 border-background" />

                <div className="rounded-lg border bg-card p-6">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{title}</h3>
                        <Badge variant={record.is_published ? "default" : "secondary"}>
                          {record.is_published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{formattedDate}</p>
                    </div>
                    <div className="flex gap-2">
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
                  {description && (
                    <p className="text-muted-foreground">{description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
