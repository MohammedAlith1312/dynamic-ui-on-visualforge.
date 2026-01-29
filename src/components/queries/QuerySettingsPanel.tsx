import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface QuerySettingsPanelProps {
  queryId: string;
  queryType: string;
}

interface Entity {
  id: string;
  display_name: string;
}

interface Settings {
  primary_entity_id: string;
  group_by: string[];
  sort_entity_id: string | null;
  sort_field: string | null;
  sort_order: string | null;
  limit_rows: number;
  display_style: string;
  show_row_numbers: boolean;
}

export default function QuerySettingsPanel({ queryId, queryType }: QuerySettingsPanelProps) {
  const { toast } = useToast();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [settings, setSettings] = useState<Settings>({
    primary_entity_id: '',
    group_by: [],
    sort_entity_id: null,
    sort_field: null,
    sort_order: 'asc',
    limit_rows: 50,
    display_style: 'table',
    show_row_numbers: false,
  });

  useEffect(() => {
    fetchEntities();
    fetchSettings();
  }, [queryId]);

  const fetchEntities = async () => {
    const { data } = await (supabase as any).from('entities').select('id, display_name').order('display_name');
    setEntities(data || []);
  };

  const fetchSettings = async () => {
    const { data } = await (supabase as any)
      .from('query_settings')
      .select('*')
      .eq('query_id', queryId)
      .maybeSingle();

    if (data) {
      setSettings(data);
    }
  };

  const updateSettings = async (updates: Partial<Settings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    try {
      const { error } = await (supabase as any)
        .from('query_settings')
        .upsert({
          query_id: queryId,
          ...newSettings,
        });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6 border rounded-lg">
      <h3 className="text-lg font-semibold">Query Settings</h3>

      <div className="space-y-2">
        <Label>Primary Entity</Label>
        <Select
          value={settings.primary_entity_id}
          onValueChange={(value) => updateSettings({ primary_entity_id: value })}
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
        <Label>Sort Field</Label>
        <Input
          placeholder="Field name"
          value={settings.sort_field || ''}
          onChange={(e) => updateSettings({ sort_field: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Sort Order</Label>
        <Select
          value={settings.sort_order || 'asc'}
          onValueChange={(value) => updateSettings({ sort_order: value })}
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

      <div className="space-y-2">
        <Label>Limit Rows</Label>
        <Input
          type="number"
          min="1"
          max="500"
          value={settings.limit_rows}
          onChange={(e) => updateSettings({ limit_rows: parseInt(e.target.value) || 50 })}
        />
      </div>

      <div className="space-y-2">
        <Label>Display Style</Label>
        <Select
          value={settings.display_style}
          onValueChange={(value) => updateSettings({ display_style: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="table">Table</SelectItem>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="list">List</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={settings.show_row_numbers}
          onCheckedChange={(checked) => updateSettings({ show_row_numbers: checked })}
        />
        <Label>Show Row Numbers</Label>
      </div>
    </div>
  );
}
