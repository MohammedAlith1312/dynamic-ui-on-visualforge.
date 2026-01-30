"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useClipboard } from "@/contexts/ClipboardContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Monitor, Undo, Redo, List, Shapes } from "lucide-react";
import { ComponentsSidebar, ComponentType } from "@/components/editor/ComponentsSidebar";
import { SidebarToggle } from "@/components/editor/SidebarToggle";
import { PagePreviewModal } from "@/components/editor/PagePreviewModal";
import { GridCanvas } from "@/components/editor/GridCanvas";
import { Tables } from "@/integrations/supabase/types";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, pointerWithin } from "@dnd-kit/core";
import { useHistory } from "@/hooks/useHistory";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { DeviceFrame } from "@/components/editor/DeviceFrame";
import { revalidatePage } from "@/app/actions/revalidate";

type Page = Tables<"pages">;
type PageRow = Tables<"page_rows">;
type PageComponent = Tables<"page_components">;
type Layout = Tables<"layouts">;
type LayoutRow = Tables<"layout_rows">;
type LayoutComponent = Tables<"layout_components">;

const PageEditor = () => {
  const params = useParams();
  const pageId = params?.pageId as string;
  const router = useRouter();
  const { copiedComponent } = useClipboard();
  const [page, setPage] = useState<Page | null>(null);
  const [rows, setRows] = useState<PageRow[]>([]);
  const [components, setComponents] = useState<PageComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [activeComponentType, setActiveComponentType] = useState<ComponentType | null>(null);
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [previewLayout, setPreviewLayout] = useState<Layout | null>(null);
  const [previewLayoutRows, setPreviewLayoutRows] = useState<LayoutRow[]>([]);
  const [previewLayoutComponents, setPreviewLayoutComponents] = useState<LayoutComponent[]>([]);
  const [widgetData, setWidgetData] = useState<Map<string, { rows: any[]; components: any[] }>>(new Map());
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [showOutline, setShowOutline] = useState(false);

  const history = useHistory();

  useKeyboardShortcuts({
    onUndo: () => history.canUndo && history.undo(),
    onRedo: () => history.canRedo && history.redo(),
    onDelete: () => selectedComponent && handleDeleteComponent(selectedComponent),
    onDuplicate: () => selectedComponent && handleDuplicateComponent(selectedComponent),
  });

  useEffect(() => {
    loadPage();
    loadLayouts();
  }, [pageId]);

  const loadLayouts = async () => {
    const { data } = await supabase
      .from("layouts")
      .select("*")
      .eq("is_published", true)
      .order("title");

    setLayouts(data || []);
  };

  const loadPage = async () => {
    if (!pageId) return;

    const { data: pageData, error: pageError } = await supabase
      .from("pages")
      .select("*")
      .eq("id", pageId)
      .single();

    if (pageError) {
      toast.error("Failed to load page");
      router.push("/admin");
      return;
    }

    const { data: rowsData } = await supabase
      .from("page_rows")
      .select("*")
      .eq("page_id", pageId)
      .order("position");

    const { data: componentsData } = await supabase
      .from("page_components")
      .select("*")
      .eq("page_id", pageId)
      .order("position");

    setPage(pageData);
    setRows(rowsData || []);
    setComponents(componentsData || []);
    setLoading(false);
  };

  const handleAddRow = async () => {
    if (!pageId) return;

    const { data, error } = await supabase
      .from("page_rows")
      .insert({
        page_id: pageId,
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

    const { error } = await supabase.from("page_rows").delete().eq("id", rowId);

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
      .from("page_rows")
      .update({ columns })
      .eq("id", rowId);

    if (error) {
      toast.error("Failed to update columns");
      return;
    }

    setRows(rows.map((r) => (r.id === rowId ? { ...r, columns } : r)));
  };

  const handleUpdateRowStyles = async (rowId: string, styles: any) => {
    const { error } = await supabase
      .from("page_rows")
      .update({ styles })
      .eq("id", rowId);

    if (error) {
      toast.error("Failed to update row styles");
      return;
    }

    setRows(rows.map((r) => (r.id === rowId ? { ...r, styles } as PageRow : r)));
  };

  const handleUpdateRowColumnWidths = async (rowId: string, widths: number[]) => {
    const { error } = await supabase
      .from("page_rows")
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
      .from("page_rows")
      .update({ responsive_config: config })
      .eq("id", rowId);

    if (error) {
      toast.error("Failed to update responsive config");
      return;
    }

    setRows(rows.map((r) => (r.id === rowId ? { ...r, responsive_config: config } as any : r)));
  };

  const handleUpdateComponentStyles = async (id: string, styles: any) => {
    const { error } = await supabase
      .from("page_components")
      .update({ styles })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update component styles");
      return;
    }

    setComponents(components.map((c) => (c.id === id ? { ...c, styles } as PageComponent : c)));
  };

  const handleReorderRows = async (newRows: PageRow[]) => {
    setRows(newRows);

    // Update positions in database
    for (let i = 0; i < newRows.length; i++) {
      await supabase
        .from("page_rows")
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
      case "page-content": return {};
      case "entity-list": return { entityId: "", fields: [], displayStyle: "grid", limit: 10, sortBy: "", sortOrder: "desc", showPublishedOnly: true };
      case "entity-detail": return { entityId: "", recordId: "", fields: [], layout: "vertical" };
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
      .from("page_components")
      .update({ content })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update component");
      return;
    }

    setComponents(components.map((c) => (c.id === id ? { ...c, content } : c)));
  };

  const handleDeleteComponent = async (id: string) => {
    const { error } = await supabase.from("page_components").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete component");
      return;
    }

    setComponents(components.filter((c) => c.id !== id));
    toast.success("Component deleted");
  };

  const handleInsertTemplate = async (templateData: any) => {
    if (!pageId) return;

    const templateRows = templateData.rows || [];

    for (const templateRow of templateRows) {
      const { data: newRow, error: rowError } = await supabase
        .from("page_rows")
        .insert({
          page_id: pageId,
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
        await supabase.from("page_components").insert({
          page_id: pageId,
          row_id: newRow.id,
          component_type: templateComp.component_type,
          column_index: templateComp.column_index,
          position: templateComp.position,
          content: templateComp.content || {},
          styles: templateComp.styles || {},
        });
      }
    }

    await loadPage();
    toast.success("Template inserted successfully");
  };

  const handleDuplicateComponent = async (id: string) => {
    const component = components.find((c) => c.id === id);
    if (!component || !pageId) return;

    const columnComponents = components.filter(
      (c) => c.row_id === component.row_id && c.column_index === component.column_index
    );

    const { data, error } = await supabase
      .from("page_components")
      .insert({
        page_id: pageId,
        row_id: component.row_id,
        column_index: component.column_index,
        component_type: component.component_type,
        content: component.content,
        position: columnComponents.length,
        is_widget_instance: component.is_widget_instance,
        widget_id: component.widget_id,
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
    if (!copiedComponent || !pageId) return;

    const columnComponents = components.filter(
      (c) => c.row_id === rowId && c.column_index === columnIndex
    );

    const { data, error } = await supabase
      .from("page_components")
      .insert({
        page_id: pageId,
        row_id: rowId,
        column_index: columnIndex,
        component_type: copiedComponent.component_type,
        content: copiedComponent.content,
        position: columnComponents.length,
        is_widget_instance: (copiedComponent as any).is_widget_instance,
        widget_id: (copiedComponent as any).widget_id,
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
        return supabase.from("page_components").update({ position: newPosition }).eq("id", comp.id);
      }
      if (index >= newPosition && comp.position < component.position) {
        return supabase.from("page_components").update({ position: index + 1 }).eq("id", comp.id);
      }
      if (index <= newPosition && comp.position > component.position) {
        return supabase.from("page_components").update({ position: index - 1 }).eq("id", comp.id);
      }
      return null;
    }).filter(Boolean);

    await Promise.all(updates);
    await loadPage();
    toast.success("Component moved");
  };

  const handleAddRowAbove = async (rowId: string) => {
    const targetRow = rows.find((r) => r.id === rowId);
    if (!targetRow || !pageId) return;

    const { error } = await supabase.from("page_rows").insert({
      page_id: pageId,
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
        supabase.from("page_rows").update({ position: r.position + 1 }).eq("id", r.id)
      )
    );

    await loadPage();
    toast.success("Row added");
  };

  const handleAddRowBelow = async (rowId: string) => {
    const targetRow = rows.find((r) => r.id === rowId);
    if (!targetRow || !pageId) return;

    const { error } = await supabase.from("page_rows").insert({
      page_id: pageId,
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
        supabase.from("page_rows").update({ position: r.position + 1 }).eq("id", r.id)
      )
    );

    await loadPage();
    toast.success("Row added");
  };

  const handleDuplicateRow = async (rowId: string) => {
    const targetRow = rows.find((r) => r.id === rowId);
    if (!targetRow || !pageId) return;

    const { data: newRow, error: rowError } = await supabase
      .from("page_rows")
      .insert({
        page_id: pageId,
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
        supabase.from("page_components").insert({
          page_id: pageId,
          row_id: newRow.id,
          column_index: comp.column_index,
          position: comp.position,
          component_type: comp.component_type,
          content: comp.content,
          styles: comp.styles,
        })
      )
    );

    await loadPage();
    toast.success("Row duplicated");
  };

  const handleToggleVisibility = async (componentId: string) => {
    console.log('[PageEditor] Toggle visibility for:', componentId);
    const component = components.find((c) => c.id === componentId);
    if (!component) {
      console.log('[PageEditor] Component not found!');
      return;
    }

    const currentStyles = (component as any).styles || {};
    const currentVisible = currentStyles.visible !== false; // true if not explicitly false
    const newVisible = !currentVisible;

    console.log('[PageEditor] Visibility change:', { currentVisible, newVisible, currentStyles });

    const { error } = await supabase
      .from("page_components")
      .update({
        styles: { ...currentStyles, visible: newVisible },
      })
      .eq("id", componentId);

    if (error) {
      console.error('[PageEditor] Error updating visibility:', error);
      toast.error("Failed to update visibility");
      return;
    }

    await loadPage();
    toast.success(newVisible ? "Component shown" : "Component hidden");
  };

  const handleToggleLock = async (componentId: string) => {
    console.log('[PageEditor] Toggle lock for:', componentId);
    const component = components.find((c) => c.id === componentId);
    if (!component) {
      console.log('[PageEditor] Component not found!');
      return;
    }

    const currentStyles = (component as any).styles || {};
    const newLocked = !currentStyles.locked;

    console.log('[PageEditor] Lock change:', { currentLocked: currentStyles.locked, newLocked, currentStyles });

    const { error } = await supabase
      .from("page_components")
      .update({
        styles: { ...currentStyles, locked: newLocked },
      })
      .eq("id", componentId);

    if (error) {
      console.error('[PageEditor] Error updating lock:', error);
      toast.error("Failed to update lock");
      return;
    }

    await loadPage();
    toast.success(newLocked ? "Component locked" : "Component unlocked");
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
    const overId = over.id as string;
    const activeData = active.data.current;
    const overData = over.data.current;

    // Only handle dragging existing components between columns (not new components from sidebar)
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

      if (!targetRowId || targetColumnIndex === null || !pageId) {
        setActiveComponentType(null);
        return;
      }

      const columnComponents = components.filter(
        (c) => c.row_id === targetRowId && c.column_index === targetColumnIndex
      );

      if (activeData.type === "new-widget") {
        // Handle widget drop
        const { data, error } = await supabase
          .from("page_components")
          .insert({
            page_id: pageId,
            row_id: targetRowId,
            column_index: targetColumnIndex,
            component_type: "paragraph", // placeholder type
            content: { text: `Widget: ${activeData.widgetTitle}` },
            position: columnComponents.length,
            is_widget_instance: true,
            widget_id: activeData.widgetId,
          })
          .select()
          .single();

        if (error) {
          toast.error("Failed to add widget");
        } else {
          setComponents([...components, data]);
          toast.success("Widget added");
        }
      } else {
        // Handle component drop
        const componentType = activeData.componentType;

        const { data, error } = await supabase
          .from("page_components")
          .insert({
            page_id: pageId,
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

    // Handle moving existing component
    const component = components.find((c) => c.id === activeId);
    if (!component) {
      setActiveComponentType(null);
      return;
    }

    // Update in database
    await supabase
      .from("page_components")
      .update({
        row_id: component.row_id,
        column_index: component.column_index,
      })
      .eq("id", activeId);

    // Reorder components in the same column
    const columnComponents = components
      .filter((c) => c.row_id === component.row_id && c.column_index === component.column_index)
      .sort((a, b) => a.position - b.position);

    for (let i = 0; i < columnComponents.length; i++) {
      await supabase
        .from("page_components")
        .update({ position: i })
        .eq("id", columnComponents[i].id);
    }

    setActiveComponentType(null);
  };

  const handlePreview = async () => {
    if (!page) return;

    let layout = null;
    let layoutRows: LayoutRow[] = [];
    let layoutComponents: LayoutComponent[] = [];

    if (page.layout_id) {
      const { data: layoutData } = await supabase
        .from("layouts")
        .select("*")
        .eq("id", page.layout_id)
        .single();

      if (layoutData) {
        layout = layoutData;

        const { data: lRows } = await supabase
          .from("layout_rows")
          .select("*")
          .eq("layout_id", page.layout_id)
          .order("position");

        const { data: lComponents } = await supabase
          .from("layout_components")
          .select("*")
          .eq("layout_id", page.layout_id)
          .order("position");

        layoutRows = lRows || [];
        layoutComponents = lComponents || [];
      }
    }

    // Fetch widget data for all widget instances
    const widgetInstances = components.filter((c): c is PageComponent & { widget_id: string } =>
      Boolean(c.is_widget_instance && c.widget_id)
    );
    const widgetDataMap = new Map<string, { rows: any[]; components: any[] }>();

    for (const instance of widgetInstances) {
      if (!widgetDataMap.has(instance.widget_id)) {
        const { data: widgetRows } = await supabase
          .from("widget_rows")
          .select("*")
          .eq("widget_id", instance.widget_id)
          .order("position");

        const { data: widgetComponents } = await supabase
          .from("widget_components")
          .select("*")
          .eq("widget_id", instance.widget_id)
          .order("position");

        widgetDataMap.set(instance.widget_id, {
          rows: widgetRows || [],
          components: widgetComponents || []
        });
      }
    }

    setPreviewLayout(layout);
    setPreviewLayoutRows(layoutRows);
    setPreviewLayoutComponents(layoutComponents);
    setWidgetData(widgetDataMap);
    setShowPreview(true);
  };

  const handlePublishToggle = async () => {
    if (!page) return;

    const newIsPublished = !page.is_published;

    const { error } = await supabase
      .from("pages")
      .update({ is_published: newIsPublished })
      .eq("id", page.id);

    if (error) {
      toast.error("Failed to update page");
      return;
    }

    setPage({ ...page, is_published: newIsPublished });

    // Clear cache immediately so the change is reflected in the public UI
    if (page.slug) {
      // Fetch fresh HTML content before revalidating if we are publishing
      if (newIsPublished) {
        try {
          const path = `/page/${page.slug}?t=${Date.now()}`;
          const response = await fetch(path);
          if (response.ok) {
            const html = await response.text();
            // Update the DB with the actual HTML content
            await supabase
              .from("pages")
              .update({ published_html: html } as any)
              .eq("id", page.id);
          }
        } catch (err) {
          console.error("Failed to fetch/save HTML during publish:", err);
        }
      }
      await revalidatePage(page.slug);
    }

    toast.success(newIsPublished ? "Page published" : "Page unpublished");
  };

  const handleLayoutChange = async (layoutId: string | null) => {
    if (!page) return;

    const { error } = await supabase
      .from("pages")
      .update({ layout_id: layoutId || null })
      .eq("id", page.id);

    if (error) {
      toast.error("Failed to update layout");
      return;
    }

    setPage({ ...page, layout_id: layoutId || null });
    toast.success("Layout updated");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <PagePreviewModal
        open={showPreview}
        onOpenChange={setShowPreview}
        page={page}
        rows={rows}
        components={components}
        layout={previewLayout}
        layoutRows={previewLayoutRows}
        layoutComponents={previewLayoutComponents}
        widgetData={widgetData}
      />
      <DndContext
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <SidebarToggle
              showOutline={showOutline}
              onToggle={() => setShowOutline(!showOutline)}
              title={page?.title || "Page"}
              rows={rows}
              components={components}
              selectedComponentId={selectedComponent}
              onSelectComponent={setSelectedComponent}
              onToggleVisibility={handleToggleVisibility}
              onToggleLock={handleToggleLock}
            />

            <div className="flex-1 flex flex-col">
              <header className="border-b bg-card shadow-[var(--shadow-soft)] sticky top-0 z-50">
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    <Button variant="outline" onClick={() => router.push("/admin")} className="gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <h1 className="text-xl font-bold">{page?.title}</h1>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="layout-select" className="text-sm">Layout:</Label>
                      <Select value={page?.layout_id ?? "none"} onValueChange={(value) => handleLayoutChange(value === "none" ? null : value)}>
                        <SelectTrigger id="layout-select" className="w-[200px]">
                          <SelectValue placeholder="No layout" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No layout</SelectItem>
                          {layouts.map((layout) => (
                            <SelectItem key={layout.id} value={layout.id}>
                              {layout.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                      onClick={handlePreview}
                      className="gap-2"
                    >
                      <Monitor className="h-4 w-4" />
                      Preview
                    </Button>
                    <Button
                      variant={page?.is_published ? "outline" : "default"}
                      onClick={handlePublishToggle}
                      className="gap-2"
                    >
                      {page?.is_published ? (
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
      </DndContext>
    </>
  );
};

export default PageEditor;
