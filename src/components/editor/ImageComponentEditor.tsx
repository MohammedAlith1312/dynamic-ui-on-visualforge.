import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon } from "lucide-react";

interface ImageComponentEditorProps {
  component: Tables<"page_components">;
  onUpdate: (content: any) => void;
}

export const ImageComponentEditor = ({
  component,
  onUpdate,
}: ImageComponentEditorProps) => {
  const content = component.content as { url: string; alt: string };
  const [url, setUrl] = useState(content.url || "");
  const [alt, setAlt] = useState(content.alt || "");

  const handleSave = () => {
    onUpdate({ url, alt });
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          Image Component
        </div>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={handleSave}
          placeholder="Image URL..."
        />
        <Input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          onBlur={handleSave}
          placeholder="Alt text..."
        />
        {url && (
          <img src={url} alt={alt} className="w-full max-h-48 object-cover rounded" />
        )}
      </div>
    </Card>
  );
};
