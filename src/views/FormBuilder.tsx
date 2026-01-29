"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye, Settings } from "lucide-react";
import { FieldLibrary } from "@/components/forms/FieldLibrary";
import { FormCanvas } from "@/components/forms/FormCanvas";
import { FieldPropertiesPanel } from "@/components/forms/FieldPropertiesPanel";
import { FormPropertiesPanel } from "@/components/forms/FormPropertiesPanel";
import { SectionPropertiesPanel } from "@/components/forms/SectionPropertiesPanel";
import { FormPreviewModal } from "@/components/forms/FormPreviewModal";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

export default function FormBuilder() {
  const params = useParams();
  const formId = params.formId as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<"form" | "field" | "section">("form");
  const [showPreview, setShowPreview] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    if (!formId) return;

    const [formData, fieldsData, sectionsData] = await Promise.all([
      supabase.from("forms" as any).select("*").eq("id", formId).single(),
      supabase.from("form_fields" as any).select("*").eq("form_id", formId).order("position"),
      supabase.from("form_sections" as any).select("*").eq("form_id", formId).order("position"),
    ]);

    if (formData.error) {
      toast.error("Failed to load form");
      router.push("/admin/forms");
    } else {
      setForm(formData.data);
      setFields(fieldsData.data || []);
      setSections(sectionsData.data || []);
    }
    setLoading(false);
  };

  const handleSaveForm = async () => {
    if (!formId || !form) return;

    setSaving(true);
    const { error } = await supabase
      .from("forms" as any)
      .update({
        name: form.name,
        title: form.title,
        description: form.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", formId);

    if (error) {
      toast.error("Failed to save form");
    } else {
      toast.success("Form saved");
    }
    setSaving(false);
  };

  const handleAddSection = async () => {
    if (!formId) return;

    const newSection = {
      form_id: formId,
      name: `section_${Date.now()}`,
      title: "New Section",
      description: "",
      section_type: "section",
      position: sections.length,
      is_visible: true,
      conditional_logic: {},
    };

    const { data, error } = await supabase
      .from("form_sections" as any)
      .insert(newSection)
      .select()
      .single();

    if (error) {
      toast.error("Failed to add section");
      console.error(error);
    } else {
      setSections([...sections, data]);
      setSelectedItem(data);
      setSelectedType("section");
      toast.success("Section added");
    }
  };

  const handleUpdateSection = async (sectionId: string, updates: any) => {
    const { error } = await supabase
      .from("form_sections" as any)
      .update(updates)
      .eq("id", sectionId);

    if (error) {
      toast.error("Failed to update section");
      console.error(error);
    } else {
      setSections(sections.map(s => s.id === sectionId ? { ...s, ...updates } : s));
      if (selectedItem?.id === sectionId) {
        setSelectedItem({ ...selectedItem, ...updates });
      }
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Delete this section and all its fields?")) return;

    const { error } = await supabase
      .from("form_sections" as any)
      .delete()
      .eq("id", sectionId);

    if (error) {
      toast.error("Failed to delete section");
    } else {
      setSections(sections.filter(s => s.id !== sectionId));
      if (selectedItem?.id === sectionId) {
        setSelectedItem(null);
        setSelectedType("form");
      }
      toast.success("Section deleted");
    }
  };

  const handleAddField = async (fieldType: string, sectionId?: string) => {
    if (!formId) return;

    const newField = {
      form_id: formId,
      section_id: sectionId || null,
      field_name: `field_${Date.now()}`,
      label: `New ${fieldType} Field`,
      field_type: fieldType,
      position: fields.length,
      is_required: false,
      is_visible: true,
      options: [],
      validation_rules: {},
      conditional_logic: {},
      column_width: "full",
    };

    const { data, error } = await supabase
      .from("form_fields" as any)
      .insert(newField)
      .select()
      .single();

    if (error) {
      toast.error("Failed to add field");
      console.error(error);
    } else {
      setFields([...fields, data]);
      setSelectedItem(data);
      setSelectedType("field");
      toast.success("Field added");
    }
  };

  const handleUpdateField = async (fieldId: string, updates: any) => {
    const { error } = await supabase
      .from("form_fields" as any)
      .update(updates)
      .eq("id", fieldId);

    if (error) {
      toast.error("Failed to update field");
      console.error(error);
    } else {
      setFields(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
      if (selectedItem?.id === fieldId) {
        setSelectedItem({ ...selectedItem, ...updates });
      }
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm("Delete this field?")) return;

    const { error } = await supabase
      .from("form_fields" as any)
      .delete()
      .eq("id", fieldId);

    if (error) {
      toast.error("Failed to delete field");
    } else {
      setFields(fields.filter(f => f.id !== fieldId));
      if (selectedItem?.id === fieldId) {
        setSelectedItem(null);
        setSelectedType("form");
      }
      toast.success("Field deleted");
    }
  };

  const handleUpdateForm = (updates: any) => {
    setForm({ ...form, ...updates });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Check if we're dragging from the library
    const activeData = active.data.current;
    if (activeData?.fieldType) {
      // Dragging from library to canvas
      let sectionId: string | undefined = undefined;

      if (over.id.toString().startsWith('section-')) {
        sectionId = over.id.toString().replace('section-', '');
      }

      await handleAddField(activeData.fieldType, sectionId);
      return;
    }

    if (active.id === over.id) return;

    // Check if we're dragging an existing field
    const activeField = fields.find(f => f.id === active.id);

    if (activeField) {
      // Dropping into a section
      if (over.id.toString().startsWith('section-')) {
        const sectionId = over.id.toString().replace('section-', '');
        await handleUpdateField(activeField.id, { section_id: sectionId });
      }
      // Dropping into canvas (no section)
      else if (over.id === 'canvas-no-section') {
        await handleUpdateField(activeField.id, { section_id: null });
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!form) return null;

  return (
    <AdminLayout>
      <div className="flex flex-col h-screen">
        {/* Top Bar */}
        <div className="border-b bg-card p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/admin/forms")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="text-lg font-semibold border-0 p-0 h-auto focus-visible:ring-0"
                />
                <p className="text-sm text-muted-foreground">{form.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/forms/${formId}/submissions`)}
              >
                View Submissions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/forms/${formId}/settings`)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button onClick={handleSaveForm} disabled={saving} size="sm">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Field Library */}
            <div className="w-64 border-r bg-card p-4 overflow-y-auto">
              <FieldLibrary onAddField={handleAddField} />
            </div>

            {/* Center - Form Canvas */}
            <div className="flex-1 p-6 overflow-y-auto bg-muted/30">
              <SortableContext
                items={[...sections.map(s => s.id), ...fields.map(f => f.id)]}
                strategy={verticalListSortingStrategy}
              >
                <FormCanvas
                  fields={fields}
                  sections={sections}
                  onSelectField={(field) => {
                    setSelectedItem(field);
                    setSelectedType("field");
                  }}
                  onSelectSection={(section) => {
                    setSelectedItem(section);
                    setSelectedType("section");
                  }}
                  onDeleteField={handleDeleteField}
                  onDeleteSection={handleDeleteSection}
                  onAddSection={handleAddSection}
                />
              </SortableContext>
            </div>

            {/* Right Sidebar - Properties Panel */}
            <div className="w-80 border-l bg-card p-4 overflow-y-auto">
              {selectedType === "form" && (
                <FormPropertiesPanel form={form} onUpdate={handleUpdateForm} />
              )}
              {selectedType === "field" && selectedItem && (
                <FieldPropertiesPanel
                  field={selectedItem}
                  onUpdate={(updates) => handleUpdateField(selectedItem.id, updates)}
                  availableFields={fields.map(f => ({ id: f.id, label: f.label, field_type: f.field_type }))}
                />
              )}
              {selectedType === "section" && selectedItem && (
                <SectionPropertiesPanel
                  section={selectedItem}
                  onUpdate={(updates) => handleUpdateSection(selectedItem.id, updates)}
                  availableFields={fields.map(f => ({ id: f.id, label: f.label, field_type: f.field_type }))}
                />
              )}
            </div>
          </div>
        </DndContext>
      </div>

      <FormPreviewModal
        open={showPreview}
        onOpenChange={setShowPreview}
        form={form}
        fields={fields}
        sections={sections}
      />
    </AdminLayout>
  );
}