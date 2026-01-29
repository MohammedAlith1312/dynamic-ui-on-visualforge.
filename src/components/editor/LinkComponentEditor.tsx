import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link as LinkIcon } from "lucide-react";

interface LinkComponentEditorProps {
  component: Tables<"page_components">;
  onUpdate: (content: any) => void;
}

export const LinkComponentEditor = ({
  component,
  onUpdate,
}: LinkComponentEditorProps) => {
  const content = component.content as { text: string; url: string };
  const [text, setText] = useState(content.text || "");
  const [url, setUrl] = useState(content.url || "");

  const handleSave = () => {
    onUpdate({ text, url });
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <LinkIcon className="h-4 w-4" />
          Link Component
        </div>
        <Input value={text} onChange={(e) => setText(e.target.value)} onBlur={handleSave} placeholder="Link text..." />
        <Input value={url} onChange={(e) => setUrl(e.target.value)} onBlur={handleSave} placeholder="URL..." />
      </div>
    </Card>
  );
};
