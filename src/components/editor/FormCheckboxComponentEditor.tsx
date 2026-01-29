import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormCheckboxComponentEditorProps {
  content: {
    fieldName?: string;
    label?: string;
    options?: string;
    type?: "checkbox" | "radio";
    required?: boolean;
  };
  onUpdate: (content: any) => void;
}

export const FormCheckboxComponentEditor = ({ content, onUpdate }: FormCheckboxComponentEditorProps) => {
  const fieldName = content.fieldName || "checkbox_field";
  const label = content.label || "Select Options";
  const options = content.options || "Option 1\nOption 2\nOption 3";
  const type = content.type || "checkbox";
  const required = content.required || false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Form Checkbox/Radio Field</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Field Type</Label>
          <Select value={type} onValueChange={(val: any) => onUpdate({ ...content, type: val })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="checkbox">Checkbox Group</SelectItem>
              <SelectItem value="radio">Radio Group</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkbox-field-name">Field Name</Label>
          <Input
            id="checkbox-field-name"
            value={fieldName}
            onChange={(e) => onUpdate({ ...content, fieldName: e.target.value })}
            placeholder="checkbox_field"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkbox-label">Label</Label>
          <Input
            id="checkbox-label"
            value={label}
            onChange={(e) => onUpdate({ ...content, label: e.target.value })}
            placeholder="Select Options"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkbox-options">Options (one per line)</Label>
          <Textarea
            id="checkbox-options"
            value={options}
            onChange={(e) => onUpdate({ ...content, options: e.target.value })}
            placeholder="Option 1&#10;Option 2&#10;Option 3"
            rows={5}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="checkbox-required"
            checked={required}
            onCheckedChange={(checked) => onUpdate({ ...content, required: !!checked })}
          />
          <Label htmlFor="checkbox-required" className="cursor-pointer">
            Required Field
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};
