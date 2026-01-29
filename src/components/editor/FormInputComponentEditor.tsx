import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface FormInputComponentEditorProps {
  content: {
    fieldName?: string;
    label?: string;
    placeholder?: string;
    inputType?: string;
    required?: boolean;
    validation?: string;
  };
  onUpdate: (content: any) => void;
}

export const FormInputComponentEditor = ({ content, onUpdate }: FormInputComponentEditorProps) => {
  const fieldName = content.fieldName || "field_name";
  const label = content.label || "Field Label";
  const placeholder = content.placeholder || "Enter value...";
  const inputType = content.inputType || "text";
  const required = content.required || false;
  const validation = content.validation || "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Form Input Field</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="input-field-name">Field Name</Label>
          <Input
            id="input-field-name"
            value={fieldName}
            onChange={(e) => onUpdate({ ...content, fieldName: e.target.value })}
            placeholder="field_name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="input-label">Label</Label>
          <Input
            id="input-label"
            value={label}
            onChange={(e) => onUpdate({ ...content, label: e.target.value })}
            placeholder="Field Label"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="input-placeholder">Placeholder</Label>
          <Input
            id="input-placeholder"
            value={placeholder}
            onChange={(e) => onUpdate({ ...content, placeholder: e.target.value })}
            placeholder="Enter value..."
          />
        </div>

        <div className="space-y-2">
          <Label>Input Type</Label>
          <Select value={inputType} onValueChange={(val) => onUpdate({ ...content, inputType: val })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="password">Password</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="tel">Phone</SelectItem>
              <SelectItem value="url">URL</SelectItem>
              <SelectItem value="date">Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="input-required"
            checked={required}
            onCheckedChange={(checked) => onUpdate({ ...content, required: !!checked })}
          />
          <Label htmlFor="input-required" className="cursor-pointer">
            Required Field
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="input-validation">Validation Pattern (regex)</Label>
          <Input
            id="input-validation"
            value={validation}
            onChange={(e) => onUpdate({ ...content, validation: e.target.value })}
            placeholder="e.g., ^\d{3}-\d{3}-\d{4}$"
          />
        </div>
      </CardContent>
    </Card>
  );
};
