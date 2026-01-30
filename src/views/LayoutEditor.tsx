"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useClipboard } from "@/contexts/ClipboardContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Monitor, Undo, Redo } from "lucide-react";
import { ComponentsSidebar, ComponentType } from "@/components/editor/ComponentsSidebar";
import { GridCanvas } from "@/components/editor/GridCanvas";
import { Tables } from "@/integrations/supabase/types";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, pointerWithin } from "@dnd-kit/core";
import { LayoutPreviewModal } from "@/components/editor/LayoutPreviewModal";
import { useHistory } from "@/hooks/useHistory";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { DeviceFrame } from "@/components/editor/DeviceFrame";

type Layout = Tables<"layouts">;
type LayoutRow = Tables<"layout_rows">;
type LayoutComponent = Tables<"layout_components">;

const LayoutEditor = () => {
  const params = useParams();
  const layoutId = params?.layoutId as string;
  const router = useRouter();
  const { copiedComponent } = useClipboard();
  const [layout, setLayout] = useState<Layout | null>(null);
  const [rows, setRows] = useState<LayoutRow[]>([]);
  const [components, setComponents] = useState<LayoutComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeComponentType, setActiveComponentType] = useState<ComponentType | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const history = useHistory();

  useKeyboardShortcuts({
    onUndo: () => history.canUndo && history.undo(),
    onRedo: () => history.canRedo && history.redo(),
    onDelete: () => selectedComponent && handleDeleteComponent(selectedComponent),
    onDuplicate: () => selectedComponent && handleDuplicateComponent(selectedComponent),
  });

  useEffect(() => {
    loadLayout();
  }, [layoutId]);

  const loadLayout = async () => {
    if (!layoutId) return;

    const { data: layoutData, error: layoutError } = await supabase
      .from("layouts")
      .select("*")
      .eq("id", layoutId)
      .single();

    if (layoutError) {
      toast.error("Failed to load layout");
      router.push("/admin/layouts");
      return;
    }

    const { data: rowsData } = await supabase
      .from("layout_rows")
      .select("*")
      .eq("layout_id", layoutId)
      .order("position");

    const { data: componentsData } = await supabase
      .from("layout_components")
      .select("*")
      .eq("layout_id", layoutId)
      .order("position");

    setLayout(layoutData);
    setRows(rowsData || []);
    setComponents(componentsData || []);
    setLoading(false);
  };

  const handleAddRow = async () => {
    if (!layoutId) return;

    const { data, error } = await supabase
      .from("layout_rows")
      .insert({
        layout_id: layoutId,
        position: rows.length,
        columns: 1,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add row");
      return;
    }

    setRows([...rows, data]);
    toast.success("Row added");
  };

  const handleDeleteRow = async (rowId: string) => {
    if (!confirm("Delete this row and all its components?")) return;

    const { error } = await supabase.from("layout_rows").delete().eq("id", rowId);

    if (error) {
      toast.error("Failed to delete row");
      return;
    }

    setRows(rows.filter((r) => r.id !== rowId));
    setComponents(components.filter((c) => c.row_id !== rowId));
    toast.success("Row deleted");
  };

  const handleUpdateRowColumns = async (rowId: string, columns: number) => {
    const { error } = await supabase
      .from("layout_rows")
      .update({ columns })
      .eq("id", rowId);

    if (error) {
      toast.error("Failed to update columns");
      return;
    }

    setRows(rows.map((r) => (r.id === rowId ? { ...r, columns } : r)));
  };

  const handleUpdateRowStyles = async (rowId: string, styles: any) => {
    const { error } = await supabase.from("layout_rows").update({ styles }).eq("id", rowId);
    if (error) {
      toast.error("Failed to update row styles");
      return;
    }
    setRows(rows.map((r) => (r.id === rowId ? { ...r, styles } as LayoutRow : r)));
  };

  const handleUpdateRowColumnWidths = async (rowId: string, widths: number[]) => {
    const { error } = await supabase
      .from("layout_rows")
      .update({ column_widths: widths })
      .eq("id", rowId);

    if (error) {
      toast.error("Failed to update column widths");
      return;
    }

    setRows(rows.map((r) => (r.id === rowId ? { ...r, column_widths: widths } as any : r)));
  };

  const handleUpdateRowResponsiveConfig = async (rowId: string, config: any) => {
    const { error } = await supabase
      .from("layout_rows")
      .update({ responsive_config: config })
      .eq("id", rowId);

    if (error) {
      toast.error("Failed to update responsive config");
      return;
    }

    setRows(rows.map((r) => (r.id === rowId ? { ...r, responsive_config: config } as any : r)));
  };

  const handleUpdateComponentStyles = async (id: string, styles: any) => {
    const { error } = await supabase.from("layout_components").update({ styles }).eq("id", id);
    if (error) {
      toast.error("Failed to update component styles");
      return;
    }
    setComponents(components.map((c) => (c.id === id ? { ...c, styles } as LayoutComponent : c)));
  };

  const handleReorderRows = async (newRows: LayoutRow[]) => {
    setRows(newRows);

    for (let i = 0; i < newRows.length; i++) {
      await supabase
        .from("layout_rows")
        .update({ position: i })
        .eq("id", newRows[i].id);
    }
  };

  const getDefaultContent = (type: ComponentType) => {
    switch (type) {
      case "heading": return { text: "New Heading", level: "h2" };
      case "paragraph": return { text: "New paragraph text" };
      case "image": return { url: "", alt: "Image" };
      case "button": return { text: "Click me", link: "" };
      case "link": return { text: "Link", url: "" };
      case "video": return { url: "" };
      case "divider": return {};
      case "spacer": return { height: "medium" };
      case "quote": return { text: "Quote text", author: "" };
      case "list": return { items: "Item 1\nItem 2\nItem 3", type: "bullet" };
      case "code": return { code: "console.log('Hello');", language: "javascript" };
      case "query": return { queryId: "" };
      case "datasource": return {
        dataSourceType: "entity",
        viewType: "table",
        viewOptions: {
          visibleColumns: [],
          sortField: null,
          sortOrder: "asc",
          filters: [],
        },
      };
      case "chart": return {
        chartType: "bar",
        data: JSON.stringify([
          { name: "Jan", value: 400 },
          { name: "Feb", value: 300 },
          { name: "Mar", value: 600 },
          { name: "Apr", value: 800 },
          { name: "May", value: 500 },
          { name: "Jun", value: 700 }
        ], null, 2),
        title: "Sample Bar Chart",
        xAxisKey: "name",
        yAxisKey: "value"
      };
      case "tabs": return { tabs: [{ id: "tab-1", label: "Tab 1", content: "Content 1" }, { id: "tab-2", label: "Tab 2", content: "Content 2" }] };
      case "accordion": return { items: [{ id: "item-1", title: "Section 1", content: "Content 1" }, { id: "item-2", title: "Section 2", content: "Content 2" }] };
      case "card": return { layout: "image-top", title: "Card Title", description: "Card description", imageUrl: "", buttonText: "Learn More", buttonLink: "" };
      case "form-input": return { fieldName: "field_name", label: "Field Label", placeholder: "Enter value...", inputType: "text", required: false };
      case "form-textarea": return { fieldName: "message", label: "Message", placeholder: "Enter your message...", rows: 4, required: false };
      case "form-select": return { fieldName: "select_field", label: "Select Option", placeholder: "Choose...", options: "Option 1\nOption 2\nOption 3", required: false };
      case "form-checkbox": return { fieldName: "checkbox_field", label: "Select Options", options: "Option 1\nOption 2\nOption 3", type: "checkbox", required: false };
      case "form-submit": return { buttonText: "Submit", buttonVariant: "default", successMessage: "Form submitted successfully!", submitAction: "custom" };
      default: return {};
    }
  };

  const handleUpdateComponent = async (id: string, content: any) => {
    const { error } = await supabase
      .from("layout_components")
      .update({ content })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update component");
      return;
    }

    setComponents(components.map((c) => (c.id === id ? { ...c, content } : c)));
  };

  const handleDeleteComponent = async (id: string) => {
    const { error } = await supabase.from("layout_components").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete component");
      return;
    }

    setComponents(components.filter((c) => c.id !== id));
    toast.success("Component deleted");
  };

  const handleInsertTemplate = async (templateData: any) => {
    if (!layoutId) return;

    const templateRows = templateData.rows || [];

    for (const templateRow of templateRows) {
      const { data: newRow, error: rowError } = await supabase
        .from("layout_rows")
        .insert({
          layout_id: layoutId,
          position: rows.length,
          columns: templateRow.columns || 1,
          column_widths: templateRow.column_widths || [],
          styles: templateRow.styles || {},
        })
        .select()
        .single();

      if (rowError || !newRow) {
        toast.error("Failed to insert template row");
        continue;
      }

      const templateComponents = templateRow.components || [];
      for (const templateComp of templateComponents) {
        await supabase.from("layout_components").insert({
          layout_id: layoutId,
          row_id: newRow.id,
          component_type: templateComp.component_type,
          column_index: templateComp.column_index,
          position: templateComp.position,
          content: templateComp.content || {},
          styles: templateComp.styles || {},
        });
      }
    }

    await loadLayout();
    toast.success("Template inserted successfully");
  };

  const handleDuplicateComponent = async (id: string) => {
    const component = components.find((c) => c.id === id);
    if (!component || !layoutId) return;

    const columnComponents = components.filter(
      (c) => c.row_id === component.row_id && c.column_index === component.column_index
    );

    const { data, error } = await supabase
      .from("layout_components")
      .insert({
        layout_id: layoutId,
        row_id: component.row_id,
        column_index: component.column_index,
        component_type: component.component_type,
        content: component.content,
        position: columnComponents.length,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to duplicate component");
      return;
    }

    setComponents([...components, data]);
    toast.success("Component duplicated");
  };

  const handlePasteComponent = async (rowId: string, columnIndex: number) => {
    if (!copiedComponent || !layoutId) return;

    const columnComponents = components.filter(
      (c) => c.row_id === rowId && c.column_index === columnIndex
    );

    const { data, error } = await supabase
      .from("layout_components")
      .insert({
        layout_id: layoutId,
        row_id: rowId,
        column_index: columnIndex,
        component_type: copiedComponent.component_type,
        content: copiedComponent.content,
        position: columnComponents.length,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to paste component");
      return;
    }

    setComponents([...components, data]);
    toast.success("Component pasted");
  };

  const handleMoveComponentToPosition = async (id: string, newPosition: number) => {
    const component = components.find((c) => c.id === id);
    if (!component) return;

    const columnComponents = components
      .filter((c) => c.row_id === component.row_id && c.column_index === component.column_index)
      .sort((a, b) => a.position - b.position);

    const updates = columnComponents.map((comp, index) => {
      if (comp.id === id) {
        return supabase.from("layout_components").update({ position: newPosition }).eq("id", comp.id);
      }
      if (index >= newPosition && comp.position < component.position) {
        return supabase.from("layout_components").update({ position: index + 1 }).eq("id", comp.id);
      }
      if (index <= newPosition && comp.position > component.position) {
        return supabase.from("layout_components").update({ position: index - 1 }).eq("id", comp.id);
      }
      return null;
    }).filter(Boolean);

    await Promise.all(updates);
    await loadLayout();
    toast.success("Component moved");
  };

  const handleAddRowAbove = async (rowId: string) => {
    const targetRow = rows.find((r) => r.id === rowId);
    if (!targetRow || !layoutId) return;

    const { error } = await supabase.from("layout_rows").insert({
      layout_id: layoutId,
      position: targetRow.position,
      columns: 1,
    });

    if (error) {
      toast.error("Failed to add row");
      return;
    }

    const rowsToUpdate = rows.filter((r) => r.position >= targetRow.position);
    await Promise.all(
      rowsToUpdate.map((r) =>
        supabase.from("layout_rows").update({ position: r.position + 1 }).eq("id", r.id)
      )
    );

    await loadLayout();
    toast.success("Row added");
  };

  const handleAddRowBelow = async (rowId: string) => {
    const targetRow = rows.find((r) => r.id === rowId);
    if (!targetRow || !layoutId) return;

    const { error } = await supabase.from("layout_rows").insert({
      layout_id: layoutId,
      position: targetRow.position + 1,
      columns: 1,
    });

    if (error) {
      toast.error("Failed to add row");
      return;
    }

    const rowsToUpdate = rows.filter((r) => r.position > targetRow.position);
    await Promise.all(
      rowsToUpdate.map((r) =>
        supabase.from("layout_rows").update({ position: r.position + 1 }).eq("id", r.id)
      )
    );

    await loadLayout();
    toast.success("Row added");
  };

  const handleDuplicateRow = async (rowId: string) => {
    const targetRow = rows.find((r) => r.id === rowId);
    if (!targetRow || !layoutId) return;

    const { data: newRow, error: rowError } = await supabase
      .from("layout_rows")
      .insert({
        layout_id: layoutId,
        position: targetRow.position + 1,
        columns: targetRow.columns,
        styles: targetRow.styles,
        column_widths: targetRow.column_widths,
      })
      .select()
      .single();

    if (rowError || !newRow) {
      toast.error("Failed to duplicate row");
      return;
    }

    const rowComponents = components.filter((c) => c.row_id === rowId);
    await Promise.all(
      rowComponents.map((comp) =>
        supabase.from("layout_components").insert({
          layout_id: layoutId,
          row_id: newRow.id,
          column_index: comp.column_index,
          position: comp.position,
          component_type: comp.component_type,
          content: comp.content,
          styles: comp.styles,
        })
      )
    );

    await loadLayout();
    toast.success("Row duplicated");
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === "new-component") {
      setActiveComponentType(activeData.componentType);
    } else if (activeData?.type === "new-widget") {
      setActiveComponentType("widget" as ComponentType);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === "component" && overData?.type === "droppable-column") {
      const component = activeData.component;
      const targetRowId = overData.rowId;
      const targetColumnIndex = overData.columnIndex;

      if (component.row_id !== targetRowId || component.column_index !== targetColumnIndex) {
        setComponents(
          components.map((c) =>
            c.id === activeId
              ? { ...c, row_id: targetRowId, column_index: targetColumnIndex }
              : c
          )
        );
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveComponentType(null);
      return;
    }

    const activeId = active.id as string;
    const activeData = active.data.current;
    const overData = over.data.current;

    // Handle dropping new component or widget from sidebar
    if ((activeId.startsWith("new-") || activeId.startsWith("new-widget-")) &&
      (activeData?.type === "new-component" || activeData?.type === "new-widget")) {
      const targetRowId = overData?.rowId;
      const targetColumnIndex = overData?.columnIndex;

      if (!targetRowId || targetColumnIndex === null || !layoutId) {
        setActiveComponentType(null);
        return;
      }

      const columnComponents = components.filter(
        (c) => c.row_id === targetRowId && c.column_index === targetColumnIndex
      );

      if (activeData.type === "new-widget") {
        // Widgets are not allowed in layouts
        toast.error("Widgets cannot be added to layouts");
        setActiveComponentType(null);
        return;
      } else {
        // Handle component drop
        const componentType = activeData.componentType;

        const { data, error } = await supabase
          .from("layout_components")
          .insert({
            layout_id: layoutId,
            row_id: targetRowId,
            column_index: targetColumnIndex,
            component_type: componentType,
            content: getDefaultContent(componentType),
            position: columnComponents.length,
          })
          .select()
          .single();

        if (error) {
          toast.error("Failed to add component");
        } else {
          setComponents([...components, data]);
          toast.success("Component added");
        }
      }

      setActiveComponentType(null);
      return;
    }

    const component = components.find((c) => c.id === activeId);
    if (!component) {
      setActiveComponentType(null);
      return;
    }

    await supabase
      .from("layout_components")
      .update({
        row_id: component.row_id,
        column_index: component.column_index,
      })
      .eq("id", activeId);

    const columnComponents = components
      .filter((c) => c.row_id === component.row_id && c.column_index === component.column_index)
      .sort((a, b) => a.position - b.position);

    for (let i = 0; i < columnComponents.length; i++) {
      await supabase
        .from("layout_components")
        .update({ position: i })
        .eq("id", columnComponents[i].id);
    }

    setActiveComponentType(null);
  };

  const handlePublishToggle = async () => {
    if (!layout) return;

    const { error } = await supabase
      .from("layouts")
      .update({ is_published: !layout.is_published })
      .eq("id", layout.id);

    if (error) {
      toast.error("Failed to update layout");
      return;
    }

    setLayout({ ...layout, is_published: !layout.is_published });
    toast.success(layout.is_published ? "Layout unpublished" : "Layout published");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <ComponentsSidebar isLayoutEditor />

          <div className="flex-1 flex flex-col">
            <header className="border-b bg-card shadow-[var(--shadow-soft)] sticky top-0 z-50">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <Button variant="outline" onClick={() => router.push("/admin/layouts")} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <h1 className="text-xl font-bold">{layout?.title}</h1>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => history.undo()}
                    disabled={!history.canUndo}
                    title="Undo (Cmd+Z)"
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => history.redo()}
                    disabled={!history.canRedo}
                    title="Redo (Cmd+Shift+Z)"
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                    className="gap-2"
                  >
                    <Monitor className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    variant={layout?.is_published ? "outline" : "default"}
                    onClick={handlePublishToggle}
                    className="gap-2"
                  >
                    {layout?.is_published ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Publish
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-auto px-4 py-8">
              <GridCanvas
                rows={rows}
                components={components}
                onUpdateComponent={handleUpdateComponent}
                onUpdateComponentStyles={handleUpdateComponentStyles}
                onDeleteComponent={handleDeleteComponent}
                onAddRow={handleAddRow}
                onDeleteRow={handleDeleteRow}
                onUpdateRowColumns={handleUpdateRowColumns}
                onUpdateRowStyles={handleUpdateRowStyles}
                onUpdateRowColumnWidths={handleUpdateRowColumnWidths}
                onUpdateRowResponsiveConfig={handleUpdateRowResponsiveConfig}
                onReorderRows={handleReorderRows}
                activeComponentType={activeComponentType}
                onDuplicateComponent={handleDuplicateComponent}
                onPasteComponent={handlePasteComponent}
                onInsertTemplate={handleInsertTemplate}
                onMoveComponentToPosition={handleMoveComponentToPosition}
                onAddRowAbove={handleAddRowAbove}
                onAddRowBelow={handleAddRowBelow}
                onDuplicateRow={handleDuplicateRow}
              />
            </main>
          </div>
        </div>
      </SidebarProvider>

      <LayoutPreviewModal
        open={showPreview}
        onOpenChange={setShowPreview}
        layout={layout}
        rows={rows}
        components={components}
      />
    </DndContext>
  );
};

export default LayoutEditor;
