import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface FormTextareaComponentEditorProps {
  content: {
    fieldName?: string;
    label?: string;
    placeholder?: string;
    rows?: number;
    required?: boolean;
    maxLength?: number;
  };
  onUpdate: (content: any) => void;
}

export const FormTextareaComponentEditor = ({ content, onUpdate }: FormTextareaComponentEditorProps) => {
  const fieldName = content.fieldName || "message";
  const label = content.label || "Message";
  const placeholder = content.placeholder || "Enter your message...";
  const rows = content.rows || 4;
  const required = content.required || false;
  const maxLength = content.maxLength || 500;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Form Textarea Field</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="textarea-field-name">Field Name</Label>
          <Input
            id="textarea-field-name"
            value={fieldName}
            onChange={(e) => onUpdate({ ...content, fieldName: e.target.value })}
            placeholder="message"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="textarea-label">Label</Label>
          <Input
            id="textarea-label"
            value={label}
            onChange={(e) => onUpdate({ ...content, label: e.target.value })}
            placeholder="Message"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="textarea-placeholder">Placeholder</Label>
          <Input
            id="textarea-placeholder"
            value={placeholder}
            onChange={(e) => onUpdate({ ...content, placeholder: e.target.value })}
            placeholder="Enter your message..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="textarea-rows">Rows</Label>
          <Input
            id="textarea-rows"
            type="number"
            min="2"
            max="20"
            value={rows}
            onChange={(e) => onUpdate({ ...content, rows: parseInt(e.target.value) || 4 })}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="textarea-required"
            checked={required}
            onCheckedChange={(checked) => onUpdate({ ...content, required: !!checked })}
          />
          <Label htmlFor="textarea-required" className="cursor-pointer">
            Required Field
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="textarea-maxlength">Max Length</Label>
          <Input
            id="textarea-maxlength"
            type="number"
            min="50"
            max="10000"
            value={maxLength}
            onChange={(e) => onUpdate({ ...content, maxLength: parseInt(e.target.value) || 500 })}
          />
        </div>
      </CardContent>
    </Card>
  );
};
