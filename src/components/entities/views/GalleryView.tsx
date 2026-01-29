"use client";

import { Button } from "@/components/ui/button";
import { E_FieldDataType } from "@/components/entities/FieldEditor";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";



import { EntityRecord, EntityField } from "@/types/entity";

interface GalleryConfig {
  imageField: string;
  titleField: string;
  subtitleField?: string;
}

interface GalleryViewProps {
  records: EntityRecord[];
  fields: EntityField[];
  galleryConfig?: GalleryConfig;
  onEdit: (record: EntityRecord) => void;
  onDelete: (record: EntityRecord) => void;
  onTogglePublish: (record: EntityRecord) => void;
}

export const GalleryView = ({ records, fields, galleryConfig, onEdit, onDelete, onTogglePublish }: GalleryViewProps) => {
  const getFieldValue = (record: EntityRecord, fieldName: string) => {
    const field = fields.find(f => f.name === fieldName);
    if (!field) return null;
    return record.data[field.name];
  };

  const imageField = fields.find(f => f.name === galleryConfig?.imageField);
  const titleField = fields.find(f => f.name === galleryConfig?.titleField) || fields[0];
  const subtitleField = galleryConfig?.subtitleField ? fields.find(f => f.name === galleryConfig.subtitleField) : null;

  if (!galleryConfig || !imageField) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Please configure the Gallery view by selecting an image field in View Options.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {records.map((record) => {
        const imageUrl = getFieldValue(record, imageField.name);
        const title = getFieldValue(record, titleField.name) || 'Untitled';
        const subtitle = subtitleField ? getFieldValue(record, subtitleField.name) : null;

        return (
          <div key={record.id} className="group relative aspect-square rounded-lg overflow-hidden bg-muted">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{title}</h3>
                    {subtitle && (
                      <p className="text-sm text-white/80 truncate">{subtitle}</p>
                    )}
                  </div>
                  <Badge variant={record.is_published ? "default" : "secondary"}>
                    {record.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => onEdit(record)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onTogglePublish(record)}
                  >
                    {record.is_published ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => onDelete(record)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
