import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { GripVertical } from "lucide-react";
import { E_FieldDataType } from "./FieldEditor";

type FieldType = 'text' | 'number' | 'boolean' | 'date' | 'longtext' | 'image' | 'url';

import { EntityField } from "@/types/entity";

interface CardLayout {
  titleField: string;
  subtitleField?: string;
  imageField?: string;
  displayFields: Array<{ fieldId: string; position: number }>;
}

interface CardLayoutEditorProps {
  fields: EntityField[];
  layout: CardLayout;
  onChange: (layout: CardLayout) => void;
  showImageField?: boolean;
}

export const CardLayoutEditor = ({ fields, layout, onChange, showImageField = true }: CardLayoutEditorProps) => {
  const handleFieldToggle = (fieldId: string, checked: boolean) => {
    const newDisplayFields = checked
      ? [...layout.displayFields, { fieldId, position: layout.displayFields.length }]
      : layout.displayFields.filter(f => f.fieldId !== fieldId);

    onChange({ ...layout, displayFields: newDisplayFields });
  };

  const imageFields = fields.filter(f => f.field_type === E_FieldDataType.Image);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Title Field *</Label>
        <Select value={layout.titleField} onValueChange={(value) => onChange({ ...layout, titleField: value })}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select title field" />
          </SelectTrigger>
          <SelectContent>
            {fields.map(field => (
              <SelectItem key={field.name} value={field.name}>
                {field.display_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium">Subtitle Field (Optional)</Label>
        <Select value={layout.subtitleField || "none"} onValueChange={(value) => onChange({ ...layout, subtitleField: value === "none" ? undefined : value })}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select subtitle field" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {fields.map(field => (
              <SelectItem key={field.name} value={field.name}>
                {field.display_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showImageField && imageFields.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Image Field (Optional)</Label>
          <Select value={layout.imageField || "none"} onValueChange={(value) => onChange({ ...layout, imageField: value === "none" ? undefined : value })}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select image field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {imageFields.map(field => (
                <SelectItem key={field.name} value={field.name}>
                  {field.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label className="text-sm font-medium mb-2 block">Additional Fields to Display</Label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {fields.map(field => {
            const isSelected = layout.displayFields.some(df => df.fieldId === field.name);
            const isTitle = field.name === layout.titleField;
            const isSubtitle = field.name === layout.subtitleField;
            const isImage = field.name === layout.imageField;
            const isReserved = isTitle || isSubtitle || isImage;

            return (
              <div key={field.name} className="flex items-center space-x-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <Checkbox
                  id={`display-${field.name}`}
                  checked={isSelected}
                  disabled={isReserved}
                  onCheckedChange={(checked) => handleFieldToggle(field.name, checked as boolean)}
                />
                <Label
                  htmlFor={`display-${field.name}`}
                  className={`font-normal cursor-pointer flex-1 ${isReserved ? 'text-muted-foreground' : ''}`}
                >
                  {field.display_name}
                  {isReserved && (
                    <span className="text-xs ml-2">
                      (Used as {isTitle ? 'title' : isSubtitle ? 'subtitle' : 'image'})
                    </span>
                  )}
                </Label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
