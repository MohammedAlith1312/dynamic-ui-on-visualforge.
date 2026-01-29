import { useState, useEffect } from "react";
import { 
  Heading1, 
  Type, 
  Image as ImageIcon, 
  MousePointerClick, 
  Link as LinkIcon,
  Video,
  Minus,
  Space,
  Quote,
  List,
  Code,
  FileText,
  Box,
  Search,
  Database,
  FileSearch,
  BarChart3,
  Layers,
  ChevronDown,
  CreditCard,
  FileInput,
  FormInput,
  ListChecks,
  Mail,
  Info
} from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ComponentType = 
  | "heading"
  | "paragraph"
  | "image"
  | "button"
  | "link"
  | "video"
  | "divider"
  | "spacer"
  | "quote"
  | "list"
  | "code"
  | "page-content"
  | "entity-list"
  | "entity-detail"
  | "query"
  | "chart"
  | "tabs"
  | "accordion"
  | "card"
  | "form-input"
  | "form-textarea"
  | "form-select"
  | "form-checkbox"
  | "form-submit"
  | "datasource";

interface ComponentItem {
  type: ComponentType;
  title: string;
  icon: any;
  description: string;
}

const components: ComponentItem[] = [
  { type: "heading", title: "Heading", icon: Heading1, description: "H1-H6 headings" },
  { type: "paragraph", title: "Paragraph", icon: Type, description: "Text paragraph" },
  { type: "image", title: "Image", icon: ImageIcon, description: "Image with URL" },
  { type: "button", title: "Button", icon: MousePointerClick, description: "Call-to-action button" },
  { type: "link", title: "Link", icon: LinkIcon, description: "Hyperlink" },
  { type: "video", title: "Video", icon: Video, description: "Embedded video" },
  { type: "divider", title: "Divider", icon: Minus, description: "Horizontal line" },
  { type: "spacer", title: "Spacer", icon: Space, description: "Vertical spacing" },
  { type: "quote", title: "Quote", icon: Quote, description: "Block quote" },
  { type: "list", title: "List", icon: List, description: "Bullet or numbered list" },
  { type: "code", title: "Code", icon: Code, description: "Code block" },
  { type: "chart", title: "Chart", icon: BarChart3, description: "Data visualization charts" },
];

const advancedComponents: ComponentItem[] = [
  { type: "tabs", title: "Tabs", icon: Layers, description: "Tabbed content" },
  { type: "accordion", title: "Accordion", icon: ChevronDown, description: "Collapsible sections" },
  { type: "card", title: "Card", icon: CreditCard, description: "Card with layout options" },
];

const formComponents: ComponentItem[] = [
  { type: "form-input", title: "Input Field", icon: FormInput, description: "Text input with validation" },
  { type: "form-textarea", title: "Textarea", icon: FileInput, description: "Multi-line text input" },
  { type: "form-select", title: "Select", icon: ListChecks, description: "Dropdown selection" },
  { type: "form-checkbox", title: "Checkbox/Radio", icon: ListChecks, description: "Multiple choice options" },
  { type: "form-submit", title: "Submit Button", icon: Mail, description: "Form submission button" },
];

const entityComponents: ComponentItem[] = [
  { type: "entity-list", title: "Entity List", icon: Database, description: "Display entity records" },
  { type: "entity-detail", title: "Entity Detail", icon: FileSearch, description: "Display single record" },
  { type: "query", title: "Query", icon: Search, description: "Display query results" },
  { type: "datasource", title: "Data Source", icon: Database, description: "Connect to API or Database and display in views" },
];

const layoutComponents: ComponentItem[] = [
  { type: "page-content", title: "Page Content", icon: FileText, description: "Page content placeholder" },
];

interface DraggableComponentItemProps {
  component: ComponentItem;
}

