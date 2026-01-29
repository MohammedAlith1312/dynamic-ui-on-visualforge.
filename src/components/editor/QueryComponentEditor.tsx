import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QueryComponentEditorProps {
  component: any;
  onUpdate: (updates: any) => void;
}

interface Query {
  id: string;
  display_name: string;
  query_type: string;
}

export default function QueryComponentEditor({ component, onUpdate }: QueryComponentEditorProps) {
  const [queries, setQueries] = useState<Query[]>([]);

  useEffect(() => {
    fetchPublishedQueries();
  }, []);

  const fetchPublishedQueries = async () => {
    const { data } = await (supabase as any)
      .from('queries')
      .select('id, display_name, query_type')
      .eq('is_published', true)
      .order('display_name');

    setQueries(data || []);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select Query</Label>
        <Select
          value={component.content.queryId || ''}
          onValueChange={(value) => onUpdate({ content: { queryId: value } })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a query" />
          </SelectTrigger>
          <SelectContent>
            {queries.map((query) => (
              <SelectItem key={query.id} value={query.id}>
                {query.display_name} ({query.query_type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Only published queries are available
        </p>
      </div>
    </div>
  );
}
