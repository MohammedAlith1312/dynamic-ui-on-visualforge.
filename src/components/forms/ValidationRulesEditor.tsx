import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ValidationRulesEditorProps {
  fieldType: string;
  rules: any;
  onChange: (rules: any) => void;
}

export function ValidationRulesEditor({ fieldType, rules, onChange }: ValidationRulesEditorProps) {
  const showTextValidation = ["text", "email", "tel", "url", "textarea", "password"].includes(fieldType);
  const showNumberValidation = ["number", "range"].includes(fieldType);
  const showFileValidation = ["file", "image"].includes(fieldType);

  return (
    <div className="space-y-4">
      <Label className="text-base">Validation Rules</Label>

      {showTextValidation && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="min-length" className="text-xs">Min Length</Label>
              <Input
                id="min-length"
                type="number"
                value={rules.min_length || ""}
                onChange={(e) => onChange({ ...rules, min_length: parseInt(e.target.value) || undefined })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="max-length" className="text-xs">Max Length</Label>
              <Input
                id="max-length"
                type="number"
                value={rules.max_length || ""}
                onChange={(e) => onChange({ ...rules, max_length: parseInt(e.target.value) || undefined })}
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="pattern" className="text-xs">Pattern (Regex)</Label>
            <Input
              id="pattern"
              value={rules.pattern || ""}
              onChange={(e) => onChange({ ...rules, pattern: e.target.value })}
              placeholder="^[A-Za-z]+$"
            />
          </div>
        </>
      )}

      {showNumberValidation && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="min-value" className="text-xs">Min Value</Label>
            <Input
              id="min-value"
              type="number"
              value={rules.min || ""}
              onChange={(e) => onChange({ ...rules, min: parseFloat(e.target.value) || undefined })}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="max-value" className="text-xs">Max Value</Label>
            <Input
              id="max-value"
              type="number"
              value={rules.max || ""}
              onChange={(e) => onChange({ ...rules, max: parseFloat(e.target.value) || undefined })}
              placeholder="100"
            />
          </div>
        </div>
      )}

      {showFileValidation && (
        <>
          <div>
            <Label htmlFor="file-types" className="text-xs">Allowed File Types</Label>
            <Input
              id="file-types"
              value={rules.file_types?.join(", ") || ""}
              onChange={(e) => onChange({ ...rules, file_types: e.target.value.split(",").map(t => t.trim()) })}
              placeholder="image/png, image/jpeg, application/pdf"
            />
          </div>

          <div>
            <Label htmlFor="max-size" className="text-xs">Max File Size (MB)</Label>
            <Input
              id="max-size"
              type="number"
              value={rules.max_file_size ? rules.max_file_size / (1024 * 1024) : ""}
              onChange={(e) => onChange({ ...rules, max_file_size: parseFloat(e.target.value) * 1024 * 1024 || undefined })}
              placeholder="5"
            />
          </div>
        </>
      )}

      <div>
        <Label htmlFor="custom-message" className="text-xs">Custom Error Message</Label>
        <Textarea
          id="custom-message"
          value={rules.custom_message || ""}
          onChange={(e) => onChange({ ...rules, custom_message: e.target.value })}
          placeholder="Please enter a valid value"
          rows={2}
        />
      </div>
    </div>
  );
}
