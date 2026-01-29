import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Quote } from "lucide-react";

interface QuoteComponentEditorProps {
  component: Tables<"page_components">;
  onUpdate: (content: any) => void;
}

export const QuoteComponentEditor = ({
  component,
  onUpdate,
}: QuoteComponentEditorProps) => {
  const content = component.content as { text: string; author: string };
  const [text, setText] = useState(content.text || "");
  const [author, setAuthor] = useState(content.author || "");

  const handleSave = () => {
    onUpdate({ text, author });
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Quote className="h-4 w-4" />
          Quote Component
        </div>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} onBlur={handleSave} placeholder="Quote text..." rows={3} />
        <Input value={author} onChange={(e) => setAuthor(e.target.value)} onBlur={handleSave} placeholder="Author (optional)" />
      </div>
    </Card>
  );
};
