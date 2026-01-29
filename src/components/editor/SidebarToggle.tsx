import { ComponentsSidebar } from "./ComponentsSidebar";
import { OutlinePanel } from "./OutlinePanel";
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { List, Shapes } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Row = Tables<"page_rows"> | Tables<"widget_rows"> | Tables<"layout_rows">;
type Component = Tables<"page_components"> | Tables<"widget_components"> | Tables<"layout_components">;

interface SidebarToggleProps {
  showOutline: boolean;
  onToggle: () => void;
  title: string;
  rows: Row[];
  components: Component[];
  selectedComponentId?: string | null;
  onSelectComponent: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  isLayoutEditor?: boolean;
}

export const SidebarToggle = ({
  showOutline,
  onToggle,
  title,
  rows,
  components,
  selectedComponentId,
  onSelectComponent,
  onToggleVisibility,
  onToggleLock,
  isLayoutEditor = false,
}: SidebarToggleProps) => {
  if (showOutline) {
    return (
      <Sidebar>
        <SidebarHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Structure</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="gap-2"
              title="Switch to Components"
            >
              <Shapes className="h-4 w-4" />
              <span className="text-xs">Components</span>
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-0">
          <OutlinePanel
            title={title}
            rows={rows}
            components={components}
            selectedComponentId={selectedComponentId}
            onSelectComponent={onSelectComponent}
            onToggleVisibility={onToggleVisibility}
            onToggleLock={onToggleLock}
          />
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <ComponentsSidebar
      isLayoutEditor={isLayoutEditor}
      renderHeader={() => (
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Add Components</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="gap-1 h-8"
              title="Switch to Outline View"
            >
              <List className="h-4 w-4" />
              <span className="text-xs">Outline</span>
            </Button>
          </div>
        </div>
      )}
    />
  );
};



