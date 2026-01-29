import { ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Copy, Trash2, Edit, ArrowUp, ArrowDown, Clipboard } from "lucide-react";
import { useClipboard } from "@/contexts/ClipboardContext";

interface ComponentContextMenuProps {
  children: ReactNode;
  componentId: string;
  component: any;
  totalComponents: number;
  currentPosition: number;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveToTop: () => void;
  onMoveToBottom: () => void;
}

export const ComponentContextMenu = ({
  children,
  componentId,
  component,
  totalComponents,
  currentPosition,
  onEdit,
  onDuplicate,
  onDelete,
  onMoveToTop,
  onMoveToBottom,
}: ComponentContextMenuProps) => {
  const { copyComponent, copiedComponent } = useClipboard();

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Edit</span>
        </ContextMenuItem>
        
        <ContextMenuItem onClick={onDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Duplicate</span>
          <span className="ml-auto text-xs text-muted-foreground">Ctrl+D</span>
        </ContextMenuItem>
        
        <ContextMenuItem onClick={() => copyComponent(component)}>
          <Clipboard className="mr-2 h-4 w-4" />
          <span>Copy</span>
          <span className="ml-auto text-xs text-muted-foreground">Ctrl+C</span>
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem 
          onClick={onMoveToTop}
          disabled={currentPosition === 0}
        >
          <ArrowUp className="mr-2 h-4 w-4" />
          <span>Move to Top</span>
        </ContextMenuItem>
        
        <ContextMenuItem 
          onClick={onMoveToBottom}
          disabled={currentPosition === totalComponents - 1}
        >
          <ArrowDown className="mr-2 h-4 w-4" />
          <span>Move to Bottom</span>
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
          <span className="ml-auto text-xs text-muted-foreground">Del</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
