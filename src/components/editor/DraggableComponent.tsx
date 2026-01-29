import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Copy, CopyPlus, Trash2, Paintbrush } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/contexts/ClipboardContext";
import { ComponentStylePanel } from "./ComponentStylePanel";
import { ComponentContextMenu } from "./ComponentContextMenu";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { HeadingComponentEditor } from "./HeadingComponentEditor";
import { TextComponentEditor } from "./TextComponentEditor";
import { ImageComponentEditor } from "./ImageComponentEditor";
import { ButtonComponentEditor } from "./ButtonComponentEditor";
import { LinkComponentEditor } from "./LinkComponentEditor";
import { VideoComponentEditor } from "./VideoComponentEditor";
import { DividerComponentEditor } from "./DividerComponentEditor";
import { SpacerComponentEditor } from "./SpacerComponentEditor";
import { QuoteComponentEditor } from "./QuoteComponentEditor";
import { ListComponentEditor } from "./ListComponentEditor";
import { CodeComponentEditor } from "./CodeComponentEditor";
import { PageContentComponentEditor } from "./PageContentComponentEditor";
import { EntityListComponentEditor } from "./EntityListComponentEditor";
import { EntityDetailComponentEditor } from "./EntityDetailComponentEditor";
import QueryComponentEditor from "./QueryComponentEditor";
import { ChartComponentEditor } from "./ChartComponentEditor";
import { TabsComponentEditor } from "./TabsComponentEditor";
import { AccordionComponentEditor } from "./AccordionComponentEditor";
import { CardComponentEditor } from "./CardComponentEditor";
import { FormInputComponentEditor } from "./FormInputComponentEditor";
import { FormTextareaComponentEditor } from "./FormTextareaComponentEditor";
import { FormSelectComponentEditor } from "./FormSelectComponentEditor";
import { FormCheckboxComponentEditor } from "./FormCheckboxComponentEditor";
import { FormSubmitComponentEditor } from "./FormSubmitComponentEditor";
import { DatasourceComponentEditor } from "./DatasourceComponentEditor";

type Component = Tables<"page_components"> | Tables<"widget_components"> | Tables<"layout_components">;

interface DraggableComponentProps {
  component: Component;
  onUpdate: (id: string, content: any) => void;
  onUpdateStyles: (id: string, styles: any) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  totalComponents: number;
  onMoveToPosition: (id: string, position: number) => void;
}

