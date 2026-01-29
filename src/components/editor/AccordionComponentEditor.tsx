import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

interface AccordionComponentEditorProps {
  content: {
    items?: AccordionItem[];
  };
  onUpdate: (content: any) => void;
}

export const AccordionComponentEditor = ({ content, onUpdate }: AccordionComponentEditorProps) => {
  const items = content.items || [
    { id: "item-1", title: "Section 1", content: "Content for section 1" },
    { id: "item-2", title: "Section 2", content: "Content for section 2" },
  ];

  const handleAddItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      title: `Section ${items.length + 1}`,
      content: `Content for section ${items.length + 1}`,
    };
    onUpdate({ items: [...items, newItem] });
  };

  const handleRemoveItem = (id: string) => {
    onUpdate({ items: items.filter((item) => item.id !== id) });
  };

  const handleUpdateItem = (id: string, field: keyof AccordionItem, value: string) => {
    onUpdate({
      items: items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          Accordion Component
          <Button size="sm" variant="outline" onClick={handleAddItem} className="gap-2">
            <Plus className="h-3 w-3" />
            Add Section
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Section {index + 1}</span>
              {items.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`item-title-${item.id}`}>Section Title</Label>
              <Input
                id={`item-title-${item.id}`}
                value={item.title}
                onChange={(e) => handleUpdateItem(item.id, "title", e.target.value)}
                placeholder="Section title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`item-content-${item.id}`}>Section Content</Label>
              <Textarea
                id={`item-content-${item.id}`}
                value={item.content}
                onChange={(e) => handleUpdateItem(item.id, "content", e.target.value)}
                placeholder="Section content"
                rows={3}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
