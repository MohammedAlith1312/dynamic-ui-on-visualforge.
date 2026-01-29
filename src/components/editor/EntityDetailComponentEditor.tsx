import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

import { getEntities, getFields } from "@/lib/schema-service";

interface Entity {
  id: string;
  display_name: string;
  is_published: boolean;
}

import { EntityRecord, EntityField } from "@/types/entity";

interface EntityDetailComponentEditorProps {
  component: any;
  onUpdate: (content: any) => void;
}

export const EntityDetailComponentEditor = ({ component, onUpdate }: EntityDetailComponentEditorProps) => {
  const content = component.content || {};
  const [entities, setEntities] = useState<Entity[]>([]);
  const [fields, setFields] = useState<EntityField[]>([]);
  const [records, setRecords] = useState<EntityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntities();
  }, []);

  useEffect(() => {
    if (content.entityId) {
      loadFields(content.entityId);
      loadRecords(content.entityId);
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

  const loadRecords = async (entityId: string) => {
    const { data, error } = await supabase
      .from("entity_records")
      .select("id, data, is_published, created_at")
      .eq("entity_id", entityId)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      toast.error("Failed to load records");
      console.error(error);
    } else {
      setRecords(data || []);
    }
  };

  const handleEntityChange = (entityId: string) => {
    onUpdate({
      ...content,
      entityId,
      recordId: "",
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

  const getRecordLabel = (record: EntityRecord) => {
    const data = record.data;
    const firstField = fields[0];
    if (firstField && data[firstField.name]) {
      return String(data[firstField.name]).substring(0, 50);
    }
    return record.id.substring(0, 8);
  };

  const defaultContent = {
    entityId: "",
    recordId: "",
    fields: [],
    layout: "vertical",
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

      {currentContent.entityId && records.length > 0 && (
        <div className="space-y-2">
          <Label>Record</Label>
          <Select
            value={currentContent.recordId}
            onValueChange={(value) => onUpdate({ ...currentContent, recordId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a record" />
            </SelectTrigger>
            <SelectContent>
              {records.map((record) => (
                <SelectItem key={record.id} value={record.id}>
                  {getRecordLabel(record)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
        <Label>Layout</Label>
        <Select
          value={currentContent.layout}
          onValueChange={(value) => onUpdate({ ...currentContent, layout: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vertical">Vertical</SelectItem>
            <SelectItem value="horizontal">Horizontal</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
