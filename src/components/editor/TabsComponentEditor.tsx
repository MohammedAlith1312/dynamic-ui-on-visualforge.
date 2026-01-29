import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  content: string;
}

interface TabsComponentEditorProps {
  content: {
    tabs?: TabItem[];
  };
  onUpdate: (content: any) => void;
}

export const TabsComponentEditor = ({ content, onUpdate }: TabsComponentEditorProps) => {
  const tabs = content.tabs || [
    { id: "tab-1", label: "Tab 1", content: "Content for tab 1" },
    { id: "tab-2", label: "Tab 2", content: "Content for tab 2" },
  ];

  const handleAddTab = () => {
    const newTab = {
      id: `tab-${Date.now()}`,
      label: `Tab ${tabs.length + 1}`,
      content: `Content for tab ${tabs.length + 1}`,
    };
    onUpdate({ tabs: [...tabs, newTab] });
  };

  const handleRemoveTab = (id: string) => {
    onUpdate({ tabs: tabs.filter((t) => t.id !== id) });
  };

  const handleUpdateTab = (id: string, field: keyof TabItem, value: string) => {
    onUpdate({
      tabs: tabs.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          Tabs Component
          <Button size="sm" variant="outline" onClick={handleAddTab} className="gap-2">
            <Plus className="h-3 w-3" />
            Add Tab
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tabs.map((tab, index) => (
          <div key={tab.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tab {index + 1}</span>
              {tabs.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveTab(tab.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`tab-label-${tab.id}`}>Tab Label</Label>
              <Input
                id={`tab-label-${tab.id}`}
                value={tab.label}
                onChange={(e) => handleUpdateTab(tab.id, "label", e.target.value)}
                placeholder="Tab label"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`tab-content-${tab.id}`}>Tab Content</Label>
              <Textarea
                id={`tab-content-${tab.id}`}
                value={tab.content}
                onChange={(e) => handleUpdateTab(tab.id, "content", e.target.value)}
                placeholder="Tab content"
                rows={3}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
