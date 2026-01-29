import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface OptionsEditorProps {
  options: Option[];
  onChange: (options: Option[]) => void;
}

export function OptionsEditor({ options, onChange }: OptionsEditorProps) {
  const [newOption, setNewOption] = useState({ value: "", label: "" });

  const handleAddOption = () => {
    if (!newOption.value || !newOption.label) return;

    onChange([...options, newOption]);
    setNewOption({ value: "", label: "" });
  };

  const handleRemoveOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const handleUpdateOption = (index: number, field: "value" | "label", value: string) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <Label className="text-base">Options</Label>

      {options.length > 0 && (
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
              <Input
                value={option.value}
                onChange={(e) => handleUpdateOption(index, "value", e.target.value)}
                placeholder="value"
                className="flex-1"
              />
              <Input
                value={option.label}
                onChange={(e) => handleUpdateOption(index, "label", e.target.value)}
                placeholder="Label"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveOption(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="border rounded-lg p-3 space-y-3">
        <Label className="text-sm">Add New Option</Label>
        <div className="space-y-2">
          <Input
            value={newOption.value}
            onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
            placeholder="Option value"
          />
          <Input
            value={newOption.label}
            onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
            placeholder="Option label"
          />
          <Button onClick={handleAddOption} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Option
          </Button>
        </div>
      </div>
    </div>
  );
}
