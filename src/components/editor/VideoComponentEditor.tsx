import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Video } from "lucide-react";

interface VideoComponentEditorProps {
  component: Tables<"page_components">;
  onUpdate: (content: any) => void;
}

export const VideoComponentEditor = ({
  component,
  onUpdate,
}: VideoComponentEditorProps) => {
  const content = component.content as { url: string };
  const [url, setUrl] = useState(content.url || "");

  const handleSave = () => {
    onUpdate({ url });
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Video className="h-4 w-4" />
          Video Component
        </div>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} onBlur={handleSave} placeholder="YouTube or Vimeo URL..." />
        <p className="text-xs text-muted-foreground">Paste a YouTube or Vimeo video URL</p>
      </div>
    </Card>
  );
};
