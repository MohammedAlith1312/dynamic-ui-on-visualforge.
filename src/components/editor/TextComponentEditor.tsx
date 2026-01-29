import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Type } from "lucide-react";
import { useState } from "react";

interface TextComponentEditorProps {
  component: Tables<"page_components">;
  onUpdate: (content: any) => void;
}

export const TextComponentEditor = ({
  component,
  onUpdate,
}: TextComponentEditorProps) => {
  const content = component.content as { text: string };
  const [text, setText] = useState(content.text || "");

  const handleSave = () => {
    onUpdate({ text });
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Type className="h-4 w-4" />
          Text Component
        </div>
        <div>
          <Label htmlFor={`text-${component.id}`}>Text</Label>
          <Textarea
            id={`text-${component.id}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleSave}
            placeholder="Enter text"
            rows={4}
          />
        </div>
      </div>
    </Card>
  );
};
