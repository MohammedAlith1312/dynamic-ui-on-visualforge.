import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QueryFieldSelectorProps {
  queryId: string;
  queryType: string;
  primaryEntityId: string;
}

interface Entity {
  id: string;
  display_name: string;
}

interface EntityField {
  id: string;
  name: string;
  display_name: string;
  field_type: string;
}

interface Field {
  id: string;
  entity_id: string;
  field_name: string;
  aggregation: string | null;
}

export default function QueryFieldSelector({ queryId, queryType, primaryEntityId }: QueryFieldSelectorProps) {
  const { toast } = useToast();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [selectedAgg, setSelectedAgg] = useState<string>('');
  const [availableFields, setAvailableFields] = useState<EntityField[]>([]);

  useEffect(() => {
    fetchEntities();
    fetchFields();
  }, [queryId]);

  const fetchEntities = async () => {
    const { data } = await (supabase as any).from('entities').select('id, display_name').order('display_name');
    setEntities(data || []);
  };

  const fetchFields = async () => {
    const { data } = await (supabase as any)
      .from('query_fields')
      .select('*')
      .eq('query_id', queryId)
      .order('position');

    setFields(data || []);
  };

  const loadEntityFields = async (entityId: string) => {
    if (!entityId) {
      setAvailableFields([]);
      return;
    }

    const { data } = await (supabase as any)
      .from('entity_fields')
      .select('id, name, display_name, field_type')
      .eq('entity_id', entityId)
      .order('position');

    setAvailableFields(data || []);
  };

  const handleEntityChange = (entityId: string) => {
    setSelectedEntity(entityId);
    setSelectedField('');
    setAvailableFields([]);
    loadEntityFields(entityId);
  };

  const addField = async () => {
    if (!selectedEntity || !selectedField) return;

    try {
      const { error } = await (supabase as any)
        .from('query_fields')
        .insert({
          query_id: queryId,
          entity_id: selectedEntity,
          field_name: selectedField,
          aggregation: queryType === 'aggregate' ? selectedAgg || null : null,
          position: fields.length,
        });

      if (error) throw error;

      setSelectedEntity('');
      setSelectedField('');
      setSelectedAgg('');
      fetchFields();

      toast({
        title: "Field added",
        description: "The field has been added to the query.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding field",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeField = async (fieldId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('query_fields')
        .delete()
        .eq('id', fieldId);

      if (error) throw error;
      fetchFields();

      toast({
        title: "Field removed",
        description: "The field has been removed from the query.",
      });
    } catch (error: any) {
      toast({
        title: "Error removing field",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <h3 className="text-lg font-semibold">Query Fields</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Entity</Label>
          <Select value={selectedEntity} onValueChange={handleEntityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select entity" />
            </SelectTrigger>
            <SelectContent>
              {entities.map((entity) => (
                <SelectItem key={entity.id} value={entity.id}>
                  {entity.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Field</Label>
          <Select 
            value={selectedField} 
            onValueChange={setSelectedField}
            disabled={!selectedEntity || availableFields.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={selectedEntity ? "Select field" : "Select entity first"} />
            </SelectTrigger>
            <SelectContent>
              {availableFields.map((field) => (
                <SelectItem key={field.id} value={field.name}>
                  {field.display_name} ({field.field_type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {queryType === 'aggregate' && (
          <div className="space-y-2">
            <Label>Aggregation</Label>
            <Select value={selectedAgg} onValueChange={setSelectedAgg}>
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                <SelectItem value="count">COUNT</SelectItem>
                <SelectItem value="sum">SUM</SelectItem>
                <SelectItem value="avg">AVG</SelectItem>
                <SelectItem value="min">MIN</SelectItem>
                <SelectItem value="max">MAX</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Button onClick={addField} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Add Field
      </Button>

      <div className="space-y-2 mt-4">
        {fields.map((field) => {
          const entity = entities.find(e => e.id === field.entity_id);
          return (
            <div key={field.id} className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">
                {entity?.display_name}: {field.field_name}
                {field.aggregation && ` (${field.aggregation.toUpperCase()})`}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeField(field.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
