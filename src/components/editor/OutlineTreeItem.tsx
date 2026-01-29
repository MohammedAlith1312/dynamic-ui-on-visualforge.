import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, ChevronDown, Eye, EyeOff, Lock, Unlock, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface OutlineTreeItemProps {
  id: string;
  label: string;
  type: "component" | "column" | "row";
  componentType?: string;
  visible?: boolean;
  locked?: boolean;
  isSelected?: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  level: number;
  onToggleVisibility?: () => void;
  onToggleLock?: () => void;
  onSelect?: () => void;
}

export const OutlineTreeItem = ({
  id,
  label,
  type,
  componentType,
  visible = true,
  locked = false,
  isSelected = false,
  hasChildren = false,
  isExpanded = true,
  onToggleExpand,
  level,
  onToggleVisibility,
  onToggleLock,
  onSelect,
}: OutlineTreeItemProps) => {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: locked,
    data: { type, id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getIcon = () => {
    if (type === "row") return "📐";
    if (type === "column") return "📦";
    
    // Component icons
    const icons: Record<string, string> = {
      heading: "📝",
      paragraph: "📄",
      image: "🖼️",
      button: "🔘",
      link: "🔗",
      video: "🎥",
      divider: "➖",
      spacer: "⬜",
      quote: "💬",
      list: "📋",
      code: "💻",
      chart: "📊",
      tabs: "📑",
      accordion: "🗂️",
      card: "🃏",
      "form-input": "📝",
      "form-textarea": "📝",
      "form-select": "🔽",
      "form-checkbox": "☑️",
      "form-submit": "✅",
    };
    
    return icons[componentType || ""] || "📦";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-1 py-1 px-2 rounded transition-colors",
        type === "component" && "cursor-pointer",
        type === "component" && "hover:bg-accent",
        type !== "component" && "hover:bg-muted/50",
        isSelected && "bg-primary/10 border-l-2 border-primary",
        !visible && "opacity-50",
        locked && "cursor-not-allowed"
      )}
    >
      <div style={{ marginLeft: `${level * 16}px` }} className="flex items-center gap-1 flex-1 min-w-0">
        {hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand?.();
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}
        
        {!hasChildren && <div className="w-4" />}
        
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 shrink-0",
            locked && "cursor-not-allowed opacity-30"
          )}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
        
        <span className="text-sm mr-1">{getIcon()}</span>
        
        <span 
          className={cn(
            "text-sm truncate flex-1",
            type === "component" && "cursor-pointer",
            !visible && "line-through"
          )}
          onClick={(e) => {
            if (type === "component" && onSelect) {
              e.stopPropagation();
              e.preventDefault();
              console.log('[OutlineTreeItem] Label clicked, selecting:', id);
              onSelect();
            }
          }}
        >
          {label}
        </span>
      </div>
      
      <div className="flex items-center gap-0.5 shrink-0">
        {type === "component" && onToggleVisibility && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-accent shrink-0"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log('[OutlineTreeItem] Visibility clicked for:', id, visible);
              onToggleVisibility();
            }}
            title={visible ? "Hide component" : "Show component"}
          >
            {visible ? (
              <Eye className="h-3 w-3 text-muted-foreground" />
            ) : (
              <EyeOff className="h-3 w-3 text-destructive" />
            )}
          </Button>
        )}
        
        {type === "component" && onToggleLock && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-accent shrink-0"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log('[OutlineTreeItem] Lock clicked for:', id, locked);
              onToggleLock();
            }}
            title={locked ? "Unlock component" : "Lock component"}
          >
            {locked ? (
              <Lock className="h-3 w-3 text-orange-500" />
            ) : (
              <Unlock className="h-3 w-3 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
