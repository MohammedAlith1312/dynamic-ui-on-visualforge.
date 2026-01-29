import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GripVertical, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Label } from "@/components/ui/label";

export enum E_FieldDataType {
    String = "String",
    Interger = "Interger",
    Date = "Date",
    DateTime = "DateTime",
    Decimal = "Decimal",
    TimeSpan = "TimeSpan",
    Image = "Image",
    DropDown = "DropDown",
    Relation = "Relation",
    Boolean = "Boolean",
    TextArea = "TextArea",
    DBComputed = "DBComputed",
    Formula = "Formula",
    File = "File",
    Time = "Time",
    QRcode = "QRcode",
    List = "List",
    HTMLEditor = "HTMLEditor",
    Button = "Button",
    Icon = "Icon",
    Password = "Password",
    Int64 = "Int64",
    Chips = "Chips",
    ImageSlider = "ImageSlider",
}

export interface EntityField {
  id: string;
  name: string;
  display_name: string;
  field_type: E_FieldDataType;
  is_required: boolean;
  default_value: string | null;
}

interface FieldEditorProps {
  field: EntityField;
  onUpdate: (updates: Partial<EntityField>) => void;
  onDelete: () => void;
}

const FIELD_TYPES = Object.values(E_FieldDataType).map((type) => ({
  value: type,
  label: type.replace(/([A-Z])/g, ' $1').trim(), // Add space before capital letters for label
}));

export const FieldEditor = ({ field, onUpdate, onDelete }: FieldEditorProps) => {
  const [expanded, setExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.name,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg bg-card"
    >
      <div className="flex items-center gap-3 p-4">     
        <div className="flex-1 grid grid-cols-3 gap-3">
          <Input
            value={field.display_name}
            onChange={(e) => onUpdate({ display_name: e.target.value })}
            placeholder="Display Name"
          />
          <Input
            value={field.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="field_name"
          />
          <Select value={field.field_type} onValueChange={(value) => onUpdate({ field_type: value as E_FieldDataType })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FIELD_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      {expanded && (
        <div className="border-t p-4 space-y-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <Label>Required Field</Label>
            <Switch
              checked={field.is_required}
              onCheckedChange={(checked) => onUpdate({ is_required: checked })}
            />
          </div>
          <div className="space-y-2">
            <Label>Default Value</Label>
            <Input
              value={field.default_value || ""}
              onChange={(e) => onUpdate({ default_value: e.target.value || null })}
              placeholder="Optional default value"
            />
          </div>
        </div>
      )}
    </div>
  );
};
