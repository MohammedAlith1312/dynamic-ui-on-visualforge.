import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MousePointerClick } from "lucide-react";

interface ButtonComponentEditorProps {
  component: Tables<"page_components">;
  onUpdate: (content: any) => void;
}

export const ButtonComponentEditor = ({
  component,
  onUpdate,
}: ButtonComponentEditorProps) => {
  const content = component.content as { 
    text: string; 
    link: string;
    variant?: string;
    size?: string;
    fullWidth?: boolean;
  };
  const [text, setText] = useState(content.text || "");
  const [link, setLink] = useState(content.link || "");
  const [variant, setVariant] = useState(content.variant || "default");
  const [size, setSize] = useState(content.size || "default");
  const [fullWidth, setFullWidth] = useState(content.fullWidth || false);

  const handleSave = () => {
    onUpdate({ text, link, variant, size, fullWidth });
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MousePointerClick className="h-4 w-4" />
          Button Component
        </div>
        <div className="space-y-2">
          <Label htmlFor="button-text">Button Text</Label>
          <Input
            id="button-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleSave}
            placeholder="Button text..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="button-link">Link URL</Label>
          <Input
            id="button-link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onBlur={handleSave}
            placeholder="Link URL..."
          />
        </div>
        <div className="space-y-2">
          <Label>Variant</Label>
          <Select value={variant} onValueChange={(val) => { setVariant(val); setTimeout(handleSave, 0); }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="ghost">Ghost</SelectItem>
              <SelectItem value="destructive">Destructive</SelectItem>
              <SelectItem value="link">Link</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Size</Label>
          <Select value={size} onValueChange={(val) => { setSize(val); setTimeout(handleSave, 0); }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="default">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="button-fullwidth"
            checked={fullWidth}
            onCheckedChange={(checked) => { setFullWidth(!!checked); setTimeout(handleSave, 0); }}
          />
          <Label htmlFor="button-fullwidth" className="cursor-pointer">
            Full Width
          </Label>
        </div>
      </div>
    </Card>
  );
};
