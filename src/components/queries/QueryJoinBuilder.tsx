import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QueryJoinBuilderProps {
  queryId: string;
}

interface Entity {
  id: string;
  display_name: string;
}

interface Join {
  id: string;
  target_entity_id: string;
  join_type: string;
  primary_field: string;
  target_field: string;
}

export default function QueryJoinBuilder({ queryId }: QueryJoinBuilderProps) {
  const { toast } = useToast();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [joins, setJoins] = useState<Join[]>([]);
  const [newJoin, setNewJoin] = useState({
    target_entity_id: '',
    join_type: 'inner',
    primary_field: '',
    target_field: '',
  });

  useEffect(() => {
    fetchEntities();
    fetchJoins();
  }, [queryId]);

  const fetchEntities = async () => {
    const { data } = await (supabase as any).from('entities').select('id, display_name').order('display_name');
    setEntities(data || []);
  };

  const fetchJoins = async () => {
    const { data } = await (supabase as any)
      .from('query_joins')
      .select('*')
      .eq('query_id', queryId)
      .order('position');

    setJoins(data || []);
  };

  const addJoin = async () => {
    if (!newJoin.target_entity_id || !newJoin.primary_field || !newJoin.target_field) {
      toast({
        title: "Missing fields",
        description: "Please fill in all join fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('query_joins')
        .insert({
          query_id: queryId,
          ...newJoin,
          position: joins.length,
        });

      if (error) throw error;

      setNewJoin({
        target_entity_id: '',
        join_type: 'inner',
        primary_field: '',
        target_field: '',
      });
      fetchJoins();

      toast({
        title: "Join added",
        description: "The join has been added to the query.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding join",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeJoin = async (joinId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('query_joins')
        .delete()
        .eq('id', joinId);

      if (error) throw error;
      fetchJoins();

      toast({
        title: "Join removed",
        description: "The join has been removed from the query.",
      });
    } catch (error: any) {
      toast({
        title: "Error removing join",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <h3 className="text-lg font-semibold">Query Joins</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Target Entity</Label>
          <Select
            value={newJoin.target_entity_id}
            onValueChange={(value) => setNewJoin({ ...newJoin, target_entity_id: value })}
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
          <Label>Join Type</Label>
          <Select
            value={newJoin.join_type}
            onValueChange={(value) => setNewJoin({ ...newJoin, join_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inner">INNER</SelectItem>
              <SelectItem value="left">LEFT</SelectItem>
              <SelectItem value="right">RIGHT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Primary Field</Label>
          <Input
            placeholder="field_name"
            value={newJoin.primary_field}
            onChange={(e) => setNewJoin({ ...newJoin, primary_field: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Target Field</Label>
          <Input
            placeholder="field_name"
            value={newJoin.target_field}
            onChange={(e) => setNewJoin({ ...newJoin, target_field: e.target.value })}
          />
        </div>
      </div>

      <Button onClick={addJoin} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Add Join
      </Button>

      <div className="space-y-2 mt-4">
        {joins.map((join) => {
          const entity = entities.find(e => e.id === join.target_entity_id);
          return (
            <div key={join.id} className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">
                {join.join_type.toUpperCase()} JOIN {entity?.display_name} ON {join.primary_field} = {join.target_field}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeJoin(join.id)}
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
