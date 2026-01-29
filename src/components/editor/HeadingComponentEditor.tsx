import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Type } from "lucide-react";
import { useState } from "react";

interface HeadingComponentEditorProps {
  component: Tables<"page_components">;
  onUpdate: (content: any) => void;
}

export const HeadingComponentEditor = ({
  component,
  onUpdate,
}: HeadingComponentEditorProps) => {
  const content = component.content as { text: string; level: string };
  const [text, setText] = useState(content.text || "");
  const [level, setLevel] = useState(content.level || "h2");

  const handleSave = () => {
    onUpdate({ text, level });
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Type className="h-4 w-4" />
          Heading Component
        </div>
        <div className="space-y-3">
          <div>
            <Label htmlFor={`heading-text-${component.id}`}>Text</Label>
            <Input
              id={`heading-text-${component.id}`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={handleSave}
              placeholder="Enter heading text"
            />
          </div>
          <div>
            <Label htmlFor={`heading-level-${component.id}`}>Level</Label>
            <Select value={level} onValueChange={(value) => { setLevel(value); setTimeout(handleSave, 0); }}>
              <SelectTrigger id={`heading-level-${component.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="h1">H1</SelectItem>
                <SelectItem value="h2">H2</SelectItem>
                <SelectItem value="h3">H3</SelectItem>
                <SelectItem value="h4">H4</SelectItem>
                <SelectItem value="h5">H5</SelectItem>
                <SelectItem value="h6">H6</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
};
