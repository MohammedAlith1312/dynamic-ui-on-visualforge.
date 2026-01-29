import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Save, Trash2, Table2, LayoutGrid, Columns3, Images, List, Clock, Calendar, BarChart3 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ViewOptions {
  visibleColumns: string[];
  sortField: string | null;
  sortOrder: 'asc' | 'desc';
  filters: Array<{ field: string; operator: string; value: string }>;
}

interface SavedView {
  id: string;
  name: string;
  view_config: any;
  is_default: boolean;
}

interface ViewSelectorProps {
  entityId: string;
  currentView: ViewOptions;
  onViewLoad: (view: ViewOptions) => void;
  onViewNameChange?: (name: string) => void;
  onViewIdChange?: (id: string | null) => void;
}

export interface ViewSelectorRef {
  refreshViews: () => void;
}

export const ViewSelector = forwardRef<ViewSelectorRef, ViewSelectorProps>(({ entityId, currentView, onViewLoad, onViewNameChange, onViewIdChange }, ref) => {
  const [views, setViews] = useState<SavedView[]>([]);
  const [selectedViewId, setSelectedViewId] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [viewName, setViewName] = useState("");
  const [deleteViewId, setDeleteViewId] = useState<string | null>(null);
  const [hasLoadedDefault, setHasLoadedDefault] = useState(false);

  const loadViews = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("entity_views")
      .select("*")
      .eq("entity_id", entityId)
      .order("created_at");

    if (error) {
      console.error("Error loading views:", error);
    } else {
      setViews((data || []).map(item => ({ ...item, is_default: !!item.is_default })));

      // Auto-select default view only once
      if (!hasLoadedDefault) {
        const defaultView = data?.find(v => v.is_default);
        if (defaultView) {
          setSelectedViewId(defaultView.id);
          onViewLoad(defaultView.view_config as unknown as ViewOptions);
          onViewNameChange?.(defaultView.name);
          onViewIdChange?.(defaultView.id);
          setHasLoadedDefault(true);
        }
      }
    }
  };

  useEffect(() => {
    loadViews();
  }, [entityId]);

  useImperativeHandle(ref, () => ({
    refreshViews: loadViews
  }));

  const handleSaveView = async () => {
    if (!viewName.trim()) {
      toast.error("Please enter a view name");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("entity_views")
      .insert([{
        entity_id: entityId,
        user_id: user.id,
        name: viewName,
        view_config: currentView as any,
      }]);

    if (error) {
      toast.error("Failed to save view");
      console.error(error);
    } else {
      toast.success("View saved successfully");
      setViewName("");
      setShowSaveDialog(false);
      loadViews();
    }
  };

  const handleDeleteView = async () => {
    if (!deleteViewId) return;

    const { error } = await supabase
      .from("entity_views")
      .delete()
      .eq("id", deleteViewId);

    if (error) {
      toast.error("Failed to delete view");
      console.error(error);
    } else {
      toast.success("View deleted");
      if (selectedViewId === deleteViewId) {
        setSelectedViewId(null);
      }
      loadViews();
    }
    setDeleteViewId(null);
  };

  const handleViewSelect = (viewId: string) => {
    if (viewId === "default") {
      setSelectedViewId(null);
      onViewNameChange?.("Default View");
      onViewIdChange?.(null);
      return;
    }

    const view = views.find(v => v.id === viewId);
    if (view) {
      setSelectedViewId(viewId);
      onViewLoad(view.view_config as unknown as ViewOptions);
      onViewNameChange?.(view.name);
      onViewIdChange?.(viewId);
    }
  };

  const getViewIcon = (viewType?: string) => {
    switch (viewType) {
      case 'table': return <Table2 className="h-4 w-4" />;
      case 'card': return <LayoutGrid className="h-4 w-4" />;
      case 'kanban': return <Columns3 className="h-4 w-4" />;
      case 'gallery': return <Images className="h-4 w-4" />;
      case 'list': return <List className="h-4 w-4" />;
      case 'timeline': return <Clock className="h-4 w-4" />;
      case 'calendar': return <Calendar className="h-4 w-4" />;
      case 'gantt': return <BarChart3 className="h-4 w-4" />;
      default: return <Table2 className="h-4 w-4" />;
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Select value={selectedViewId || "default"} onValueChange={handleViewSelect}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="default">
              <div className="flex items-center gap-2">
                <Table2 className="h-4 w-4" />
                <span>Default View</span>
              </div>
            </SelectItem>
            {views.map((view) => (
              <SelectItem key={view.id} value={view.id}>
                <div className="flex items-center gap-2">
                  {getViewIcon(view.view_config?.viewType)}
                  <span>{view.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSaveDialog(true)}
        >
          <Save className="h-4 w-4 mr-2" />
          Save View
        </Button>

        {selectedViewId && selectedViewId !== "default" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteViewId(selectedViewId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save View</DialogTitle>
            <DialogDescription>
              Give this view a name to save your current column selection, sorting, and filters.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="View name"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveView()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveView}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteViewId} onOpenChange={() => setDeleteViewId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete View</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this saved view? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteView}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

ViewSelector.displayName = "ViewSelector";
