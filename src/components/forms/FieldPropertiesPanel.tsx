import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ConditionalLogicEditor } from "./ConditionalLogicEditor";
import { ValidationRulesEditor } from "./ValidationRulesEditor";
import { OptionsEditor } from "./OptionsEditor";

interface FieldPropertiesPanelProps {
  field: any;
  onUpdate: (updates: any) => void;
  availableFields: Array<{ id: string; label: string; field_type: string }>;
}

export function FieldPropertiesPanel({ field, onUpdate, availableFields }: FieldPropertiesPanelProps) {
  const hasOptions = ["select", "radio", "checkbox", "multi-select"].includes(field.field_type);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Field Properties</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Field Label"
          />
        </div>

        <div>
          <Label htmlFor="field-name">Field Name</Label>
          <Input
            id="field-name"
            value={field.field_name}
            onChange={(e) => onUpdate({ field_name: e.target.value })}
            placeholder="field_name"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Internal identifier (lowercase, no spaces)
          </p>
        </div>

        <div>
          <Label htmlFor="placeholder">Placeholder</Label>
          <Input
            id="placeholder"
            value={field.placeholder || ""}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            placeholder="Enter placeholder text"
          />
        </div>

        <div>
          <Label htmlFor="help-text">Help Text</Label>
          <Textarea
            id="help-text"
            value={field.help_text || ""}
            onChange={(e) => onUpdate({ help_text: e.target.value })}
            placeholder="Optional help text for users"
            rows={2}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Required Field</Label>
            <p className="text-xs text-muted-foreground">
              Users must fill this field
            </p>
          </div>
          <Switch
            checked={field.is_required}
            onCheckedChange={(checked) => onUpdate({ is_required: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Visible</Label>
            <p className="text-xs text-muted-foreground">
              Show this field by default
            </p>
          </div>
          <Switch
            checked={field.is_visible ?? true}
            onCheckedChange={(checked) => onUpdate({ is_visible: checked })}
          />
        </div>

        <div>
          <Label htmlFor="column-width">Column Width</Label>
          <Select
            value={field.column_width}
            onValueChange={(value) => onUpdate({ column_width: value })}
          >
            <SelectTrigger id="column-width">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Width</SelectItem>
              <SelectItem value="half">Half Width</SelectItem>
              <SelectItem value="third">Third Width</SelectItem>
              <SelectItem value="quarter">Quarter Width</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasOptions && (
          <div className="pt-4 border-t">
            <OptionsEditor
              options={field.options || []}
              onChange={(options) => onUpdate({ options })}
            />
          </div>
        )}

        <div className="pt-4 border-t">
          <ValidationRulesEditor
            fieldType={field.field_type}
            rules={field.validation_rules || {}}
            onChange={(rules) => onUpdate({ validation_rules: rules })}
          />
        </div>

        <div className="pt-4 border-t">
          <ConditionalLogicEditor
            value={field.conditional_logic || {}}
            onChange={(logic) => onUpdate({ conditional_logic: logic })}
            availableFields={availableFields.filter(f => f.id !== field.id)}
          />
        </div>
      </div>
    </div>
  );
}
