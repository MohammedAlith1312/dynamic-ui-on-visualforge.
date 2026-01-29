import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { List } from "lucide-react";

interface ListComponentEditorProps {
  component: Tables<"page_components">;
  onUpdate: (content: any) => void;
}

export const ListComponentEditor = ({
  component,
  onUpdate,
}: ListComponentEditorProps) => {
  const content = component.content as { items: string; type: string };
  const [items, setItems] = useState(content.items || "");
  const [type, setType] = useState(content.type || "bullet");

  const handleSave = () => {
    onUpdate({ items, type });
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <List className="h-4 w-4" />
          List Component
        </div>
        <Textarea value={items} onChange={(e) => setItems(e.target.value)} onBlur={handleSave} placeholder="One item per line..." rows={4} />
        <Select value={type} onValueChange={(val) => { setType(val); setTimeout(handleSave, 100); }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bullet">Bullet List</SelectItem>
            <SelectItem value="numbered">Numbered List</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};
