import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, FolderPlus, ChevronRight, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QueryJoinTreeProps {
  queryId: string;
}

interface Entity {
  id: string;
  display_name: string;
}

interface EntityField {
  id: string;
  name: string;
  display_name: string;
  entity_id: string;
}

interface JoinCondition {
  id: string;
  join_id: string;
  primary_field: string;
  target_field: string;
  logic: string;
  position: number;
}

interface JoinNode {
  id: string;
  query_id: string;
  parent_join_id: string | null;
  is_group: boolean;
  position: number;
  target_entity_id: string | null;
  join_type: string | null;
  primary_field: string | null;
  target_field: string | null;
}

const JOIN_TYPES = [
  { value: 'inner', label: 'Inner Join' },
  { value: 'left', label: 'Left Join' },
  { value: 'right', label: 'Right Join' },
];

function QueryJoinTree({ queryId }: QueryJoinTreeProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [rootJoins, setRootJoins] = useState<JoinNode[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchEntities();
    fetchRootJoins();
  }, [queryId]);

  const fetchEntities = async () => {
    const { data } = await (supabase as any)
      .from('entities')
      .select('id, display_name')
      .order('display_name');
    setEntities(data || []);
  };

  const fetchRootJoins = async () => {
    const { data } = await (supabase as any)
      .from('query_joins')
      .select('*')
      .eq('query_id', queryId)
      .is('parent_join_id', null)
      .order('position');
    setRootJoins(data || []);
  };

  const addJoin = async (parentId: string | null = null) => {
    console.log('addJoin called', { parentId, entitiesLength: entities.length });
    if (!entities.length) {
      toast({
        title: "No entities available",
        description: "Please create at least one entity first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const position = rootJoins.length;
      const insertData = {
        query_id: queryId,
        parent_join_id: parentId,
        is_group: false,
        target_entity_id: entities[0].id,
          join_type: 'inner',
        primary_field: '',
        target_field: '',
        position,
      };
      console.log('Inserting join:', insertData);
      
      const { data, error } = await (supabase as any)
        .from('query_joins')
        .insert(insertData);

      console.log('Insert result:', { data, error });

      if (error) throw error;

      fetchRootJoins();
      toast({ title: "Join added" });
    } catch (error: any) {
      console.error('Error adding join:', error);
      toast({
        title: "Error adding join",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addJoinGroup = async (parentId: string | null = null) => {
    console.log('addJoinGroup called', { parentId });
    try {
      const position = rootJoins.length;
      const insertData = {
        query_id: queryId,
        parent_join_id: parentId,
        is_group: true,
        position,
      };
      console.log('Inserting join group:', insertData);
      
      const { data, error } = await (supabase as any)
        .from('query_joins')
        .insert(insertData);

      console.log('Insert group result:', { data, error });

      if (error) throw error;

      fetchRootJoins();
      toast({ title: "Join group added" });
    } catch (error: any) {
      console.error('Error adding join group:', error);
      toast({
        title: "Error adding join group",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Joins</h3>
        <div className="flex gap-1.5">
          <Button onClick={() => addJoin()} size="sm" variant="outline" className="h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Join
          </Button>
          <Button onClick={() => addJoinGroup()} size="sm" variant="outline" className="h-7 text-xs">
            <FolderPlus className="h-3 w-3 mr-1" />
            Group
          </Button>
        </div>
      </div>

      {rootJoins.length === 0 ? (
        <div className="bg-muted/30 p-4 rounded-md text-center">
          <p className="text-xs text-muted-foreground">
            No joins configured. Click "Join" to add one.
          </p>
        </div>
      ) : (
        <div className="space-y-1 border-l-2 border-border/50 pl-2">
          {rootJoins.map((join) => (
            <JoinTreeNode
              key={join.id}
              node={join}
              level={0}
              entities={entities}
              onRefresh={fetchRootJoins}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface JoinTreeNodeProps {
  node: JoinNode;
  level: number;
  entities: Entity[];
  onRefresh: () => void;
}

function JoinTreeNode({ node, level, entities, onRefresh }: JoinTreeNodeProps) {
  const [children, setChildren] = useState<JoinNode[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [primaryEntityFields, setPrimaryEntityFields] = useState<EntityField[]>([]);
  const [targetEntityFields, setTargetEntityFields] = useState<EntityField[]>([]);
  const [joinConditions, setJoinConditions] = useState<JoinCondition[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (node.is_group) {
      fetchChildren();
    } else if (node.target_entity_id) {
      fetchEntityFields(node.target_entity_id);
      fetchJoinConditions();
    }
  }, [node.id, node.is_group, node.target_entity_id]);

  const fetchChildren = async () => {
    const { data } = await (supabase as any)
      .from('query_joins')
      .select('*')
      .eq('parent_join_id', node.id)
      .order('position');
    setChildren(data || []);
  };

  const fetchEntityFields = async (entityId: string) => {
    const { data } = await (supabase as any)
      .from('entity_fields')
      .select('id, name, display_name, entity_id')
      .eq('entity_id', entityId)
      .order('display_name');
    setTargetEntityFields(data || []);
  };

  const fetchJoinConditions = async () => {
    const { data } = await (supabase as any)
      .from('query_join_conditions')
      .select('*')
      .eq('join_id', node.id)
      .order('position');
    setJoinConditions(data || []);
  };

  const updateNode = async (updates: Partial<JoinNode>) => {
    try {
      const { error } = await (supabase as any)
        .from('query_joins')
        .update(updates)
        .eq('id', node.id);

      if (error) throw error;

      // If target entity changed, fetch new fields
      if (updates.target_entity_id) {
        fetchEntityFields(updates.target_entity_id);
      }

      onRefresh();
      if (node.is_group) fetchChildren();
    } catch (error: any) {
      toast({
        title: "Error updating join",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteNode = async () => {
    try {
      const { error } = await (supabase as any)
        .from('query_joins')
        .delete()
        .eq('id', node.id);

      if (error) throw error;

      onRefresh();
      toast({ title: "Join deleted" });
    } catch (error: any) {
      toast({
        title: "Error deleting join",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addChildJoin = async () => {
    if (!entities.length) {
      toast({
        title: "No entities available",
        description: "Please create at least one entity first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const position = children.length;
      const { error } = await (supabase as any)
        .from('query_joins')
        .insert({
          query_id: node.query_id,
          parent_join_id: node.id,
          is_group: false,
          target_entity_id: entities[0].id,
          join_type: 'inner',
          primary_field: '',
          target_field: '',
          position,
        });

      if (error) throw error;

      fetchChildren();
      toast({ title: "Join added" });
    } catch (error: any) {
      toast({
        title: "Error adding join",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addChildGroup = async () => {
    try {
      const position = children.length;
      const { error } = await (supabase as any)
        .from('query_joins')
        .insert({
          query_id: node.query_id,
          parent_join_id: node.id,
          is_group: true,
          position,
        });

      if (error) throw error;

      fetchChildren();
      toast({ title: "Join group added" });
    } catch (error: any) {
      toast({
        title: "Error adding join group",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addJoinCondition = async () => {
    if (!targetEntityFields.length) {
      toast({
        title: "No fields available",
        description: "Select an entity first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const position = joinConditions.length;
      const { error } = await (supabase as any)
        .from('query_join_conditions')
        .insert({
          join_id: node.id,
          primary_field: targetEntityFields[0].name,
          target_field: targetEntityFields[0].name,
          logic: 'and',
          position,
        });

      if (error) throw error;

      fetchJoinConditions();
      toast({ title: "Join condition added" });
    } catch (error: any) {
      toast({
        title: "Error adding join condition",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateJoinCondition = async (conditionId: string, updates: Partial<JoinCondition>) => {
    try {
      const { error } = await (supabase as any)
        .from('query_join_conditions')
        .update(updates)
        .eq('id', conditionId);

      if (error) throw error;

      fetchJoinConditions();
    } catch (error: any) {
      toast({
        title: "Error updating join condition",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteJoinCondition = async (conditionId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('query_join_conditions')
        .delete()
        .eq('id', conditionId);

      if (error) throw error;

      fetchJoinConditions();
      toast({ title: "Join condition deleted" });
    } catch (error: any) {
      toast({
        title: "Error deleting join condition",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (node.is_group) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
          
          <FolderPlus className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">Join Group</span>

          <div className="flex-1" />

          <Button onClick={addChildJoin} size="sm" variant="ghost" className="h-6 text-xs px-1.5">
            <Plus className="h-3 w-3 mr-1" />
            Join
          </Button>
          <Button onClick={addChildGroup} size="sm" variant="ghost" className="h-6 text-xs px-1.5">
            <FolderPlus className="h-3 w-3 mr-1" />
            Group
          </Button>
          <Button variant="ghost" size="sm" onClick={deleteNode} className="h-6 w-6 p-0">
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>

        {isExpanded && (
          <div className="ml-3 border-l-2 border-border/50 pl-2 space-y-1">
            {children.length === 0 ? (
              <div className="bg-muted/20 p-2 rounded text-center">
                <p className="text-xs text-muted-foreground">Empty group</p>
              </div>
            ) : (
              children.map((child) => (
                <JoinTreeNode
                  key={child.id}
                  node={child}
                  level={level + 1}
                  entities={entities}
                  onRefresh={fetchChildren}
                />
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  // Leaf join
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 p-2 rounded-md bg-card border hover:border-primary/30 transition-colors group">
        <Select
          value={node.join_type || 'inner'}
          onValueChange={(value) => updateNode({ join_type: value })}
        >
          <SelectTrigger className="h-7 w-[90px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {JOIN_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value} className="text-xs">
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={node.target_entity_id || ''}
          onValueChange={(value) => updateNode({ target_entity_id: value })}
        >
          <SelectTrigger className="h-7 w-[130px] text-xs">
            <SelectValue placeholder="Entity" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {entities.map((entity) => (
              <SelectItem key={entity.id} value={entity.id} className="text-xs">
                {entity.display_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground">ON</span>

        {joinConditions.length > 0 && (
          <span className="text-xs text-muted-foreground">
            ({joinConditions.length} condition{joinConditions.length !== 1 ? 's' : ''})
          </span>
        )}

        <div className="flex-1" />

        <Button 
          onClick={addJoinCondition}
          size="sm" 
          variant="ghost" 
          className="h-6 text-xs px-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Condition
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={deleteNode} 
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>

      {/* Join Conditions */}
      {joinConditions.length > 0 && (
        <div className="ml-3 border-l-2 border-border/30 pl-2 space-y-1">
          {joinConditions.map((condition, index) => (
            <div key={condition.id} className="flex items-center gap-1.5 p-1.5 rounded-md bg-muted/20 hover:bg-muted/40 transition-colors group/condition">
              {index === 0 ? (
                <div className="h-6 w-14 flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground font-medium">AND</span>
                </div>
              ) : (
                <Select
                  value={condition.logic}
                  onValueChange={(value) => updateJoinCondition(condition.id, { logic: value })}
                >
                  <SelectTrigger className="h-6 w-14 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="and" className="text-xs">AND</SelectItem>
                    <SelectItem value="or" className="text-xs">OR</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Select
                value={condition.primary_field}
                onValueChange={(value) => updateJoinCondition(condition.id, { primary_field: value })}
              >
                <SelectTrigger className="h-6 w-[110px] text-xs">
                  <SelectValue placeholder="Primary field" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {targetEntityFields.map((field) => (
                    <SelectItem key={field.id} value={field.name} className="text-xs">
                      {field.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-xs text-muted-foreground">=</span>

              <Select
                value={condition.target_field}
                onValueChange={(value) => updateJoinCondition(condition.id, { target_field: value })}
              >
                <SelectTrigger className="h-6 w-[110px] text-xs">
                  <SelectValue placeholder="Target field" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {targetEntityFields.map((field) => (
                    <SelectItem key={field.id} value={field.name} className="text-xs">
                      {field.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => deleteJoinCondition(condition.id)} 
                className="h-5 w-5 p-0 opacity-0 group-hover/condition:opacity-100 transition-opacity"
              >
                <Trash2 className="h-2.5 w-2.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QueryJoinTree;
