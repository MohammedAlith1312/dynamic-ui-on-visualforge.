"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { GridCanvas } from "@/components/editor/GridCanvas";
import { ComponentsSidebar, ComponentType } from "@/components/editor/ComponentsSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";

interface TemplateRow {
  id: string;
  columns: number;
  position: number;
  column_widths: any;
  styles: any;
  responsive_config: any;
}

interface TemplateComponent {
  id: string;
  row_id: string;
  component_type: string;
  column_index: number;
  position: number;
  content: any;
  styles: any;
}

const TemplateEditor = () => {
  const params = useParams();
  const templateId = params.templateId as string;
  const router = useRouter();
  const [template, setTemplate] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rows, setRows] = useState<TemplateRow[]>([]);
  const [components, setComponents] = useState<TemplateComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeComponentType, setActiveComponentType] = useState<ComponentType | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    if (!templateId) return;

    const { data, error } = await supabase
      .from("section_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (error) {
      toast.error("Failed to load template");
      router.push("/admin/templates");
      return;
    }

    setTemplate(data);
    setName(data.name);
    setDescription(data.description || "");

    // Parse template_data properly
    let templateData: any = {};
    if (data.template_data) {
      if (typeof data.template_data === 'string') {
        try {
          templateData = JSON.parse(data.template_data);
        } catch (e) {
          console.error("Failed to parse template_data:", e);
        }
      } else if (typeof data.template_data === 'object') {
        templateData = data.template_data;
      }
    }

    const rawRows = templateData.rows || [];
    const loadedRows: TemplateRow[] = [];
    const loadedComponents: TemplateComponent[] = [];

    // Convert nested structure to flat structure
    rawRows.forEach((row: any, rowIndex: number) => {
      const rowId = `temp-row-${Date.now()}-${rowIndex}`;

      loadedRows.push({
        id: rowId,
        columns: row.columns || 1,
        position: rowIndex,
        column_widths: row.column_widths || [],
        styles: row.styles || {},
        responsive_config: row.responsive_config || { mobile: {}, tablet: {}, desktop: {} }
      });

      // Extract components from nested array
      if (row.components && Array.isArray(row.components)) {
        row.components.forEach((comp: any, compIndex: number) => {
          loadedComponents.push({
            id: `temp-comp-${Date.now()}-${rowIndex}-${compIndex}`,
            row_id: rowId,
            component_type: comp.component_type || 'paragraph',
            column_index: comp.column_index || 0,
            position: comp.position || compIndex,
            content: comp.content || {},
            styles: comp.styles || {},
          });
        });
      }
    });

    console.log("Loaded template data:", { rows: loadedRows, components: loadedComponents });

    setRows(loadedRows);
    setComponents(loadedComponents);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!templateId) return;

    // Convert flat structure back to nested structure for storage
    const rowsWithComponents = rows.map(row => {
      const rowComponents = components
        .filter(c => c.row_id === row.id)
        .sort((a, b) => a.position - b.position)
        .map(c => ({
          component_type: c.component_type,
          column_index: c.column_index,
          position: c.position,
          content: c.content,
          styles: c.styles,
        }));

      return {
        columns: row.columns,
        position: row.position,
        column_widths: row.column_widths,
        styles: row.styles,
        responsive_config: row.responsive_config,
        components: rowComponents,
      };
    });

    const templateData = { rows: rowsWithComponents };

    console.log("Saving template data:", templateData);

    const { error } = await supabase
      .from("section_templates")
      .update({
        name,
        description,
        template_data: templateData as any,
      })
      .eq("id", templateId);

    if (error) {
      console.error("Save error:", error);
      toast.error("Failed to save template");
      return;
    }

    toast.success("Template saved successfully");
  };

  const handleAddRow = () => {
    const newRow: TemplateRow = {
      id: `temp-row-${Date.now()}`,
      columns: 1,
      position: rows.length,
      column_widths: [],
      styles: {},
      responsive_config: { mobile: {}, tablet: {}, desktop: {} }
    };
    setRows([...rows, newRow]);
  };

  const handleDeleteRow = (rowId: string) => {
    if (!confirm("Delete this row and all its components?")) return;
    setRows(rows.filter((r) => r.id !== rowId));
    setComponents(components.filter((c) => c.row_id !== rowId));
    toast.success("Row deleted");
  };

  const handleUpdateRowColumns = (rowId: string, columns: number) => {
    setRows(rows.map((r) => (r.id === rowId ? { ...r, columns } : r)));
  };

  const handleUpdateRowStyles = (rowId: string, styles: any) => {
    setRows(rows.map((r) => (r.id === rowId ? { ...r, styles } : r)));
  };

  const handleReorderRows = (newRows: any[]) => {
    setRows(newRows.map((r, index) => ({ ...r, position: index })));
  };

  const handlePasteComponent = (rowId: string, columnIndex: number) => {
    // Not implemented for templates
    toast.info("Paste not available in template editor");
  };

  const handleUpdateComponent = (id: string, content: any) => {
    setComponents(components.map((c) => (c.id === id ? { ...c, content } : c)));
  };

  const handleUpdateComponentStyles = (id: string, styles: any) => {
    setComponents(components.map((c) => (c.id === id ? { ...c, styles } : c)));
  };

  const handleDeleteComponent = (id: string) => {
    setComponents(components.filter((c) => c.id !== id));
    toast.success("Component deleted");
  };

  const handleDuplicateComponent = (id: string) => {
    const component = components.find((c) => c.id === id);
    if (!component) return;

    const newComponent: TemplateComponent = {
      ...component,
      id: `temp-comp-${Date.now()}`,
      position: components.filter((c) => c.row_id === component.row_id).length,
    };

    setComponents([...components, newComponent]);
    toast.success("Component duplicated");
  };

  const handleMoveComponentToPosition = (id: string, newPosition: number) => {
    const component = components.find((c) => c.id === id);
    if (!component) return;

    const columnComponents = components
      .filter((c) => c.row_id === component.row_id && c.column_index === component.column_index)
      .sort((a, b) => a.position - b.position);

    const updatedComponents = components.map((comp) => {
      if (comp.id === id) {
        return { ...comp, position: newPosition };
      }
      const compIndex = columnComponents.findIndex((c) => c.id === comp.id);
      if (compIndex >= 0) {
        if (compIndex >= newPosition && comp.position < component.position) {
          return { ...comp, position: compIndex + 1 };
        }
        if (compIndex <= newPosition && comp.position > component.position) {
          return { ...comp, position: compIndex - 1 };
        }
      }
      return comp;
    });

    setComponents(updatedComponents);
    toast.success("Component moved");
  };

  const handleAddRowAbove = (rowId: string) => {
    const targetRow = rows.find((r) => r.id === rowId);
    if (!targetRow) return;

    const newRow: TemplateRow = {
      id: `temp-row-${Date.now()}`,
      position: targetRow.position,
      columns: 1,
      column_widths: [],
      styles: {},
      responsive_config: { mobile: {}, tablet: {}, desktop: {} }
    };

    const updatedRows = rows.map((r) =>
      r.position >= targetRow.position ? { ...r, position: r.position + 1 } : r
    );

    setRows([...updatedRows, newRow].sort((a, b) => a.position - b.position));
    toast.success("Row added");
  };

  const handleAddRowBelow = (rowId: string) => {
    const targetRow = rows.find((r) => r.id === rowId);
    if (!targetRow) return;

    const newRow: TemplateRow = {
      id: `temp-row-${Date.now()}`,
      position: targetRow.position + 1,
      columns: 1,
      column_widths: [],
      styles: {},
      responsive_config: { mobile: {}, tablet: {}, desktop: {} }
    };

    const updatedRows = rows.map((r) =>
      r.position > targetRow.position ? { ...r, position: r.position + 1 } : r
    );

    setRows([...updatedRows, newRow].sort((a, b) => a.position - b.position));
    toast.success("Row added");
  };

  const handleDuplicateRow = (rowId: string) => {
    const targetRow = rows.find((r) => r.id === rowId);
    if (!targetRow) return;

    const newRowId = `temp-row-${Date.now()}`;
    const newRow: TemplateRow = {
      ...targetRow,
      id: newRowId,
      position: targetRow.position + 1,
    };

    const rowComponents = components.filter((c) => c.row_id === rowId);
    const newComponents = rowComponents.map((comp) => ({
      ...comp,
      id: `temp-comp-${Date.now()}-${Math.random()}`,
      row_id: newRowId,
    }));

    setRows([...rows, newRow].sort((a, b) => a.position - b.position));
    setComponents([...components, ...newComponents]);
    toast.success("Row duplicated");
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
      case "chart": return {
        chartType: "bar",
        data: JSON.stringify([
          { name: "Jan", value: 400 },
          { name: "Feb", value: 300 },
          { name: "Mar", value: 600 }
        ], null, 2),
        title: "Sample Chart",
        xAxisKey: "name",
        yAxisKey: "value"
      };
      case "tabs": return { tabs: [{ id: "tab-1", label: "Tab 1", content: "Content 1" }] };
      case "accordion": return { items: [{ id: "item-1", title: "Section 1", content: "Content 1" }] };
      case "card": return { layout: "image-top", title: "Card Title", description: "Card description" };
      case "form-input": return { fieldName: "field_name", label: "Field Label", placeholder: "Enter value..." };
      case "form-textarea": return { fieldName: "message", label: "Message", placeholder: "Enter your message..." };
      case "form-select": return { fieldName: "select_field", label: "Select Option", options: "Option 1\nOption 2" };
      case "form-checkbox": return { fieldName: "checkbox_field", label: "Select Options", options: "Option 1\nOption 2" };
      case "form-submit": return { buttonText: "Submit", buttonVariant: "default" };
      default: return {};
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;

    if (activeId.startsWith("new-")) {
      const componentType = active.data.current?.componentType;
      setActiveComponentType(componentType);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveComponentType(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId.startsWith("new-")) {
      const componentType = active.data.current?.componentType as ComponentType;

      if (overId.startsWith("column-")) {
        const [, rowId, columnIndex] = overId.split("-");

        const newComponent: TemplateComponent = {
          id: `temp-comp-${Date.now()}`,
          row_id: rowId,
          component_type: componentType,
          column_index: parseInt(columnIndex),
          position: components.filter((c) => c.row_id === rowId && c.column_index === parseInt(columnIndex)).length,
          content: getDefaultContent(componentType),
          styles: {},
        };

        setComponents([...components, newComponent]);
        toast.success("Component added");
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over for visual feedback
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <SidebarProvider>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
        <div className="min-h-screen bg-background flex">
          <ComponentsSidebar />

          <div className="flex-1 flex flex-col">
            <header className="border-b bg-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <Button variant="ghost" size="icon" onClick={() => router.push("/admin/templates")}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 max-w-md space-y-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="font-semibold"
                    placeholder="Template name..."
                  />
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Template description..."
                    className="text-sm"
                  />
                </div>
              </div>
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save Template
              </Button>
            </header>

            <main className="flex-1 overflow-auto p-8">
              <div className="max-w-7xl mx-auto">
                <div className="bg-card rounded-lg shadow-lg p-8">
                  {rows.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="text-lg mb-2">No rows yet</p>
                      <p className="text-sm">Click "Add Row" to start building your template</p>
                    </div>
                  ) : (
                    <GridCanvas
                      rows={rows as any}
                      components={components as any}
                      onUpdateComponent={handleUpdateComponent}
                      onUpdateComponentStyles={handleUpdateComponentStyles}
                      onDeleteComponent={handleDeleteComponent}
                      onAddRow={handleAddRow}
                      onDeleteRow={handleDeleteRow}
                      onUpdateRowColumns={handleUpdateRowColumns}
                      onUpdateRowStyles={handleUpdateRowStyles}
                      onReorderRows={handleReorderRows}
                      activeComponentType={activeComponentType}
                      onDuplicateComponent={handleDuplicateComponent}
                      onPasteComponent={handlePasteComponent}
                      onMoveComponentToPosition={handleMoveComponentToPosition}
                      onAddRowAbove={handleAddRowAbove}
                      onAddRowBelow={handleAddRowBelow}
                      onDuplicateRow={handleDuplicateRow}
                    />
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </DndContext>
    </SidebarProvider>
  );
};

export default TemplateEditor;
