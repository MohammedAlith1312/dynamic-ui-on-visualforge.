import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface ConditionalRule {
  field_id: string;
  operator: string;
  value: string;
}

interface ConditionalLogic {
  show_if?: ConditionalRule[];
  logic_type?: "AND" | "OR";
}

interface ConditionalLogicEditorProps {
  value: ConditionalLogic;
  onChange: (value: ConditionalLogic) => void;
  availableFields: Array<{ id: string; label: string; field_type: string }>;
}

const OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Less Than" },
  { value: "is_empty", label: "Is Empty" },
  { value: "is_not_empty", label: "Is Not Empty" },
];

export function ConditionalLogicEditor({ value, onChange, availableFields }: ConditionalLogicEditorProps) {
  const rules = value.show_if || [];
  const logicType = value.logic_type || "AND";

  const addRule = () => {
    onChange({
      ...value,
      show_if: [
        ...rules,
        { field_id: "", operator: "equals", value: "" }
      ]
    });
  };

  const removeRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index);
    onChange({
      ...value,
      show_if: newRules
    });
  };

  const updateRule = (index: number, field: keyof ConditionalRule, newValue: string) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: newValue };
    onChange({
      ...value,
      show_if: newRules
    });
  };

  const updateLogicType = (newType: "AND" | "OR") => {
    onChange({
      ...value,
      logic_type: newType
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Conditional Logic</Label>
        <Button onClick={addRule} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Add Rule
        </Button>
      </div>

      {rules.length > 0 && (
        <>
          <div className="space-y-3">
            {rules.map((rule, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rule {index + 1}</span>
                  <Button
                    onClick={() => removeRule(index)}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">Field</Label>
                    <Select
                      value={rule.field_id}
                      onValueChange={(val) => updateRule(index, "field_id", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFields.map((field) => (
                          <SelectItem key={field.id} value={field.id}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Operator</Label>
                    <Select
                      value={rule.operator}
                      onValueChange={(val) => updateRule(index, "operator", val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {!["is_empty", "is_not_empty"].includes(rule.operator) && (
                    <div>
                      <Label className="text-xs">Value</Label>
                      <Input
                        value={rule.value}
                        onChange={(e) => updateRule(index, "value", e.target.value)}
                        placeholder="Enter value"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {rules.length > 1 && (
            <div>
              <Label className="text-xs">Logic Type</Label>
              <Select value={logicType} onValueChange={updateLogicType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">All conditions must match (AND)</SelectItem>
                  <SelectItem value="OR">Any condition can match (OR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      {rules.length === 0 && (
        <div className="text-center py-6 text-sm text-muted-foreground border rounded-lg border-dashed">
          No conditional logic rules. Click "Add Rule" to get started.
        </div>
      )}
    </div>
  );
}
