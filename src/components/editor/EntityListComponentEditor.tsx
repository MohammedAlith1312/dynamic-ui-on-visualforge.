import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

import { getEntities, getFields } from "@/lib/schema-service";

interface Entity {
  id: string;
  display_name: string;
  is_published: boolean;
}

interface EntityField {
  id: string;
  name: string;
  display_name: string;
}

interface EntityListComponentEditorProps {
  component: any;
  onUpdate: (content: any) => void;
}

export const EntityListComponentEditor = ({ component, onUpdate }: EntityListComponentEditorProps) => {
  const content = component.content || {};
  const [entities, setEntities] = useState<Entity[]>([]);
  const [fields, setFields] = useState<EntityField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntities();
  }, []);

  useEffect(() => {
    if (content.entityId) {
      loadFields(content.entityId);
    }
  }, [content.entityId]);

  const loadEntities = async () => {
    // Load published entities from schema service
    const data = await getEntities();
    setEntities((data as any[]).filter(e => e.is_published));
    setLoading(false);
  };

  const loadFields = async (entityId: string) => {
    // Load fields from schema service
    const data = await getFields(entityId);
    setFields(data as any[]);
  };

  const handleEntityChange = (entityId: string) => {
    onUpdate({
      ...content,
      entityId,
      fields: [],
    });
  };

  const handleFieldToggle = (fieldName: string, checked: boolean) => {
    const selectedFields = content.fields || [];
    const newFields = checked
      ? [...selectedFields, fieldName]
      : selectedFields.filter((f: string) => f !== fieldName);
    
    onUpdate({ ...content, fields: newFields });
  };

  const defaultContent = {
    entityId: "",
    fields: [],
    displayStyle: "grid",
    limit: 10,
    sortBy: "",
    sortOrder: "desc",
    showPublishedOnly: true,
  };

  const currentContent = { ...defaultContent, ...content };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Entity</Label>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading entities...</div>
        ) : entities.length === 0 ? (
          <div className="text-sm text-muted-foreground">No published entities available</div>
        ) : (
          <Select value={currentContent.entityId} onValueChange={handleEntityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select an entity" />
            </SelectTrigger>
            <SelectContent>
              {entities.map((entity) => (
                <SelectItem key={entity.id} value={entity.id}>
                  {entity.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {currentContent.entityId && fields.length > 0 && (
        <div className="space-y-2">
          <Label>Fields to Display</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
            {fields.map((field) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Checkbox
                  id={field.name}
                  checked={(currentContent.fields || []).includes(field.name)}
                  onCheckedChange={(checked) => handleFieldToggle(field.name, checked as boolean)}
                />
                <label htmlFor={field.name} className="text-sm cursor-pointer">
                  {field.display_name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Display Style</Label>
        <Select
          value={currentContent.displayStyle}
          onValueChange={(value) => onUpdate({ ...currentContent, displayStyle: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="list">List</SelectItem>
            <SelectItem value="table">Table</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Maximum Items</Label>
        <Input
          type="number"
          min="1"
          max="100"
          value={currentContent.limit}
          onChange={(e) => onUpdate({ ...currentContent, limit: parseInt(e.target.value) || 10 })}
        />
      </div>

      {currentContent.entityId && fields.length > 0 && (
        <>
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select
              value={currentContent.sortBy}
              onValueChange={(value) => onUpdate({ ...currentContent, sortBy: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Created date (default)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Created date (default)</SelectItem>
                {fields.map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    {field.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sort Order</Label>
            <Select
              value={currentContent.sortOrder}
              onValueChange={(value) => onUpdate({ ...currentContent, sortOrder: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
};
