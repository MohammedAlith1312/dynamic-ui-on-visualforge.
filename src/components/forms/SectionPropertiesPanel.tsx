import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ConditionalLogicEditor } from "./ConditionalLogicEditor";

interface SectionPropertiesPanelProps {
  section: any;
  onUpdate: (updates: any) => void;
  availableFields: Array<{ id: string; label: string; field_type: string }>;
}

export function SectionPropertiesPanel({ section, onUpdate, availableFields }: SectionPropertiesPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Section Properties</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="section-name">Section Name</Label>
          <Input
            id="section-name"
            value={section.name || ""}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="section_name"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Internal identifier (lowercase, no spaces)
          </p>
        </div>

        <div>
          <Label htmlFor="section-title">Section Title</Label>
          <Input
            id="section-title"
            value={section.title || ""}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Section Title"
          />
        </div>

        <div>
          <Label htmlFor="section-description">Description</Label>
          <Textarea
            id="section-description"
            value={section.description || ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Optional description"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="section-type">Section Type</Label>
          <Select
            value={section.section_type}
            onValueChange={(value) => onUpdate({ section_type: value })}
          >
            <SelectTrigger id="section-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="section">Standard Section</SelectItem>
              <SelectItem value="tab">Tab (Multi-step)</SelectItem>
              <SelectItem value="column">Column Layout</SelectItem>
              <SelectItem value="repeatable">Repeatable Section</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {section.section_type === "tab" && "Use for multi-step forms"}
            {section.section_type === "column" && "Fields displayed in columns"}
            {section.section_type === "repeatable" && "Users can add multiple instances"}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Visible</Label>
            <p className="text-xs text-muted-foreground">
              Show this section by default
            </p>
          </div>
          <Switch
            checked={section.is_visible ?? true}
            onCheckedChange={(checked) => onUpdate({ is_visible: checked })}
          />
        </div>

        <div className="pt-4 border-t">
          <ConditionalLogicEditor
            value={section.conditional_logic || {}}
            onChange={(logic) => onUpdate({ conditional_logic: logic })}
            availableFields={availableFields}
          />
        </div>
      </div>
    </div>
  );
}
