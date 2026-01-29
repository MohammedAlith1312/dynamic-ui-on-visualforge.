import { ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Plus, Copy, Trash2, Settings } from "lucide-react";

interface RowContextMenuProps {
  children: ReactNode;
  rowId: string;
  onAddRowAbove: () => void;
  onAddRowBelow: () => void;
  onDuplicateRow: () => void;
  onDeleteRow: () => void;
  onToggleProperties: () => void;
}

export const RowContextMenu = ({
  children,
  rowId,
  onAddRowAbove,
  onAddRowBelow,
  onDuplicateRow,
  onDeleteRow,
  onToggleProperties,
}: RowContextMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={onAddRowAbove}>
          <Plus className="mr-2 h-4 w-4" />
          <span>Add Row Above</span>
        </ContextMenuItem>
        
        <ContextMenuItem onClick={onAddRowBelow}>
          <Plus className="mr-2 h-4 w-4" />
          <span>Add Row Below</span>
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={onDuplicateRow}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Duplicate Row</span>
        </ContextMenuItem>
        
        <ContextMenuItem onClick={onToggleProperties}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Row Properties</span>
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={onDeleteRow} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Row</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
