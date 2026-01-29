import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Code } from "lucide-react";

interface CodeComponentEditorProps {
  component: Tables<"page_components">;
  onUpdate: (content: any) => void;
}

export const CodeComponentEditor = ({
  component,
  onUpdate,
}: CodeComponentEditorProps) => {
  const content = component.content as { code: string; language: string };
  const [code, setCode] = useState(content.code || "");
  const [language, setLanguage] = useState(content.language || "");

  const handleSave = () => {
    onUpdate({ code, language });
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Code className="h-4 w-4" />
          Code Component
        </div>
        <Input value={language} onChange={(e) => setLanguage(e.target.value)} onBlur={handleSave} placeholder="Language (e.g., javascript)" />
        <Textarea value={code} onChange={(e) => setCode(e.target.value)} onBlur={handleSave} placeholder="Code..." rows={6} className="font-mono text-sm" />
      </div>
    </Card>
  );
};
