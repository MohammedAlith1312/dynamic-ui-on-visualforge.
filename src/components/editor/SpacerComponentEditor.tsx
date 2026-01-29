import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Space } from "lucide-react";

interface SpacerComponentEditorProps {
  component: Tables<"page_components">;
  onUpdate: (content: any) => void;
}

export const SpacerComponentEditor = ({
  component,
  onUpdate,
}: SpacerComponentEditorProps) => {
  const content = component.content as { height: string };
  const [height, setHeight] = useState(content.height || "medium");

  const handleSave = (val: string) => {
    setHeight(val);
    onUpdate({ height: val });
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Space className="h-4 w-4" />
          Spacer Component
        </div>
        <Select value={height} onValueChange={handleSave}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small (20px)</SelectItem>
            <SelectItem value="medium">Medium (40px)</SelectItem>
            <SelectItem value="large">Large (80px)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};