const DraggableComponentItem = ({ component }: DraggableComponentItemProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-${component.type}`,
    data: { type: "new-component", componentType: component.type },
  });

  return (
    <SidebarMenuItem ref={setNodeRef}>
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "flex items-start gap-3 py-3 px-2 rounded-lg hover:bg-accent cursor-grab active:cursor-grabbing transition-colors",
          isDragging && "opacity-50"
        )}
      >
        <component.icon className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
        <div className="flex flex-col items-start">
          <span className="font-medium">{component.title}</span>
          <span className="text-xs text-muted-foreground">
            {component.description}
          </span>
        </div>
      </div>
    </SidebarMenuItem>
  );
};

interface WidgetItemProps {
  widget: Tables<"widgets">;
}

const DraggableWidgetItem = ({ widget }: WidgetItemProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-widget-${widget.id}`,
    data: { type: "new-widget", widgetId: widget.id, widgetTitle: widget.title },
  });

  return (
    <SidebarMenuItem ref={setNodeRef}>
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "flex items-start gap-3 py-3 px-2 rounded-lg hover:bg-accent cursor-grab active:cursor-grabbing transition-colors",
          isDragging && "opacity-50"
        )}
      >
        <Box className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
        <div className="flex flex-col items-start">
          <span className="font-medium">{widget.title}</span>
          <span className="text-xs text-muted-foreground">
            Widget
          </span>
        </div>
      </div>
    </SidebarMenuItem>
  );
};

interface ComponentsSidebarProps {
  isLayoutEditor?: boolean;
  renderHeader?: () => React.ReactNode;
}

export function ComponentsSidebar({ isLayoutEditor = false, renderHeader }: ComponentsSidebarProps) {
  const [widgets, setWidgets] = useState<Tables<"widgets">[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadWidgets();
  }, []);

  const loadWidgets = async () => {
    const { data } = await supabase
      .from("widgets")
      .select("*")
      .eq("is_published", true)
      .order("title");
    
    setWidgets(data || []);
  };

  const filterComponents = (comps: ComponentItem[]) => {
    if (!searchQuery) return comps;
    return comps.filter(c =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filterWidgets = (widgetsList: Tables<"widgets">[]) => {
    if (!searchQuery) return widgetsList;
    return widgetsList.filter(w =>
      w.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredComponents = filterComponents(components);
  const filteredAdvancedComponents = filterComponents(advancedComponents);
  const filteredFormComponents = filterComponents(formComponents);
  const filteredLayoutComponents = filterComponents(layoutComponents);
  const filteredEntityComponents = filterComponents(entityComponents);
  const filteredWidgets = filterWidgets(widgets);

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        {renderHeader && renderHeader()}
        
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Components (Drag to add)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredComponents.map((component) => (
                <DraggableComponentItem key={component.type} component={component} />
              ))}
              {filteredComponents.length === 0 && (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No components found
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Advanced Components</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredAdvancedComponents.map((component) => (
                <DraggableComponentItem key={component.type} component={component} />
              ))}
              {filteredAdvancedComponents.length === 0 && searchQuery && (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No advanced components found
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Form Components</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredFormComponents.map((component) => (
                <DraggableComponentItem key={component.type} component={component} />
              ))}
              {filteredFormComponents.length === 0 && searchQuery && (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No form components found
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {isLayoutEditor && (
          <SidebarGroup>
            <SidebarGroupLabel>Layout Components</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredLayoutComponents.map((component) => (
                  <DraggableComponentItem key={component.type} component={component} />
                ))}
                {filteredLayoutComponents.length === 0 && (
                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                    No layout components found
                  </div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!isLayoutEditor && filteredWidgets.length > 0 && (
          <SidebarGroup>
            <div className="flex items-center gap-2 px-4 py-2">
              <SidebarGroupLabel>Widgets (Drag to add)</SidebarGroupLabel>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">Reusable components. When you edit the widget, all instances on all pages update automatically.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredWidgets.map((widget) => (
                  <DraggableWidgetItem key={widget.id} widget={widget} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!isLayoutEditor && (
          <SidebarGroup>
            <SidebarGroupLabel>Entity Components</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredEntityComponents.map((component) => (
                  <DraggableComponentItem key={component.type} component={component} />
                ))}
                {filteredEntityComponents.length === 0 && searchQuery && (
                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                    No entity components found
                  </div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!isLayoutEditor && widgets.length > 0 && filteredWidgets.length === 0 && searchQuery && (
          <SidebarGroup>
            <SidebarGroupLabel>Widgets (Drag to add)</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                No widgets found
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
