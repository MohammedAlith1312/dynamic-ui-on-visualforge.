import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface FormSelectComponentEditorProps {
  content: {
    fieldName?: string;
    label?: string;
    placeholder?: string;
    options?: string;
    required?: boolean;
  };
  onUpdate: (content: any) => void;
}

export const FormSelectComponentEditor = ({ content, onUpdate }: FormSelectComponentEditorProps) => {
  const fieldName = content.fieldName || "select_field";
  const label = content.label || "Select Option";
  const placeholder = content.placeholder || "Choose an option...";
  const options = content.options || "Option 1\nOption 2\nOption 3";
  const required = content.required || false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Form Select Field</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="select-field-name">Field Name</Label>
          <Input
            id="select-field-name"
            value={fieldName}
            onChange={(e) => onUpdate({ ...content, fieldName: e.target.value })}
            placeholder="select_field"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="select-label">Label</Label>
          <Input
            id="select-label"
            value={label}
            onChange={(e) => onUpdate({ ...content, label: e.target.value })}
            placeholder="Select Option"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="select-placeholder">Placeholder</Label>
          <Input
            id="select-placeholder"
            value={placeholder}
            onChange={(e) => onUpdate({ ...content, placeholder: e.target.value })}
            placeholder="Choose an option..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="select-options">Options (one per line)</Label>
          <Textarea
            id="select-options"
            value={options}
            onChange={(e) => onUpdate({ ...content, options: e.target.value })}
            placeholder="Option 1&#10;Option 2&#10;Option 3"
            rows={5}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-required"
            checked={required}
            onCheckedChange={(checked) => onUpdate({ ...content, required: !!checked })}
          />
          <Label htmlFor="select-required" className="cursor-pointer">
            Required Field
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};