export const DraggableComponent = ({
  component,
  onUpdate,
  onUpdateStyles,
  onDelete,
  onDuplicate,
  totalComponents,
  onMoveToPosition,
}: DraggableComponentProps) => {
  const { copyComponent } = useClipboard();
  const [showStyles, setShowStyles] = useState(false);
  
  const componentStyles = (component as any).styles || {};
  const isHidden = componentStyles.visible === false;
  const isLocked = componentStyles.locked === true;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: component.id,
    disabled: isLocked,
    data: {
      type: "component",
      component
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : isHidden ? 0.4 : 1,
  };

  const componentStyleStrings = (component as any).styles || {};
  const componentStyleString = {
    marginTop: componentStyleStrings.marginTop,
    marginBottom: componentStyleStrings.marginBottom,
    marginLeft: componentStyleStrings.marginLeft,
    marginRight: componentStyleStrings.marginRight,
    paddingTop: componentStyleStrings.paddingTop,
    paddingBottom: componentStyleStrings.paddingBottom,
    paddingLeft: componentStyleStrings.paddingLeft,
    paddingRight: componentStyleStrings.paddingRight,
    color: componentStyleStrings.color,
    backgroundColor: componentStyleStrings.backgroundColor,
    fontSize: componentStyleStrings.fontSize,
    fontWeight: componentStyleStrings.fontWeight,
    textAlign: componentStyleStrings.textAlign as any,
    borderRadius: componentStyleStrings.borderRadius,
    boxShadow: componentStyleStrings.boxShadow,
    border: componentStyleStrings.border,
  };

  // Cast to page_components for editor compatibility (widget_components have same structure for content)
  const editorComponent = component as Tables<"page_components">;
  
  const commonProps = {
    component: editorComponent,
    onUpdate: (content: any) => onUpdate(component.id, content),
  };

  const renderComponent = () => {
    switch (component.component_type) {
      case "heading":
        return <HeadingComponentEditor {...commonProps} />;
      case "paragraph":
        return <TextComponentEditor {...commonProps} />;
      case "image":
        return <ImageComponentEditor {...commonProps} />;
      case "button":
        return <ButtonComponentEditor {...commonProps} />;
      case "link":
        return <LinkComponentEditor {...commonProps} />;
      case "video":
        return <VideoComponentEditor {...commonProps} />;
      case "divider":
        return <DividerComponentEditor />;
      case "spacer":
        return <SpacerComponentEditor {...commonProps} />;
      case "quote":
        return <QuoteComponentEditor {...commonProps} />;
      case "list":
        return <ListComponentEditor {...commonProps} />;
      case "code":
        return <CodeComponentEditor {...commonProps} />;
      case "page-content":
        return <PageContentComponentEditor />;
      case "entity-list":
        return <EntityListComponentEditor {...commonProps} />;
      case "entity-detail":
        return <EntityDetailComponentEditor {...commonProps} />;
      case "query":
        return <QueryComponentEditor {...commonProps} />;
      case "datasource":
        return <DatasourceComponentEditor {...commonProps} />;
      case "chart":
        return <ChartComponentEditor {...commonProps} />;
      case "tabs":
        return <TabsComponentEditor content={component.content as any} onUpdate={(content) => onUpdate(component.id, content)} />;
      case "accordion":
        return <AccordionComponentEditor content={component.content as any} onUpdate={(content) => onUpdate(component.id, content)} />;
      case "card":
        return <CardComponentEditor content={component.content as any} onUpdate={(content) => onUpdate(component.id, content)} />;
      case "form-input":
        return <FormInputComponentEditor content={component.content as any} onUpdate={(content) => onUpdate(component.id, content)} />;
      case "form-textarea":
        return <FormTextareaComponentEditor content={component.content as any} onUpdate={(content) => onUpdate(component.id, content)} />;
      case "form-select":
        return <FormSelectComponentEditor content={component.content as any} onUpdate={(content) => onUpdate(component.id, content)} />;
      case "form-checkbox":
        return <FormCheckboxComponentEditor content={component.content as any} onUpdate={(content) => onUpdate(component.id, content)} />;
      case "form-submit":
        return <FormSubmitComponentEditor content={component.content as any} onUpdate={(content) => onUpdate(component.id, content)} />;
      default:
        return null;
    }
  };

  return (
    <ComponentContextMenu
      componentId={component.id}
      component={component}
      totalComponents={totalComponents}
      currentPosition={component.position}
      onEdit={() => setShowStyles(true)}
      onDuplicate={() => onDuplicate(component.id)}
      onDelete={() => onDelete(component.id)}
      onMoveToTop={() => onMoveToPosition(component.id, 0)}
      onMoveToBottom={() => onMoveToPosition(component.id, totalComponents - 1)}
    >
      <div ref={setNodeRef} style={{...style, ...componentStyleString}} className={cn(
        "relative group",
        isHidden && "opacity-40 pointer-events-none",
        isLocked && "cursor-not-allowed border-2 border-orange-500/50"
      )}>
        <div
          {...attributes}
          {...listeners}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowStyles(!showStyles)}
            title="Styles"
          >
            <Paintbrush className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onDuplicate(component.id)}
            title="Duplicate (Cmd+D)"
          >
            <CopyPlus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => copyComponent(component)}
            title="Copy (Cmd+C)"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-7 w-7"
            onClick={() => onDelete(component.id)}
            title="Delete (Backspace)"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div>
          {renderComponent()}
          <Collapsible open={showStyles}>
            <CollapsibleContent>
              <ComponentStylePanel
                componentId={component.id}
                styles={componentStyleStrings}
                onUpdate={(styles) => onUpdateStyles(component.id, styles)}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </ComponentContextMenu>
  );
};
