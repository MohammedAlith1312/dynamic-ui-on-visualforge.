import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QueryConditionBuilderProps {
  queryId: string;
}

interface Entity {
  id: string;
  display_name: string;
}

interface Condition {
  id: string;
  entity_id: string;
  field_name: string;
  operator: string;
  value: string | null;
  logic: string;
}

export default function QueryConditionBuilder({ queryId }: QueryConditionBuilderProps) {
  const { toast } = useToast();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [newCondition, setNewCondition] = useState({
    entity_id: '',
    field_name: '',
    operator: 'equals',
    value: '',
    logic: 'and',
  });

  useEffect(() => {
    fetchEntities();
    fetchConditions();
  }, [queryId]);

  const fetchEntities = async () => {
    const { data } = await (supabase as any).from('entities').select('id, display_name').order('display_name');
    setEntities(data || []);
  };

  const fetchConditions = async () => {
    const { data } = await (supabase as any)
      .from('query_conditions')
      .select('*')
      .eq('query_id', queryId)
      .order('position');

    setConditions(data || []);
  };

  const addCondition = async () => {
    if (!newCondition.entity_id || !newCondition.field_name) {
      toast({
        title: "Missing fields",
        description: "Please select entity and field name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('query_conditions')
        .insert({
          query_id: queryId,
          ...newCondition,
          position: conditions.length,
        });

      if (error) throw error;

      setNewCondition({
        entity_id: '',
        field_name: '',
        operator: 'equals',
        value: '',
        logic: 'and',
      });
      fetchConditions();

      toast({
        title: "Condition added",
        description: "The condition has been added to the query.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding condition",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeCondition = async (conditionId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('query_conditions')
        .delete()
        .eq('id', conditionId);

      if (error) throw error;
      fetchConditions();

      toast({
        title: "Condition removed",
        description: "The condition has been removed from the query.",
      });
    } catch (error: any) {
      toast({
        title: "Error removing condition",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const needsValue = !['is_empty', 'is_not_empty'].includes(newCondition.operator);

  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <h3 className="text-lg font-semibold">Query Conditions</h3>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label>Entity</Label>
          <Select
            value={newCondition.entity_id}
            onValueChange={(value) => setNewCondition({ ...newCondition, entity_id: value })}
          >
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
          <Input
            placeholder="field_name"
            value={newCondition.field_name}
            onChange={(e) => setNewCondition({ ...newCondition, field_name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Operator</Label>
          <Select
            value={newCondition.operator}
            onValueChange={(value) => setNewCondition({ ...newCondition, operator: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">Equals</SelectItem>
              <SelectItem value="not_equals">Not Equals</SelectItem>
              <SelectItem value="contains">Contains</SelectItem>
              <SelectItem value="gt">Greater Than</SelectItem>
              <SelectItem value="lt">Less Than</SelectItem>
              <SelectItem value="gte">Greater Than or Equal</SelectItem>
              <SelectItem value="lte">Less Than or Equal</SelectItem>
              <SelectItem value="is_empty">Is Empty</SelectItem>
              <SelectItem value="is_not_empty">Is Not Empty</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {needsValue && (
          <div className="space-y-2">
            <Label>Value</Label>
            <Input
              placeholder="value"
              value={newCondition.value}
              onChange={(e) => setNewCondition({ ...newCondition, value: e.target.value })}
            />
          </div>
        )}

        {conditions.length > 0 && (
          <div className="space-y-2">
            <Label>Logic</Label>
            <Select
              value={newCondition.logic}
              onValueChange={(value) => setNewCondition({ ...newCondition, logic: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="and">AND</SelectItem>
                <SelectItem value="or">OR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Button onClick={addCondition} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Add Condition
      </Button>

      <div className="space-y-2 mt-4">
        {conditions.map((condition, idx) => {
          const entity = entities.find(e => e.id === condition.entity_id);
          return (
            <div key={condition.id} className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">
                {idx > 0 && `${condition.logic.toUpperCase()} `}
                {entity?.display_name}.{condition.field_name} {condition.operator} {condition.value || ''}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCondition(condition.id)}
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
